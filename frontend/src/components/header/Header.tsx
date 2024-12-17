import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Button, Container, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "src/services/AuthContext";
import { auth } from "src/services/FirebaseConfig";
import { useTranslation } from "react-i18next";


const pages = [
  { text: "Home", href: "/home" },
  { text: "Garage", href: "/garage"},
  { text: "Defects", href: "/defects" },
  { text: "Contact", href: "/contact" },
];

export default function Header() {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const { t } = useTranslation();

  const { isAuthenticated, logout } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (to: string) => {
    navigate(to);
    setAnchorElNav(null);
  };

  const handleLogout = async () => {
    await logout();
    try {
      localStorage.removeItem("jwt_token");
      navigate("/");
    } catch (error: any) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleCloseNavMenu("/home");
              }}
              sx={{
                mr: 2,
                display: { xs: "none", sm: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              PARK
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", sm: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={() => setAnchorElNav(null)}
                sx={{ display: { xs: "block", sm: "none" } }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.text}
                    onClick={() => handleCloseNavMenu(page.href)}
                  >
                    <Typography sx={{ textAlign: "center" }}>
                      {page.text}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "flex", sm: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              PARK
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page.text}
                  onClick={() => handleCloseNavMenu(page.href)}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page.text}
                </Button>
              ))}
            </Box>

            {isAuthenticated && userEmail && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ color: "white", mr: 2 }}>
                  {userEmail}
                </Typography>
                <Button
                  onClick={handleLogout}
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  {t("component_header.sign_out")}
                </Button>
              </Box>
            )}
            {!isAuthenticated && (
              <Button
                onClick={() => navigate("/sign-in")}
                sx={{ color: "white", fontWeight: "bold" }}
              >
                {t("component_header.sign_in")}
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
