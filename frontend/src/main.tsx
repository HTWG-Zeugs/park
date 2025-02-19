import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "src/App";
import "src/index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Defects from "src/routes/Defects";
import SignIn from "src/routes/SignIn";
import SignUp from "src/routes/SignUp";
import Home from "src/routes/Home";
import Contact from "src/routes/Contact";
import AddDefect from "src/routes/AddDefect";
import Garages from "./routes/Garages";
import AddGarage from "./routes/AddGarage";
import DefectDetails from "src/routes/DefectDetails";
import Users from "./routes/Users";
import AddUsers from "./routes/AddUser";
import EditUser from "./routes/EditUser";
import "firebase/auth";
import "src/common/i18n/i18n.ts";
import ProtectedRoute from "src/routes/ProtectedRoutes";
import TenantSpecificRoute from "src/routes/TenantTypeSpecificRoute";
import PrivateRoute from "src/routes/PrivateRoute";
import { AuthProvider } from "src/services/AuthContext";
import EditGarage from "./routes/EditGarage";
import Occupancy from "src/routes/Occupancy";
import Analytics from "./routes/Analytics";
import DemoClient from "./routes/DemoClient";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div>404</div>,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "occupancy", element: <Occupancy /> },
      { path: "demo-client", element: <DemoClient /> },
      { path: "sign-in", element: <SignIn /> },
      { path: "sign-up", element: <SignUp /> },
      {
        path: "analytics",
        element: (
          <TenantSpecificRoute>
            <Analytics />
          </TenantSpecificRoute>
        ),
      },
      {
        path: "users",
        element: (
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        ),
      },
      {
        path: "users/add",
        element: (
          <ProtectedRoute>
            <AddUsers />
          </ProtectedRoute>
        ),
      },
      {
        path: "users/edit",
        element: (
          <ProtectedRoute>
            <EditUser />
          </ProtectedRoute>
        ),
      },
      {
        path: "defects",
        element: (
          <ProtectedRoute>
            <Defects />
          </ProtectedRoute>
        ),
      },
      {
        path: "defects/add",
        element: (
          <ProtectedRoute>
            <AddDefect />
          </ProtectedRoute>
        ),
      },
      {
        path: "defects/details",
        element: (
          <ProtectedRoute>
            <DefectDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "garages",
        element: (
          <ProtectedRoute>
            <Garages />
          </ProtectedRoute>
        ),
      },
      {
        path: "garages/add",
        element: (
          <ProtectedRoute>
            <AddGarage />
          </ProtectedRoute>
        ),
      },
      {
        path: "garages/edit",
        element: (
          <ProtectedRoute>
            <EditGarage />
          </ProtectedRoute>
        ),
      },
      {
        path: "contact",
        element: <Contact />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
