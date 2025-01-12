import { GarageInfoObject } from "../../../shared/GarageInfoObject";
import { GarageDto } from "../../shared/garageDto";
import { ChargingInvoice } from "../models/chargingInvoice";
import { ChargingSession } from "../models/chargingSession";
import { ChargingStation } from "../models/chargingStation";
import { Garage } from "../models/garage";
import { OccupancyStatus } from "../../../shared/OccupancyStatus";
import { Ticket } from "../models/ticket";
import { Repository } from "../repositories/repository";
import { getIdToken } from "../middleware/serviceCommunication";
import axios from "axios";

export class GarageService {
  private repo: Repository;

  constructor(repository: Repository) {
    this.repo = repository;
  }

  async getGarage(garageId: string): Promise<GarageInfoObject> {
    return this.getGarageInfoObjectFromGarage(await this.repo.getGarage(garageId));
  }

  async createGarage(garageDto: GarageDto): Promise<void> {
    const garage: Garage = this.getGarageFromDto(garageDto);
    await this.repo.createGarage(garage);
  }

  async updateGarage(garageDto: GarageDto): Promise<void> {
    const garage: Garage = this.getGarageFromDto(garageDto);
    this.repo.updateGarage(garage);
  }

  async deleteGarage(garageId: string) {
    this.repo.deleteGarage(garageId);
  }

  async getParkingOccupancy(garageId: string): Promise<OccupancyStatus> {
    const garage: Garage = await this.repo.getGarage(garageId);
    return new OccupancyStatus(
      garage.parkingPlacesTotal, garage.parkingPlacesOccupied
    );
  }

  async getChargingOccupancy(garageId: string): Promise<OccupancyStatus> {
    const garage: Garage = await this.repo.getGarage(garageId);
    return new OccupancyStatus(
      garage.chargingPlacesTotal, garage.chargingPlacesOccupied
    );
  }

  async handleCarEntry(garageId: string): Promise<string> {
    const garage = await this.repo.getGarage(garageId);
    const isFree =
      garage.parkingPlacesOccupied < garage.parkingPlacesTotal;

    if (garage.isOpen && isFree) {
      const ticket: Ticket = {
        id: crypto.randomUUID(),
        garageId: garageId,
        entryTimestamp: new Date(),
        paymentTimestamp: null,
      };
      this.repo.createTicket(ticket);
      garage.parkingPlacesOccupied++;
      this.repo.updateGarage(garage);
      return ticket.id;
    } else {
      throw Error("Cannot enter because garage is closed.");
    }
  }

  async handleCarExit(garageId: string): Promise<void> {
    const garage = await this.repo.getGarage(garageId);
    garage.parkingPlacesOccupied--;
    this.repo.updateGarage(garage);
  }

  async handleTicketPayment(ticketId: string): Promise<void> {
    const ticket = await this.repo.getTicket(ticketId);
    ticket.paymentTimestamp = new Date();
    await this.repo.updateTicket(ticket);
  }

  async mayExit(ticketId: string): Promise<boolean> {
    const ticket = await this.repo.getTicket(ticketId);
    // check if payment was more than 15 minutes ago
    const currentDate = new Date();
    const payDate = new Date(ticket.paymentTimestamp);
    if (payDate !== undefined && payDate !== null) {
      const isStillValid =
        currentDate.getDate() - payDate.getDate() == 0 &&
        currentDate.getFullYear() - payDate.getFullYear() == 0 &&
        currentDate.getTime() - payDate.getTime() <= 900000;
      return isStillValid;
    } else {
      return false;
    }
  }

  async startChargingSession(garageId: string, stationId: string, userId: string): Promise<string> {
    let garage = await this.repo.getGarage(garageId);
    const garageRollback = garage;
    if (garage.isOpen) {
      const session: ChargingSession = {
        id: crypto.randomUUID(),
        userId: userId,
        garageId: garageId,
        chargingStationId: stationId,
        sessionStartedTimestamp: new Date(),
        sessionFinishedTimestamp: null,
        kWhConsumed: null,
      };
      garage = this.setChargingOccupancy(
        garage,
        garage.chargingPlacesOccupied + 1
      );
      garage = this.setChargingStationOccupied(garage, stationId, true);
      await this.repo.updateGarage(garage).catch(() => {
        throw new Error(
          `Unable to update charging stations occupancy for garage ${garageId}`
        );
      });
      await this.repo.createChargingSession(session).catch(async () => {
        await this.repo.updateGarage(garageRollback);
        throw Error("Unable to create the charging session in the database");
      });

      return session.id;
    } else {
      throw Error("Cannot start charging session because garage is closed.");
    }
  }

  async endChargingSession(garageId: string, sessionId: string): Promise<void> {
    let garage = await this.repo.getGarage(garageId);
    const garageRollback = garage;
    let session = await this.repo.getChargingSession(sessionId);

    if (session.sessionFinishedTimestamp) {
      throw new Error(`Session with ID ${sessionId} has already ended`);
    } else {
      session.sessionFinishedTimestamp = new Date();
      session.kWhConsumed = this.getConsumedKwhForSession(garage, session);
      garage = this.setChargingOccupancy(
        garage,
        garage.chargingPlacesOccupied - 1
      );
      garage = this.setChargingStationOccupied(
        garage,
        session.chargingStationId,
        false
      );
      await this.repo.updateGarage(garage);
      await this.repo.updateChargingSession(session).catch(async () => {
        await this.repo.updateGarage(garageRollback);
        throw Error("Unable to create the charging session in the database");
      });
    }
  }

  async getChargingSession(sessionId: string): Promise<ChargingSession> {
    return await this.repo.getChargingSession(sessionId);
  }

  async getChargingInvoice(sessionId: string): Promise<ChargingInvoice> {
    return await this.repo.getChargingInvoice(sessionId);
  }

  private async notifyAnalytics(tenantId: string, garageId: string, endpoint: string, record: any) {
    try {
      const token = await getIdToken();
  
      const response = await axios.put(
        `${process.env.INFRASTRUCTURE_MANAGEMENT_SERVICE_URL}/analytics/requests/${tenantId}`,
        {},
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        }
      );
  
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  }

  private setChargingOccupancy(garage: Garage, newValue: number): Garage {
    garage.chargingPlacesOccupied = newValue;

    if (garage.chargingPlacesOccupied > garage.chargingPlacesTotal) {
      throw new Error("All charging stations are occupied already");
    } else {
      return garage;
    }
  }

  private setChargingStationOccupied(garage: Garage, stationId: string, occupied: boolean): Garage {
    let stationIndex = garage.chargingStations.findIndex(
      (station) => station.id == stationId
    );

    if (stationIndex !== -1) {
      if (garage.chargingStations[stationIndex].isOccupied == occupied) {
        throw Error(
          `Cannot change occupation for charging station with ID ${stationId} to same value`
        );
      } else {
        garage.chargingStations[stationIndex].isOccupied = occupied;
        return garage;
      }
    } else {
      throw new Error(
        `Charging station with ID ${stationId} does not exist for garage with ID ${garage.id}`
      );
    }
  }

  private getConsumedKwhForSession(
    garage: Garage,
    session: ChargingSession
  ): number {
    const station = garage.chargingStations.find(s => s.id === session.chargingStationId)
    console.log(station)
    const chargedHours =
      (session.sessionFinishedTimestamp.getTime() -
      new Date(session.sessionStartedTimestamp).getTime()) /
      (1000 * 60 * 60);
    return Math.round(chargedHours * station.chargingSpeedInKw * 100) / 100;
  }

  private getGarageFromDto(garageDto: GarageDto): Garage {
    return new Garage(
      garageDto.id,
      garageDto.tenantId,
      garageDto.name,
      garageDto.isOpen,
      garageDto.totalParkingSpaces,
      0,
      garageDto.totalChargingSpaces,
      0,
      garageDto.pricePerHourInEuros,
      garageDto.openingTime,
      garageDto.closingTime,
      garageDto.chargingStations.map(cs => ({
        id: cs.id,
        name: cs.name,
        isOccupied: false,
        isCharging: false,
        chargingSpeedInKw: cs.chargingSpeedInKw,
        pricePerKwh: cs.pricePerKwh,
      } as ChargingStation))
    );
  }

  private getGarageInfoObjectFromGarage(garage: Garage): GarageInfoObject {
    return {
      Id: garage.id,
      TenantId: garage.tenantId,
      Name: garage.name,
      IsOpen: garage.isOpen,
      ParkingPlacesTotal: garage.parkingPlacesTotal,
      ParkingPlacesOccupied: garage.parkingPlacesOccupied,
      ChargingPlacesTotal: garage.chargingPlacesTotal,
      ChargingPlacesOccupied: garage.chargingPlacesOccupied,
      PricePerHourInEuros: garage.pricePerHourInEuros,
      OpeningTime: garage.openingTime,
      ClosingTime:garage.closingTime
    } as GarageInfoObject
  }
}
