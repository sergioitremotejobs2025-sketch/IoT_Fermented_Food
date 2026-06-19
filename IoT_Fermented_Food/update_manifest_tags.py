import os
import glob
import re

REGISTRY = "europe-west1-docker.pkg.dev/iot-microservices-gcp/iot-repo"
PROD_DIR = "manifests-k8s/prod"
SERVERLESS_DIR = "manifests-k8s/serverless"

yaml_files = glob.glob(os.path.join(PROD_DIR, "*.yaml")) + glob.glob(os.path.join(SERVERLESS_DIR, "*.yaml"))

images_to_update = {
    "ai-ms:latest": f"{REGISTRY}/ai-ms:latest",
    "sergioitremotejobs2025/measure-ms": f"{REGISTRY}/measure-ms:latest",
    "sergioitremotejobs2025/microcontrollers-ms": f"{REGISTRY}/microcontrollers-ms:latest",
    "sergioitremotejobs2025/mysql-iot": f"{REGISTRY}/mysql-iot:latest",
    "fake-arduino-iot-pictures:latest": f"{REGISTRY}/fake-arduino-iot-pictures:latest",
    "sergioitremotejobs2025/publisher-ms": f"{REGISTRY}/publisher-ms:latest",
    "sergioitremotejobs2025/angular-ms:latest": f"{REGISTRY}/angular-ms:latest",
    "sergioitremotejobs2025/orchestrator-ms:latest": f"{REGISTRY}/orchestrator-ms:latest",
    "sergioitremotejobs2025/stats-ms": f"{REGISTRY}/stats-ms:latest",
    "sergioitremotejobs2025/auth-ms": f"{REGISTRY}/auth-ms:latest",
}

for file_path in yaml_files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    modified = False
    for old_img, new_img in images_to_update.items():
        if old_img in content:
            content = content.replace(f"image: {old_img}", f"image: {new_img}")
            modified = True
            
    if modified:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")

print("YAML update complete.")
