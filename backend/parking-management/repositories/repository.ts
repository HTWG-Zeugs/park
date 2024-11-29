import { OccupancyStatus } from "../models/occupancyStatus";

export interface Repository {
    getOccupancyStatus(garageId): OccupancyStatus;
}