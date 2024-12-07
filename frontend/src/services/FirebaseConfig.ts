import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const API_KEY = import.meta.env.VITE_IDENTITY_PLATFORM_API_KEY;
const AUTH_DOMAIN = import.meta.env.VITE_IDENTITY_PLATFORM_AUTH_DOMAIN;
const PROJECT_ID = import.meta.env.VITE_IDENTITY_PLATFORM_PROJECT_ID;

if (API_KEY === undefined)
    throw new Error("IDENTITY_PLATFORM_API_KEY is not defined");
if (AUTH_DOMAIN === undefined)
    throw new Error("IDENTITY_PLATFORM_AUTH_DOMAIN is not defined");
if (PROJECT_ID === undefined)
    throw new Error("IDENTITY_PLATFORM_PROJECT_ID is not defined");

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
