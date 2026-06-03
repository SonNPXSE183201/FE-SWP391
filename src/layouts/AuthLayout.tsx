import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { ArrowLeft } from 'lucide-react';
import './AuthLayout.css';

export const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  return (
    <div className="auth-layout">
      <div className="auth-layout__content">
        {/* Top navigation bar */}
        <header className="auth-header">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Logo size="sm" showText />
          </Link>

          <nav className="auth-header__nav">
            <Link to="/" className="auth-header__link">
              <ArrowLeft size={16} />
              Trang chủ
            </Link>

            {isLogin && (
              <Link to="/register" className="auth-header__link auth-header__link--primary">
                Đăng ký
              </Link>
            )}

            {isRegister && (
              <Link to="/login" className="auth-header__link auth-header__link--primary">
                Đăng nhập
              </Link>
            )}
          </nav>
        </header>

        {/* Page content */}
        <Outlet />
      </div>
    </div>
  );
};
