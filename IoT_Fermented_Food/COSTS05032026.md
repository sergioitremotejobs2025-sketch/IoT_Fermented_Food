# 💰 GCP Cost Estimates — `iot-microservices-gcp`

> Calculated for **GKE Autopilot** in **`europe-west1`** (March 2026).
> Autopilot bills per **requested** resource (vCPU + Memory), not per node.

---

## Pricing Rates (europe-west1)

| Resource | Rate |
|---|---|
| vCPU | $0.0585 / vCPU / hour |
| Memory | $0.0081 / GiB / hour |
| L4 Load Balancer (base) | $0.025 / hour |
| LB Forwarding Rules | $0.01 / rule / hour |
| Persistent Disk SSD | $0.000231 / GiB / hour |

---

## Pod Resource Inventory (Before Right-Sizing)

| Pod | CPU Request | RAM Request | Cost/hr (est.) |
|---|---|---|---|
| `ai-ms` | 500m | 512Mi | $0.033 |
| `angular-ms` | 100m | 103Mi | $0.007 |
| `auth-ms` | 100m | 103Mi | $0.007 |
| `fake-arduino-iot-pictures` | 500m* | 2048Mi* | $0.046 |
| `measure-ms` | 100m | 103Mi | $0.007 |
| `microcontrollers-ms` | 100m | 103Mi | $0.007 |
| `mongo` | 500m | 512Mi | $0.033 |
| `mysql` | 500m | 512Mi | $0.033 |
| `orchestrator-ms` | 250m | 256Mi | $0.017 |
| `publisher-ms` (CronJob ×3) | 500m* | 2048Mi* | $0.046 |
| `rabbitmq` | 250m | 256Mi | $0.017 |
| `stats-ms` | 1000m | 16Mi | $0.059 |
| `ingress-nginx-controller` | 100m | 103Mi | $0.007 |

> *Autopilot defaults applied because no resource requests were specified in the manifest.

**Total before right-sizing: ~5.5 vCPU / 11.5 GiB → ~$0.46/hr**

---

## Daily / Monthly Cost Breakdown (Before)

| Period | Compute | Network/Storage | **Total** |
|---|---|---|---|
| Per hour | $0.41 | $0.046 | **$0.46** |
| Per day (24h) | $9.84 | $1.10 | **$10.94** |
| Per month (30d) | $295 | $33 | **~$328** |

---

## ✂️ Right-Sizing Changes Applied

The following optimizations were made to reduce cost by ~50%:

| Pod | Before RAM | After RAM | Before CPU | After CPU | Saving/hr |
|---|---|---|---|---|---|
| `fake-arduino-iot-pictures` | 2048Mi (default) | 256Mi | 500m (default) | 100m | $0.034 |
| `publisher-ms` | 2048Mi (default) | 256Mi | 500m (default) | 100m | $0.034 |
| `stats-ms` | 1000m CPU limit | 250m CPU limit | — | — | $0.044 |

**Total hourly saving: ~$0.11/hr → ~$2.64/day → ~$80/month**

---

## Pod Resource Inventory (After Right-Sizing)

| Pod | CPU Request | RAM Request | Cost/hr (est.) |
|---|---|---|---|
| `ai-ms` | 500m | 512Mi | $0.033 |
| `angular-ms` | 100m | 103Mi | $0.007 |
| `auth-ms` | 100m | 103Mi | $0.007 |
| `fake-arduino-iot-pictures` | **100m** | **256Mi** | **$0.008** |
| `measure-ms` | 100m | 103Mi | $0.007 |
| `microcontrollers-ms` | 100m | 103Mi | $0.007 |
| `mongo` | 500m | 512Mi | $0.033 |
| `mysql` | 500m | 512Mi | $0.033 |
| `orchestrator-ms` | 250m | 256Mi | $0.017 |
| `publisher-ms` | **100m** | **256Mi** | **$0.008** |
| `rabbitmq` | 250m | 256Mi | $0.017 |
| `stats-ms` | **250m** | 16Mi | **$0.015** |
| `ingress-nginx-controller` | 100m | 103Mi | $0.007 |

**Total after right-sizing: ~3.0 vCPU / 3.0 GiB → ~$0.22/hr**

---

## Daily / Monthly Cost Breakdown (After)

| Period | Compute | Network/Storage | **Total** |
|---|---|---|---|
| Per hour | $0.20 | $0.046 | **$0.25** |
| Per day (24h) | $4.80 | $1.10 | **$5.90** |
| Per month (30d) | $144 | $33 | **~$177** |

---

## 💡 Further Savings Tips

| Tip | Est. Saving |
|---|---|
| **Scale down to 0 when not in use** (`kubectl scale --replicas=0`) | Up to 100% while off |
| **Delete the cluster on weekends** (re-create takes ~15 min) | ~$60/month |
| **Use Spot/Preemptible GKE nodes** (not available on Autopilot) | N/A for Autopilot |
| **Move to GKE Standard** for more control at lower cost | ~30% saving |

---
*Generated: 2026-03-05 | Project: iot-microservices-gcp | Cluster: iot-cluster (Autopilot, europe-west1)*
