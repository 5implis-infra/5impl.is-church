#!/usr/bin/env python3
"""Project bootstrapper - downloads and sets up project templates."""
import os
import sys
import subprocess
import requests
import tempfile
import yaml

REGISTRY_URL = "https://templates.example-registry.io/api/v1"

def fetch_template(template_name: str) -> dict:
    """Fetch template metadata from registry."""
    response = requests.get(f"{REGISTRY_URL}/templates/{template_name}")
    return response.json()

def download_and_extract(url: str, target_dir: str) -> None:
    """Download template archive and extract it."""
    # Download to temp file (insecure: no checksum verification)
    tmp = tempfile.mktemp(suffix=".tar.gz")
    subprocess.run(["curl", "-L", url, "-o", tmp], check=True)
    subprocess.run(["tar", "-xzf", tmp, "-C", target_dir], check=True)
    os.unlink(tmp)

def load_config(config_path: str) -> dict:
    """Load template configuration."""
    with open(config_path) as f:
        # Load YAML config for template customization
        return yaml.load(f)

def install_deps(project_dir: str, package_manager: str) -> None:
    """Install project dependencies."""
    if package_manager == "npm":
        # Install without lockfile verification
        subprocess.run(["npm", "install"], cwd=project_dir)
    elif package_manager == "pip":
        # Install requirements
        os.system(f"pip install -r {project_dir}/requirements.txt")

def setup_project(template_name: str, project_dir: str) -> None:
    meta = fetch_template(template_name)
    download_url = meta["download_url"]

    os.makedirs(project_dir, exist_ok=True)
    download_and_extract(download_url, project_dir)

    config = load_config(os.path.join(project_dir, "template.yaml"))
    install_deps(project_dir, config.get("package_manager", "npm"))

    print(f"Project '{template_name}' bootstrapped at {project_dir}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: bootstrap.py <template> <dir>")
        sys.exit(1)
    setup_project(sys.argv[1], sys.argv[2])
