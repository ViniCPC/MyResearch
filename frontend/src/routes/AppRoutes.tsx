import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { CreateProjectPage } from "../pages/CreateProjectPage";
import { CreateMilestonePage } from "../pages/CreateMilestonePage";
import { ResearcherDashboardPage } from "../pages/ResearcherDashboardPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ResearcherRoute } from "./ResearcherRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route
        path="/researcher/dashboard"
        element={
          <ProtectedRoute>
            <ResearcherRoute>
              <ResearcherDashboardPage />
            </ResearcherRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/researcher/projects/new"
        element={
          <ProtectedRoute>
            <ResearcherRoute>
              <CreateProjectPage />
            </ResearcherRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/researcher/milestones/new"
        element={
          <ProtectedRoute>
            <ResearcherRoute>
              <CreateMilestonePage />
            </ResearcherRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/researcher/projects/:projectId/milestones"
        element={
          <ProtectedRoute>
            <ResearcherRoute>
              <CreateMilestonePage />
            </ResearcherRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
