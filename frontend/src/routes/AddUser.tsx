import { useRef, useState } from "react";
import { TextField, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreateUserRequestObject } from "shared/CreateUserRequestObject";

const AUTHENTICATION_URL = import.meta.env.VITE_AUTHENTICATION_SERVICE_URL;

interface FormData {
    name: string;
    mail: string;
    password: string;
    role: string;
  }

interface FormErrors {
  name: string;
  mail: string;
  password: string;
  role: string;
}

export default function AddUsers() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const userCreated = useRef(false);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    mail: "",
    role: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    mail: "",
    password: "",
    role: "",
  });

  const validationFunctions: { [key: string]: (value: string) => string } = {
    name: (value: string) => {
      if (value.length < 1) return "Name is required";
      return "";
    },
    mail: (value: string) => {
      if (value.length < 1) return "Mail is required";
      return "";
    },
    role: (value: string) => {
        //TODO: Fix this
      if (parseInt(value) < 0) return "Role is required";
        return "";
    },
    password: (value: string) => {
      if (value.length < 1) return "Password is required";
      return "";
    },
  };

  const handleChange = (e: { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validateField(name, value);
  };

  const validateField = (name: string, value: any) => {
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
      mail: "",
      role: "",
      password: "",
    };
    let isValid = true;

    for (const field in formData) {
      const validationFunction = validationFunctions[field];
      if (!validationFunction) continue;
      const error = validationFunction(formData[field as keyof FormData]);
      if (error) isValid = false;
      errors[field as keyof FormErrors] = error;
    }

    setFormErrors({ ...errors });
    return isValid;
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    console.log("submitting");
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
                  {t("route_add_user.add_user")}
                </Typography>
              </Grid>

              <Grid size={12}>
                <TextField
                  id="outlined-error"
                  fullWidth
                  label={t("route_add_user.grid_name")}
                  name="object"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  id="outlined-error"
                  fullWidth
                  label={t("route_add_user.grid_mail")}
                  name="location"
                  value={formData.mail}
                  onChange={handleChange}
                  error={!!formErrors.mail}
                  helperText={formErrors.mail}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("route_add_user.grid_role")}
                  name="shortDescription"
                  value={formData.role}
                  onChange={handleChange}
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("route_add_user.grid_password")}
                  name="shortDescription"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
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
                  {t("route_add_user.save_button")}
                </LoadingButton>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}
