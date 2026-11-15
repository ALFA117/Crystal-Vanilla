import { useAuth } from '../contexts/AuthContext';
import Icon, { BrandMark } from './Icon';

export default function Header({ page, onCalculator, onInventario, onLoginClick }) {
  const { user, perfil, loading, servidor } = useAuth();
  const offline = !user && servidor === 'offline';
  const invLabel = user && perfil?.rol === 'admin' ? 'Panel admin' : 'Inventario';

  return (
    <header className="cv-header">
      <div className="cv-header__inner">
        <a className="cv-brand" href="/" onClick={(e) => { e.preventDefault(); onCalculator(); }}>
          <BrandMark size={36} />
          <span className="cv-brand__text">
            <span className="cv-brand__name">Crystal Vanilla</span>
            <span className="cv-brand__sub">Calculadora de producción</span>
          </span>
        </a>

        <nav className="cv-nav" aria-label="Secciones">
          <button
            type="button"
            className="cv-nav__btn"
            aria-current={page === 'calculator' ? 'page' : undefined}
            onClick={onCalculator}
          >
            <Icon name="calculator" size={17} />
            Calculadora
          </button>
          <button
            type="button"
            className="cv-nav__btn"
            aria-current={page === 'dashboard' ? 'page' : undefined}
            onClick={onInventario}
          >
            <Icon name="box" size={17} />
            {invLabel}
            {!user && (offline
              ? <span className="cv-nav__badge" title="El servidor de inventario no responde">Sin conexión</span>
              : <Icon name="lock" size={14} className="cv-nav__lock" title="Requiere iniciar sesión" />)}
          </button>
        </nav>

        <div className="cv-header__account">
          {!loading && (user ? (
            <button type="button" className="cv-account" onClick={onInventario}>
              <Icon name="user" size={17} />
              <span className="cv-account__name">{perfil?.nombre?.split(' ')[0] || 'Mi cuenta'}</span>
              {perfil?.rol && <span className={`cv-role cv-role--${perfil.rol}`}>{perfil.rol}</span>}
            </button>
          ) : (
            <button type="button" className="cv-btn cv-btn--on-dark" onClick={onLoginClick}>
              <Icon name="login" size={17} />
              Ingresar
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
