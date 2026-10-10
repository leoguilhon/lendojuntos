import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AppLayout() {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isClubSection = pathname === "/dashboard" || pathname.startsWith("/clubs/") || pathname.startsWith("/books/");

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link className="brand" to="/dashboard">
          <img src="/images/logo-header.png" alt="LendoJuntos" />
          <div className="brand-copy">
            <span className="brand-kicker">LendoJuntos</span>
            <strong>clubes com memoria</strong>
          </div>
        </Link>
        <nav className="topnav" aria-label="Navegação principal">
          <Link
            aria-current={isClubSection ? "page" : undefined}
            className={isClubSection ? "active" : undefined}
            to="/dashboard"
          >
            Clubes
          </Link>
          <NavLink to="/profile">Perfil</NavLink>
        </nav>
        <div className="user-menu">
          <div className="user-badge">
            <span>Leitor atual</span>
            <strong>{user?.name}</strong>
          </div>
          <button className="ghost-button" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}
