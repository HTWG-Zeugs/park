import { ChargingStationState } from "./ChargingStationState";

export class GarageState {
    id: string;
    tenantId: string;
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