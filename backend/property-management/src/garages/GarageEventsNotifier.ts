import { Garage } from "./models/Garage";
import { GarageDto } from "./../../../shared/garageDto";

export class GarageEventsNotifier {
  constructor(private readonly parkingManagementEndpoint: string) {}

  notifyGarageCreated(garage: Garage): void {
    const dto: GarageDto = {
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

    fetch(`${this.parkingManagementEndpoint}/garage/create`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })
      .then(data => {
        console.log('Garage created successfully:', data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  notifyGarageUpdated(garage: Garage): void {
    const dto: GarageDto = {
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

    fetch(`${this.parkingManagementEndpoint}/garage/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })
      .then(data => {
        console.log('Garage updated successfully:', data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  notifyGarageDeleted(garage: Garage): void {
    fetch(`${this.parkingManagementEndpoint}/garage/delete/${garage.Id}`, {
      method: 'DELETE',
    })
      .then(data => {
        console.log('Garage deleted successfully:', data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }
}