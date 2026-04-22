import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProjectById,
  getProjectMilestones,
  getProjectDonations,
} from "../service/project.service";
import type { Project, Milestone, ProjectStatus } from "../service/project.service";

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

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div
      style={{
        background: "#e5e7eb",
        borderRadius: "6px",
        height: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          background: percent >= 100 ? "#16a34a" : "#2563eb",
          borderRadius: "6px",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

function MilestoneItem({ milestone, index }: { milestone: Milestone; index: number }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "1rem",
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
        background: milestone.released ? "#f0fdf4" : "#fff",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: milestone.released ? "#16a34a" : "#e5e7eb",
          color: milestone.released ? "#fff" : "#6b7280",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "0.85rem",
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <strong style={{ fontSize: "0.95rem" }}>{milestone.title}</strong>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
            {formatCurrency(milestone.amount)}
          </span>
        </div>
        {milestone.description && (
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
            {milestone.description}
          </p>
        )}
        {milestone.released && (
          <span
            style={{
              display: "inline-block",
              marginTop: "0.4rem",
              background: "#16a34a",
              color: "#fff",
              fontSize: "0.75rem",
              borderRadius: "4px",
              padding: "2px 8px",
            }}
          >
            Liberado
          </span>
        )}
        {milestone.txHash && (
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#9ca3af", wordBreak: "break-all" }}>
            Tx: {milestone.txHash}
          </p>
        )}
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
    fetchAll(id);
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
      const raised = donations.reduce((sum, d) => sum + Number(d.amount), 0);
      setTotalRaised(raised);
    } catch {
      setError("Erro ao carregar projeto.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Carregando projeto...</div>;
  if (error) return <div style={{ padding: "2rem", color: "#dc2626" }}>{error}</div>;
  if (!project) return null;

  const goal = Number(project.goalAmount);
  const progressPercent = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#2563eb",
          fontSize: "0.9rem",
          padding: 0,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        ← Voltar
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, flex: 1 }}>{project.title}</h1>
        <span
          style={{
            background: STATUS_COLOR[project.status],
            color: "#fff",
            borderRadius: "6px",
            padding: "4px 12px",
            fontSize: "0.85rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      <p style={{ color: "#374151", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        {project.description}
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          background: "#f9fafb",
        }}
      >
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
          Financiamento
        </h2>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
          <span style={{ color: "#6b7280" }}>Total arrecadado</span>
          <strong style={{ color: "#16a34a" }}>{formatCurrency(totalRaised)}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          <span style={{ color: "#6b7280" }}>Meta financeira</span>
          <strong>{formatCurrency(goal)}</strong>
        </div>

        <ProgressBar value={totalRaised} max={goal} />

        <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#6b7280", textAlign: "right" }}>
          {progressPercent.toFixed(1)}% atingido
        </p>
      </div>

      {project.contractAddress && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            background: "#f9fafb",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
            Contract Address
          </span>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.85rem",
              color: "#6b7280",
              wordBreak: "break-all",
              fontFamily: "monospace",
            }}
          >
            {project.contractAddress}
          </p>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Milestones ({milestones.length})
        </h2>

        {milestones.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Nenhum milestone cadastrado.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {milestones.map((m, i) => (
              <MilestoneItem key={m.id} milestone={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
