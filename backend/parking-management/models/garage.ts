import { ChargingStation } from "./chargingStation";

export class Garage {
  id: string;
  tenantId: string;
  name: string;
  isOpen: boolean;
  parkingPlacesTotal: number;
  parkingPlacesOccupied: number;
  chargingPlacesTotal: number;
  chargingPlacesOccupied: number;
  pricePerHourInEuros: number;
  openingTime: string;
  closingTime: string
  chargingStations: ChargingStation[];

  constructor(
    id: string,
    tenantId: string,
    name: string,
    isOpen: boolean,
    parkingPlacesTotal: number,
    parkingPlacesOccupied: number,
    chargingPlacesTotal: number,
    chargingPlacesOccupied: number,
    pricePerHourInEuros: number,
    openingTime: string,
    closingTime: string,
    chargingStations: ChargingStation[]
  ) {
    this.id = id;
    this.tenantId = tenantId;
    this.name = name;
    this.isOpen = isOpen;
    this.parkingPlacesTotal = parkingPlacesTotal;
    this.parkingPlacesOccupied = parkingPlacesOccupied;
    this.chargingPlacesTotal = chargingPlacesTotal;
    this.chargingPlacesOccupied = chargingPlacesOccupied;
    this.pricePerHourInEuros = pricePerHourInEuros;
    this.openingTime = openingTime;
    this.closingTime = closingTime;
    this.chargingStations = chargingStations;
  }
}
