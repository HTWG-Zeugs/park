import axios from "axios";

export interface GoogleAuthResponse {
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

export async function signUpUserWithGoogle(
  email: string,
  password: string,
  tenantId: string,
  apiKey: string
): Promise<GoogleAuthResponse> {
  try {
    console.log("api key", apiKey);
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
        tenantId
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error occurred by the new user sign up:", error);
    throw new Error("Registration failed");
  }
}