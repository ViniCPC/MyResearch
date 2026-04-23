import { Navigate } from "react-router-dom";
import { getCurrentRole } from "../utils/storage";

interface ResearcherRouteProps {
  children: React.ReactNode;
}

export function ResearcherRoute({ children }: ResearcherRouteProps) {
  const role = getCurrentRole();

  if (role !== "RESEARCHER") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
