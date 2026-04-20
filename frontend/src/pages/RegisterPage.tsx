import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerResearcher } from "../service/auth.service";

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

export function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institution: "",
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
      await registerResearcher(formData);
      navigate("/login");
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Erro ao cadastrar usuario"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Cadastro</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "1rem", maxWidth: "400px" }}
      >
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={formData.name}
          onChange={handleChange}
        />

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

        <input
          type="text"
          name="institution"
          placeholder="Instituicao"
          value={formData.institution}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <p>
        Ja tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
}
