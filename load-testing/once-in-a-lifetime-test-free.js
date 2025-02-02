import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
   stages: [
      { duration: '1m', target: 1000 },
      { duration: '10m', target: 1000 },
      { duration: '1m', target: 0 },
    ],
};

export default function () {
  const garageId = "1bac896e-443a-4785-a0a6-459a12930baf";

  let response;

  do {
    const url = `https://free.park-staging-app.tech/parking/garare/enter/${garageId}`;
    response = http.post(url);
  } while (response.status != 200);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });

  const ticketId = response.data();


  do {
    const url = `https://free.park-staging-app.tech/parking/garage/handlePayment/${ticketId}`;
    response = http.post(url);
  } while (response.status != 200);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });

  do {
    const url = `https://free.park-staging-app.tech/parking/garage/exit/${ticketId}`;
    response = http.post(url);
  } while (response.status != 200);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });
  

  sleep(1);
}
