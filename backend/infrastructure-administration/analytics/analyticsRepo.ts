import { Firestore, getFirestore } from "firebase-admin/firestore";
import "dotenv/config";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { OccupancyRecord } from "./models/occupancyRecord";
import { NumberRecord } from "./models/numberRecord";
import { DefectStatusRecord } from "../../../shared/DefectStatusRecord";

export class AnalyticsRepo {
  firestore: Firestore;

  private parkingStatusPrefix = "parking-status-";
  private parkingDurationPrefix = "parking-duration-";
  private chargingStatusPrefix = "charging-status-";
  private powerConsumptionPrefix = "power-consumption-";
  private turnoverPrefix = "turnover-";
  private defectStatusPrefix = "defect-status-";

  //request information should be stored in a separate database in an environment for the solution admins.
  //private requestsPrefix = 'requests-'

  constructor() {
    initializeApp({
      credential: applicationDefault(),
    });

    if (process.env.ANALYTICS_DB_ID === undefined)
      throw new Error("ANALYTICS_DB_ID is not defined");

    const dbId = process.env.ANALYTICS_DB_ID;
    this.firestore = getFirestore(dbId);
  }

  async createParkingStatusRecord(
    tenantId: string,
    garageId: string,
    status: OccupancyRecord
  ): Promise<void> {
    await this.createRecord(tenantId, this.parkingStatusPrefix + garageId, status);
  }

  async getParkingStatusRecord(
    tenantId: string,
    garageId: string,
    timestamp: Date
  ): Promise<OccupancyRecord> {
    const querySnapshot = await this.queryDocForTimestamp(
      tenantId,
      this.parkingStatusPrefix + garageId,
      timestamp
    );

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as OccupancyRecord;
    } else {
      throw new Error("Unable to find occupancy record");
    }
  }

  async getParkingStatusRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<OccupancyRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.parkingStatusPrefix + garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as OccupancyRecord);
  }

  async createParkingDurationRecord(
    tenantId: string,
    garageId: string,
    record: NumberRecord
  ): Promise<void> {
    await this.createRecord(tenantId, this.parkingDurationPrefix + garageId, record);
  }

  async getParkingDurationRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<NumberRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.parkingDurationPrefix + garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as NumberRecord);
  }

  async createChargingStatusRecord(
    tenantId: string,
    garageId: string,
    status: OccupancyRecord
  ): Promise<void> {
    await this.createRecord(tenantId, this.chargingStatusPrefix + garageId, status);
  }

  async getChargingStatusRecord(
    tenantId: string,
    garageId: string,
    timestamp: Date
  ): Promise<OccupancyRecord> {
    const querySnapshot = await this.queryDocForTimestamp(
      tenantId,
      this.chargingStatusPrefix + garageId,
      timestamp
    );

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as OccupancyRecord;
    } else {
      throw new Error("Unable to find occupancy record");
    }
  }

  async getChargingStatusRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<OccupancyRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.chargingStatusPrefix + garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as OccupancyRecord);
  }

  async createPowerConsumptionRecord(
    tenantId: string,
    garageId: string,
    record: NumberRecord
  ): Promise<void> {
    await this.createRecord(tenantId, this.powerConsumptionPrefix + garageId, record);
  }

  async getPowerConsumptionRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<NumberRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.powerConsumptionPrefix + garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as NumberRecord);
  }

  async createTurnoverRecord(
    tenantId: string,
    garageId: string,
    record: NumberRecord
  ): Promise<void> {
    await this.createRecord(tenantId, this.turnoverPrefix + garageId, record);
  }

  async getTurnoverRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<NumberRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.turnoverPrefix + garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as NumberRecord);
  }

  async createDefectStatusRecord(
    tenantId: string,
    garageId: string,
    record: DefectStatusRecord
  ): Promise<void> {
    await this.createRecord(tenantId, this.defectStatusPrefix + garageId, record);
  }

  async getDefectStatusRecord(
    tenantId: string,
    garageId: string,
    timestamp: Date
  ): Promise<DefectStatusRecord> {
    const querySnapshot = await this.queryDocForTimestamp(
      tenantId,
      this.defectStatusPrefix + garageId,
      timestamp
    );

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as DefectStatusRecord;
    } else {
      throw new Error("Unable to find defect status record");
    }
  }

  async getDefectStatusRecords(
    tenantId: string,
    garageId: string,
    from: Date,
    to: Date
  ): Promise<DefectStatusRecord[]> {
    const querySnapshot = await this.queryDocInRange(
      tenantId,
      this.defectStatusPrefix + garageId,
      from,
      to
    );

    return querySnapshot.docs.map((doc) => doc.data() as DefectStatusRecord);
  }

  private async createRecord(tenantId: string, collection: string, obj: any): Promise<void> {
    await this.firestore
      .collection(tenantId).doc()
      .collection(collection)
      .doc()
      .set(JSON.parse(JSON.stringify(obj)));
  }

  private async queryDocForTimestamp(
    tenantId: string,
    collection: string,
    timestamp: Date
  ): Promise<FirebaseFirestore.QuerySnapshot<any>> {
    return await this.firestore
      .collection(tenantId).doc()
      .collection(collection)
      .where("timestamp", "<=", timestamp.toISOString())
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();
  }

  private async queryDocInRange(
    tenantId: string,
    collection: string,
    from: Date,
    to: Date
  ): Promise<FirebaseFirestore.QuerySnapshot<any>> {
    const startQuerySnapshot = await this.firestore
      .collection(tenantId).doc()
      .collection(collection)
      .where("timestamp", "<=", from.toISOString())
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    let latestTimestamp = from;

    if (!startQuerySnapshot.empty) {
      const latestRecord = startQuerySnapshot.docs[0].data();
      latestTimestamp = latestRecord.timestamp;
    }

    return await this.firestore
      .collection(tenantId).doc()
      .collection(collection)
      .where("timestamp", ">=", new Date(latestTimestamp).toISOString())
      .where("timestamp", "<=", to.toISOString())
      .orderBy("timestamp", "asc")
      .get();
  }
}
