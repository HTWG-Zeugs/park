import { GarageResponseObject } from "shared/GarageResponseObject";
import dayjs from "dayjs";

export class GarageListItem{
  Id: string = "";
  Name: string = "";
  CreatedAt: string = "";
  LastModifiedAt: string = "";
}

export const toGarageListItem = (
  response: GarageResponseObject
): GarageListItem => {
  const garageListItem = new GarageListItem();
  garageListItem.Id = response.Id;
  garageListItem.Name = response.Name;
  garageListItem.CreatedAt = dayjs(response.CreatedAt)
    .local()
    .format("YYYY-MM-DD HH:mm");
  garageListItem.LastModifiedAt = dayjs(response.LastModifiedAt)
    .local()
    .format("YYYY-MM-DD HH:mm");
  return garageListItem;
};