import { useState } from "react";
import { TextField, Typography, Paper, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid2";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreateUserRequestObject } from "shared/CreateUserRequestObject";
import axiosAuthenticated from "src/services/Axios";
import { UserRoleObject } from "shared/UserRoleObject";
import { jwtDecode } from "jwt-decode";

const AUTHENTICATION_URL = import.meta.env.VITE_AUTHENTICATION_SERVICE_URL;
const TENANT_TYPE = import.meta.env.VITE_TENANT_TYPE;

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
      const validRoles = [100, 200, 300, 400, 500];
      const parsedValue = parseInt(value);
      if (!validRoles.includes(parsedValue)) return "Invalid role";
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
    //TODO: refactor later
    // extract tenant_id from jwt_token
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error("Token is null");
      return;
    }
    const decodedToken: any = jwtDecode(token);
    const tenantId = decodedToken.firebase.tenant;

    // start of normal function
    e.preventDefault();
    const userToCreate: CreateUserRequestObject = {
      name: formData.name,
      mail: formData.mail,
      role: parseInt(formData.role),
      password: formData.password,
      tenantId: tenantId,
      tenantType: TENANT_TYPE
    };
    if (!validateAllFields()) return;

    try {
      await axiosAuthenticated.post(`${AUTHENTICATION_URL}/user`, userToCreate);
      navigate("/users");
    } catch (error) {
      console.error(error);
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
                  {t("route_add_user.add_user")}
                </Typography>
              </Grid>

              <Grid size={12}>
                <TextField
                  id="outlined-error"
                  fullWidth
                  label={t("route_add_user.grid_name")}
                  name="name"
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
                  name="mail"
                  value={formData.mail}
                  onChange={handleChange}
                  error={!!formErrors.mail}
                  helperText={formErrors.mail}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  label={t("route_add_user.grid_role")}
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                >
                  <MenuItem value={UserRoleObject.solution_admin.valueOf().toString()}>
                    {t(`route_add_user.role_select.solution_admin`)}
                  </MenuItem>
                  <MenuItem value={UserRoleObject.tenant_admin.valueOf().toString()}>
                    {t(`route_add_user.role_select.tenant_admin`)}
                  </MenuItem>
                  <MenuItem value={UserRoleObject.operational_manager.valueOf().toString()}>
                    {t(`route_add_user.role_select.operational_manager`)}
                  </MenuItem>
                  <MenuItem value={UserRoleObject.customer.valueOf().toString()}>
                    {t(`route_add_user.role_select.customer`)}
                  </MenuItem>
                  <MenuItem value={UserRoleObject.third_party.valueOf().toString()}>
                    {t(`route_add_user.role_select.third_party`)}
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("route_add_user.grid_password")}
                  name="password"
                  type="password"
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
