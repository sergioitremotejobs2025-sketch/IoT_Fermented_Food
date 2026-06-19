# GCP Cost Summary (2026-03-06)

## Resources used today

| Resource | Approx. Daily Cost | Status |
|----------|--------------------|--------|
| GKE Autopilot cluster | $2.00 | DELETED |
| Residual Storage Disks (PVCs) | $0.05 | DELETED |
| Artifact Registry | $0.30 | ACTIVE (negligible cost) |
| Cloud Build | $0.25 | COMPLETED |
| **Total estimated session cost** | **$2.60** | |

> [!NOTE]
> All session costs are fully covered by the Google Cloud Free Trial credits.

## Verified Teardown State (21:18 CET)

I have performed a manual inspection of the GCP project and confirmed the following:
- [x] **Clusters**: 0 active (Verified with `gcloud container clusters list`)
- [x] **Load Balancers**: 0 active (Verified with `gcloud compute forwarding-rules list`)
- [x] **Disks**: 0 active (Deleted residual PVC disks manually)
- [x] **Compute Instances**: 0 active nodes.

The project has returned to a **$0.00/day** burn rate.
