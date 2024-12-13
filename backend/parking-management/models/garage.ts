import { ChargingStation } from "./chargingStation";
import { OccupancyStatus } from "./occupancyStatus";
import { GarageDto } from "../../shared/garageDto";

export class Garage {
  id: string;
  isOpen: boolean;
  parkingStatus: OccupancyStatus;
  chargingStatus: OccupancyStatus;
  chargingStations: ChargingStation[];

  constructor(
    id: string,
    isOpen: boolean,
    parkingStatus: OccupancyStatus,
    chargingStatus: OccupancyStatus,
    chargingStations: ChargingStation[]
  ) {
    this.id = id;
    this.isOpen = isOpen;
    this.parkingStatus = parkingStatus;
    this.chargingStatus = chargingStatus;
    this.chargingStations = chargingStations;
  }
}
