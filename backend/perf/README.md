k6 performance scripts

Files:
- rps-test.js: constant arrival rate test to measure requests per second against `/foodloop/users`.
- scenario-login-and-get.js: VU-based scenario that logs in (POST /login) and requests GET /users.

Run locally with k6 installed:

k6 run perf/rps-test.js --env BASE_URL=http://localhost:3000/foodloop

k6 run perf/scenario-login-and-get.js --env BASE_URL=http://localhost:3000/foodloop

Using Docker (no local k6 install):

docker run --rm -i loadimpact/k6 run - < perf/rps-test.js --env BASE_URL=http://host.docker.internal:3000/foodloop

Notes:
- The `rps-test.js` uses the `constant-arrival-rate` executor and targets 100 RPS by default. Adjust `rate` in the file or pass env var replacements if needed.
- Ensure the backend server is running and accessible. If running server on Windows and testing from Docker, `host.docker.internal` resolves to the host.
- The `scenario-login-and-get.js` requires a valid test user or mocked endpoint. Replace credentials accordingly.
