import { ChargingStation } from "./ChargingStation";
import { GarageState } from "./GarageState";

export class Garage {
  Id: string;
  Name: string;
  IsOpen: boolean;
  CreatedAt: Date;
  LastModifiedAt: Date;
  NumberParkingSpots: number;
  PricePerHour: number;
  OpeningTime: string;
  ClosingTime: string;
  ChargingStations: ChargingStation[];
  

  constructor(name: string) {
      const date = new Date();
      this.Id = crypto.randomUUID();
      this.Name = name;
      this.IsOpen = true;
      this.CreatedAt = date;
      this.LastModifiedAt = date;
  }

  public State(): GarageState {
    return {
      id: this.Id,
      name: this.Name,
      isOpen: this.IsOpen,
      numberParkingSpots: this.NumberParkingSpots,
      pricePerHourInEuros: this.PricePerHour,
      openingTime: this.OpeningTime,
      closingTime: this.ClosingTime,
      createdAt: this.CreatedAt.toISOString(),
      lastModifiedAt: this.LastModifiedAt.toISOString(),
      chargingStations: this.ChargingStations.map(cs => cs.State())
    }
  }

  public static fromState(state: GarageState): Garage {
    const garage = new Garage(state.name);
    garage.Id = state.id;
    garage.CreatedAt = new Date(state.createdAt);
    garage.LastModifiedAt = new Date(state.lastModifiedAt);
    garage.NumberParkingSpots = state.numberParkingSpots;
    garage.PricePerHour = state.pricePerHourInEuros;
    garage.OpeningTime = state.openingTime;
    garage.ClosingTime = state.closingTime;
    garage.ChargingStations = state.chargingStations.map(cs => ChargingStation.fromState(cs));
    return garage;
  }

  update(garage: Garage) {
    this.Name = garage.Name;
    this.IsOpen = garage.IsOpen;
    this.NumberParkingSpots = garage.NumberParkingSpots;
    this.PricePerHour = garage.PricePerHour;
    this.OpeningTime = garage.OpeningTime;
    this.ClosingTime = garage.ClosingTime;
    this.ChargingStations = garage.ChargingStations;
    this.LastModifiedAt = new Date();
  }

  public setNumberParkingSpots(numberParkingSpots: number) {
    if(numberParkingSpots < 0) {
      throw new Error("Number of parking spots cannot be negative");
    }

    this.NumberParkingSpots = numberParkingSpots;
  }

  public setPricePerHourInEuros(pricePerHour: number) {
    if(pricePerHour <= 0) {
      throw new Error("Price per hour must be greater than 0");
    }

    this.PricePerHour = pricePerHour;
  }

  public setOpeningTimes(openingTime: string, closingTime: string) {

    if (this.isValidTime(openingTime) && this.isValidTime(closingTime)) {
      const openingTimeInMinutes = this.convertToMinutes(openingTime);
      const closingTimeInMinutes = this.convertToMinutes(closingTime);

      if (openingTimeInMinutes >= closingTimeInMinutes) {
        throw new Error("Opening time must be before closing time");
      } 
    }
    else {
      throw new Error("Invalid time format. Please use HH:mm");
    }

    this.OpeningTime = openingTime;
    this.ClosingTime = closingTime;
  }

  public setChargingStations(chargingStations: ChargingStation[]) {
    this.ChargingStations = chargingStations;
  }

  private isValidTime(time: string): boolean {
    const formatValid = /^(\d{1,2}):(\d{2})$/.test(time);

    if (!formatValid) {
      return false;
    }

    const minutes = this.convertToMinutes(time);
    return minutes >= 0 && minutes < 24 * 60;
  }

  // Convert HH:mm to minutes since midnight
  private convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
}