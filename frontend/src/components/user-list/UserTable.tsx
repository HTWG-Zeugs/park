import { useEffect, useState } from "react";
import { UserObject } from "shared/UserObject";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { Button, Tooltip, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function EditToolbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate("/users/add")}
        variant="contained"
        sx={{ textTransform: "none", fontWeight: "bold" }}
      >
        {t("component_userList.add_user")}
      </Button>
    </GridToolbarContainer>
  );
}

export default function UserTable() {
  const [users, setUsers] = useState<UserObject[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetchAllUsers = () => {
    const fetchedUsers: UserObject[] = [
        {
            UserId: "1",
            Name: "John Doe",
            Mail: "john.doe@mail.com",
            Role: "Admin",
            TenantId: "1"
        },
    ];
    setUsers(fetchedUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleDeleteClicked = (id: GridRowId) => async () => {
    try {
      console.log("Delete user with id:", id);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleChangeRoleClicked = (id: GridRowId) => async () => {
    console.log("Change role for user with id:", id);
  };

  const columns: GridColDef[] = [
    {
      field: "UserId",
      headerName: t("component_userList.table.column_user_id"),
      width: 200,
    },
    {
      field: "Name",
      headerName: t("component_userList.table.column_name"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "Mail",
      headerName: t("component_userList.table.column_mail"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "Role",
      headerName: t("component_userList.table.column_role"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "TenantId",
      headerName: t("component_userList.table.column_tenant_id"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("component_userList.table.column_actions"),
      flex: 1,
      minWidth: 200,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <Tooltip title={t("component_userList.actions.delete")}>
            <GridActionsCellItem
              icon={<DeleteIcon color="error" />}
              label={t("component_userList.actions.delete")}
              onClick={handleDeleteClicked(id)}
              color="inherit"
            />
          </Tooltip>,
          <Tooltip title={t("component_userList.actions.details")}>
            <GridActionsCellItem
              icon={<DescriptionIcon color="primary" />}
              label={t("component_userList.actions.details")}
              onClick={handleChangeRoleClicked(id)}
              color="inherit"
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const localeText = {
    noRowsLabel: t("mui.noRows"),
    noResultsOverlayLabel: t("mui.noResults"),
    toolbarExport: t("mui.export"),
    toolbarDensity: t("mui.density"),
    toolbarDensityLabel: t("mui.density_label"),
    toolbarDensityCompact: t("mui.density_compact"),
    toolbarDensityStandard: t("mui.density_standard"),
    toolbarDensityComfortable: t("mui.density_comfortable"),
    toolbarColumns: t("mui.manage_columns"),
    footerPaginationRowsPerPage: t("mui.rows_per_page"),
    footerRowSelected: (count: number) => t("mui.rows_selected", { count }),
    footerTotalRows: t("mui.total_rows"),
    footerTotalVisibleRows: (visibleCount: number, totalCount: number) =>
      t("mui.visible_rows", { visibleCount, totalCount }),
    columnMenuSortAsc: t("mui.sort_asc"),
    columnMenuSortDesc: t("mui.sort_desc"),
    columnMenuFilter: t("mui.filter"),
    columnMenuHideColumn: t("mui.hide_column"),
    columnMenuShowColumns: t("mui.show_columns"),
    columnMenuUnsort: t("mui.unsort"),
  };

  const paginationModel = {
    page: 0,
    pageSize: 5,
    labelRowsPerPage: "Rows per wadawda",
    rowsPerPageOptions: [5, 10, 25, 50, 100],
  };

  return (
    <Box sx={{ height: "70vh", width: "100%"}}>
      <DataGrid
        rows={users}
        columns={columns}
        localeText={localeText}
        initialState={{ pagination: { paginationModel } }}
        slots={{
          toolbar: EditToolbar as GridSlots["toolbar"],
        }}
        pageSizeOptions={[5, 10, 20]}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#3f51b5",
            color: "#000",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            bgcolor: "#f5f5f5",
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: "#e0f7fa",
          },
          "& .actions": {
            display: "flex",
            justifyContent: "center",
          },
        }}
        getRowId={(row) => row.UserId}
        loading={loading}
      />
    </Box>
  );
}