import { ChargingStation } from "./chargingStation";
import { OccupancyStatus } from "./occupancyStatus";

export class Garage {
    garageId: string;
    isOpen: boolean;
    parkingStatus: OccupancyStatus;
    chargingStatus: OccupancyStatus;
    chargingStations: ChargingStation[];
}