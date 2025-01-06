import { Firestore, getFirestore } from "firebase-admin/firestore";
import "dotenv/config";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { OccupancyRecord } from "./models/occupancyRecord";

export class AnalyticsRepo {
  firestore: Firestore;

  private parkingStatusPrefix = 'parking-status-'

  constructor() {
    initializeApp({
      credential: applicationDefault()
    });

    if (process.env.ANALYTICS_DB_ID === undefined)
        throw new Error("ANALYTICS_DB_ID is not defined");

    const dbId = process.env.ANALYTICS_DB_ID;
    this.firestore = getFirestore(dbId);
  }

  async createParkingStatusRecord(garageId: string, status: OccupancyRecord): Promise<void> {
    await this.firestore
      .collection(this.parkingStatusPrefix + garageId)
      .doc()
      .set(JSON.parse(JSON.stringify((status))))
  }

  async getParkingStatusRecord(garageId: string, timestamp: Date): Promise<OccupancyRecord> {
    console.log(this.parkingStatusPrefix + garageId)
    console.log(timestamp)
    const querySnapshot = await this.firestore
      .collection(this.parkingStatusPrefix + garageId)
      .where('timestamp', '<=', timestamp.toISOString())
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as OccupancyRecord;
    } else {
      throw new Error("Unable to find occupancy record");
    }
  }

  async getParkingStatusRecords(garageId: string, from: Date, to: Date): Promise<OccupancyRecord[]> {
    const startQuerySnapshot = await this.firestore
    .collection(this.parkingStatusPrefix + garageId)
    .where('timestamp', '<=', from.toISOString())
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  let latestTimestamp = from;

  if (!startQuerySnapshot.empty) {
    const latestRecord = startQuerySnapshot.docs[0].data() as OccupancyRecord;
    latestTimestamp = latestRecord.timestamp;
  }

  const querySnapshot = await this.firestore
    .collection(this.parkingStatusPrefix + garageId)
    .where('timestamp', '>=', new Date(latestTimestamp).toISOString())
    .where('timestamp', '<=', to.toISOString())
    .orderBy('timestamp', 'asc')
    .get();

  return querySnapshot.docs.map(doc => doc.data() as OccupancyRecord);
  }
}