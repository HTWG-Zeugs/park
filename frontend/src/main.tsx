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
import DefectDetails from "src/routes/DefectDetails";
// import "firebase/auth";
import "src/common/i18n/i18n.ts";

import ProtectedRoute from "src/routes/ProtectedRoutes";
import { AuthProvider } from "src/services/AuthContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div>404</div>,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "sign-in", element: <SignIn /> },
      { path: "sign-up", element: <SignUp /> },
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
