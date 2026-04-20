import { useNavigate } from "react-router-dom";
import { removeToken } from "../utils/storage";

export function DashboardPage() {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Você está em uma rota privada.</p>

      <button onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}