import { ChargingStation } from "./chargingStation";
import { OccupancyStatus } from "./occupancyStatus";
import { GarageDto } from "../../shared/garageDto";

export class Garage {
  id: string;
  isOpen: boolean;
  parkingPlacesTotal: number;
  parkingPlacesOccupied: number;
  chargingPlacesTotal: number;
  chargingPlacesOccupied: number;
  chargingStations: ChargingStation[];

  constructor(
    id: string,
    isOpen: boolean,
    totalParkingPlaces: number,
    occupiedParkingPlaces: number,
    totalChargingPlaces: number,
    occupiedChargingPlaces: number,
    chargingStations: ChargingStation[]
  ) {
    this.id = id;
    this.isOpen = isOpen;
    this.parkingPlacesTotal = totalParkingPlaces;
    this.parkingPlacesOccupied = occupiedParkingPlaces;
    this.chargingPlacesTotal = totalChargingPlaces;
    this.chargingPlacesOccupied = occupiedChargingPlaces;
    this.chargingStations = chargingStations;
  }
}

export class asdf {
  id: string;
  isOpen: boolean;
  parkingPlacesTotal: number;
  parkingPlacesOccupied: number;
  chargingPlacesTotal: number;
  chargingPlacesOccupied: number;
  chargingStations: ChargingStation[];
}
