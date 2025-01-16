import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts"
import axiosAuthenticated from "src/services/Axios";
import React from "react";
import { GarageResponseObject } from "shared/GarageResponseObject";
import { DefectStatusRecord } from "shared/DefectStatusRecord";
import { NumberRecord } from "shared/NumberRecord";
import { OccupancyRecord } from "shared/OccupancyRecord";
import { GarageListItem, toGarageListItem } from "src/models/GarageListItem";

export default function Analytics() {
  const { t } = useTranslation();
  const [garages, setGarages] = React.useState<GarageListItem[]>([]);
  const [selectedGarage, setSelectedGarage] = React.useState<string>();

  const [turnover, setTurnover] = React.useState<number>(0);
  const [meanParkingDuration, setMeanParkingDuration] = React.useState<number>(0);
  const [kwhCharged, setKwhCharged] = React.useState<number>(0);
  const [parkingOccupancyHist, setParkingOccupancyHist] = React.useState<any[][]>([])
  const [chargingOccupancyHist, setChargingOccupancyHist] = React.useState<any[][]>([])
  const [defectStatusHist, setDefectStatusHist] = React.useState<any[][]>([])

  const PROPERTY_MANAGEMENT_URL = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;
  const INFRASTRUCTURE_MANAGEMENT_URL = import.meta.env.VITE_INFRASTRUCTURE_MANAGEMENT_SERVICE_URL;

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
          fetchGarageAnalytics(listItems[0].Id);
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
      fetchGarageAnalytics(garageId);
      setSelectedGarage(event.target.value as string);
    }
  }

  const fetchTurnover = (garageId: string, start: Date, end: Date) => {
    axiosAuthenticated
      .get(`${INFRASTRUCTURE_MANAGEMENT_URL}/analytics/turnover/${garageId}/${start.toISOString()}/${end.toISOString()}`)
      .then(turnoverResponse => {
        if (!turnoverResponse.data) {
          console.log("No turnover entries could be fetched")
          return;
        }
        const turnoverEntries: NumberRecord[] = turnoverResponse.data;
        if (turnoverEntries.length == 0) {
          setTurnover(0);
          return;
        }
        const totalTurnover = turnoverEntries.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
        setTurnover(Number(totalTurnover.toFixed(2)));
      })
      .catch((error) => {
        console.error("Failed to fetch turnover entries:", error);
      })
  }

  const fetchMeanParkingDuration = (garageId: string, start: Date, end: Date) => {
    axiosAuthenticated
      .get(`${INFRASTRUCTURE_MANAGEMENT_URL}/analytics/parking/duration/${garageId}/${start.toISOString()}/${end.toISOString()}`)
      .then(durationResponse => {
        if (!durationResponse.data) {
          console.log("No parking duration entries could be fetched")
          return;
        }
        const durationEntries: NumberRecord[] = durationResponse.data;
        if (durationEntries.length == 0) {
          setMeanParkingDuration(0);
          return;
        }
        const meanDuration = durationEntries.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
        setMeanParkingDuration(meanDuration/durationEntries.length);
      })
      .catch((error) => {
        console.error("Failed to fetch parking duration entries:", error);
      })
  }

  const fetchTotalKwhConsumed = (garageId: string, start: Date, end: Date) => {
    axiosAuthenticated
      .get(`${INFRASTRUCTURE_MANAGEMENT_URL}/analytics/charging/powerConsumed/${garageId}/${start.toISOString()}/${end.toISOString()}`)
      .then(powerConsumptionResponse => {
        if (!powerConsumptionResponse.data) {
          console.log("No power consumption entries could be fetched")
          return;
        }
        const powerConsumptionEntries: NumberRecord[] = powerConsumptionResponse.data;
        if (powerConsumptionEntries.length == 0) {
          setKwhCharged(0);
          return;
        }
        const totalConsumedPower = powerConsumptionEntries.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
        setKwhCharged(totalConsumedPower);
      })
      .catch((error) => {
        console.error("Failed to fetch power consumption entries:", error);
      })
  }

  const fetchParkingStatus = (garageId: string, start: Date, end: Date) => {
    axiosAuthenticated
      .get(`${INFRASTRUCTURE_MANAGEMENT_URL}/analytics/parking/status/${garageId}/${start.toISOString()}/${end.toISOString()}`)
      .then(parkingStatusResponse => {
        if (!parkingStatusResponse.data) {
          console.log("No parking status entries could be fetched")
          return;
        }
        const parkingStatusEntries: OccupancyRecord[] = parkingStatusResponse.data;
        if (parkingStatusEntries.length == 0) {
          setParkingOccupancyHist([]);
          return;
        }
        setParkingOccupancyHist(
          create30DaysNumberOccupancyHistogram(parkingStatusEntries)
        );
      })
      .catch((error) => {
        console.error("Failed to fetch parking occupancy entries:", error);
      })
  }

  const fetchChargingStatus = (garageId: string, start: Date, end: Date) => {
    axiosAuthenticated
      .get(`${INFRASTRUCTURE_MANAGEMENT_URL}/analytics/charging/status/${garageId}/${start.toISOString()}/${end.toISOString()}`)
      .then(chargingStatusResponse => {
        if (!chargingStatusResponse.data) {
          console.log("No charging status entries could be fetched")
          return;
        }
        const chargingStatusEntries: OccupancyRecord[] = chargingStatusResponse.data;
        if (chargingStatusEntries.length == 0) {
          setChargingOccupancyHist([]);
          return;
        }
        setChargingOccupancyHist(
          create30DaysNumberOccupancyHistogram(chargingStatusEntries)
        );
      })
      .catch((error) => {
        console.error("Failed to fetch charging occupancy entries:", error);
      })
  }

  const fetchDefectStatus = (garageId: string, start: Date, end: Date) => {
    axiosAuthenticated
      .get(`${INFRASTRUCTURE_MANAGEMENT_URL}/analytics/defects/status/${garageId}/${start.toISOString()}/${end.toISOString()}`)
      .then(defectStatusResponse => {
        if (!defectStatusResponse.data) {
          console.log("No defect status entries could be fetched")
          return;
        }
        const defectStatusEntries: DefectStatusRecord[] = defectStatusResponse.data;
        if (defectStatusEntries.length == 0) {
          setDefectStatusHist([]);
          return;
        }
        setDefectStatusHist(
          create30DaysDefectRecordHistogram(defectStatusEntries)
        );
      })
      .catch((error) => {
        console.error("Failed to fetch defect status entries:", error);
      })
  }

  const fetchGarageAnalytics = (garageId: string) => {
    console.log(`Fetching analytics for garage ${garageId}`);
    const now = new Date();
    const aMonthAgo = new Date(new Date().setDate(now.getDate()-30))

    fetchTurnover(garageId, aMonthAgo, now);
    fetchMeanParkingDuration(garageId, aMonthAgo, now);
    fetchTotalKwhConsumed(garageId, aMonthAgo, now);

    fetchParkingStatus(garageId, aMonthAgo, now);
    fetchChargingStatus(garageId, aMonthAgo, now);
    fetchDefectStatus(garageId, aMonthAgo, now);
  }

  const create30DaysNumberOccupancyHistogram = (records: OccupancyRecord[]) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let last30Days: Date[] = []

    for (const i of Array(30).keys()) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      last30Days.push(date);
    }

    last30Days.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const dayValueMap = new Map();
    for (const record of records) {
      const recordDate = new Date(record.timestamp);
      recordDate.setHours(0, 0, 0, 0);
      
      if (!dayValueMap.has(recordDate.getTime()) || dayValueMap.get(recordDate.getTime()) < record.occupiedSpaces) {
        dayValueMap.set(recordDate.getTime(), record.occupiedSpaces);
      }
    }

    let lastValue: any = records[0].occupiedSpaces;
    
    const dates: Date[] = [];
    const values: number[] = [];

    last30Days.forEach(date => {
        const timestamp = date.getTime();

        if (dayValueMap.has(timestamp)) {
            lastValue = dayValueMap.get(timestamp);
        } 
        
        dates.push(new Date(timestamp));
        values.push(lastValue);
    })

    return [dates, values];
  }
  
  const create30DaysDefectRecordHistogram = (records: DefectStatusRecord[]) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let last30Days = [];

    for (const i of Array(30).keys()) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        last30Days.push(date);
    }

    last30Days.sort((a, b) => a.getTime() - b.getTime());
    records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const dayValueMap = new Map();
    for (const record of records) {
        const recordDate = new Date(record.timestamp);
        recordDate.setHours(0, 0, 0, 0);

        if (!dayValueMap.has(recordDate.getTime()) || record.timestamp > dayValueMap.get(recordDate.getTime()).timestamp) {
            dayValueMap.set(recordDate.getTime(), record);
        }
    }

    let lastValue = { open: 0, inWork: 0, closed: 0, rejected: 0 };

    let dates: Date[] = []
    let openValues: number[] = []
    let inWorkValues: number[] = []
    let closedValues: number[] = []
    let rejectedValues: number[] = []

    last30Days.forEach(date => {
        const timestamp = date.getTime();

        if (dayValueMap.has(timestamp)) {
            lastValue = dayValueMap.get(timestamp);
        }

        dates.push(new Date(timestamp))
        openValues.push(lastValue.open);
        inWorkValues.push(lastValue.inWork);
        closedValues.push(lastValue.closed);
        rejectedValues.push(lastValue.rejected);
    });

    return [dates, openValues, inWorkValues, closedValues, rejectedValues];
  };

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
            <Typography variant="h6"> {t('route_analytics.turnover')}<br /> ({t('route_analytics.last_30_days')})</Typography>
            <Typography variant="h5">${turnover}</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Numeric Stat 2 */}
      <Grid size={{ xs: 1, sm: 1, md: 1, lg: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{t('route_analytics.mean_parking_duration')} <br /> ({t('route_analytics.last_30_days')})</Typography>
            <Typography variant="h5">{meanParkingDuration} min </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Numeric Stat 3 */}
      <Grid size={{ xs: 1, sm: 1, md: 1, lg: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{t('route_analytics.total_kwh_charged')} <br /> ({t('route_analytics.last_30_days')})</Typography>
            <Typography variant="h5">{kwhCharged} KWh</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      

      {/* Line Chart 1 */}
      <Grid  size={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">{t('route_analytics.parking_occupancy')} ({t('route_analytics.last_30_days')})</Typography>
            <LineChart 
                xAxis={parkingOccupancyHist.length === 0 ? [] : [{
                  data: parkingOccupancyHist[0],
                  valueFormatter: (value) => `${new Date(value).getDate()}.${new Date(value).getMonth()+1}`,
                  min: new Date().setDate(new Date().getDate() - 30)
                }]}
                series={parkingOccupancyHist.length === 0 ? [] : [{ 
                  data: parkingOccupancyHist[1],
                  color: '#f28e2c', 
                  area: true, 
                }]}
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
                xAxis={chargingOccupancyHist.length === 0 ? [] : [{
                  data: chargingOccupancyHist[0],
                  valueFormatter: (value) => `${new Date(value).getDate()}.${new Date(value).getMonth()+1}`,
                  min: new Date().setDate(new Date().getDate() - 30)
                }]}
                series={chargingOccupancyHist.length === 0 ? [] : [{ 
                  data: chargingOccupancyHist[1],
                  color: '#f28e2c', 
                  area: true, 
                }]}
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
                xAxis={defectStatusHist.length === 0 ? [] : [{
                  data: defectStatusHist[0],
                  valueFormatter: (value) => `${new Date(value).getDate()}.${new Date(value).getMonth()+1}`,
                  min: new Date().setDate(new Date().getDate() - 30)
                }]}
                series={defectStatusHist.length === 0 ? [] : [
                  { data: defectStatusHist[1], label: t('route_analytics.open') },
                  { data: defectStatusHist[2], label: t('route_analytics.in_work') },
                  { data: defectStatusHist[3], label: t('route_analytics.closed') },
                  { data: defectStatusHist[4], label: t('route_analytics.rejected') },
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
