import { useState } from "react";
import { TextField, Typography, Paper, FormControlLabel, Switch, Button, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { GarageRequestObject } from "shared/GarageRequestObject";
import { useNavigate } from "react-router-dom";
import axiosAuthenticated from "src/services/Axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
import { ChargingStationRequestObject } from "shared/ChargingStationRequestObject";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

dayjs.extend(utc);

interface Map {
  [key: string]: (data: string) => string;
}

interface FormData {
  name: string;
  isOpen: boolean;
  numberParkingSpots: number;
  pricePerHour: number;
  openingTime: string;
  closingTime: string;
  chargingStations: ChargingStationRequestObject[]; 
}

interface FormErrors {
  name: string;
  numberParkingSpots: string;
  pricePerHour: string;
  openingTime: string;
  closingTime: string;
}

export default function AddGarage() {
  const PROPERTY_MANAGEMENT_URL = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;
  const navigate = useNavigate();

  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    isOpen: false,
    numberParkingSpots: 0,
    pricePerHour: 1,
    openingTime: "06:00",
    closingTime: "23:00",
    chargingStations: []
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    numberParkingSpots: "",
    pricePerHour: "",
    openingTime: "",
    closingTime: "",
  });

  const validationFunctions: Map = {
    name: (value: string) => {
      if (value.length < 1) return t("route_add_garage.errors.name_required");
      return "";
    },
    numberParkingSpots: (value: string) => {
      const numberSpots = Number(value);
      if (numberSpots < 0) return t("route_add_garage.errors.number_parking_spots_positive");
      return "";
    },
    pricePerHour: (value: string) => {
      const price = Number(value);
      if (price < 0) return t("route_add_garage.errors.price_per_hour_positive");
      return "";
    },
    openingTime: (value: string) => {
      if (!isValidTime(value)) return t("route_add_garage.errors.opening_time_invalid");
      return "";
    },
    closingTime: (value: string) => {
      if (!isValidTime(value)) return t("route_add_garage.errors.closing_time_invalid");
      const opening = convertToMinutes(formData.openingTime);
      const closing = convertToMinutes(value);
      if (opening >= closing) return t("route_add_garage.errors.closing_after_opening");
      return "";
    },
  };

  function isValidTime(time: string): boolean {
    const formatValid = /^(\d{1,2}):(\d{2})$/.test(time);

    if (!formatValid) {
      return false;
    }

    const minutes = convertToMinutes(time);
    return minutes >= 0 && minutes < 24 * 60;
  }

  function convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
  
      const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
      const newValue = type === "checkbox" ? checked : value;
  
      setFormData({
        ...formData,
        [name]: newValue,
      });
      validateField(name, String(newValue));
    };

  const validateField = (name: string, value: string) => {
    const validationFunction = validationFunctions[name];
    if (validationFunction) {
      const error = validationFunction(value);
      setFormErrors({
        ...formErrors,
        [name]: error,
      });
    }
  };

  const validateAllFields = () => {
    const errors = {
      name: "",
      numberParkingSpots: "",
      pricePerHour: "",
      openingTime: "",
      closingTime: "",
    };
    let isValid = true;

    for (const field in formData) {
      const validationFunction = validationFunctions[field];
      if (!validationFunction) continue;
      const error = validationFunction(String(formData[field as keyof FormData]));
      if (error) isValid = false;
      errors[field as keyof FormErrors] = error;
    }

    setFormErrors({ ...errors });
    return isValid;
  };

  // Handler for adding a new charging station
  const addChargingStation = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      chargingStations: [
        ...prevFormData.chargingStations,
        { name: "", chargingSpeedInKw: 0, pricePerKwh: 0 }
      ],
    }));
  };

  // Handler for updating charging station properties
  const handleChargingStationChange = (name: string, chargingSpeedInKw: number, pricePerKwh: number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      chargingStations: prevFormData.chargingStations.map((station) =>
        station.name === name ? { ...station, chargingSpeedInKw: chargingSpeedInKw, pricePerKwh: pricePerKwh }: station
      ),
    }));
  };

  // Handler for removing a charging station
  const removeChargingStation = (name: string) => {
    setFormData((setFormData) => ({
      ...setFormData,
      chargingStations: setFormData.chargingStations.filter(
        (station) => station.name !== name
      ),
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!validateAllFields()) return;

    setSaving(true);

    const request: GarageRequestObject = {
      name: formData.name,
      isOpen: formData.isOpen,
      numberParkingSpots: formData.numberParkingSpots,
      pricePerHourInEuros: formData.pricePerHour,
      openingTime: formData.openingTime,
      closingTime: formData.closingTime,
      chargingStations: formData.chargingStations,
    };

    try {
      await axiosAuthenticated.post(`${PROPERTY_MANAGEMENT_URL}/garages/`, request);
      navigate("/garages");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        margin: { xs: "10px", sm: "50px" },
      }}
    >
      <Grid size={{ xs: 12, md: 8, sm: 10 }}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="h4">
                  {t("route_add_garage.add_garage")}
                </Typography>
              </Grid>

              <Grid size={12}>
                <TextField
                  id="outlined-error"
                  fullWidth
                  label={t("route_add_garage.name")}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel 
                  control={
                    <Switch 
                      name="isOpen"
                      checked={formData.isOpen}
                      onChange={handleChange}
                    />} 
                  label={formData.isOpen ? t("route_add_garage.open") : t("route_add_garage.closed")} />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("route_add_garage.number_parking_spots")}
                  name="numberParkingSpots"
                  value={formData.numberParkingSpots}
                  onChange={handleChange}
                  error={!!formErrors.numberParkingSpots}
                  helperText={formErrors.numberParkingSpots}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("route_add_garage.price_per_hour")}
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  error={!!formErrors.pricePerHour}
                  helperText={formErrors.pricePerHour}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("route_add_garage.opening_time")}
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  error={!!formErrors.openingTime}
                  helperText={formErrors.openingTime}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("route_add_garage.closing_time")}
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  error={!!formErrors.closingTime}
                  helperText={formErrors.closingTime}
                />
              </Grid>

              <Typography variant="h5">
                {t("route_add_garage.charging_stations.title")}
              </Typography>
                {formData.chargingStations.map((station, index) => (
                    <Grid container spacing={2}>
                      <Typography variant="h6">
                        {t("route_add_garage.charging_stations.station")} {index + 1} 
                        <IconButton
                          type="button"
                          onClick={() => removeChargingStation(station.name)}>
                            <DeleteOutlineIcon/>
                        </IconButton>
                      </Typography>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          label={t("route_add_garage.charging_stations.name")}
                          name="name"
                          value={station.name}
                          onChange={(e) =>
                            handleChargingStationChange(e.target.value, station.chargingSpeedInKw, station.pricePerKwh)
                          }
                          error={!!formErrors.closingTime}
                          helperText={formErrors.closingTime}
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          label={t("route_add_garage.charging_stations.charging_speed")}
                          name="charging-speed"
                          value={station.chargingSpeedInKw}
                          onChange={(e) =>
                            handleChargingStationChange(station.name, +e.target.value, station.pricePerKwh)
                          }
                          error={!!formErrors.closingTime}
                          helperText={formErrors.closingTime}
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          label={t("route_add_garage.charging_stations.price")}
                          name="price"
                          value={station.pricePerKwh}
                          onChange={(e) =>
                            handleChargingStationChange(station.name, station.chargingSpeedInKw, +e.target.value)
                          }
                          error={!!formErrors.closingTime}
                          helperText={formErrors.closingTime}
                        />
                      </Grid>
                    </Grid>
                ))}
                <IconButton type="button" onClick={addChargingStation}>
                  <AddIcon/>
                </IconButton>

              <Grid size={12}>
                <LoadingButton
                  type="submit"
                  color="primary"
                  loading={saving}
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="outlined"
                >
                  {t("common.save_button")}
                </LoadingButton>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}
