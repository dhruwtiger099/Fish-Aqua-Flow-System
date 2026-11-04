import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const api = __ENV.API_URL || 'http://localhost:3000';
const auth = __ENV.API_TOKEN ? { Authorization: `Bearer ${__ENV.API_TOKEN}` } : {};
const failureRate = new Rate('request_failures');
const apiLatency = new Trend('api_latency_ms');

export const options = {
  scenarios: {
    steady_1000_users: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '5m',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    request_failures: ['rate<0.01'],
  },
};

export default function () {
  const params = { headers: { ...auth, Accept: 'application/json' }, tags: { suite: 'farm-api' } };
  const readPaths = [
    '/api/dashboard/summary?limit=25',
    '/api/inventory?limit=25',
    '/api/purchases?limit=25',
    '/api/reports/summary?limit=25',
  ];
  const response = http.get(`${api}${readPaths[(__VU + __ITER) % readPaths.length]}`, params);
  apiLatency.add(response.timings.duration);
  const ok = check(response, {
    'read is successful': (res) => res.status === 200,
    'response is JSON-like': (res) => res.headers['Content-Type']?.includes('application/json'),
  });
  failureRate.add(!ok);
  sleep(Math.random() * 2 + 1);
}

export function optionsForWriteScenario() {
  return {
    scenarios: {
      writes: {
        executor: 'constant-arrival-rate',
        rate: 30,
        timeUnit: '1m',
        duration: '5m',
        preAllocatedVUs: 50,
        maxVUs: 200,
      },
    },
  };
}
