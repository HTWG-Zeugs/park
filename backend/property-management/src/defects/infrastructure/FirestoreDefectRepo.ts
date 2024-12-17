import { Defect } from "../models/defectAggregate/Defect";
import type { IDefectRepo } from "../models/IDefectRepo";
import type { DefectState } from "../models/defectAggregate/DefectState";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import "dotenv/config";

export class FirestoreDefectRepo implements IDefectRepo {
  firestore: Firestore;

  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  async getAllDefects(): Promise<Defect[]> {
    const docs = (await this.firestore
      .collection("defects")
      .get()) as FirebaseFirestore.QuerySnapshot<DefectState>;
    const defects: Defect[] = [];
    docs.forEach((doc) => {
      const dto = doc.data();
      const defectState: DefectState = {
        ...dto,
        Id: doc.id,
      };
      const defect = Defect.fromState(defectState);
      defects.push(defect);
    });
    return defects;
  }

  async getDefect(defectId: string): Promise<Defect> {
    try {
      const doc = (await this.firestore
        .collection("defects")
        .doc(defectId)
        .get()) as FirebaseFirestore.DocumentSnapshot<DefectState>;
      if (doc.exists) {
        const dto = doc.data();
        if (!dto) {
          return Promise.reject(new Error("Defect not found"));
        }
        const defectState: DefectState = {
          ...dto,
          Id: doc.id,
        };
        const defect = Defect.fromState(defectState);
        return defect;
      }
      return Promise.reject(new Error("Defect not found"));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async addDefect(defect: Defect): Promise<void> {
    const defectRef = this.firestore
      .collection("defects")
      .doc(String(defect.Id));

    const state = defect.toState();
    try {
      await defectRef.set(state);
    } catch (error) {
      console.error("Error adding defect: ", error);
      return Promise.reject(error);
    }
  }

  async updateDefect(defect: Defect): Promise<boolean> {
    const defectRef = this.firestore.collection("defects").doc(defect.Id);
    const state = defect.toState();
    try {
      await defectRef.set(state);
      return true;
    } catch (error) {
      console.error("Error updating defect: ", error);
      return Promise.resolve(false);
    }
  }

  async deleteDefect(defectId: string): Promise<void> {
    const defectRef = this.firestore.collection("defects").doc(defectId);
    try {
      await defectRef.delete();
    } catch (error) {
      console.error("Error deleting defect: ", error);
      return Promise.reject(error);
    }
  }
}
