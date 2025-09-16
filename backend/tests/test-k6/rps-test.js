import http from 'k6/http';
import { Rate } from 'k6/metrics';
import { check } from 'k6';

export let errorRate = new Rate('errors');

// Configure number of requests per second using constant-arrival-rate executor
export let options = {
  scenarios: {
    rps_scenario: {
      executor: 'constant-arrival-rate',
      rate: 100, // target requests per second
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
  },
  thresholds: {
    errors: ['rate<0.01'], // <1% errors
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000/foodloop';
// PATH can be set via --env PATH=/publicaciones, default to /publicaciones
const PATH = __ENV.PATH || '/publicaciones';

export default function () {
  const url = `${BASE}${PATH}`;
  const res = http.get(url);
  const ok = check(res, {
    'status is 200': (r) => r.status === 200,
  });
  errorRate.add(!ok);
}
