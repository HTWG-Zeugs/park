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
  const garageId = "bdeec1e1-f6cf-47e9-a4c9-a340a288bc54"

  let response;

  do {
    const url = `https://mercedes.park-staging-app.tech/parking/garare/enter/${garageId}`;
    response = http.post(url);
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 400ms': (r) => r.timings.duration < 400,
    });
  } while (response.status != 200);

  const ticketId = response.data();


  do {
    const url = `https://mercedes.park-staging-app.tech/parking/garage/handlePayment/${ticketId}`;
    response = http.post(url);
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 400ms': (r) => r.timings.duration < 400,
    });
  } while (response.status != 200);

  do {
    const url = `https://mercedes.park-staging-app.tech/parking/garage/exit/${ticketId}`;
    response = http.post(url);
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 400ms': (r) => r.timings.duration < 400,
    });
  } while (response.status != 200);
  

  sleep(1);
}
