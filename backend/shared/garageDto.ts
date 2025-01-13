import { ChargingStationDto } from "./chargingStationDto";

export class GarageDto {
    id: string;
    tenantId: string;
    name: string;
    isOpen: boolean;
    totalParkingSpaces: number;
    totalChargingSpaces: number;
    pricePerHourInEuros: number;
    openingTime: string;
    closingTime: string;
    chargingStations: ChargingStationDto[];
}