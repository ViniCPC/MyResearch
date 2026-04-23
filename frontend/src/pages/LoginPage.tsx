import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../service/auth.service";
import { saveToken } from "../utils/storage";
import { getApiErrorMessage } from "../utils/apiError";

type AccessMode = "COMMON" | "RESEARCHER";

export function LoginPage() {
  const navigate = useNavigate();

  const [accessMode, setAccessMode] = useState<AccessMode>("COMMON");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(formData);
      const role = response.user?.role;

      if (accessMode === "RESEARCHER" && role && role !== "RESEARCHER") {
        setError("Esta conta nao e de pesquisador. Selecione Login comum.");
        return;
      }

      if (accessMode === "COMMON" && role === "RESEARCHER") {
        setError("Esta conta e de pesquisador. Selecione Login pesquisador.");
        return;
      }

      saveToken(response.accessToken, response.user);

      if (role === "RESEARCHER" || accessMode === "RESEARCHER") {
        navigate("/researcher/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao fazer login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="mb-5 space-y-1">
          <h1 className="title-xl">Login</h1>
          <p className="muted-text text-sm">
            Escolha como deseja acessar a plataforma.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAccessMode("COMMON")}
            className={`btn ${accessMode === "COMMON" ? "btn-primary" : "btn-secondary"}`}
          >
            Login comum
          </button>
          <button
            type="button"
            onClick={() => setAccessMode("RESEARCHER")}
            className={`btn ${accessMode === "RESEARCHER" ? "btn-primary" : "btn-secondary"}`}
          >
            Login pesquisador
          </button>
        </div>

        <p className="muted-text mb-5 text-sm">
          {accessMode === "RESEARCHER"
            ? "Use essa opcao para acessar dashboard, cadastro de projeto e milestones."
            : "Use essa opcao para acesso padrao da plataforma."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Sua senha"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-base"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <>
                <span className="loader h-4 w-4 border-white/40 border-t-white" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {error && <p className="alert-error mt-4">{error}</p>}

        <p className="muted-text mt-5 text-sm">
          Nao tem conta?{" "}
          <Link to="/register?type=common" className="font-semibold text-blue-700 hover:underline">
            Cadastro comum
          </Link>
          {" | "}
          <Link
            to="/register?type=researcher"
            className="font-semibold text-blue-700 hover:underline"
          >
            Cadastro pesquisador
          </Link>
        </p>
      </div>
    </div>
  );
}
