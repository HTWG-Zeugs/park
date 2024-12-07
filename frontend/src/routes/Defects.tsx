import { Paper } from "@mui/material";
import DefectList from "src/components/defect-list/DefectList";

export default function Defects() {
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
        <DefectList />
      </Paper>
    </>
  );
}
