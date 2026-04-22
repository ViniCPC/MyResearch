import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../service/project.service";
import type { Project, ProjectStatus, QueryProjectParams } from "../service/project.service";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  FUNDED: "Financiado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_COLOR: Record<ProjectStatus, string> = {
  DRAFT: "#888",
  ACTIVE: "#2563eb",
  FUNDED: "#16a34a",
  COMPLETED: "#7c3aed",
  CANCELLED: "#dc2626",
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
    <div
      onClick={onClick}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1.25rem",
        cursor: "pointer",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          {project.title}
        </h3>
        <span
          style={{
            background: STATUS_COLOR[project.status],
            color: "#fff",
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "0.75rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "0.875rem",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {project.description}
      </p>

      <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", color: "#374151" }}>
          Meta: <strong>{formatCurrency(project.goalAmount)}</strong>
        </span>
      </div>
    </div>
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
    fetchProjects();
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
    } catch {
      setError("Erro ao carregar projetos.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProjects(search);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(e.target.value as ProjectStatus | "");
    setPage(1);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Projetos de Pesquisa</h1>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}
      >
        <input
          type="text"
          placeholder="Buscar por título ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "0.5rem 0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "0.9rem",
          }}
        />

        <select
          value={statusFilter}
          onChange={handleStatusChange}
          style={{
            padding: "0.5rem 0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "0.9rem",
          }}
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          style={{
            padding: "0.5rem 1.25rem",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Buscar
        </button>
      </form>

      {loading && <p>Carregando projetos...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <p style={{ color: "#6b7280" }}>Nenhum projeto encontrado.</p>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ padding: "0.4rem 0.9rem", cursor: page <= 1 ? "not-allowed" : "pointer" }}
            >
              Anterior
            </button>
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: "0.4rem 0.9rem", cursor: page >= totalPages ? "not-allowed" : "pointer" }}
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  );
}
