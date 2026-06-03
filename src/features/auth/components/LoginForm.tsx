import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader2, ArrowRight, X } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { loginApi } from '../../../api/auth.api';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { setAuth, setLoading, isLoading, getRoleRedirectPath } = useAuthStore();

  useEffect(() => {
    // Load saved email if exists
    const savedEmail = localStorage.getItem('inku-remembered-email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Basic validation
    if (!email || !password) {
      setLocalError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const response = await loginApi({ email, password });
      
      if (response.success && response.data) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('inku-remembered-email', email);
        } else {
          localStorage.removeItem('inku-remembered-email');
        }

        // Save to store
        setAuth(response.data.user, response.data.token);
        toast.success(response.message || 'Đăng nhập thành công');
        
        // Redirect based on role
        const redirectPath = getRoleRedirectPath();
        navigate(redirectPath, { replace: true });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập';
      setLocalError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Shimmer border glow effect */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-60 blur-[1px] animate-shimmer-border"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(108,92,231,0.3), transparent, rgba(108,92,231,0.15), transparent)',
          backgroundSize: '200% 100%',
        }}
      />

      {/* Card container with glow pulse */}
      <div className="relative w-full p-8 rounded-2xl bg-bg-secondary/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-in-up animate-glow-pulse">
        {/* Close (X) button → navigate to Landing Page */}
        <Link
          to="/"
          id="login-close-btn"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 hover:border-white/20 hover:rotate-90 transition-all duration-300 group"
          aria-label="Quay về trang chủ"
        >
          <X size={16} className="group-hover:scale-110 transition-transform" />
        </Link>

        {/* Header */}
        <div
          className="mb-8 text-center animate-hero-text-reveal"
          style={{ animationDelay: '0.15s' }}
        >
          <h2 className="text-3xl font-bold text-text-primary mb-2">Đăng Nhập</h2>
          <p className="text-text-secondary">Chào mừng bạn quay lại với Inku</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {localError && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
              {localError}
            </div>
          )}

          {/* Email field */}
          <div
            className="space-y-2 animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            <label className="text-sm font-medium text-text-primary" htmlFor="email">
              Email
            </label>
            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'email' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-brand transition-colors duration-300">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                placeholder="nhap@email.com"
              />
            </div>
          </div>

          {/* Password field */}
          <div
            className="space-y-2 animate-fade-in-up"
            style={{ animationDelay: '0.35s' }}
          >
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-text-primary" htmlFor="password">
                Mật khẩu
              </label>
              <a href="#" className="text-xs text-brand hover:text-brand-hover transition-colors">
                Quên mật khẩu?
              </a>
            </div>
            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'password' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-brand transition-colors duration-300">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Remember me */}
          <div
            className="flex items-center animate-fade-in-up"
            style={{ animationDelay: '0.45s' }}
          >
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-border-custom text-brand focus:ring-brand bg-bg-surface cursor-pointer"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-text-secondary cursor-pointer">
              Nhớ tài khoản
            </label>
          </div>

          {/* Submit button */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.55s' }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex items-center justify-center py-3 px-4 bg-gradient-to-br from-brand to-brand-hover text-white rounded-lg font-medium overflow-hidden hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
            >
              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Register link */}
        <div
          className="mt-8 pt-6 border-t border-white/10 text-center animate-fade-in-up"
          style={{ animationDelay: '0.65s' }}
        >
          <p className="text-sm text-text-secondary">
            Bạn là Trợ lý vẽ chưa có tài khoản?{' '}
            <Link to="/register" className="text-brand font-medium hover:text-brand-hover transition-colors relative group/link">
              Đăng ký ngay
              <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-brand group-hover/link:w-full transition-all duration-300" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
