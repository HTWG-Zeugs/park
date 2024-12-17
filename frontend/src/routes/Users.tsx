import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import UserTable from "src/components/user-list/UserTable";

const Users: React.FC = () => {

  return (
    <Paper
      sx={{
        padding: 3, 
        display: "flex",
        flexDirection: "column",
        height: "100%", 
        margin: { xs: "10px", sm: "50px" },
        overflow: "hidden",
      }}
      elevation={3}
    >
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <UserTable />
      </Box>
    </Paper>
  );
};

export default Users;
