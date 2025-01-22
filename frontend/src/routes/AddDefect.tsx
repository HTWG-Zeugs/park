import { useCallback, useEffect, useRef, useState } from "react";
import { TextField, Typography, Paper, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import Grid from "@mui/material/Grid2";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { CreateDefectRequestObject } from "shared/CreateDefectRequestObject";

import { useNavigate } from "react-router-dom";
import axiosAuthenticated from "src/services/Axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Dropzone from "src/components/dropzone/Dropzone";
import { ImageFile } from "src/models/ImageFile";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { GarageResponseObject } from "shared/GarageResponseObject";
import { GarageListItem, toGarageListItem } from "src/models/GarageListItem";

const BACKEND_URL = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;
const PROPERTY_MANAGEMENT_URL = import.meta.env.VITE_PROPERTY_MANAGEMENT_SERVICE_URL;

dayjs.extend(utc);

interface Map {
  [key: string]: (data: string) => string;
}

interface FormData {
  garageId: string;
  object: string;
  location: string;
  shortDescription: string;
  detailedDescription: string;
}

interface FormErrors {
  garageId: string;
  object: string;
  location: string;
  shortDescription: string;
}

export default function AddDefect() {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const uploadedImages = useRef<ImageFile[]>([]);
  const defectCreated = useRef(false);

  const [saving, setSaving] = useState(false);

  const [garages, setGarages] = useState<GarageListItem[]>([]);
  const [selectedGarage, setSelectedGarage] = useState<GarageListItem>();

  const [formData, setFormData] = useState<FormData>({
    garageId: selectedGarage?.Id ?? "",
    object: "",
    location: "",
    shortDescription: "",
    detailedDescription: ""
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    garageId: "",
    object: "",
    location: "",
    shortDescription: ""
  });

  const [images, setImages] = useState<ImageFile[]>([]);

  useEffect(() => {
    fetchGarages()
    return () => {
      if (defectCreated.current) return;
      uploadedImages.current.forEach((image) => {
        removeFileFromGcs(image);
      });
    };
  }, [uploadedImages, defectCreated]);

  const validationFunctions: Map = {
    object: (value: string) => {
      if (value.length < 1) return "Object is required";
      return "";
    },
    location: (value: string) => {
      if (value.length < 1) return "Location is required";
      return "";
    },
    shortDescription: (value: string) => {
      if (value.length > 80)
        return "Short description must not be longer than 80 characters";
      return "";
    },
    status: (value: string) => {
      if (value.length < 1) return "Status is required";
      return "";
    },
  };

  const handleGarageChange = (event: SelectChangeEvent<string>) => {
      console.log(event.target.value)
      const garage = garages.find(garage => garage.Id === event.target.value);
      if (garage) {
        setSelectedGarage(garage)
        setFormData({
          ...formData,
          ['garageId']: garage.Id,
        });
      }
    }

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validateField(name, value);
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
      garageId: "",
      object: "",
      location: "",
      shortDescription: "",
      status: "",
      reportingDate: "",
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

  async function fetchSignedUrl(image: ImageFile) {
    try {
      const response = await axiosAuthenticated.get(
        `${BACKEND_URL}/defects/signedUploadUrl/${image.name}`
      );
      image.uploadUrl = response.data.uploadUrl as string;
      image.deleteUrl = response.data.deleteUrl as string;
      image.uploadedName = response.data.name as string;
    } catch {
      console.error("Error fetching signed url for image upload");
    }
  }

  async function uploadImages(imagesToUpload: ImageFile[]) {
    for (const image of imagesToUpload) {
      if (image.isUploaded) continue;

      if (!image.uploadUrl) {
        await fetchSignedUrl(image);
      }

      if (!image.uploadUrl) {
        image.isUploaded = false;
        image.hasUploadError = true;
        console.error("Error fetching signed url for image upload");
        continue;
      }

      try {
        await axios.put(image.uploadUrl, image, {
          headers: {
            "Content-Type": image.type,
          },
        });
        image.isUploaded = true;
        image.hasUploadError = false;
      } catch {
        image.hasUploadError = true;
        image.isUploaded = false;
        continue;
      }
    }
  }

  const fetchGarages = useCallback(() => {
    axiosAuthenticated
      .get(`${PROPERTY_MANAGEMENT_URL}/garages/`)
      .then((response) => {
        if (!response.data) {
          throw new Error("fetching garages failed!");
        }
        const responseData: GarageResponseObject[] = response.data;
        const listItems: GarageListItem[] = responseData.map((d) =>
          toGarageListItem(d)
        );
        if (listItems.length > 0) {
          setGarages(listItems);
          setSelectedGarage(listItems[0])
          formData.garageId = listItems[0].Id
        }
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      })
      .finally(() => {
        //set loading to false
      });
    }, [t]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!validateAllFields()) return;

    setSaving(true);

    const imagesToUpload = [...images];

    await uploadImages(imagesToUpload);

    uploadedImages.current = imagesToUpload;

    if (imagesToUpload.some((imageUpload) => !imageUpload.isUploaded)) {
      setSaving(false);
      return;
    }

    // All images uploaded successfully
    // Continue with creating request object

    const request: CreateDefectRequestObject = {
      GarageId: formData.garageId,
      Object: formData.object,
      Location: formData.location,
      ShortDesc: formData.shortDescription,
      DetailedDesc: formData.detailedDescription,
      ImageNames: images.map((image) => image.uploadedName), // use the uploaded name because the uploaded name is unique
    };

    try {
      await axiosAuthenticated.post(`${BACKEND_URL}/defects/`, request);
      defectCreated.current = true;
      navigate("/defects");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  async function removeFileFromGcs(image: ImageFile) {
    if (image.isUploaded && image.deleteUrl) {
      await axios.delete(image.deleteUrl);
    }
  }

  const removeFile = useCallback(
    async (file: ImageFile) => {
      await removeFileFromGcs(file);
      setImages((prevImages) => prevImages.filter((f) => f !== file));
    },
    [setImages]
  );

  const thumbs = images.map((file) => (
    <div className="thumb" key={file.name}>
      <img
        src={file.preview}
        className="thumbInner"
        onLoad={() => URL.revokeObjectURL(file.preview)}
      />
      {file.hasUploadError && (
        <div className="errorOverlay">
          <p>{t("route_add_defect.upload_failed")}</p>
        </div>
      )}
      <button
        className="removeButton"
        onClick={() => removeFile(file)}
        aria-label="Remove image"
      >
        <CloseIcon />
      </button>
    </div>
  ));

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
                  {t("route_add_defect.add_defect")}
                </Typography>
              </Grid>

              <Grid>
                <InputLabel id="garage-select-label">Garage</InputLabel>
                <Select
                  labelId="garage-select-label"
                  id="garage-select"
                  value={formData.garageId}
                  label="Garage"
                  error={!!formErrors.garageId}
                  onChange={handleGarageChange}>
                  { garages.map((garage, i) => <MenuItem key={i} value={garage.Id}>{garage.Name}</MenuItem>) }
                </Select>
              </Grid>

              <Grid size={12}>
                <TextField
                  id="outlined-error"
                  fullWidth
                  label={t("route_add_defect.grid_object")}
                  name="object"
                  value={formData.object}
                  onChange={handleChange}
                  error={!!formErrors.object}
                  helperText={formErrors.object}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  id="outlined-error"
                  fullWidth
                  label={t("route_add_defect.grid_location")}
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("route_add_defect.grid_short_desc")}
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  error={!!formErrors.shortDescription}
                  helperText={formErrors.shortDescription}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  id="outlined-error"
                  fullWidth
                  label={t("route_add_defect.grid_detailed_desc")}
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  multiline
                  minRows={4}
                  maxRows={10}
                />
              </Grid>

              <Grid size={12}>
                <div>
                  <Dropzone images={images} setImages={setImages} />
                  {images.length > 0 && (
                    <div className="thumbsContainer">{thumbs}</div>
                  )}
                </div>
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
