import { CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2"
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

interface OccupancyGridProps {
  total: number;
  occupied: number;
}

export const OccupancyGrid: FunctionComponent<OccupancyGridProps> = ({total, occupied}) => {
  const { t } = useTranslation();

  return (
    <>
      <Grid container style={{marginLeft: "50px"}}>
        <Grid container alignContent={"center"} size={4}>
          <CircularProgress 
            variant="determinate" 
            value={total-occupied} 
            thickness={10} size={60} 
            color='primary'
            sx={{
              borderRadius: '50%',
              boxShadow: `inset 0 0 0 ${10/44*60}px #cbcbcb`,
           }}/>
        </Grid>
        <Grid size={4}>
          <p>{t("component_occupancy_grid.total")}</p>
          <p>{total}</p>
        </Grid>
        <Grid size={4}>
          <p>{t("component_occupancy_grid.occupied")}</p>
          <p>{occupied}</p>
        </Grid>
      </Grid>
    </>
  );
}
