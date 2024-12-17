import { ChargingStationDto } from "./chargingStationDto";

export class GarageDto {
    id: string;
    isOpen: boolean;
    totalParkingSpaces: number;
    totalChargingSpaces: number;
    chargingStations: ChargingStationDto[];
}