import { ChargingStationResponseObject } from './ChargingStationResponseObject';

export type GarageResponseObject = {
  Id: string;
  TenantId: string;
  Name: string;
  IsOpen: boolean;
  NumberParkingSpots: number;
  PricePerHourInEuros: number;
  OpeningTime: string;
  ClosingTime: string;
  CreatedAt: string;
  LastModifiedAt: string;
  ChargingStations: ChargingStationResponseObject[];
};