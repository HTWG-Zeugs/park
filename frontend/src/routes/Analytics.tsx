import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2"
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts"
import axiosAuthenticated from "src/services/Axios";
import React from "react";
import { GarageResponseObject } from "shared/GarageResponseObject";
import { GarageListItem, toGarageListItem } from "src/models/GarageListItem";

export default function Analytics() {
  const { t } = useTranslation();
  const [garages, setGarages] = React.useState<GarageListItem[]>([]);
  const [selectedGarage, setSelectedGarage] = React.useState<string>();

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
          setSelectedGarage(listItems[0].Name)
          //fetch garage analytics here
        }
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      })
      .finally(() => {
        //set loading to false
      });
    }, [t]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const garageId = garages.find(garage => garage.Name === event.target.value)?.Id;
    if (garageId) {
      //fetch garage analytics here
      setSelectedGarage(event.target.value as string);
    }
  }

  // ### garage specific analytics ###
  //parking status for the garage during the last 30 days (histogram chart)
  //charging status for the garage during the last 30 days (histogram chart)
  //defect status evolution for the garage in the last 30 days (histogram chart with three lines and legend)
  //mean parking duration in the garage in the last month (numeric value)
  //power consumed in the garage for charging in the last month (numeric value)
  //turnover for the garage in the last month (numeric value)

  // ### general tenant analytics ###
  //request count for tenant 


  return (
    (selectedGarage?.length ?? 0) > 0 && <Paper
        sx={{
          padding: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          margin: { xs: "10px", sm: "50px" },
        }}
        elevation={3}
      >
      <div style={{marginLeft: '50px'}}>
      <Grid container alignItems={"center"} spacing={{md: 2 }}>
        {
          garages.length > 1 && <FormControl>
            <InputLabel id="garage-select-label">Garage</InputLabel>
              <Select
                labelId="garage-select-label"
                id="garage-select"
                value={selectedGarage!}
                label="Garage"
                onChange={handleChange}>
                { garages.map((garage, i) => <MenuItem key={i} value={garage.Name}>{garage.Name}</MenuItem>) }
              </Select>
            </FormControl>
        }
        {
          garages.length == 1 && <h1>{selectedGarage!}</h1>
        }
        <h1>{t("route_analytics.title")}</h1>
      </Grid>
      </div>

      <Grid container columns={{ xs: 1, sm: 1, md: 2, lg: 6 }}>
        {/* Numeric Stat 1 */}
      <Grid size={{ xs: 1, sm: 1, md: 1, lg: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6"> {t('route_analytics.mean_daily_turnover')}<br /> ({t('route_analytics.last_30_days')})</Typography>
            <Typography variant="h5">$18,000</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Numeric Stat 2 */}
      <Grid size={{ xs: 1, sm: 1, md: 1, lg: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{t('route_analytics.mean_parking_duration')} <br /> ({t('route_analytics.last_30_days')})</Typography>
            <Typography variant="h5">90 min </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Numeric Stat 3 */}
      <Grid size={{ xs: 1, sm: 1, md: 1, lg: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{t('route_analytics.total_kwh_charged')} <br /> ({t('route_analytics.last_30_days')})</Typography>
            <Typography variant="h5">1000 KWh</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      

      {/* Line Chart 1 */}
      <Grid  size={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{t('route_analytics.parking_occupancy')} ({t('route_analytics.last_30_days')})</Typography>
            <LineChart 
                xAxis={[{ data: [1,2,3,4] }]}
                series={[{ data: [3,4,2,3], color: '#f28e2c', area: true }]}
                width={450}
                height={320}>
              </LineChart>
          </CardContent>
        </Card>
      </Grid>

      {/* Line Chart 2 */}
      <Grid size={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{t('route_analytics.charging_occupancy')} ({t('route_analytics.last_30_days')})</Typography>
              <LineChart 
                xAxis={[{ data: [1,2,3,4,5,6] }]}
                series={[{ data: [4,2,4,3,1,3], color: '#f28e2c', area: true }]}
                width={450}
                height={320}>
              </LineChart>
          </CardContent>
        </Card>
      </Grid>

      {/* Line Chart 3 */}
      <Grid size={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{t('route_analytics.defect_status')} ({t('route_analytics.last_30_days')})</Typography>
              <LineChart 
                xAxis={[{ data: [1,2,3,4] }]}
                series={[
                  { data: [1,4,2,3], label: t('route_analytics.open') },
                  { data: [2,2,3,2], label: t('route_analytics.in_work') },
                  { data: [1,0,2,4], label: t('route_analytics.closed') },
                  { data: [0,0,1,0], label: t('route_analytics.rejected') },
                ]}
                width={450}
                height={320}
                >
              </LineChart>
          </CardContent>
        </Card>
      </Grid>
      </Grid>



      </Paper>
  );
}
