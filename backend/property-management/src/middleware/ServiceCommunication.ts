import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import "dotenv/config";

export async function getIdToken() {
  const targetAudience = process.env.INFRASTRUCTURE_ADMINISTRATION_SERVICE_AUDIENCE;
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(targetAudience);
  const idToken = await client.getRequestHeaders();
  return idToken['Authorization'].split(' ')[1];
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
  } catch (error) {
    console.error('Error calling API:', error);
  }
}