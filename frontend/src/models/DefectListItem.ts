import { DefectResponseObject } from "shared/DefectResponseObject";
import { DefectReportStatus } from "src/models/DefectReportStatus";
import dayjs from "dayjs";

export class DefectListItem {
  Id: string;
  Object: string = "";
  Location: string = "";
  ShortDesc: string = "";
  DetailedDesc: string = "";
  ReportingDate: string = "";
  LastModifiedAt: string = "";
  Status: DefectReportStatus = DefectReportStatus.Open;

  constructor(id: string) {
    this.Id = id;
  }
}

export const toDefectListItem = (
  response: DefectResponseObject
): DefectListItem => {
  const defectListItem = new DefectListItem(response.Id);
  defectListItem.Object = response.Object;
  defectListItem.Location = response.Location;
  defectListItem.ShortDesc = response.ShortDesc;
  defectListItem.DetailedDesc = response.DetailedDesc;
  defectListItem.ReportingDate = dayjs(response.ReportingDate)
    .local()
    .format("YYYY-MM-DD HH:mm");
  defectListItem.LastModifiedAt = dayjs(response.LastModifiedAt)
    .local()
    .format("YYYY-MM-DD HH:mm");
  const status: DefectReportStatus =
    DefectReportStatus[response.Status as keyof typeof DefectReportStatus];
  defectListItem.Status = status;
  return defectListItem;
};
