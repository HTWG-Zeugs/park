export type CreateGarageRequestObject = {
  Name: string;
  IsOpen: boolean;
  NumberParkingSpots: number;
  PricePerHourInEuros: number;
  OpeningTime: string;
  ClosingTime: string;
}