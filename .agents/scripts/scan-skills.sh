#!/usr/bin/env bash
# Hook: PostToolUse › Bash
# After Bash commands that install skills, scans .agents/skills/ and .claude/skills/
# for any skill without a .audited marker and quarantines it to .agents/skills/disabled/.
#
# A skill is considered "audited/trusted" when a .audited file exists inside its directory.
# The security audit step creates this marker after a successful review.
#
# Called with Claude Code PostToolUse JSON on stdin, or standalone with no arguments.
# Fast-path: exits in < 10ms if no unaudited skills are found.

set -euo pipefail

PROJECT_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null || pwd)"
DISABLED_DIR="$PROJECT_ROOT/.agents/skills/disabled"

# Skills exempted from quarantine (the audit skill itself)
SKIP_LIST="skill-security-auditor"

# Directories to scan
SCAN_DIRS=(
    "$PROJECT_ROOT/.agents/skills"
    "$PROJECT_ROOT/.claude/skills"
)

# ── If called from a Bash PostToolUse hook, filter by command relevance ───────
if [ ! -t 0 ]; then
    RAW=$(cat)
    if [ -n "$RAW" ]; then
        COMMAND=$(python3 - "$RAW" 2>/dev/null <<'PYEOF'
import json, sys
try:
    data = json.loads(sys.argv[1])
    ti = data.get("tool_input", data)
    print(ti.get("command", ""))
except Exception:
    print("")
PYEOF
        )
        case "$COMMAND" in
            *skills\ add*|*skills\ install*|*skills\ update*|*skills\ upgrade*|\
            *skills\ sync*|*skill\ add*|*npx\ skills*|*pnpx\ skills*|*bunx\ skills*)
                : ;;  # proceed
            *)
                exit 0 ;;  # not a skill command — exit fast
        esac
    fi
fi

# ── Scan and quarantine ───────────────────────────────────────────────────────
mkdir -p "$DISABLED_DIR"

for SKILLS_DIR in "${SCAN_DIRS[@]}"; do
    [ -d "$SKILLS_DIR" ] || continue

    while IFS= read -r SKILL_MD; do
        SKILL_DIR="$(dirname "$SKILL_MD")"
        SKILL_NAME="$(basename "$SKILL_DIR")"

        # Skip the disabled subtree
        case "$SKILL_DIR" in
            "$DISABLED_DIR"/*) continue ;;
        esac

        # Skip exempted skills
        case " $SKIP_LIST " in
            *" $SKILL_NAME "*) continue ;;
        esac

        # Skip already-audited skills
        [ -f "$SKILL_DIR/.audited" ] && continue

        # Handle name collision in disabled/: append origin suffix
        DEST="$DISABLED_DIR/$SKILL_NAME"
        if [ -e "$DEST" ]; then
            ORIGIN_LABEL="$(basename "$SKILLS_DIR" | sed 's/^\.//')"
            DEST="$DISABLED_DIR/${SKILL_NAME}--${ORIGIN_LABEL}"
        fi

        mv "$SKILL_DIR" "$DEST"
        DEST_REL="${DEST#$PROJECT_ROOT/}"

        cat <<MSG

================================================================================
NOVA SKILL DETECTADA — AUDITORIA DE SEGURANÇA NECESSÁRIA
================================================================================
Skill    : $SKILL_NAME
Origem   : ${SKILLS_DIR#$PROJECT_ROOT/}
Destino  : $DEST_REL

A skill foi quarentenada e NÃO será carregada até a auditoria ser concluída.

Execute agora:
  /skill-security-auditor $DEST_REL

Após aprovação, ative com:
  mv $DEST_REL .agents/skills/$SKILL_NAME
================================================================================
MSG
    done < <(find "$SKILLS_DIR" -maxdepth 2 -name "SKILL.md" 2>/dev/null)
done

exit 0
