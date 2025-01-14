import Paper from "@mui/material/Paper";
  import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import React from "react";
import { GarageListItem, toGarageListItem } from "src/models/GarageListItem";
import { Button, FormControl, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CallMadeIcon from '@mui/icons-material/CallMade';
import axiosAuthenticated from "src/services/Axios";
import { GarageResponseObject } from "shared/GarageResponseObject";
import { ChargingStationResponseObject } from "shared/ChargingStationResponseObject";

export default function DemoClient() {
  const { t } = useTranslation();
  const [garages, setGarages] = React.useState<GarageResponseObject[]>([]);
  const [chargingStations, setChargingStations] = React.useState<ChargingStationResponseObject[]>([]);
  const [selectedGarage, setSelectedGarage] = React.useState<string>();
  const [selectedStation, setSelectedStation] = React.useState<string>();

  const PROPERTY_MANAGEMENT_URL = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;
  const INFRASTRUCTURE_MANAGEMENT_URL = import.meta.env.VITE_INFRASTRUCTURE_MANAGEMENT_SERVICE_URL;

  const ticketId: string = "<ticketId>";
  const sessionId: string = "<sessionId>";

  //create garage with charging stations
  //update garage and add charging station
  //show analytics and occupancy page
  //drive in (via dem client)
  //start charging session (via dem client)
  //show occupancy status
  //create defect?
  //stop charging session (via dem client)
  //pay parking ticket (via dem client)
  //drive out (via dem client)

  useEffect(() => {
    fetchGarages()
  }, [])

  const fetchGarages = useCallback(() => {
    axiosAuthenticated
      .get(`${PROPERTY_MANAGEMENT_URL}/garages/`)
      .then((response) => {
        if (!response.data) {
          throw new Error("fetching garages failed!");
        }
        const responseData: GarageResponseObject[] = response.data;
        if (responseData.length > 0) {
          setGarages(responseData);
          setSelectedGarage(responseData[0].Name)
          setChargingStations(responseData[0].ChargingStations);
          setSelectedStation(responseData[0].ChargingStations[0].name)
        }
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      })
      .finally(() => {
        //set loading to false
      });
    }, [t]);

  const handleGarageChange = (event: SelectChangeEvent<string>) => {
      const garage = garages.find(garage => garage.Name === event.target.value);
      if (garage?.Id) {
        setSelectedGarage(event.target.value as string);
        setChargingStations(garage.ChargingStations);
        setSelectedStation(garage.ChargingStations[0].name)
      }
    }

  const handleStationChange = (station: any) => {
    console.log(station)
  }

  const handleSessionIdChange = (sessionId: any) => {
    console.log(sessionId)
  }

  const handleTicketIdChange = (sessionId: any) => {
    console.log(sessionId)
  }

  return (
    <Paper
      sx={{
        padding: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        margin: { xs: "10px", sm: "50px" },
      }}
      elevation={3}>
        <Grid container columns={3}>
          <Grid size={2}>
            <Typography variant="h6">
              1. Create garage
            </Typography>
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}
              startIcon={<CallMadeIcon />}>
              go to 'garages'
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Create a garage with some charging stations
          </Grid>

          <Grid size={2}>
            <Typography variant="h6">
              2. Update garage
            </Typography>
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}
              startIcon={<CallMadeIcon />}>
              go to 'garages'
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Update the garage and add/delete some charging stations
          </Grid>
          
          <Grid size={2}>
            <Typography variant="h6">
              3. Check occupancy
            </Typography>
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}
              startIcon={<CallMadeIcon />}>
              go to 'occupancy'
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Check the occupancy. Currently all spaces in the garage should be empty.
          </Grid>

          <Grid size={2}>
            <Typography variant="h6">
              4. Show (empty) analytics
            </Typography>
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}
              startIcon={<CallMadeIcon />}>
              go to 'analytics'
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Check the analytics. Currently there should be no analytic records for that garage.
          </Grid>

          <Grid size={1}>
            <Typography variant="h6">
              5. Drive in
            </Typography>
          </Grid>
          <Grid size={1}>
            { garages.length > 0 && <FormControl variant="standard">
                <Select
                  labelId="garage-select-label"
                  id="garage-select"
                  value={selectedGarage!}
                  onChange={handleGarageChange}>
                  { garages.map((garage, i) => <MenuItem key={i} value={garage.Name}>{garage.Name}</MenuItem>) }
                </Select>
              </FormControl>
            }
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}>
              enter garage
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Drive in with your car: {ticketId}
          </Grid>

          <Grid size={1}>
            <Typography variant="h6">
              6. Start charging session
            </Typography>
          </Grid>
          <Grid size={1}>
          { chargingStations.length > 0 && <FormControl variant="standard">
                <Select
                  labelId="staions-select-label"
                  id="station-select"
                  value={selectedStation!}
                  onChange={handleStationChange}>
                  { chargingStations.map((station, i) => <MenuItem key={i} value={station.name}>{station.name}</MenuItem>) }
                </Select>
              </FormControl>
            }
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}>
              Start session
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Choose a charging station and start charging your car: {sessionId}
          </Grid>

          <Grid size={2}>
            <Typography variant="h6">
              7. Check occupancy again
            </Typography>
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}
              startIcon={<CallMadeIcon />}>
              go to 'occupancy'
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Parking and charging occupancy should now be increased
          </Grid>

          <Grid size={2}>
            <Typography variant="h6">
              9. Create defect
            </Typography>
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}
              startIcon={<CallMadeIcon />}>
              go to 'defects'
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            You saw some defect. Create a record for it!
          </Grid>

          <Grid size={1}>
            <Typography variant="h6">
              10. Stop charging session
            </Typography>
          </Grid>
          <Grid size={1}>
            <TextField
            variant="standard"
              id="outlined-error"
              name="detailedDescription"
              placeholder="session id"
              value={''}
              onChange={handleSessionIdChange}
            />
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}>
              Stop session
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Stop your charging session
          </Grid>

          <Grid size={2}>
            <Typography variant="h6">
              11. Show analytics again
            </Typography>
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}
              startIcon={<CallMadeIcon />}>
              go to 'analytics'
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Check the analytics. They should now be updated with some charging information.
          </Grid>

          <Grid size={1}>
            <Typography variant="h6">
              12. Pay parking ticket
            </Typography>
          </Grid>
          <Grid size={1}>
          <Grid size={1}>
            <TextField
            variant="standard"
              id="outlined-error"
              name="detailedDescription"
              placeholder="ticket id"
              value={''}
              onChange={handleTicketIdChange}
            />
          </Grid>
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}>
              Pay Ticket
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Pay your parking ticket. Now you have 15 minutes to leave!
          </Grid>

          <Grid size={1}>
            <Typography variant="h6">
              13. Drive out
            </Typography>
          </Grid>
          <Grid size={1}>
            <TextField
            variant="standard"
              id="outlined-error"
              name="detailedDescription"
              placeholder="ticket id"
              value={''}
              onChange={handleTicketIdChange}
            />
          </Grid>
          <Grid size={1}>
            <Button
              color="primary"
              onClick={() => {}}>
              Drive out
            </Button>
          </Grid>
          <Grid size={3} marginBottom={3}>
            Leave the parking garage with your car. You can check the occupancy status again if you want.
          </Grid>
        </Grid>
      </Paper>
  );
}
