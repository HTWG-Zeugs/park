import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import "dotenv/config";

initializeApp({
  credential: applicationDefault(),
});

if (process.env.FIRESTORE_DB_ID === undefined)
  throw new Error("FIRESTORE_DB_ID is not defined");

const dbId = process.env.FIRESTORE_DB_ID;
const firestore = getFirestore(dbId);

export { firestore };