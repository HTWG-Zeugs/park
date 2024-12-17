import { Card, CardContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Garage() {
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
      "Garage 2",
    ]
  }
  
  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedGarage(event.target.value as string);
  }

  return (
    selectedGarage.length > 0 && <Card>
      <CardContent>
          {
            garages.length > 1 && <FormControl fullWidth>
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
        <h1>{t("route_garage.occupancy.title")}</h1>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {t("route_garage.title")}
        </Typography>
      </CardContent>
    </Card>
  );
}
