#!/usr/bin/env python3
"""
Automated security pattern scanner for Claude skills.
Produces a JSON report of pattern-matched security findings.

Usage: python3 scan.py <skill-directory>
Output: JSON to stdout
"""
import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List, Optional

SEVERITY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}

SKIP_EXTENSIONS = {
    ".pyc", ".pyo", ".exe", ".dll", ".so", ".dylib",
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg", ".bmp",
    ".pdf", ".zip", ".tar", ".gz", ".bz2", ".xz", ".whl", ".egg",
    ".map", ".min.js",
}

SKIP_DIRS = {
    ".git", "__pycache__", "node_modules", ".venv", "venv",
    "dist", "build", ".tox", ".eggs", ".mypy_cache",
}

# (severity, category, cwe, regex_pattern, short_description, remediation)
PATTERNS = [

    # ═══════════════════════════════════════════════════════════════
    # CRITICAL — Direct system compromise or active exfiltration
    # ═══════════════════════════════════════════════════════════════

    (
        "CRITICAL", "Obfuscation+RCE", "CWE-94",
        r"(?i)(?:base64|b64)[\w\s\(\)\'\"]*(?:exec|eval|subprocess|/bin/sh|bash\b)|"
        r"(?:exec|eval)\s*\(\s*(?:base64_decode|atob|Buffer\.from\b[^)]*base64)",
        "Obfuscated code execution (base64 decoded then executed)",
        "Remove or replace with transparent, auditable logic. Obfuscated execution in a skill strongly indicates malicious intent.",
    ),
    (
        "CRITICAL", "Reverse Shell", "CWE-78",
        r"(?:nc|netcat|ncat)\s+[^\n]*-e\s+(?:/bin/[a-z]+|cmd\.exe)|"
        r"bash\s+-i\s+>&\s*/dev/tcp/|"
        r"(?:python[23]?|perl|ruby)\s+-[ce]\s+['\"][^'\"]*socket[^'\"]*exec",
        "Reverse shell pattern detected",
        "Reverse shells grant unauthorized remote access. This is almost always malicious in a skill.",
    ),
    (
        "CRITICAL", "Data Exfiltration", "CWE-200",
        r"(?:curl|wget|fetch)\s+[^\n]*(?:\$HOME|\$USER|~/|/home/|/root/)[^\n]*https?://|"
        r"find\s+/(?:home|root|etc)[^\n]*\|\s*(?:curl|wget)\s+",
        "Local files or user data sent to a remote server",
        "Skills must not upload local data without explicit user consent. Remove or require an explicit confirmation gate.",
    ),
    (
        "CRITICAL", "Hex/Encoded Payload Execution", "CWE-693",
        r"(?:xxd\s+-r|printf\s+['\"]\\x[0-9a-fA-F]|\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2}){3,})[^\n]*"
        r"(?:exec|sh\b|bash\b|python|node)",
        "Hex-encoded payload decoded and executed",
        "Hex encoding is used to hide malicious payloads from plain-text inspection. Investigate and remove immediately.",
    ),
    (
        "CRITICAL", "Remote Script Pipe Execution", "CWE-829",
        r"(?:curl|wget)\s+[^\n]*https?://[^\s|]+\s*\|\s*(?:bash|sh|python[23]?|node|ruby|perl)",
        "Remote script downloaded and piped directly to shell",
        "Never pipe remote scripts directly into an interpreter. Download first, inspect, then execute from a pinned hash.",
    ),

    # ═══════════════════════════════════════════════════════════════
    # HIGH — Likely exploitable with moderate effort
    # ═══════════════════════════════════════════════════════════════

    (
        "HIGH", "Hardcoded Credential", "CWE-798",
        r"""(?i)(?:api[_-]?key|access[_-]?key|secret[_-]?key|auth[_-]?token|"""
        r"""client[_-]?secret|private[_-]?key|bearer)\s*[=:]\s*['"][a-zA-Z0-9+/=_\-]{20,}['"]""",
        "Hardcoded API key, token, or secret",
        "Use environment variables or a secrets manager. Rotate the exposed credential immediately.",
    ),
    (
        "HIGH", "Embedded Private Key", "CWE-321",
        r"-----BEGIN\s+(?:RSA|EC|DSA|OPENSSH|PGP)\s+PRIVATE\s+KEY",
        "Private cryptographic key embedded in skill file",
        "Remove the private key and revoke it. Store keys outside the skill directory in a secrets manager.",
    ),
    (
        "HIGH", "AWS Credentials", "CWE-798",
        r"AKIA[0-9A-Z]{16}|"
        r"(?i)aws_secret_access_key\s*[=:]\s*['\"][a-zA-Z0-9+/]{40}['\"]",
        "AWS access key or secret detected",
        "Revoke these credentials immediately via the AWS console. Use IAM roles or environment variables.",
    ),
    (
        "HIGH", "Command Injection (subprocess shell=True)", "CWE-78",
        r"subprocess\.(?:call|run|Popen)\s*\([^)]*shell\s*=\s*True",
        "subprocess with shell=True — enables command injection",
        "Use shell=False and pass arguments as a list: subprocess.run(['cmd', arg1, arg2], shell=False).",
    ),
    (
        "HIGH", "eval/exec with External Input", "CWE-95",
        r"(?:eval|exec)\s*\(\s*(?:sys\.argv|os\.environ|input\s*\(|request\.|getenv\s*\(|args\[)",
        "eval() or exec() called with user/environment-controlled input",
        "Never pass external input to eval/exec. Use json.loads() for data or argparse for arguments.",
    ),
    (
        "HIGH", "Unexpected Network Listener", "CWE-441",
        r"socket\.(?:bind|listen)\s*\(|net\.createServer\s*\(|TCPServer\s*\(|UDPServer\s*\(|"
        r"nc\s+-(?:l[vp]*)\s+\d+|socat\s+TCP-LISTEN",
        "Network server/listener socket opened",
        "Skills should not bind ports or accept incoming connections. Remove the listener.",
    ),
    (
        "HIGH", "Path Traversal", "CWE-22",
        r"open\s*\([^)]*\.\.[/\\]|"
        r"os\.path\.join\s*\([^)]*\.\.[/\\]|"
        r"Path\s*\([^)]*\.\.[/\\]|"
        r"readFile\s*\([^)]*\.\.[/\\]",
        "Unvalidated '../' path traversal in file operation",
        "Validate and normalize all paths. Use os.path.realpath() and verify the result stays within an allowed base dir.",
    ),
    (
        "HIGH", "LD_PRELOAD / Library Injection", "CWE-114",
        r"LD_PRELOAD\s*[=+]|LD_LIBRARY_PATH\s*=.*(?:\$|\`|/tmp)",
        "LD_PRELOAD or dynamic library path manipulation",
        "Manipulating LD_PRELOAD intercepts system calls and can execute arbitrary code. Remove this.",
    ),
    (
        "HIGH", "Hardcoded Password", "CWE-259",
        r"""(?i)(?:password|passwd|pwd)\s*[=:]\s*['"][^\$\{\"'\s]{6,}['"]""",
        "Hardcoded password string",
        "Use environment variables or a secrets manager. Never hardcode passwords.",
    ),

    # ═══════════════════════════════════════════════════════════════
    # MEDIUM — Risky patterns requiring investigation
    # ═══════════════════════════════════════════════════════════════

    (
        "MEDIUM", "External Download", "CWE-829",
        r"(?:curl|wget)\s+(?:-[a-zA-Z\d\s]*)*https?://",
        "External download via curl/wget",
        "Verify the URL is trusted, uses HTTPS, and validate a checksum after download.",
    ),
    (
        "MEDIUM", "Dynamic Import from URL", "CWE-829",
        r"""import\s*\(\s*['"]https?://|require\s*\(\s*['"]https?://|source\s+https?://""",
        "Code imported dynamically from a remote URL",
        "Remote dynamic imports bypass local review. Pin to a specific content hash or use a local copy.",
    ),
    (
        "MEDIUM", "Unpinned npm Dependency", "CWE-1104",
        r""""(?:dependencies|devDependencies|peerDependencies)"\s*:\s*\{[^}]*"[^"@]+"\s*:\s*"""
        r""""(?:\^|~|\*|latest|>=)""",
        "npm dependency with floating version (^, ~, *, latest, >=)",
        "Pin exact versions in package.json and commit the lockfile to prevent supply chain attacks.",
    ),
    (
        "MEDIUM", "Unpinned pip Install", "CWE-1104",
        r"(?:^|\s)pip(?:3)?\s+install\s+(?!-r\s)(?:[a-zA-Z0-9\-_.]+)(?!\s*==)",
        "pip install without exact version pinning",
        "Use `package==X.Y.Z`. For scripts, generate a requirements.txt with hashes via pip-compile.",
    ),
    (
        "MEDIUM", "Shell Startup File Modification", "CWE-15",
        r"(?:>>|>\s*)\s*(?:~/|\$HOME/|/home/[^/]+/)\.(?:bashrc|zshrc|bash_profile|profile|bash_login|zprofile)|"
        r"echo\s+[^\n]*>>\s*\$HOME/\.",
        "Modifying user shell startup file (.bashrc, .zshrc, etc.)",
        "Startup file changes persist across sessions. Skills must not modify these files.",
    ),
    (
        "MEDIUM", "Crontab Installation", "CWE-15",
        r"crontab\s+[-/]|(?:>>|>)\s*/etc/cron(?:\.d|tab)?",
        "Installing or modifying cron jobs",
        "Skills must not schedule persistent background tasks without explicit user consent.",
    ),
    (
        "MEDIUM", "World-Writable File Permissions", "CWE-276",
        r"chmod\s+(?:[0-7][0-7][7]|777|a\+w|o\+w)",
        "World-writable file permissions (chmod 777 or o+w)",
        "Use the least permissive mode needed (644 for files, 755 for executables).",
    ),
    (
        "MEDIUM", "Sensitive Env Var in HTTP Request", "CWE-200",
        r"(?:curl|wget|fetch|requests\.(?:get|post))[^\n]*\$(?:HOME|USER|SECRET|TOKEN|KEY|PASS|PASSWORD|API)",
        "Environment variable (potentially sensitive) included in HTTP request",
        "Avoid leaking env vars in URLs or headers. Use dedicated auth headers only for intended endpoints.",
    ),
    (
        "MEDIUM", "os.system Usage", "CWE-78",
        r"\bos\.system\s*\(",
        "os.system() passes commands through the shell",
        "Replace with subprocess.run([...], shell=False). os.system is vulnerable to injection.",
    ),
    (
        "MEDIUM", "Global git Config Modification", "CWE-15",
        r"git\s+config\s+--global",
        "Modifying global git configuration",
        "Global git config changes affect all repos. Scope changes to the local repo or remove.",
    ),
    (
        "MEDIUM", "Unsafe Global Package Install", "CWE-829",
        r"npm\s+install\s+-g\b|pip(?:3)?\s+install\s+--user(?!\s+--)|gem\s+install\s+(?!--local\b)",
        "Global package installation without explicit user request",
        "Skills should not install global packages. Declare dependencies and let the user install them.",
    ),
    (
        "MEDIUM", "Insecure YAML Load", "CWE-502",
        r"\byaml\.load\s*\(\s*[^,)]+\s*\)(?!\s*,\s*Loader\s*=\s*yaml\.(?:Safe|Full|Base)Loader)",
        "yaml.load() without a safe Loader — can execute arbitrary Python",
        "Replace with yaml.safe_load(). The default yaml.load() executes arbitrary Python via !!python/object.",
    ),

    # ═══════════════════════════════════════════════════════════════
    # LOW — Worth noting; low direct risk in typical contexts
    # ═══════════════════════════════════════════════════════════════

    (
        "LOW", "Insecure Deserialization (pickle)", "CWE-502",
        r"\bpickle\.loads?\s*\(",
        "pickle.loads() deserializes arbitrary Python objects",
        "Use pickle only on data you generated. Never unpickle untrusted input.",
    ),
    (
        "LOW", "Weak Hash Algorithm", "CWE-327",
        r"\bhashlib\.(md5|sha1)\s*\(|\bMD5\s*\(|\bSHA1\s*\(",
        "Weak cryptographic hash (MD5 or SHA-1)",
        "Use SHA-256 or SHA-3 for any security-relevant hashing.",
    ),
    (
        "LOW", "Sensitive Data in Logs", "CWE-312",
        r"(?:console\.log|print\s*\(|logger\.\w+\s*\(|logging\.\w+\s*\()[^\n]*"
        r"(?:password|secret|token|api[_-]?key|credential|private[_-]?key)",
        "Sensitive data potentially written to logs",
        "Redact or remove log statements that include credentials, tokens, or keys.",
    ),
    (
        "LOW", "Insecure Temp File", "CWE-377",
        r"\btempfile\.mktemp\s*\(|(?<!['\"/])/tmp/[a-zA-Z0-9_.-]{3,}(?=['\"\s;|&])",
        "Predictable or insecure temp file pattern",
        "Use tempfile.mkstemp() or tempfile.NamedTemporaryFile() to avoid TOCTOU races.",
    ),
    (
        "LOW", "Privilege Escalation (sudo)", "CWE-250",
        r"^\s*sudo\s+(?!-[nkuiSbCeAp])[a-zA-Z/]",
        "sudo usage — elevates privileges",
        "Verify that elevated privileges are required. Document the reason in the SKILL.md.",
    ),
    (
        "LOW", "eval() General", "CWE-95",
        r"(?<!\w)eval\s*\(\s*[^)]{5,}\)",
        "eval() usage — requires careful review",
        "Prefer explicit parsers. Reserve eval for trusted, static inputs only.",
    ),

    # ═══════════════════════════════════════════════════════════════
    # INFO — Informational; not inherently risky but worth noting
    # ═══════════════════════════════════════════════════════════════

    (
        "INFO", "External HTTP Request", "N/A",
        r"(?:requests\.(?:get|post|put|delete|patch)|axios\.(?:get|post)|fetch\s*\()\s*\(\s*['\"](https?://[^'\"]+)['\"]",
        "External HTTP request to hardcoded URL",
        "Verify the URL is expected and that no sensitive data is sent unintentionally.",
    ),
    (
        "INFO", "Environment Variable Read", "N/A",
        r"os\.environ(?:\.get)?\s*\(\s*['\"]|process\.env\.[A-Z_]+",
        "Reading environment variable",
        "Review which env vars are consumed and document them in SKILL.md.",
    ),
    (
        "INFO", "File Permission Change", "N/A",
        r"\bchmod\s+[0-9]+",
        "File permission change",
        "Verify the permissions set are appropriate and not overly broad.",
    ),
    (
        "INFO", "External URL in SKILL.md", "N/A",
        r"https?://[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+",
        "External URL reference in skill file",
        "Verify this URL is intentional and documented. URLs in SKILL.md instruct Claude to make network calls.",
    ),
]


@dataclass
class Finding:
    id: str
    severity: str
    category: str
    cwe: str
    file: str
    line: int
    code: str
    description: str
    remediation: str


def scan_file(path: Path, root: Path) -> List[Finding]:
    findings: List[Finding] = []
    rel = str(path.relative_to(root))

    if path.suffix.lower() in SKIP_EXTENSIONS:
        return findings

    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except (PermissionError, IsADirectoryError, OSError):
        return findings

    lines = text.splitlines()
    seen: set = set()  # deduplicate same file+line+category

    for sev, cat, cwe, pattern, desc, remediation in PATTERNS:
        try:
            rx = re.compile(pattern, re.IGNORECASE | re.MULTILINE)
        except re.error:
            continue

        for m in rx.finditer(text):
            line_no = text[: m.start()].count("\n") + 1
            line_txt = lines[line_no - 1].strip() if line_no <= len(lines) else ""

            # Skip commented-out lines
            stripped = line_txt.lstrip()
            if stripped.startswith(("#", "//", "*", ";", "rem ", "REM ")):
                continue

            key = (rel, line_no, cat)
            if key in seen:
                continue
            seen.add(key)

            findings.append(
                Finding(
                    id="",
                    severity=sev,
                    category=cat,
                    cwe=cwe,
                    file=rel,
                    line=line_no,
                    code=line_txt[:300],
                    description=desc,
                    remediation=remediation,
                )
            )

    return findings


def scan_dir(root: Path) -> List[Finding]:
    all_findings: List[Finding] = []

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]

        for fname in filenames:
            fp = Path(dirpath) / fname
            all_findings.extend(scan_file(fp, root))

    all_findings.sort(
        key=lambda f: (SEVERITY_ORDER.get(f.severity, 99), f.file, f.line)
    )

    for i, f in enumerate(all_findings, 1):
        f.id = f"SEC-{i:03d}"

    return all_findings


def binary_files(root: Path) -> List[str]:
    binaries = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            fp = Path(dirpath) / fname
            if fp.suffix.lower() in SKIP_EXTENSIONS:
                binaries.append(str(fp.relative_to(root)))
    return binaries


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 scan.py <skill-directory>", file=sys.stderr)
        sys.exit(1)

    root = Path(sys.argv[1]).resolve()
    if not root.is_dir():
        print(f"Error: '{root}' is not a directory", file=sys.stderr)
        sys.exit(1)

    findings = scan_dir(root)
    bins = binary_files(root)

    counts: dict = {}
    for f in findings:
        counts[f.severity] = counts.get(f.severity, 0) + 1

    output = {
        "skill_directory": str(root),
        "skill_name": root.name,
        "findings": [asdict(f) for f in findings],
        "binary_files": bins,
        "summary": {
            "total": len(findings),
            "by_severity": counts,
            "binary_file_count": len(bins),
        },
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
