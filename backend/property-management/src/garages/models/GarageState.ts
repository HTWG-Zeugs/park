import { ChargingStationState } from "./ChargingStationState";

export class GarageState {
    id: string;
    name: string;
    isOpen: boolean;
    numberParkingSpots: number;
    pricePerHourInEuros: number;
    openingTime: string;
    closingTime: string;
    createdAt: string;
    lastModifiedAt: string;
    chargingStations: ChargingStationState[];
}