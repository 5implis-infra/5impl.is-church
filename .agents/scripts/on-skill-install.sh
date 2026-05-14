#!/usr/bin/env bash
# Hook: on-skill-install
# Quarantines new skills added to .agents/skills/ until a security audit is run.
#
# Calling conventions supported (tried in order):
#
#   1. CLI argument      on-skill-install.sh path/to/SKILL.md
#   2. Env variables     FILE_PATH=... / HOOK_FILE_PATH=... / HOOK_PATH=...
#   3. stdin JSON        Claude Code format:
#                          { "tool_input": { "file_path": "..." } }
#                        or flat:
#                          { "file_path": "..." }
#   4. stdin plain text  just the file path on the first line

set -euo pipefail

PROJECT_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null || pwd)"

# Snapshot env vars before any local assignment overwrites them
_ENV_FILE_PATH="${FILE_PATH:-}"
_ENV_HOOK_FILE_PATH="${HOOK_FILE_PATH:-}"
_ENV_HOOK_PATH="${HOOK_PATH:-}"
_ENV_OPENCODE="${OPENCODE_FILE_PATH:-}"
_ENV_ANTIGRAVITY="${ANTIGRAVITY_FILE_PATH:-}"

# ── 1. CLI argument ──────────────────────────────────────────────────────────
FILE_PATH="${1:-}"

# ── 2. Environment variables ─────────────────────────────────────────────────
if [ -z "$FILE_PATH" ]; then
    FILE_PATH="${_ENV_HOOK_FILE_PATH:-${_ENV_FILE_PATH:-${_ENV_HOOK_PATH:-${_ENV_OPENCODE:-${_ENV_ANTIGRAVITY:-}}}}}"
fi

# ── 3 & 4. stdin ─────────────────────────────────────────────────────────────
if [ -z "$FILE_PATH" ] && [ ! -t 0 ]; then
    RAW=$(cat)
    if [ -n "$RAW" ]; then
        # Try JSON first (Claude Code, opencode, and other JSON-based runtimes)
        FILE_PATH=$(python3 - "$RAW" 2>/dev/null <<'PYEOF'
import json, sys
raw = sys.argv[1]
try:
    data = json.loads(raw)
    # Claude Code PostToolUse: { tool_name, tool_input: { file_path } }
    ti = data.get("tool_input", data)
    path = ti.get("file_path", "")
    # antigravity / generic: { path, file, filename }
    if not path:
        path = data.get("path", data.get("file", data.get("filename", "")))
    print(path)
except Exception:
    # Fallback: treat stdin as a plain path
    line = raw.strip().splitlines()[0] if raw.strip() else ""
    print(line)
PYEOF
        )
    fi
fi

[ -z "$FILE_PATH" ] && exit 0

# ── Resolve absolute path ─────────────────────────────────────────────────────
case "$FILE_PATH" in
    /*) ABS_PATH="$FILE_PATH" ;;
    *)  ABS_PATH="$PROJECT_ROOT/$FILE_PATH" ;;
esac

DISABLED_DIR="$PROJECT_ROOT/.agents/skills/disabled"

# Accept SKILL.md from either .agents/skills/ or .claude/skills/
AGENTS_SKILLS="$PROJECT_ROOT/.agents/skills"
CLAUDE_SKILLS="$PROJECT_ROOT/.claude/skills"

case "$ABS_PATH" in
    "$AGENTS_SKILLS"/*/SKILL.md | "$CLAUDE_SKILLS"/*/SKILL.md) : ;;
    *) exit 0 ;;
esac

# Skip skills already in the disabled subtree
case "$ABS_PATH" in
    "$DISABLED_DIR"/*) exit 0 ;;
esac

SKILL_DIR="$(dirname "$ABS_PATH")"
SKILL_NAME="$(basename "$SKILL_DIR")"

# Never quarantine the audit skill itself
[ "$SKILL_NAME" = "skill-security-auditor" ] && exit 0

# Skip skills that have already been audited
[ -f "$SKILL_DIR/.audited" ] && exit 0

# ── Quarantine ────────────────────────────────────────────────────────────────
mkdir -p "$DISABLED_DIR"
if [ -d "$SKILL_DIR" ]; then
    mv "$SKILL_DIR" "$DISABLED_DIR/$SKILL_NAME"
    cat <<MSG

================================================================================
NOVA SKILL DETECTADA — AUDITORIA DE SEGURANÇA NECESSÁRIA
================================================================================
Skill    : $SKILL_NAME
Destino  : .agents/skills/disabled/$SKILL_NAME

A skill foi quarentenada e NÃO será carregada até a auditoria ser concluída.

Execute agora:
  /skill-security-auditor .agents/skills/disabled/$SKILL_NAME

Após aprovação, ative com:
  mv .agents/skills/disabled/$SKILL_NAME .agents/skills/$SKILL_NAME
================================================================================
MSG
fi
