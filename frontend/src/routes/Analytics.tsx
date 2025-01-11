import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2"
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts"
import axiosAuthenticated from "src/services/Axios";
import React from "react";
import { GarageResponseObject } from "shared/GarageResponseObject";
import { DefectStatusRecord } from "shared/DefectStatusRecord";
import { NumberRecord } from "shared/NumberRecord";
import { GarageListItem, toGarageListItem } from "src/models/GarageListItem";

export default function Analytics() {
  const { t } = useTranslation();
  const [garages, setGarages] = React.useState<GarageListItem[]>([]);
  const [selectedGarage, setSelectedGarage] = React.useState<string>();

  const [turnover, setTurnover] = React.useState<number>();
  const [meanParkingDuration, setMeanParkingDuration] = React.useState<number>();
  const [kwhCharged, setKwhCharged] = React.useState<number>();
  const [parkingOccupancyHist, setParkingOccupancyHist] = React.useState<any[][]>()
  const [chargingOccupancyHist, setChargingOccupancyHist] = React.useState<any[][]>()
  const [defectStatusHist, setDefectStatusHist] = React.useState<any[][]>()

  const PROPERTY_MANAGEMENT_URL = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;
  const INFRASTRUCTURE_MANAGEMENT_URL = import.meta.env.VITE_INFRASTRUCTURE_MANAGEMENT_URL;

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

  const fetchGarageAnalytics = (garageId: string) => {
    console.log(`Fetching analytics for garage ${garageId}`);
    setTurnover(19000);
    setMeanParkingDuration(91);
    setKwhCharged(1001);

    let parkingRecords: NumberRecord[] = [
      { timestamp: new Date('2024-12-16T12:00:00Z'), value: 4 },
      { timestamp: new Date('2024-12-22T12:00:00Z'), value: 2 },
      { timestamp: new Date('2025-01-03T12:00:00Z'), value: 5 },
      { timestamp: new Date('2025-01-08T12:00:00Z'), value: 3 },
      { timestamp: new Date('2025-01-10T12:00:00Z'), value: 1 },
      { timestamp: new Date('2025-01-10T12:00:00Z'), value: 3 },
    ];

    let chargingRecords: NumberRecord[] = [
      { timestamp: new Date('2024-12-18T12:00:00Z'), value: 3 },
      { timestamp: new Date('2024-12-26T12:00:00Z'), value: 13 },
      { timestamp: new Date('2024-12-30T12:00:00Z'), value: 9 },
      { timestamp: new Date('2025-01-3T12:00:00Z'), value: 2 },
      { timestamp: new Date('2025-01-08T12:00:00Z'), value: 14 },
    ];

    let defectStatusRecords: DefectStatusRecord[] = [
      {
          timestamp: new Date('2024-12-18T12:00:00Z'),
          open: 5,
          inWork: 3,
          closed: 2,
          rejected: 0
      },
      {
          timestamp: new Date('2024-12-22T12:00:00Z'),
          open: 8,
          inWork: 2,
          closed: 4,
          rejected: 1
      },
      {
          timestamp: new Date('2024-12-30T12:00:00Z'),
          open: 6,
          inWork: 4,
          closed: 3,
          rejected: 2
      },
      {
          timestamp: new Date('2025-01-04T08:00:00Z'),
          open: 7,
          inWork: 5,
          closed: 6,
          rejected: 1
      },
      {
          timestamp: new Date('2025-01-05T08:00:00Z'),
          open: 4,
          inWork: 6,
          closed: 7,
          rejected: 0
      },
      {
          timestamp: new Date('2025-01-06T08:00:00Z'),
          open: 3,
          inWork: 7,
          closed: 5,
          rejected: 2
      },
      {
          timestamp: new Date('2025-01-07T08:00:00Z'),
          open: 2,
          inWork: 8,
          closed: 9,
          rejected: 3
      },
      {
          timestamp: new Date('2025-01-08T08:00:00Z'),
          open: 5,
          inWork: 5,
          closed: 5,
          rejected: 1
      }
    ]
  

    setParkingOccupancyHist(create30DaysNumberRecordHistogram(parkingRecords));
    setChargingOccupancyHist(create30DaysNumberRecordHistogram(chargingRecords));
    setDefectStatusHist(create30DaysDefectRecordHistogram(defectStatusRecords));
  }

  const create30DaysNumberRecordHistogram = (records: NumberRecord[]) => {
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
      
      if (!dayValueMap.has(recordDate.getTime()) || dayValueMap.get(recordDate.getTime()) < record.value) {
        dayValueMap.set(recordDate.getTime(), record.value);
      }
    }

    let lastValue: any = records[0].value;
    
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
                xAxis={[{
                  data: parkingOccupancyHist![0],
                  valueFormatter: (value) => `${new Date(value).getDate()}.${new Date(value).getMonth()+1}`,
                  min: new Date().setDate(new Date().getDate() - 30)
                }]}
                series={[{ 
                  data: parkingOccupancyHist![1],
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
                xAxis={[{
                  data: chargingOccupancyHist![0],
                  valueFormatter: (value) => `${new Date(value).getDate()}.${new Date(value).getMonth()+1}`,
                  min: new Date().setDate(new Date().getDate() - 30)
                }]}
                series={[{ 
                  data: chargingOccupancyHist![1],
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
                xAxis={[{
                  data: chargingOccupancyHist![0],
                  valueFormatter: (value) => `${new Date(value).getDate()}.${new Date(value).getMonth()+1}`,
                  min: new Date().setDate(new Date().getDate() - 30)
                }]}
                series={[
                  { data: defectStatusHist![1], label: t('route_analytics.open') },
                  { data: defectStatusHist![2], label: t('route_analytics.in_work') },
                  { data: defectStatusHist![3], label: t('route_analytics.closed') },
                  { data: defectStatusHist![4], label: t('route_analytics.rejected') },
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
