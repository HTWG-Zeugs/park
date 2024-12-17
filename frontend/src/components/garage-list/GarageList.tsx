import { useCallback, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import axiosAuthenticated from "src/services/Axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GarageLisItem, toGarageListItem } from "src/models/GarageListItem";
import { GarageResponseObject } from "shared/GarageResponseObject";

export default function DefectTable() {
  const [garages, setGarages] = useState<GarageLisItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  const navigate = useNavigate();

  function EditToolbar() {
    const navigate = useNavigate();

    return (
      <GridToolbarContainer>
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/garages/add")}
          variant="contained"
        >
          {t("component_garageList.buttons.add_garage")}
        </Button>
      </GridToolbarContainer>);
    }

  const fetchAllGarages = useCallback(() => {
    axiosAuthenticated
      .get("/garages/")
      .then((response) => {
        if (!response.data) {
          throw new Error(t("component_defectList.error_fetching_data"));
        }
        const responseData: GarageResponseObject[] = response.data;
        const listItems: GarageLisItem[] = responseData.map((d) =>
          toGarageListItem(d)
        );
        setGarages(listItems);
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchAllGarages();
  }, [fetchAllGarages, setGarages, setLoading]);

  const handleDeleteClicked = (id: GridRowId) => async () => {
    try {
      const defectId = id.toString();
      setLoading(true);
      axiosAuthenticated
        .delete(`/garages/${defectId}`)
        .then(() => fetchAllGarages());
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleEditClicked = (id: GridRowId) => async () => {
    navigate("/garages/edit", {
      state: {
        id: id,
      },
    });
  };

  const columns: GridColDef[] = [
    {
      field: "Name",
      headerName: t("component_garageList.table.column_name"),
      width: 100,
    },
    {
      field: "LastModifiedAt",
      headerName: t("component_garageList.table.column_last_modified"),
      flex: 1,
      minWidth: 175,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("component_garageList.table.column_actions"),
      flex: 1,
      minWidth: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClicked(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClicked(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <DataGrid
      rows={garages}
      columns={columns}
      initialState={{ pagination: { paginationModel } }}
      slots={{
        toolbar: EditToolbar as GridSlots["toolbar"],
      }}
      pageSizeOptions={[5, 10]}
      sx={{ border: 0, minHeight: "50vh", flexGrow: 1 }}
      getRowId={(row) => row.Id}
      loading={loading}
    />
  );
}
