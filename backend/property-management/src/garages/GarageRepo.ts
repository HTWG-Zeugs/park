import { Garage } from "./models/Garage";

export class GarageRepository{
  async getAllGarages(): Promise<Garage[]> {
    // Get all garages from database

    // For now, just return
    return [];
  }

  async addGarage(garage: Garage): Promise<void> {
    // Add garage to database

    // For now, just return

    // publish event to parking management service

    return;
  }

  async getGarageById(id: string): Promise<Garage | null> {
    // Get garage from database

    // For now, just return
    return null;
  }

  async updateGarage(garage: Garage): Promise<void> {
    // Update garage in database

    // For now, just return
    return;
  }
}