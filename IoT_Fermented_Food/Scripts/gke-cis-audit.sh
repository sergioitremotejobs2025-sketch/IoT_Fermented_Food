#!/bin/bash
# scripts/gke-cis-audit.sh
# Static Analysis of the IoT Microservices repository against CIS GKE Benchmarking standards.

set -e

echo "🔎 Starting CIS GKE Benchmarking Static Audit..."
echo "=============================================="

# 1. Check for non-root users in Dockerfiles
echo "[1/4] User Privilege Audit:"
DOCKERFILES=$(find . -maxdepth 2 -name "Dockerfile")
for df in $DOCKERFILES; do
    if grep -iq "USER" "$df"; then
        echo "  ✅ $df uses explicit USER"
    else
        echo "  ❌ $df runs as root (CIS Violation 4.1.1)"
    fi
done

# 2. Check for SecurityContexts in Kubernetes Manifests
echo -e "\n[2/4] Workload SecurityContext Audit:"
MANIFESTS=$(find manifests-k8s -name "*.yaml")
for mf in $MANIFESTS; do
    # Skip non-workload manifests (Services, ConfigMaps, etc.)
    if grep -qE "kind: Deployment|kind: StatefulSet|kind: DaemonSet" "$mf"; then
        CONTENT=$(cat "$mf")
        if echo "$CONTENT" | grep -q "securityContext:"; then
            if echo "$CONTENT" | grep -q "runAsNonRoot: true" && echo "$CONTENT" | grep -q "readOnlyRootFilesystem: true"; then
                echo "  ✅ $mf: FULL COMPLIANCE (CIS 5.7.1, 5.7.3)"
            else
                echo "  ⚠️  $mf: securityContext found, but missing hardening details."
            fi
        else
            echo "  ❌ $mf: MISSING securityContext (CIS Violation 5.7.1)"
        fi
    fi
done

# 3. Check for Network Policies
echo -e "\n[3/4] Network Isolation Audit:"
if [ -f "manifests-k8s/security/gke-hardening-baseline.yaml" ]; then
    echo "  ✅ Global Network Policy baseline found."
else
    echo "  ❌ Global Network Hardening Baseline missing (CIS Violation 5.6.1)"
fi

# 4. Check for GCP-level hardening in setup scripts
echo -e "\n[4/4] Infrastructure Hardening Audit:"
if grep -q "create-auto" setup_gcp_infra.sh; then
    echo "  ✅ GKE Autopilot detected. Network isolation is managed by GCP (CIS 5.6.1 Pass)."
elif grep -q "enable-network-policy" setup_gcp_infra.sh; then
    echo "  ✅ Network policy explicitly enabled in Standard cluster setup."
else
    echo "  ❌ Network isolation NOT explicitly enabled (CIS Violation 5.7.1)."
fi

echo -e "\n=============================================="
echo "Phase 2 Security Audit Complete."
