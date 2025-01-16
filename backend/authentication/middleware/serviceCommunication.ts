import { GoogleAuth } from 'google-auth-library';
import "dotenv/config";

export async function getIdToken() {
  const targetAudience = process.env.INFRASTRUCTURE_ADMINISTRATION_SERVICE_AUDIENCE;
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(targetAudience);
  const idToken = await client.getRequestHeaders();
  return idToken['Authorization'].split(' ')[1];
}