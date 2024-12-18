import { useEffect, useState } from "react";
import { TextField, Typography, Paper, FormControlLabel, Switch } from "@mui/material";
import Grid from "@mui/material/Grid2";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { GarageRequestObject } from "shared/GarageRequestObject";

import { useLocation, useNavigate } from "react-router-dom";
import axiosAuthenticated from "src/services/Axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
import { GarageResponseObject } from "shared/GarageResponseObject";

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
}

interface FormErrors {
  name: string;
  numberParkingSpots: string;
  pricePerHour: string;
  openingTime: string;
  closingTime: string;
}

export default function EditGarage() {
  const location = useLocation();
  const { id } = location.state || {};
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
  });

  useEffect(() => {
    if (id) {
      fetchGarage(id);
    }
  }, [id]);

  function fetchGarage(id: string) {
    axiosAuthenticated
      .get(`/garages/${id}`)
      .then((response) => {
        const data: GarageResponseObject = response.data;
        setFormData({
          name: data.Name,
          isOpen: data.IsOpen,
          numberParkingSpots: data.NumberParkingSpots,
          pricePerHour: data.PricePerHourInEuros,
          openingTime: data.OpeningTime,
          closingTime: data.ClosingTime,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

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
      chargingStations: [],
    };

    try {
      await axiosAuthenticated.put(`/garages/${id}`, request);
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
                <Typography variant="h6">
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