import { Link, useNavigate } from "react-router-dom";
import { getCurrentRole, removeToken } from "../utils/storage";

export function DashboardPage() {
  const navigate = useNavigate();
  const role = getCurrentRole();

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="title-xl">Dashboard</h1>
          <p className="muted-text text-sm">
            Perfil atual: <strong className="text-slate-900">{role ?? "Nao identificado"}</strong>
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          Sair
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/projects"
          className="panel transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <strong className="text-base">Projetos publicos</strong>
          <p className="muted-text mt-1 text-sm">Ver todos os projetos de pesquisa</p>
        </Link>

        {role === "RESEARCHER" && (
          <Link
            to="/researcher/dashboard"
            className="panel border-blue-200 bg-blue-50 text-blue-900 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <strong className="text-base">Area do pesquisador</strong>
            <p className="mt-1 text-sm text-blue-700">
              Criar projeto, milestones e acompanhar status
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
