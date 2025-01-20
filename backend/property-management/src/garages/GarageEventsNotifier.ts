import { Garage } from "./models/Garage";
import { GarageDto } from "./../../../shared/garageDto";
import axios from "axios";
import https from "https";
import {getIdToken} from "./../middleware/ServiceCommunication";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export class GarageEventsNotifier {
  constructor(private readonly parkingManagementEndpoint: string) {}

  async notifyGarageCreated(garage: Garage): Promise<void> {
    const dto: GarageDto = this.convertGarageToDto(garage);
    const token = await getIdToken();

    axios
      .post(`${this.parkingManagementEndpoint}/garage/create`, dto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        httpsAgent: httpsAgent,
      })
      .then((response) => {
        console.log("Notified parking management about new garage");
      })
      .catch((error) => {
        console.error("Bad Request, unable to notify parking management.", error);
      });
  }

  async notifyGarageUpdated(garage: Garage): Promise<void> {
    const dto: GarageDto = this.convertGarageToDto(garage);
    const token = await getIdToken();

    axios
      .put(`${this.parkingManagementEndpoint}/garage/update`, dto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Notified parking management about updated garage");
      })
      .catch((error) => {
        console.error("Bad Request, unable to notify parking management.", error);
      });
  }

  async notifyGarageDeleted(garageId: string): Promise<void> {
    const token = await getIdToken();

    axios
      .delete(`${this.parkingManagementEndpoint}/garage/delete/${garageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Notified parking management about deleted garage");
      })
      .catch((error) => {
        console.error("Bad Request, unable to notify parking management.", error);
      });
  }

  private convertGarageToDto(garage: Garage): GarageDto {
    return {
      id: garage.Id,
      tenantId: garage.TenantId,
      name: garage.Name,
      isOpen: garage.IsOpen,
      totalParkingSpaces: garage.NumberParkingSpots,
      totalChargingSpaces: garage.ChargingStations.length,
      pricePerHourInEuros: garage.PricePerHour,
      openingTime: garage.OpeningTime,
      closingTime: garage.ClosingTime,
      chargingStations: garage.ChargingStations.map((cs) => ({
        id: cs.Id,
        name: cs.Name,
        chargingSpeedInKw: cs.ChargingSpeedInKw,
        pricePerKwh: cs.PricePerKwh,
      })),
    };
  }
}
