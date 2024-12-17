import { CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2"
import Card from "@mui/joy/Card";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import { OccupancyGrid } from "src/components/occupancy-grid/OccupancyGrid";

export default function Occupancy() {
  const { t } = useTranslation();
  const [garages, setGarages] = React.useState<string[]>([]);
  const [selectedGarage, setSelectedGarage] = React.useState<string>('');

  useEffect(() => {
    const garages: string[] = fetchGarages();
    if (garages.length > 1) {
      setGarages(garages);
      setSelectedGarage(garages[0]);
    } else if (garages.length == 1) {
      setSelectedGarage(garages[0])
    }
    setGarages(garages)
  }, [])

  const fetchGarages = () => {
    return [
      "Garage 1",
      "Garage 2"
    ]
  }
  
  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedGarage(event.target.value as string);
  }

  return (
    selectedGarage.length > 0 && <Card variant="soft">
      <div style={{margin: '50px'}}>
        <Grid container alignItems={"center"} spacing={{md: 2 }}>
          {
            garages.length > 1 && <FormControl>
              <InputLabel id="garage-select-label">Garage</InputLabel>
                <Select
                  labelId="garage-select-label"
                  id="garage-select"
                  value={selectedGarage}
                  label="Garage"
                  onChange={handleChange}>
                  { garages.map((garage, i) => <MenuItem key={i} value={garage}>{garage}</MenuItem>) }
                </Select>
              </FormControl>
          }
          {
            garages.length == 1 && <h1>{selectedGarage}</h1>
          }
          <h1>{t("route_occupancy.title")}</h1>
        </Grid>
        <div style={{marginLeft: '50px'}}>
          <Grid container alignItems={"center"} spacing={{md: 2 }}>
            <DirectionsCarIcon/> 
            <h2>{t("route_occupancy.parking_spaces")}</h2>
          </Grid>
          <OccupancyGrid total={250} occupied={120}/>
          <Grid container alignItems={"center"} spacing={{md: 2 }}>
            <EvStationIcon/> 
            <h2>{t("route_occupancy.charging_spaces")}</h2>
          </Grid>
          <OccupancyGrid total={12} occupied={4}/>
        </div>
      </div>
    </Card>
  );
}
