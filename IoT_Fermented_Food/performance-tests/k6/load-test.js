import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// Custom metrics to track specific IoT business logic
const OrchestratorHealthCheck = new Counter('orchestrator_health_check');

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<300'], // 95% of requests must be under 300ms
    'http_req_failed': ['rate<0.01'],    // Error rate must be < 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost';

export default function () {
  group('Infrastructure Health Check', function () {
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
      'health status is 200': (r) => r.status === 200,
      'service is orchestrator': (r) => r.json().service === 'orchestrator-ms',
    });
    OrchestratorHealthCheck.add(1);
  });

  group('Observability Integration', function () {
    const metricsRes = http.get(`${BASE_URL}/metrics`);
    check(metricsRes, {
      'metrics status is 200': (r) => r.status === 200,
      'has prometheus metrics': (r) => r.body.includes('http_requests_total') || r.body.includes('process_cpu_user_seconds_total'),
    });
  });

  // Simulated think time
  sleep(Math.random() * 3 + 1);
}
