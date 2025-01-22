export type GarageInfoObject = {
  Id: string;
  TenantId: string;
  Name: string;
  IsOpen: boolean;
  ParkingPlacesTotal: number;
  ParkingPlacesOccupied: number;
  ChargingPlacesTotal: number;
  ChargingPlacesOccupied: number;
  PricePerHourInEuros: number;
  OpeningTime: string;
  ClosingTime: string;
};