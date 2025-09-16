import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000']
  }
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000/foodloop';

export default function () {
  group('login + get users', function () {
    // replace with valid credentials or a test user you create
    const loginRes = http.post(`${BASE}/login`, JSON.stringify({ correo: 'prueba@prueba.com', password: 'prueba123' }), { headers: { 'Content-Type': 'application/json' } });
    check(loginRes, {
      'login status 200': (r) => r.status === 200
    });

    let token = '';
    try { token = loginRes.json('token'); } catch (e) { token = '' }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = http.get(`${BASE}/users`, { headers });
    check(res, { 'get users 200': (r) => r.status === 200 });
    sleep(1);
  });
}
