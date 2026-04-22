import { useNavigate, Link } from "react-router-dom";
import { removeToken } from "../utils/storage";

export function DashboardPage() {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <button onClick={handleLogout}>Sair</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        <Link
          to="/projects"
          style={{
            display: "block",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "1.25rem",
            textDecoration: "none",
            color: "#111827",
            background: "#fff",
          }}
        >
          <strong style={{ fontSize: "1rem" }}>Projetos</strong>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
            Ver todos os projetos de pesquisa
          </p>
        </Link>
      </div>
    </div>
  );
}