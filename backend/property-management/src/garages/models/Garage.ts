import { Floor } from "./Floor";

export class Garage {
  private _Id: string;
  private _CreatedAt: Date;
  private _LastModifiedAt: Date;
  private _Floors: Floor[] = [];

  Name: string;
    
  public get Id(): string {
      return this._Id;
  }

  public get CreatedAt(): Date {
      return this._CreatedAt;
  }

  public get LastModifiedAt(): Date {
      return this._LastModifiedAt;
  }

  constructor(name: string) {
      const date = new Date();
      this._Id = crypto.randomUUID();
      this.Name = name;
      this._CreatedAt = date;
      this._LastModifiedAt = date;
  }

  public get Floors(): Floor[] {
    return this._Floors;
  }

  public addFloor(floorId: string, numberParkingSpots: number): void {
    if(this._Floors.some(floor => floor.Id === floorId)) {
      throw new Error(`Floor with id ${floorId} already exists`);
    }

    const floor = new Floor(floorId, numberParkingSpots);
    this._Floors.push(floor);
  }

  public removeFloor(floorId: string): void {
    this._Floors = this._Floors.filter(floor => floor.Id !== floorId);
  }

  public updateFloor(updatedFloor: Floor): void {
    if(!this._Floors.some(floor => floor.Id === updatedFloor.Id)) {
      throw new Error(`Floor with id ${updatedFloor.Id} does not exist`);
    }

    this._Floors = this._Floors.map(floor => {
      if (floor.Id === updatedFloor.Id) {
        return updatedFloor;
      }
      return floor;
    });
  }
}