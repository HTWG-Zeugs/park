export class Garage {
  private _Id: string;
  private _CreatedAt: Date;
  private _LastModifiedAt: Date;
  private _NumberParkingSpots: number;
  private _PricePerHour: number;
  private _OpeningTime: Date;
  private _ClosingTime: Date;
  
  Name: string;
  IsOpen: boolean;
  
  public get Id(): string {
      return this._Id;
  }

  public get CreatedAt(): Date {
      return this._CreatedAt;
  }

  public get LastModifiedAt(): Date {
      return this._LastModifiedAt;
  }

  public get NumberParkingSpots(): number {
    return this._NumberParkingSpots;
  }

  public get PricePerHourInEuros(): number {
    return this._PricePerHour;
  }

  public get OpeningTime(): Date {
    return this._OpeningTime;
  }

  public get ClosingTime(): Date {
    return this._ClosingTime;
  }

  constructor(name: string) {
      const date = new Date();
      this._Id = crypto.randomUUID();
      this.Name = name;
      this.IsOpen = true;
      this._CreatedAt = date;
      this._LastModifiedAt = date;
  }

  public setNumberParkingSpots(numberParkingSpots: number) {
    if(numberParkingSpots < 0) {
      throw new Error("Number of parking spots cannot be negative");
    }

    this._NumberParkingSpots = numberParkingSpots;
  }

  public setPricePerHourInEuros(pricePerHour: number) {
    if(pricePerHour <= 0) {
      throw new Error("Price per hour must be greater than 0");
    }

    this._PricePerHour = pricePerHour;
  }

  public setOpeningTimes(openingTimeIso: string, closingTimeIso: string) {
    const openingTime = new Date(openingTimeIso);
    const closingTime = new Date(closingTimeIso);

    if(openingTime > closingTime) {
      throw new Error("Opening time cannot be after closing time");
    }

    this._OpeningTime = openingTime;
    this._ClosingTime = closingTime;
  }
}