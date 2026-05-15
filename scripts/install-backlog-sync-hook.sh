#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOK_BLOCK_START="# BACKLOG-DOC-INDEX-SYNC START"
HOOK_BLOCK_END="# BACKLOG-DOC-INDEX-SYNC END"
HOOK_INSTALL_MARKER="backlog-doc-index-sync-installed"

show_help() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  --uninstall    Remove the backlog sync hook"
  echo "  --help         Show this help message"
}

uninstall_hook() {
  cd "$PROJECT_DIR"
  if [ -f ".git/hooks/pre-commit" ]; then
    python3 -c "
import sys
with open('.git/hooks/pre-commit', 'r') as f:
    lines = f.readlines()
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if line.strip() == '# BACKLOG-DOC-INDEX-SYNC START':
        start_idx = i
    if line.strip() == '# BACKLOG-DOC-INDEX-SYNC END':
        end_idx = i
        break
if start_idx is not None and end_idx is not None:
    with open('.git/hooks/pre-commit', 'w') as f:
        f.writelines(lines[:start_idx] + lines[end_idx+1:])
"
    echo "Uninstall complete"
  else
    echo "Hook not found"
  fi
}

install_hook() {

  find "$SCRIPT_DIR/.git" -name '*.sh' -exec chmod +x {} +

  cd "$PROJECT_DIR"
  mkdir -p .git/hooks

  if [ -f ".git/hooks/pre-commit" ]; then
    if grep -q "$HOOK_INSTALL_MARKER" ".git/hooks/pre-commit" 2>/dev/null; then
      echo "Hook already installed, updating..."
      python3 -c "
import sys
with open('.git/hooks/pre-commit', 'r') as f:
    lines = f.readlines()
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if line.strip() == '# BACKLOG-DOC-INDEX-SYNC START':
        start_idx = i
    if line.strip() == '# BACKLOG-DOC-INDEX-SYNC END':
        end_idx = i
        break
if start_idx is not None and end_idx is not None:
    with open('.git/hooks/pre-commit', 'w') as f:
        f.writelines(lines[:start_idx] + lines[end_idx+1:])
"
    fi
  fi

  cat >> ".git/hooks/pre-commit" << HOOK_EOF
$HOOK_BLOCK_START
# Installed by $HOOK_INSTALL_MARKER
# Do not edit between START and END markers

scripts/.git/backlog-sync-docs-to-backlog.sh
scripts/.git/backlog-sync-backlog-to-docs.sh
$HOOK_BLOCK_END
HOOK_EOF

  chmod +x ".git/hooks/pre-commit"
  echo "Hook installed (scripts extracted)"
}

case "${1:-}" in
  --uninstall)
    uninstall_hook
    ;;
  --help)
    show_help
    ;;
  *)
    install_hook
    ;;
esac