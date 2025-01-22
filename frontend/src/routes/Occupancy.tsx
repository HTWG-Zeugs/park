import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import Grid from "@mui/material/Grid2"
import Card from "@mui/joy/Card";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import { OccupancyGrid } from "src/components/occupancy-grid/OccupancyGrid";
import axiosAuthenticated from "src/services/Axios";
import { GarageResponseObject } from "shared/GarageResponseObject";
import { GarageInfoObject } from "shared/GarageInfoObject";
import { GarageListItem, toGarageListItem } from "src/models/GarageListItem";

export default function Occupancy() {
  const { t } = useTranslation();
  const [garages, setGarages] = React.useState<GarageListItem[]>([]);
  const [selectedGarage, setSelectedGarage] = React.useState<GarageInfoObject>();

  const PARKING_MANAGEMENT_URL = import.meta.env.VITE_PARKING_MANAGEMENT_SERVICE_URL;
  const PROPERTY_MANAGEMENT_URL = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;

  useEffect(() => {
    fetchGarages();
  }, [])

  const fetchGarages = useCallback(() => {
    axiosAuthenticated
      .get(`${PROPERTY_MANAGEMENT_URL}/garages/`)
      .then((response) => {
        if (!response.data) {
          throw new Error("fetching garages failed!");
        }
        const responseData: GarageResponseObject[] = response.data;
        const listItems: GarageListItem[] = responseData.map((d) =>
          toGarageListItem(d)
        );
        if (listItems.length > 0) {
          setGarages(listItems);
          fetchGarageInfos(listItems[0].Id);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      })
      .finally(() => {
        //set loading to false
      });
    }, [t]);

  const fetchGarageInfos = useCallback((garageId: string) => {
    axiosAuthenticated
      .get(`${PARKING_MANAGEMENT_URL}/garage/${garageId}`)
      .then(response => {
        if (!response.data) {
          throw new Error(`fetching garage infos for garage with id ${garageId} failed!`);
        }
        const responseData: GarageInfoObject = response.data;
        console.log(responseData);
        setSelectedGarage(responseData)
      })
      .catch((error) => {
        console.error("Failed to fetch garage infos:", error);
      })
      .finally(() => {
        //set loading to false
      });
  }, [t])
  
  const handleChange = (event: SelectChangeEvent<string>) => {
    const garageId = garages.find(garage => garage.Name === event.target.value)?.Id;
    if (garageId) {
      fetchGarageInfos(garageId)
    }
  }

  return (
    (selectedGarage?.Name.length ?? 0) > 0 && <Card variant="soft">
      <div style={{margin: '50px'}}>
        <Grid container alignItems={"center"} spacing={{md: 2 }}>
          {
            garages.length > 1 && <FormControl>
              <InputLabel id="garage-select-label">Garage</InputLabel>
                <Select
                  labelId="garage-select-label"
                  id="garage-select"
                  value={selectedGarage!.Name}
                  label="Garage"
                  onChange={handleChange}>
                  { garages.map((garage, i) => <MenuItem key={i} value={garage.Name}>{garage.Name}</MenuItem>) }
                </Select>
              </FormControl>
          }
          {
            garages.length == 1 && <h1>{selectedGarage!.Name}</h1>
          }
          <h1>{t("route_occupancy.title")}</h1>
        </Grid>
        <div style={{marginLeft: '50px'}}>
          <Grid container alignItems={"center"} spacing={{md: 2 }}>
            <DirectionsCarIcon/> 
            <h2>{t("route_occupancy.parking_spaces")}</h2>
          </Grid>
          <OccupancyGrid total={selectedGarage!.ParkingPlacesTotal} occupied={selectedGarage!.ParkingPlacesOccupied}/>
          <Grid container alignItems={"center"} spacing={{md: 2 }}>
            <EvStationIcon/> 
            <h2>{t("route_occupancy.charging_spaces")}</h2>
          </Grid>
          <OccupancyGrid total={selectedGarage!.ChargingPlacesTotal} occupied={selectedGarage!.ChargingPlacesOccupied}/>
        </div>
      </div>
    </Card>
  );
}
