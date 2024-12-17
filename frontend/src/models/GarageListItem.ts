import { GarageResponseObject } from "shared/GarageResponseObject";
import dayjs from "dayjs";

export class GarageLisItem{
  Id: string = "";
  Name: string = "";
  CreatedAt: string = "";
  LastModifiedAt: string = "";
}

export const toGarageListItem = (
  response: GarageResponseObject
): GarageLisItem => {
  const garageListItem = new GarageLisItem();
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