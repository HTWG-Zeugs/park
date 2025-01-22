import type { DefectState } from "./DefectState";
import { DefectReportStatus } from "./DefectReportStatus";

export class Defect {
  private _Id: string;
  private _Status: DefectReportStatus;
  private _ImageNames: string[];
  private _LastModifiedAt: Date;
  private _ReportingDate: Date;
  
  TenantId: string;
  GarageId: string;
  GarageName: string;
  Object: string;
  Location: string;
  ShortDesc: string;
  DetailedDesc: string;

  public get Id(): string {
    return this._Id;
  }

  public get ReportingDate(): Date {
    return this._ReportingDate;
  }

  public get Status(): DefectReportStatus {
    return this._Status;
  }

  public get ImageNames(): ReadonlyArray<string> {
    return this._ImageNames as ReadonlyArray<string>;
  }

  public get LastModifiedAt(): Date {
    return this._LastModifiedAt;
  }

  constructor(object: string, location: string, garageId: string) {
    const date = new Date();
    this._Id = crypto.randomUUID();
    this.GarageId = garageId;
    this._ImageNames = [];
    this.Object = object;
    this.Location = location;
    this._ReportingDate = date;
    this._Status = DefectReportStatus.Open;
    this.ShortDesc = "";
    this.DetailedDesc = "";
    this._LastModifiedAt = date;
  }

  private _setImageNames(imageNames: string[]): void {
    this._ImageNames = imageNames;
  }

  addImage(name: string) {
    this._ImageNames.push(name);
  }

  setStatus(status: DefectReportStatus) {
    this._Status = status;
    this._LastModifiedAt = new Date();
  }

  toState(): DefectState {
    return {
      Id: this.Id,
      GarageId: this.GarageId,
      Object: this.Object,
      Location: this.Location,
      ShortDesc: this.ShortDesc,
      DetailedDesc: this.DetailedDesc,
      ReportingDate: this.ReportingDate.toISOString(),
      Status: DefectReportStatus[this.Status],
      ImageNames: [...this.ImageNames],
      LastModifiedAt: this.LastModifiedAt.toISOString(),
    };
  }

  static fromState(dto: DefectState): Defect {
    const defect = new Defect(
      dto.Object,
      dto.Location,
      dto.GarageId
    );
    defect._Id = dto.Id;
    defect.GarageId = dto.GarageId;
    defect.ShortDesc = dto.ShortDesc;
    defect.DetailedDesc = dto.DetailedDesc;
    defect._Status = DefectReportStatus[dto.Status as keyof typeof DefectReportStatus]
    defect._setImageNames(dto.ImageNames);
    defect._LastModifiedAt = new Date(dto.LastModifiedAt);
    defect._ReportingDate = new Date(dto.ReportingDate);
    return defect;
  }
}
