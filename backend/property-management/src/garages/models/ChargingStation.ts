import { ChargingStationState } from "./ChargingStationState";

export class ChargingStation {
  Id: string;
  Name: string;
  ChargingSpeedInKw: number;
  PricePerKwh: number;


  constructor(name: string, chargingSpeedInKw: number, pricePerKwh: number) {
    this.Id = crypto.randomUUID();
    this.Name = name;

    if (chargingSpeedInKw < 0) {
      throw new Error("Charging speed in kW cannot be negative");
    }

    this.ChargingSpeedInKw = chargingSpeedInKw;

    if (pricePerKwh < 0) {
      throw new Error("Price per kWh cannot be negative");
    }

    this.PricePerKwh = pricePerKwh;
  }

  public State(): ChargingStationState {
    return {
      id: this.Id,
      name: this.Name,
      chargingSpeedInKw: this.ChargingSpeedInKw,
      pricePerKwh: this.PricePerKwh
    }
  }
  public static fromState(cs: ChargingStationState): ChargingStation {
    return new ChargingStation(cs.name, cs.chargingSpeedInKw, cs.pricePerKwh);
  }

}