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
  const enterpriseGarageId = "bdeec1e1-f6cf-47e9-a4c9-a340a288bc54"
  const freeGarageId = "1bac896e-443a-4785-a0a6-459a12930baf"
  const enterpriseUrl = "https://mercedes.park-staging-app.tech/parking";
  const freeUrl = "https://free.park-staging-app.tech/parking";
  const rand = Math.random();
  const baseUrl = rand < 0.3 ? freeUrl : enterpriseUrl;
  const garageId = rand < 0.3 ? freeGarageId : enterpriseGarageId;
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
  
  sleep(Math.random() * 10);
}
