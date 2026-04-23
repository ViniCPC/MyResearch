import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerResearcher, registerUser } from "../service/auth.service";
import { getApiErrorMessage } from "../utils/apiError";

type RegisterMode = "COMMON" | "RESEARCHER";

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<RegisterMode>("COMMON");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institution: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "researcher") {
      setMode("RESEARCHER");
    } else if (type === "common") {
      setMode("COMMON");
    }
  }, [searchParams]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "RESEARCHER") {
        await registerResearcher({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          institution: formData.institution,
        });
      } else {
        await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      navigate("/login");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao cadastrar usuario"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="mb-5 space-y-1">
          <h1 className="title-xl">Cadastro</h1>
          <p className="muted-text text-sm">
            Crie sua conta e escolha o tipo de perfil.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("COMMON")}
            className={`btn ${mode === "COMMON" ? "btn-primary" : "btn-secondary"}`}
          >
            Cadastro comum
          </button>
          <button
            type="button"
            onClick={() => setMode("RESEARCHER")}
            className={`btn ${mode === "RESEARCHER" ? "btn-primary" : "btn-secondary"}`}
          >
            Cadastro pesquisador
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label-text">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Seu nome"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="email" className="label-text">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="voce@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="password" className="label-text">
              Senha
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Minimo de 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
              className="input-base"
            />
          </div>

          {mode === "RESEARCHER" && (
            <div>
              <label htmlFor="institution" className="label-text">
                Instituicao
              </label>
              <input
                id="institution"
                type="text"
                name="institution"
                placeholder="Nome da instituicao"
                value={formData.institution}
                onChange={handleChange}
                required
                className="input-base"
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <>
                <span className="loader h-4 w-4 border-white/40 border-t-white" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar"
            )}
          </button>
        </form>

        {error && <p className="alert-error mt-4">{error}</p>}

        <p className="muted-text mt-5 text-sm">
          Ja tem conta?{" "}
          <Link to="/login" className="font-semibold text-blue-700 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
