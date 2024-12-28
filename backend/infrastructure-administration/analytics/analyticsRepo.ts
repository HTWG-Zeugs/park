import { Firestore, getFirestore } from "firebase-admin/firestore";
import "dotenv/config";
import { initializeApp, applicationDefault } from "firebase-admin/app";

export class AnalyticsRepo {
  firestore: Firestore;

  //declare collection names

  constructor() {
    initializeApp({
      credential: applicationDefault()
    });

    if (process.env.ANALYTICS_DB_ID === undefined)
        throw new Error("ANALYTICS_DB_ID is not defined");

    const dbId = process.env.ANALYTICS_DB_ID;
    this.firestore = getFirestore(dbId);
  }

  //declare repo methods
}