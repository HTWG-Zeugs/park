export class Floor{
  private _Id: string;
  private _CreatedAt: Date;
  private _LastModifiedAt: Date;
  private _NumberParkingSpots: number;

  public get NumberParkingSpots(): number {
    return this._NumberParkingSpots;
  }

  public get Id(): string {
    return this._Id;
  }

  public get CreatedAt(): Date {
      return this._CreatedAt;
  }

  public get LastModifiedAt(): Date {
      return this._LastModifiedAt;
  }

  constructor(floorId: string, numberParkingSpots: number) {
      const date = new Date();
      this._Id = floorId;
      this._CreatedAt = date;
      this._LastModifiedAt = date;
      this._NumberParkingSpots = numberParkingSpots;
  }

  public updateNumberParkingSpots(numberParkingSpots: number): void {
    this._NumberParkingSpots = numberParkingSpots;
  }
}