import { Garage } from "./models/Garage";
import { Firestore } from "firebase-admin/firestore";
import "dotenv/config";
import { GarageState } from "./models/GarageState";


export class GarageRepository{
  firestore: Firestore;
  private garagesCollection = 'garages';
  
  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  async getAllGarages(): Promise<Garage[]> {
    const snapshot = await this.firestore
    .collection(this.garagesCollection)
    .get();

    const garages: Garage[] = [];
    snapshot.forEach(doc => {
      const garageState = doc.data() as GarageState;
      garages.push(Garage.fromState(garageState));
    });
    return garages
  }

  async addGarage(garage: Garage): Promise<void> {
    const state = garage.State();
    this.createOrUpdate(state, this.garagesCollection);
  }

  async getGarage(id: string): Promise<Garage | null> {
    const doc = await this.firestore
    .collection(this.garagesCollection)
      .doc(id)
      .get();

    if (doc.exists) {
        const state = doc.data() as GarageState;
        return Garage.fromState(state);
    } else {
        return null;
    }
  }

  async updateGarage(garage: Garage): Promise<void> {
    const state = garage.State();
    this.createOrUpdate(state, this.garagesCollection);
  }

  async deleteGarage(id: string): Promise<void> {
    this.firestore
      .collection(this.garagesCollection)
      .doc(id)
      .delete();
  }

  private async createOrUpdate(obj: any, collection: string): Promise<void> {
    await this.firestore
      .collection(collection)
      .doc(obj.id)
      .set(JSON.parse(JSON.stringify((obj))))
  }
}