import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createProjectMilestone,
  getProjectMilestones,
  getResearcherProjects,
  type Milestone,
  type Project,
} from "../service/project.service";
import { getApiErrorMessage } from "../utils/apiError";

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function CreateMilestonePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? "");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
  });
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setMilestones([]);
      return;
    }
    void fetchMilestones(selectedProjectId);
  }, [selectedProjectId]);

  async function fetchProjects() {
    setLoadingProjects(true);
    setError("");
    try {
      const response = await getResearcherProjects({
        page: 1,
        pageSize: 100,
        sortBy: "createdAt",
        order: "desc",
      });
      setProjects(response.data);

      if (!selectedProjectId && response.data.length > 0) {
        setSelectedProjectId(response.data[0].id);
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao carregar projetos."));
    } finally {
      setLoadingProjects(false);
    }
  }

  async function fetchMilestones(targetProjectId: string) {
    setLoadingMilestones(true);
    try {
      const result = await getProjectMilestones(targetProjectId);
      setMilestones(result);
    } catch {
      setMilestones([]);
    } finally {
      setLoadingMilestones(false);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!selectedProjectId) {
      setSaving(false);
      setError("Selecione um projeto para cadastrar a milestone.");
      return;
    }

    const amount = Number(formData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setSaving(false);
      setError("Informe um valor valido para a milestone.");
      return;
    }

    try {
      await createProjectMilestone(selectedProjectId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount,
      });

      setSuccess("Milestone cadastrada com sucesso.");
      setFormData({
        title: "",
        description: "",
        amount: "",
      });

      await fetchMilestones(selectedProjectId);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao cadastrar milestone."));
    } finally {
      setSaving(false);
    }
  }

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const totalMilestonesAmount = milestones.reduce((sum, milestone) => sum + Number(milestone.amount), 0);
  const goalAmount = Number(selectedProject?.goalAmount ?? 0);
  const remaining = Math.max(goalAmount - totalMilestonesAmount, 0);
  const releasedCount = milestones.filter((milestone) => milestone.released).length;
  const pendingCount = milestones.length - releasedCount;

  return (
    <div className="page-shell-form">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="title-xl">Criar milestones</h1>
          <p className="muted-text text-sm">Defina os marcos financeiros do projeto.</p>
        </div>
        <button onClick={() => navigate("/researcher/dashboard")} className="btn btn-secondary">
          Voltar ao dashboard
        </button>
      </div>

      <div className="panel-soft mb-4">
        <label htmlFor="projectId" className="label-text">
          Projeto
        </label>
        <select
          id="projectId"
          value={selectedProjectId}
          onChange={(event) => setSelectedProjectId(event.target.value)}
          disabled={loadingProjects || projects.length === 0}
          className="input-base"
        >
          {projects.length === 0 && <option value="">Nenhum projeto encontrado</option>}
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>

        {selectedProject && (
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="muted-text block">Meta do projeto</span>
              <strong>{formatCurrency(selectedProject.goalAmount)}</strong>
            </div>
            <div>
              <span className="muted-text block">Total em milestones</span>
              <strong>{formatCurrency(totalMilestonesAmount)}</strong>
            </div>
            <div>
              <span className="muted-text block">Saldo disponivel</span>
              <strong className={remaining > 0 ? "text-blue-700" : "text-red-600"}>
                {formatCurrency(remaining)}
              </strong>
            </div>
            <div>
              <span className="muted-text block">Liberadas / pendentes</span>
              <strong>
                {releasedCount} / {pendingCount}
              </strong>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="panel mb-4 space-y-4">
        <h2 className="title-lg">Nova milestone</h2>

        <div>
          <label htmlFor="title" className="label-text">
            Titulo
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div>
          <label htmlFor="description" className="label-text">
            Descricao
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="input-base resize-y"
          />
        </div>

        <div>
          <label htmlFor="amount" className="label-text">
            Valor da milestone (BRL)
          </label>
          <input
            id="amount"
            type="number"
            name="amount"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <button type="submit" disabled={saving || !selectedProjectId} className="btn btn-primary">
          {saving ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Salvando milestone...
            </>
          ) : (
            "Salvar milestone"
          )}
        </button>
      </form>

      {error && <p className="alert-error mb-4">{error}</p>}
      {success && <p className="alert-success mb-4">{success}</p>}

      <div className="panel">
        <h2 className="title-lg mb-3">Milestones cadastradas ({milestones.length})</h2>

        {loadingMilestones && (
          <div className="flex items-center gap-3">
            <span className="loader" />
            <p className="muted-text text-sm">Carregando milestones...</p>
          </div>
        )}

        {!loadingMilestones && milestones.length === 0 && (
          <p className="muted-text text-sm">Nenhuma milestone cadastrada para esse projeto.</p>
        )}

        {!loadingMilestones && milestones.length > 0 && (
          <div className="grid gap-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`rounded-lg border p-3 ${
                  milestone.released ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>
                    #{milestone.order} {milestone.title}
                  </strong>
                  <span className="font-semibold">{formatCurrency(milestone.amount)}</span>
                </div>
                <p className="muted-text mt-1 text-sm">{milestone.description}</p>
                <p className="mt-1 text-xs text-slate-700">
                  Status: {milestone.released ? "Liberada" : "Pendente"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProjectId && (
        <div className="mt-4">
          <Link to={`/projects/${selectedProjectId}`} className="btn btn-secondary btn-link">
            Ver detalhe publico do projeto
          </Link>
        </div>
      )}
    </div>
  );
}
