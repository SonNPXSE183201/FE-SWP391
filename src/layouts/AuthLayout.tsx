import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { ArrowLeft } from 'lucide-react';

export const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <div className="flex flex-col flex-1">
        {/* Top navigation bar */}
        <header className="flex items-center justify-between px-6 py-4 absolute top-0 left-0 right-0 z-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <Logo size="sm" showText />
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg-custom text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all duration-200"
            >
              <ArrowLeft size={16} />
              Trang chủ
            </Link>

            {isLogin && (
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg-custom text-sm font-semibold bg-brand text-white hover:bg-brand-hover transition-all duration-200"
              >
                Đăng ký
              </Link>
            )}

            {isRegister && (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg-custom text-sm font-semibold bg-brand text-white hover:bg-brand-hover transition-all duration-200"
              >
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
