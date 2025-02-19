import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Button, Container, Menu, MenuItem, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "src/services/AuthContext";
import { auth } from "src/services/FirebaseConfig";
import { useTranslation } from "react-i18next";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import TranslateIcon from "@mui/icons-material/Translate";
import Flag from "react-flagkit";
import axiosAuthenticated from "src/services/Axios";
import { UserRoleObject } from "shared/UserRoleObject";

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("GB");
  const [tenantType, setTenantType] = useState<string>("free");
  const [userRole, setUserRole] = useState<number>(0);

  const AUTHENTICATION_SERVICE_URL = import.meta.env
    .VITE_AUTHENTICATION_SERVICE_URL;

  const { isAuthenticated, logout } = useAuth();
  const pages = [
    { text: <HomeIcon />, href: "/home" },
    { text: t("component_header.occupancy"), href: "/occupancy" },
  ];

  if (
    isAuthenticated &&
    (tenantType == "premium" || tenantType == "enterprise")
  ) {
    pages.push({ text: t("component_header.analytics"), href: "/analytics" });
  }

  if (isAuthenticated) {
    pages.push(
      { text: t("component_header.garages"), href: "/garages" },
      { text: t("component_header.defects"), href: "/defects" },
      { text: t("component_header.demo_client"), href: "/demo-client" }
    );
  }

  if (
    isAuthenticated && // signed-in
    (userRole == UserRoleObject.tenant_admin || // has required role permission
      userRole == UserRoleObject.solution_admin)
  ) {
    pages.push({ text: t("component_header.users"), href: "/users" });
  }

  pages.push({ text: t("component_header.contact"), href: "/contact" });

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

  useEffect(() => {
    if (isAuthenticated) {
      try {
        axiosAuthenticated
          .get(`${AUTHENTICATION_SERVICE_URL}/user/${auth.currentUser?.uid}`)
          .then((response) => {
            setUserRole(response.data.role);
            setTenantType(response.data.tenantType);
          });
      } catch (error) {
        console.error("Error getting user: ", error);
      }
    }
  }, [isAuthenticated]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (to: string) => {
    navigate(to);
    setAnchorElNav(null);
  };

  const toggleLanguage = () => {
    if (language == "GB") {
      setLanguage("DE");
      i18n.changeLanguage("de");
    } else {
      setLanguage("GB");
      i18n.changeLanguage("en");
    }
  };

  const handleLogout = async () => {
    await logout();
    try {
      localStorage.removeItem("jwt_token");
      navigate("/");
    } catch (error) {
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
                    key={page.href}
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
                  key={page.href}
                  onClick={() => handleCloseNavMenu(page.href)}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page.text}
                </Button>
              ))}
            </Box>
            {isAuthenticated &&
            (tenantType == "premium" || tenantType == "enterprise") ? (
              <Button
                style={{ marginRight: "10px" }}
                onClick={() => toggleLanguage()}
                sx={{ color: "white", fontWeight: "bold" }}
              >
                <TranslateIcon style={{ marginRight: "5px" }} />
                <Flag country={language} />
              </Button>
            ) : null}
            {isAuthenticated && userEmail && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ color: "white", mr: 2 }}>
                  {userEmail}
                </Typography>
                <Tooltip title={t("component_header.sign_out")}>
                  <IconButton
                    onClick={handleLogout}
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {!isAuthenticated && (
              <Tooltip title={t("component_header.sign_in")}>
                <IconButton
                  onClick={() => navigate("/sign-in")}
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  <LoginIcon />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
