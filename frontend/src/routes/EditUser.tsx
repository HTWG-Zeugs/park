import { useEffect, useState } from "react";
import { TextField, Paper, Typography, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useLocation, useNavigate } from "react-router-dom";
import axiosAuthenticated from "src/services/Axios";
import "src/components/thumbnail/Thumbs.css";
import { useTranslation } from "react-i18next";
import { UserObject } from "shared/UserObject";
import { UserRoleObject } from "shared/UserRoleObject";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { EditUserRequestObject } from "shared/EditUserRequestObject";

interface FormErrors {
  name: string;
  mail: string;
  role: string;
}

export default function EditUser() {
  const location = useLocation();
  const { id } = location.state || {};
  const navigate = useNavigate();
  const [userToChange, setUserToChange] = useState<UserObject>({
    id: "",
    tenantId: "",
    name: "",
    mail: "",
    role: 0,
  });
  const AUTHENTICATION_URL = import.meta.env.VITE_AUTHENTICATION_SERVICE_URL;
  const { t } = useTranslation();
  const [formErrors, setFormErrors] = useState({
    name: "",
    mail: "",
    role: "",
  });

  useEffect(() => {
    if (id) {
      try {
        // fetch all infos about the user to change
        axiosAuthenticated
          .get(`${AUTHENTICATION_URL}/user/${id}`)
          .then((response) => {
            if (!response.data) {
              throw new Error("No data");
            }
            const user: UserObject = response.data;
            setUserToChange(user);
          });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
  }, [id]);

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
  };

  const handleChange = (e: { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setUserToChange({
      ...userToChange,
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
    };
    let isValid = true;

    for (const field in userToChange) {
      const validationFunction = validationFunctions[field];
      if (!validationFunction) continue;
      const error = validationFunction(
        userToChange[field as keyof UserObject].toString()
      );
      if (error) isValid = false;
      errors[field as keyof FormErrors] = error;
    }

    setFormErrors({ ...errors });
    return isValid;
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    let user: EditUserRequestObject = {
      name: userToChange.name,
      mail: userToChange.mail,
      role: userToChange.role,
    };
    if (!validateAllFields()) return;

    try {
      await axiosAuthenticated.put(
        `${AUTHENTICATION_URL}/user/${userToChange.id}`,
        user
      );
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
                  {t("route_edit_user.user_details")}
                </Typography>
              </Grid>

              <Grid size={12}>
                <TextField
                  label={t("route_edit_user.user_id")}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  value={userToChange?.id}
                  variant="outlined"
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label={t("route_edit_user.tenant_id")}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  value={userToChange?.tenantId}
                  variant="outlined"
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label={t("route_edit_user.name")}
                  fullWidth
                  name="name"
                  value={userToChange?.name}
                  variant="outlined"
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label={t("route_edit_user.mail")}
                  fullWidth
                  name="mail"
                  value={userToChange?.mail}
                  variant="outlined"
                  onChange={handleChange}
                  error={!!formErrors.mail}
                  helperText={formErrors.mail}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  label={t("route_edit_user.role")}
                  name="role"
                  value={userToChange.role}
                  onChange={handleChange}
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                >
                  <MenuItem
                    value={UserRoleObject.solution_admin.valueOf().toString()}
                  >
                    {t(`route_add_user.role_select.solution_admin`)}
                  </MenuItem>
                  <MenuItem
                    value={UserRoleObject.tenant_admin.valueOf().toString()}
                  >
                    {t(`route_add_user.role_select.tenant_admin`)}
                  </MenuItem>
                  <MenuItem
                    value={UserRoleObject.operational_manager
                      .valueOf()
                      .toString()}
                  >
                    {t(`route_add_user.role_select.operational_manager`)}
                  </MenuItem>
                  <MenuItem
                    value={UserRoleObject.customer.valueOf().toString()}
                  >
                    {t(`route_add_user.role_select.customer`)}
                  </MenuItem>
                  <MenuItem
                    value={UserRoleObject.third_party.valueOf().toString()}
                  >
                    {t(`route_add_user.role_select.third_party`)}
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid size={12}>
                <LoadingButton
                  type="submit"
                  color="primary"
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="outlined"
                >
                  {t("route_edit_user.save_button")}
                </LoadingButton>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}
