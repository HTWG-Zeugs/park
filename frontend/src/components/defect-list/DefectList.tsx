import { useEffect, useState } from "react";
import { DefectListItem, toDefectListItem } from "src/models/DefectListItem";
import { DefectResponseObject } from "shared/DefectResponseObject";
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
import DescriptionIcon from "@mui/icons-material/Description";
import axiosAuthenticated from "src/services/Axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function EditToolbar() {
  const navigate = useNavigate();

  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate("/defects/add")}
        variant="contained"
      >
        Add defect //TODO: Translate
      </Button>
    </GridToolbarContainer>
  );
}

export default function DefectTable() {
  const [defects, setDefects] = useState<DefectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  const navigate = useNavigate();

  function fetchAllDefects() {
    axiosAuthenticated
      .get("/defects/")
      .then((response) => {
        if (!response.data) {
          throw new Error(t("component_defectList.error_fetching_data"));
        }
        const responseData: DefectResponseObject[] = response.data;
        const listItems: DefectListItem[] = responseData.map((d) =>
          toDefectListItem(d)
        );
        setDefects(listItems);
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAllDefects();
  }, [setDefects, setLoading]);

  const handleDeleteClicked = (id: GridRowId) => async () => {
    try {
      const defectId = id.toString();
      setLoading(true);
      axiosAuthenticated
        .delete(`/defects/${defectId}`)
        .then(() => fetchAllDefects());
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleShowDetailsClicked = (id: GridRowId) => async () => {
    navigate("/defects/details", {
      state: {
        id: id,
      },
    });
  };

  const columns: GridColDef[] = [
    {
      field: "Id",
      headerName: t("component_defectList.table.column_id"),
      width: 100,
    },
    {
      field: "Object",
      headerName: t("component_defectList.table.column_object"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "Location",
      headerName: t("component_defectList.table.column_location"),
      flex: 1,
      minWidth: 150,
    },
    {
      field: "ShortDesc",
      headerName: t("component_defectList.table.column_short_desc"),
      flex: 2,
      minWidth: 200,
    },
    {
      field: "DetailedDesc",
      headerName: t("component_defectList.table.column_detailed_desc"),
      flex: 3,
      minWidth: 225,
    },
    {
      field: "ReportingDate",
      headerName: t("component_defectList.table.column_reporting_date"),
      flex: 1,
      minWidth: 175,
    },
    {
      field: "LastModifiedAt",
      headerName: t("component_defectList.table.column_last_modified"),
      flex: 1,
      minWidth: 175,
    },
    {
      field: "Status",
      headerName: t("component_defectList.table.column_status"),
      flex: 1,
      minWidth: 125,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("component_defectList.table.column_actions"),
      flex: 1,
      minWidth: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete" //TODO: translate
            onClick={handleDeleteClicked(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DescriptionIcon />}
            label="Details" //TODO: translate
            onClick={handleShowDetailsClicked(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <DataGrid
      rows={defects}
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
