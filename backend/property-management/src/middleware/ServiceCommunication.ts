import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import "dotenv/config";

export async function getIdToken() {
  const targetAudience = 'http://localhost:8083'; // TODO: später aus .env auslesen
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(targetAudience);
  const idToken = await client.getRequestHeaders();

  const token = idToken['Authorization'].split(' ')[1];
  console.log('ID Token:', token);

  return token;
}

export async function increaseRequestCounter(tenantId: string) {
  try {
    // Get the access token
    const token = await getIdToken();

    // Make a request to the protected API
    const response = await axios.put(
      `${process.env.INFRASTRUCTURE_MANAGEMENT_SERVICE_URL}/analytics/requests/${tenantId}`,
      {},
      {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      }
    );

    if (response.status !== 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = response.data;
    console.log('API Response:', data);
  } catch (error) {
    console.error('Error calling API:', error);
  }
}