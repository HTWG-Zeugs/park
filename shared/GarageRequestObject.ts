import { ChargingStationRequestObject } from './ChargingStationRequestObject';

export type GarageRequestObject = {
  name: string;
  isOpen: boolean;
  numberParkingSpots: number;
  pricePerHourInEuros: number;
  openingTime: string;
  closingTime: string;
  chargingStations: ChargingStationRequestObject[];
}