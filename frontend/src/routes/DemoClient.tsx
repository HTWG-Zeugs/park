import Paper from "@mui/material/Paper";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import React from "react";
import { GarageListItem } from "src/models/GarageListItem";

export default function DemoClient() {
  const { t } = useTranslation();
  const [garages, setGarages] = React.useState<GarageListItem[]>([]);
  const [selectedGarage, setSelectedGarage] = React.useState<string>();

  const PROPERTY_MANAGEMENT_URL = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;
  const INFRASTRUCTURE_MANAGEMENT_URL = import.meta.env.VITE_INFRASTRUCTURE_MANAGEMENT_SERVICE_URL;

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
    //
  }, [])

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
      </Paper>
  );
}
