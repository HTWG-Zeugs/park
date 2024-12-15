import { Garage } from "./models/Garage";
import { GarageDto } from "./../../../shared/garageDto";
import axios from "axios";

export class GarageEventsNotifier {
  constructor(private readonly parkingManagementEndpoint: string) {}

  notifyGarageCreated(garage: Garage): void {
    const dto: GarageDto = this.convertGarageToDto(garage);

    axios.post(`${this.parkingManagementEndpoint}/garage/create`, dto)
      .then(response => {
        console.log("Notified parking management about new garage");
      })
      .catch(error => {
        if (error.response) {
          console.error('Bad Request: ', error.response);
        }
      });
  }

  notifyGarageUpdated(garage: Garage): void {
    const dto: GarageDto = this.convertGarageToDto(garage);

    axios.put(`${this.parkingManagementEndpoint}/garage/update`, dto)
      .then(response => {
        console.log("Notified parking management about updated garage");
      })
      .catch(error => {
        if (error.response) {
          console.error('Bad Request: ', error.response);
        }
      });
  }

  notifyGarageDeleted(garageId: string): void {
    axios.delete(`${this.parkingManagementEndpoint}/garage/delete/${garageId}`)
      .then(response => {
        console.log("Notified parking management about deleted garage");
      })
      .catch(error => {
        if (error.response) {
          console.error('Bad Request: ', error.response);
        }
      });
  }

  private convertGarageToDto(garage: Garage): GarageDto {
    return {
      id: garage.Id,
      isOpen: garage.IsOpen,
      totalParkingSpaces: garage.NumberParkingSpots,
      totalChargingSpaces: garage.ChargingStations.length,
      chargingStations: garage.ChargingStations.map(cs => ({
        id: cs.Id,
        chargingSpeedInKw: cs.ChargingSpeedInKw,
        pricePerKwh: cs.PricePerKwh,
      })),
    };
  }
}