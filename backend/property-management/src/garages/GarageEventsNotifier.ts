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
        console.error('Bad Request, unable to notify parking management.');
      });
  }

  notifyGarageUpdated(garage: Garage): void {
    const dto: GarageDto = this.convertGarageToDto(garage);

    axios.put(`${this.parkingManagementEndpoint}/garage/update`, dto)
      .then(response => {
        console.log("Notified parking management about updated garage");
      })
      .catch(error => {
        console.error('Bad Request, unable to notify parking management.');
      });
  }

  notifyGarageDeleted(garageId: string): void {
    axios.delete(`${this.parkingManagementEndpoint}/garage/delete/${garageId}`)
      .then(response => {
        console.log("Notified parking management about deleted garage");
      })
      .catch(error => {
        console.error('Bad Request, unable to notify parking management.');
      });
  }

  private convertGarageToDto(garage: Garage): GarageDto {
    return {
      id: garage.Id,
      name: garage.Name,
      isOpen: garage.IsOpen,
      totalParkingSpaces: garage.NumberParkingSpots,
      totalChargingSpaces: garage.ChargingStations.length,
      pricePerHourInEuros: garage.PricePerHour,
      openingTime: garage.OpeningTime,
      closingTime: garage.ClosingTime,
      chargingStations: garage.ChargingStations.map(cs => ({
        id: cs.Id,
        name: cs.Name,
        chargingSpeedInKw: cs.ChargingSpeedInKw,
        pricePerKwh: cs.PricePerKwh,
      })),
    };
  }
}