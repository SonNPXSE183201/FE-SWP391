import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { AnimatedPage } from '../components/common/animation';
import { ArrowLeft } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <div className="flex flex-col flex-1">
        {/* Top navigation bar */}
        <header className="flex items-center justify-between px-6 py-4 absolute top-0 left-0 right-0 z-50 pointer-events-auto">
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
          </nav>
        </header>

        {/* Page content */}
        <AnimatedPage>
          <Outlet />
        </AnimatedPage>
      </div>
    </div>
  );
};
