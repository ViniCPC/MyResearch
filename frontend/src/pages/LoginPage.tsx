import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../service/auth.service";
import { saveToken } from "../utils/storage";

function getApiErrorMessage(error: any, fallbackMessage: string) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  if (error?.code === "ERR_NETWORK") {
    return "Nao foi possivel conectar ao backend. Confirme se a API esta rodando em http://localhost:3000.";
  }

  return fallbackMessage;
}

export function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const response = await login(formData);
      saveToken(response.accessToken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao fazer login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "1rem", maxWidth: "400px" }}
      >
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <p>
        Nao tem conta? <Link to="/register">Cadastrar</Link>
      </p>
    </div>
  );
}
