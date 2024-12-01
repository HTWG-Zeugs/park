import express from 'express';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.IDENTITY_PLATFORM_API_KEY;
const AUTH_DOMAIN = process.env.IDENTITY_PLATFORM_AUTH_DOMAIN;
const PROJECT_ID = process.env.IDENTITY_PLATFORM_PROJECT_ID;

if (!API_KEY) throw new Error("IDENTITY_PLATFORM_API_KEY is not defined");
if (!AUTH_DOMAIN) throw new Error("IDENTITY_PLATFORM_AUTH_DOMAIN is not defined");
if (!PROJECT_ID) throw new Error("IDENTITY_PLATFORM_PROJECT_ID is not defined");

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
};

const firebase = initializeApp(firebaseConfig);

export const auth = getAuth();

app.get('/test-auth', async (req, res) => {
  try {
    const user = auth.currentUser;
    if (user) {
      res.status(200).json({ message: 'User is logged in', user });
    } else {
      res.status(200).json({ message: 'No user is logged in' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Pra running on http://localhost:${PORT}`);
});
