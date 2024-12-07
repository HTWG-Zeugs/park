import axios from "axios";

interface GoogleAuthResponse {
  localId: string;
  idToken: string;
}

export async function verifyUserWithGoogle(
  email: string,
  password: string,
  tenantId: string,
  apiKey: string
): Promise<GoogleAuthResponse> {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
        tenantId
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Authentication failed");
  }
}
