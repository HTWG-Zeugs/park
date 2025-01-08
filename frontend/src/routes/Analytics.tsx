import Paper from "@mui/material/Paper";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Analytics() {
  const { t } = useTranslation();

  useEffect(() => {
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
        elevation={3}
      >
        <h1>{t("route_analytics.title")}</h1>
      </Paper>
  );
}
