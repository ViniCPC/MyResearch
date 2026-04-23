import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectById, getProjectDonations, getProjectMilestones } from "../service/project.service";
import type { Milestone, Project, ProjectStatus } from "../service/project.service";
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

function MilestoneItem({ milestone, index }: { milestone: Milestone; index: number }) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        milestone.released ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              milestone.released ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {index + 1}
          </span>
          <strong className="text-sm">{milestone.title}</strong>
        </div>
        <span className="text-sm font-semibold">{formatCurrency(milestone.amount)}</span>
      </div>

      {milestone.description && <p className="muted-text text-sm">{milestone.description}</p>}

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded px-2 py-1 font-semibold ${
            milestone.released ? "bg-emerald-600 text-white" : "bg-orange-100 text-orange-700"
          }`}
        >
          {milestone.released ? "Liberada" : "Pendente"}
        </span>
        {milestone.txHash && <span className="break-all text-slate-500">Tx: {milestone.txHash}</span>}
      </div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    void fetchAll(id);
  }, [id]);

  async function fetchAll(projectId: string) {
    setLoading(true);
    setError("");
    try {
      const [proj, miles, donations] = await Promise.all([
        getProjectById(projectId),
        getProjectMilestones(projectId),
        getProjectDonations(projectId),
      ]);
      setProject(proj);
      setMilestones(miles);
      const raised = donations.reduce((sum, donation) => sum + Number(donation.amount), 0);
      setTotalRaised(raised);
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao carregar projeto."));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="panel-soft flex items-center gap-3">
          <span className="loader" />
          <p className="muted-text text-sm">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <p className="alert-error">{error}</p>
      </div>
    );
  }

  if (!project) return null;

  const goal = Number(project.goalAmount);
  const progressPercent = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;
  const progressValue = goal > 0 ? Math.min(totalRaised, goal) : 0;

  return (
    <div className="page-shell-form">
      <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary mb-4">
        Voltar
      </button>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <h1 className="title-xl">{project.title}</h1>
        <span className={`status-chip ${STATUS_CLASS[project.status]}`}>{STATUS_LABEL[project.status]}</span>
      </div>

      <p className="muted-text mb-5 text-sm leading-relaxed">{project.description}</p>

      <div className="panel-soft mb-4">
        <h2 className="title-lg mb-3">Financiamento</h2>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="muted-text">Total arrecadado</span>
          <strong className="text-emerald-700">{formatCurrency(totalRaised)}</strong>
        </div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="muted-text">Meta financeira</span>
          <strong>{formatCurrency(goal)}</strong>
        </div>

        <progress className="h-2.5 w-full overflow-hidden rounded bg-slate-200 [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600" value={progressValue} max={goal || 1}>
          {progressPercent.toFixed(1)}%
        </progress>

        <p className="muted-text mt-2 text-right text-xs">{progressPercent.toFixed(1)}% atingido</p>
      </div>

      {project.contractAddress && (
        <div className="panel-soft mb-4">
          <span className="mb-1 block text-sm font-semibold">Contract address</span>
          <p className="muted-text break-all font-mono text-xs">{project.contractAddress}</p>
        </div>
      )}

      <div className="panel">
        <h2 className="title-lg mb-3">Milestones ({milestones.length})</h2>

        {milestones.length === 0 ? (
          <p className="muted-text text-sm">Nenhum milestone cadastrado.</p>
        ) : (
          <div className="grid gap-2">
            {milestones.map((milestone, index) => (
              <MilestoneItem key={milestone.id} milestone={milestone} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
