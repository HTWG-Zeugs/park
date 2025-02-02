import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
   stages: [
      { duration: '5m', target: 2000 },
      { duration: '10m', target: 2000 },
      { duration: '5m', target: 0 },
    ],
};

export default function () {
  const garageId = "bdeec1e1-f6cf-47e9-a4c9-a340a288bc54"
  const enterpriseUrl = "https://mercedes.park-staging-app.tech/parking";
  const freeUrl = "https://free.park-staging-app.tech/parking";
  const baseUrl = Math.random() < 0.3 ? freeUrl : enterpriseUrl;

  let response;

  do {
    sleep(1);
    const url = baseUrl + `/garage/enter/${garageId}`;
    response = http.post(url);
  } while (response.status != 200);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });
  const ticketId = response.body;


  do {
    sleep(1);
    const url = baseUrl + `/garage/handlePayment/${ticketId}`;
    response = http.post(url);
  } while (response.status != 200);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });

  do {
    sleep(1);
    const url = baseUrl + `/garage/exit/${ticketId}`;
    response = http.post(url);
  } while (response.status != 200);
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  sleep(Math.random() * 5);
}
