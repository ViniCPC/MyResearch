import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getProjectMilestones,
  getResearcherProjects,
  type Milestone,
  type Project,
  type ProjectStatus,
} from "../service/project.service";
import { removeToken } from "../utils/storage";
import { getApiErrorMessage } from "../utils/apiError";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  FUNDED: "Financiado",
  COMPLETED: "Concluido",
  CANCELLED: "Cancelado",
};

const STATUS_CLASS: Record<ProjectStatus, string> = {
  DRAFT: "bg-slate-500 text-white",
  ACTIVE: "bg-blue-600 text-white",
  FUNDED: "bg-emerald-600 text-white",
  COMPLETED: "bg-violet-600 text-white",
  CANCELLED: "bg-red-600 text-white",
};

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

interface DeliverySuggestion {
  project: Project;
  milestone: Milestone;
}

export function ResearcherDashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestonesByProject, setMilestonesByProject] = useState<Record<string, Milestone[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    setError("");
    try {
      const response = await getResearcherProjects({
        page: 1,
        pageSize: 100,
        sortBy: "createdAt",
        order: "desc",
      });

      const ownProjects = response.data;
      setProjects(ownProjects);

      const entries = await Promise.all(
        ownProjects.map(async (project) => {
          const milestones = await getProjectMilestones(project.id);
          return [project.id, milestones] as const;
        }),
      );

      setMilestonesByProject(Object.fromEntries(entries));
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao carregar dashboard do pesquisador."));
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  const summary = useMemo(() => {
    const allMilestones = Object.values(milestonesByProject).flat();
    const released = allMilestones.filter((milestone) => milestone.released).length;
    const pending = allMilestones.length - released;
    const withContract = projects.filter((project) => !!project.contractAddress).length;
    return {
      totalProjects: projects.length,
      withContract,
      released,
      pending,
    };
  }, [projects, milestonesByProject]);

  const deliveryOfDay = useMemo<DeliverySuggestion | null>(() => {
    const candidates: DeliverySuggestion[] = projects
      .map((project) => {
        const nextPending = (milestonesByProject[project.id] ?? [])
          .filter((milestone) => !milestone.released)
          .sort((a, b) => a.order - b.order)[0];

        if (!nextPending) {
          return null;
        }

        return { project, milestone: nextPending };
      })
      .filter((item): item is DeliverySuggestion => item !== null);

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => {
      const aPriority = a.project.status === "ACTIVE" ? 0 : 1;
      const bPriority = b.project.status === "ACTIVE" ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;

      const aDate = new Date(a.project.createdAt).getTime();
      const bDate = new Date(b.project.createdAt).getTime();
      return bDate - aDate;
    });

    return candidates[0];
  }, [projects, milestonesByProject]);

  if (loading) {
    return (
      <div className="page-shell space-y-4">
        <div className="panel-soft flex items-center gap-3">
          <span className="loader" />
          <p className="muted-text text-sm">Carregando dashboard do pesquisador...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="panel space-y-2">
              <div className="skeleton h-3 w-28" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="title-xl">Dashboard do pesquisador</h1>
          <p className="muted-text text-sm">Acompanhe seus projetos, contratos e milestones.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/researcher/projects/new" className="btn btn-primary btn-link">
            Criar projeto
          </Link>
          <Link to="/researcher/milestones/new" className="btn btn-secondary btn-link">
            Criar milestones
          </Link>
          <button onClick={handleLogout} className="btn btn-danger">
            Sair
          </button>
        </div>
      </div>

      {error && <p className="alert-error mb-4">{error}</p>}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel">
          <span className="muted-text mb-1 block text-xs font-medium uppercase tracking-wide">
            Projetos criados por voce
          </span>
          <strong className="text-2xl">{summary.totalProjects}</strong>
        </div>

        <div className="panel">
          <span className="muted-text mb-1 block text-xs font-medium uppercase tracking-wide">
            Contratos implantados
          </span>
          <strong className="text-2xl">{summary.withContract}</strong>
        </div>

        <div className="panel">
          <span className="muted-text mb-1 block text-xs font-medium uppercase tracking-wide">
            Milestones liberadas
          </span>
          <strong className="text-2xl text-emerald-600">{summary.released}</strong>
        </div>

        <div className="panel">
          <span className="muted-text mb-1 block text-xs font-medium uppercase tracking-wide">
            Milestones pendentes
          </span>
          <strong className="text-2xl text-orange-600">{summary.pending}</strong>
        </div>
      </div>

      <div className="panel-soft mb-6 border-blue-200 bg-blue-50">
        <h2 className="title-lg mb-2 text-blue-900">Entrega do dia</h2>
        {!deliveryOfDay && (
          <p className="text-sm text-blue-800">
            Nao ha milestones pendentes no momento. Bom trabalho.
          </p>
        )}
        {deliveryOfDay && (
          <div className="space-y-1.5">
            <strong className="text-blue-950">
              {deliveryOfDay.project.title} - Milestone #{deliveryOfDay.milestone.order}
            </strong>
            <p className="text-sm text-blue-900">{deliveryOfDay.milestone.title}</p>
            <p className="text-sm text-blue-800">
              Valor previsto: {formatCurrency(deliveryOfDay.milestone.amount)}
            </p>
            <div className="pt-1">
              <Link
                to={`/researcher/projects/${deliveryOfDay.project.id}/milestones`}
                className="btn btn-primary btn-link"
              >
                Atualizar milestones deste projeto
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="title-lg">Seus projetos ({projects.length})</h2>

        {projects.length === 0 && (
          <div className="panel">
            <p className="muted-text mb-3 text-sm">Voce ainda nao tem projetos cadastrados.</p>
            <Link to="/researcher/projects/new" className="btn btn-primary btn-link">
              Cadastrar primeiro projeto
            </Link>
          </div>
        )}

        {projects.length > 0 && (
          <div className="grid gap-3">
            {projects.map((project) => {
              const projectMilestones = milestonesByProject[project.id] ?? [];
              const released = projectMilestones.filter((item) => item.released).length;
              const pending = projectMilestones.length - released;
              const hasContract = !!project.contractAddress;

              return (
                <div key={project.id} className="panel space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <p className="muted-text text-sm">Meta: {formatCurrency(project.goalAmount)}</p>
                    </div>
                    <span className={`status-chip ${STATUS_CLASS[project.status]}`}>
                      {STATUS_LABEL[project.status]}
                    </span>
                  </div>

                  <div className="grid gap-2 text-sm sm:grid-cols-3">
                    <div className="space-y-0.5">
                      <span className="muted-text block">Status do contrato</span>
                      <strong className={hasContract ? "text-emerald-700" : "text-orange-600"}>
                        {hasContract ? "Implantado" : "Pendente"}
                      </strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="muted-text block">Milestones</span>
                      <strong>
                        {released} liberadas / {pending} pendentes
                      </strong>
                    </div>
                    <div className="space-y-0.5">
                      <span className="muted-text block">Contract address</span>
                      <strong>{hasContract ? "Configurado" : "Nao informado"}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-link">
                      Ver detalhe
                    </Link>
                    <Link
                      to={`/researcher/projects/${project.id}/milestones`}
                      className="btn btn-primary btn-link"
                    >
                      Gerenciar milestones
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
