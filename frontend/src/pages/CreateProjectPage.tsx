import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  createResearcherProject,
  type Project,
  type ProjectStatus,
} from "../service/project.service";
import { getApiErrorMessage } from "../utils/apiError";

const STATUS_OPTIONS: ProjectStatus[] = ["DRAFT", "ACTIVE", "FUNDED", "COMPLETED", "CANCELLED"];

const STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  FUNDED: "Financiado",
  COMPLETED: "Concluido",
  CANCELLED: "Cancelado",
};

export function CreateProjectPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    imageUrl: "",
    contractAddress: "",
    status: "DRAFT" as ProjectStatus,
  });
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const goalAmount = Number(formData.goalAmount);
    if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
      setLoading(false);
      setError("Informe uma meta financeira valida e maior que zero.");
      return;
    }

    try {
      const project = await createResearcherProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        goalAmount,
        imageUrl: formData.imageUrl.trim() || undefined,
        contractAddress: formData.contractAddress.trim() || undefined,
        status: formData.status,
      });

      setCreatedProject(project);
      setSuccess("Projeto criado com sucesso.");
      setFormData({
        title: "",
        description: "",
        goalAmount: "",
        imageUrl: "",
        contractAddress: "",
        status: "DRAFT",
      });
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao cadastrar projeto."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell-form">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="title-xl">Criar projeto</h1>
          <p className="muted-text text-sm">
            Cadastre seu projeto de pesquisa para captar recursos.
          </p>
        </div>
        <button onClick={() => navigate("/researcher/dashboard")} className="btn btn-secondary">
          Voltar ao dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="panel space-y-4">
        <div>
          <label htmlFor="title" className="label-text">
            Titulo
          </label>
          <input
            id="title"
            type="text"
            name="title"
            maxLength={150}
            required
            value={formData.title}
            onChange={handleChange}
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
            maxLength={2000}
            required
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="input-base resize-y"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="goalAmount" className="label-text">
              Meta financeira (BRL)
            </label>
            <input
              id="goalAmount"
              type="number"
              name="goalAmount"
              min="0.01"
              step="0.01"
              required
              value={formData.goalAmount}
              onChange={handleChange}
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="status" className="label-text">
              Status inicial
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-base"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="imageUrl" className="label-text">
              URL da imagem
            </label>
            <input
              id="imageUrl"
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="contractAddress" className="label-text">
              Contract address (opcional)
            </label>
            <input
              id="contractAddress"
              type="text"
              name="contractAddress"
              value={formData.contractAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="input-base"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? (
            <>
              <span className="loader h-4 w-4 border-white/40 border-t-white" />
              Criando projeto...
            </>
          ) : (
            "Criar projeto"
          )}
        </button>
      </form>

      {error && <p className="alert-error mt-4">{error}</p>}
      {success && <p className="alert-success mt-4">{success}</p>}

      {createdProject && (
        <div className="alert-success mt-4 space-y-2 border-emerald-200 bg-emerald-50">
          <strong className="block">Proximo passo</strong>
          <p>Projeto criado. Agora voce pode cadastrar as milestones.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              to={`/researcher/projects/${createdProject.id}/milestones`}
              className="btn btn-primary btn-link"
            >
              Cadastrar milestones
            </Link>
            <Link to={`/projects/${createdProject.id}`} className="btn btn-secondary btn-link">
              Ver detalhe publico
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
