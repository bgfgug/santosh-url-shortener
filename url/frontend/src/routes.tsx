import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import { ProtectedRoute } from "./components/layout/protected-route";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import { DashboardPage } from "./pages/dashboard-page";
import { AnalyticsPage } from "./pages/analytics-page";
import { QRCodePage } from "./pages/qr-code-page";
import { ProfilePage } from "./pages/profile-page";
import { LandingPage } from "./pages/landing-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/urls/:id/analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "/urls/:id/qr",
            element: <QRCodePage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          // Redirect root to dashboard if needed in layout or handling it here
        ],
      },
    ],
  },
]);
