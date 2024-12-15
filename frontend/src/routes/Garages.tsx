import { Paper } from "@mui/material";
import GarageList from "src/components/garage-list/GarageList";

export default function Garages() {
  return (
    <>
      <Paper
        sx={{
          padding: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          margin: { xs: "10px", sm: "50px" },
        }}
        elevation={3}
      >
        <GarageList />
      </Paper>
    </>
  );
}