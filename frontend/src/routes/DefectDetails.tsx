import { ChangeEvent, useEffect, useState } from "react";
import {
  TextField,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useLocation } from "react-router-dom";
import axiosAuthenticated from "src/services/Axios";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import "src/components/thumbnail/Thumbs.css";
import { DefectReportStatus } from "src/models/DefectReportStatus";
import { DefectResponseObject } from "shared/DefectResponseObject";
import { useTranslation } from "react-i18next";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function DefectDetailsView() {
  const location = useLocation();
  const { id } = location.state || {};
  const { t } = useTranslation();
  const [images, setImages] = useState<
    { name: string; url: string; hasUrlError: boolean }[]
  >([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [defectData, setDefectData] = useState({
    object: "",
    location: "",
    shortDescription: "",
    detailedDescription: "",
    reportingDate: null as Dayjs | null,
    status: "",
    imageNames: [] as string[],
    lastModifiedAt: null as Dayjs | null,
  });

  useEffect(() => {
    if (id) {
      fetchDefect(id);
    }
  }, [id]);

  async function fetchImageUrls() {
    const imageUrls = [];
    for (const imageName of defectData.imageNames) {
      const response = await axiosAuthenticated.get(
        `${BACKEND_URL}/defects/signedUrl/${imageName}`
      );
      const url = response.data;
      // check if the image exists in the bucket
      try {
        await axios.head(url);
        imageUrls.push({
          name: imageName,
          url: url,
          hasUrlError: false,
        });
      } catch (error) {
        console.error(
          `Error occurred while checking if the following image exists: ${imageName}, ${url}`,
          error
        );
        imageUrls.push({
          name: imageName,
          url: "",
          hasUrlError: true,
        });
      }
    }
    setImages(imageUrls);
  }

  useEffect(() => {
    if (defectData.imageNames.length > 0) fetchImageUrls();
  }, [defectData]);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage("");
    setIsModalOpen(false);
  };

  const thumbs = images.map((file) => (
    <div
      className="thumb"
      key={file.name}
      onClick={file.hasUrlError ? () => {} : () => handleImageClick(file.url)}
    >
      {!file.hasUrlError && (
        <img src={file.url} className="thumbInner" alt="image" />
      )}
      {file.hasUrlError && (
        <div>
          <div className="thumbInner"></div>
          <div className="errorOverlay">
            <p>{t("route_defect_details.img_not_available")}</p>
          </div>
        </div>
      )}
    </div>
  ));

  function fetchDefect(id: string) {
    axiosAuthenticated
      .get(`/defects/${id}`)
      .then((response) => {
        const defectData = response.data as DefectResponseObject;
        const formattedData = {
          object: defectData.Object || "",
          location: defectData.Location || "",
          shortDescription: defectData.ShortDesc || "",
          detailedDescription: defectData.DetailedDesc || "",
          reportingDate: dayjs(defectData.ReportingDate),
          status: defectData.Status || "",
          imageNames: defectData.ImageNames || [],
          lastModifiedAt: dayjs(defectData.LastModifiedAt),
        };
        setDefectData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching defect data:", error);
      });
  }

  async function handleStatusChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): Promise<void> {
    const status = event.target.value;

    if (status === defectData.status) return;

    const response = await axiosAuthenticated.put(
      `${BACKEND_URL}/defects/${id}`,
      {
        Status: status,
      }
    );
    if (response.status === 200) {
      await fetchDefect(id);
    } else {
      console.error("Error updating defect status:", response.data);
    }
  }

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
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="h6">{t("route_defect_details.defect_details")}</Typography>
            </Grid>

            <Grid size={12}>
              <TextField
                label={t("route_defect_details.object")}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
                value={defectData.object}
                variant="outlined"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label={t("route_defect_details.location")}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
                value={defectData.location}
                variant="outlined"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label={t("route_defect_details.short_desc")}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
                value={defectData.shortDescription}
                variant="outlined"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label={t("route_defect_details.detailed_desc")}
                fullWidth
                multiline
                slotProps={{ input: { readOnly: true } }}
                value={defectData.detailedDescription}
                variant="outlined"
                minRows={4}
                maxRows={10}
              />
            </Grid>

            {defectData.imageNames.length > 0 && (
              <Grid size={12}>
                <div className="thumbsContainer" style={{ marginTop: "0px" }}>
                  {thumbs}
                </div>
              </Grid>
            )}

            <Grid size={12}>
              <TextField
                fullWidth
                select
                label={t("route_defect_details.status")}
                name="status"
                value={defectData.status}
                onChange={handleStatusChange}
              >
                {Object.values(DefectReportStatus).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                label={t("route_defect_details.reported_at")}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
                value={dayjs(defectData.reportingDate)
                  .local()
                  .format("YYYY-MM-DD HH:mm:ss")}
                variant="outlined"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label={t("route_defect_details.last_modified_at")}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
                value={dayjs(defectData.lastModifiedAt)
                  .local()
                  .format("YYYY-MM-DD HH:mm:ss")}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogContent>
          <img src={selectedImage} alt="Selected" style={{ width: "100%" }} />
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
