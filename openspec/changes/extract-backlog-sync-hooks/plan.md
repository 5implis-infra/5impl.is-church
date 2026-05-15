## Plan

### 1. Create Hook Scripts

1. Create `.git/hooks/backlog-sync-docs-to-backlog.sh`
2. Create `.git/hooks/backlog-sync-backlog-to-docs.sh`
3. Make both executable

### 2. Update Installer and pre-commit

1. Update `install-backlog-sync-hook.sh` to install the new scripts
2. Update `pre-commit` to call the scripts

### 3. Test

1. Run installer
2. Test docs→backlog sync
3. Test backlog→docs sync