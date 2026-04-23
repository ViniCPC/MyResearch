import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../service/project.service";
import type { Project, ProjectStatus, QueryProjectParams } from "../service/project.service";
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

function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="panel flex h-full flex-col gap-2 text-left transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold">{project.title}</h3>
        <span className={`status-chip shrink-0 ${STATUS_CLASS[project.status]}`}>
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      <p className="muted-text line-clamp-3 text-sm">{project.description}</p>

      <div className="mt-auto pt-1">
        <span className="text-sm">
          Meta: <strong>{formatCurrency(project.goalAmount)}</strong>
        </span>
      </div>
    </button>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    void fetchProjects();
  }, [page, statusFilter]);

  async function fetchProjects(searchOverride?: string) {
    setLoading(true);
    setError("");
    try {
      const params: QueryProjectParams = {
        page,
        pageSize: 9,
        ...(statusFilter && { status: statusFilter }),
        ...(searchOverride !== undefined
          ? searchOverride
            ? { search: searchOverride }
            : {}
          : search
            ? { search }
            : {}),
      };
      const result = await getProjects(params);
      setProjects(result.data);
      setTotalPages(result.meta.totalPages);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao carregar projetos."));
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    void fetchProjects(search);
  }

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(event.target.value as ProjectStatus | "");
    setPage(1);
  }

  return (
    <div className="page-shell">
      <h1 className="title-xl mb-6">Projetos de Pesquisa</h1>

      <form onSubmit={handleSearch} className="panel mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div>
          <label htmlFor="search" className="label-text">
            Buscar projeto
          </label>
          <input
            id="search"
            type="text"
            placeholder="Titulo ou descricao..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input-base"
          />
        </div>

        <div>
          <label htmlFor="statusFilter" className="label-text">
            Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="input-base"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full md:w-auto">
            Buscar
          </button>
        </div>
      </form>

      {loading && (
        <div className="panel-soft mb-4 flex items-center gap-3">
          <span className="loader" />
          <p className="muted-text text-sm">Carregando projetos...</p>
        </div>
      )}

      {error && <p className="alert-error mb-4">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <div className="panel">
          <p className="muted-text text-sm">Nenhum projeto encontrado.</p>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>

          <div className="panel flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              className="btn btn-secondary"
            >
              Anterior
            </button>
            <span className="muted-text text-sm">
              Pagina {page} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="btn btn-secondary"
            >
              Proxima
            </button>
          </div>
        </>
      )}
    </div>
  );
}
