
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore, type UserRole } from '../../../stores/authStore';
import { authApi } from '../api/auth.api';
import type { AuthResponseDto } from '../../../api/generated/types';
import { loadRememberedEmail, loadRememberedPassword, persistRememberedCredentials } from '../utils/rememberCredentials';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState(() => loadRememberedEmail());
  const [password, setPassword] = useState(() => loadRememberedPassword());
  const [rememberMe, setRememberMe] = useState(() => !!loadRememberedEmail());
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setAuth, setLoading, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Username/Email và mật khẩu không được để trống');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ identifier: email, password });

      if (response.success && response.data && response.data.token) {
        persistRememberedCredentials(email, password, rememberMe);

        let mappedRole = response.data.roleName;
        if (mappedRole === 'System Admin') mappedRole = 'Admin';
        else if (mappedRole === 'Tantou Editor') mappedRole = 'Editor';
        else if (mappedRole === 'Editorial Board') mappedRole = 'Board';

        const profile = response.data as AuthResponseDto;

        setAuth({
          id: response.data.userId?.toString() || '0',
          fullName: response.data.fullName || response.data.userName || 'User',
          email: response.data.email || email,
          role: mappedRole as UserRole,
          avatarUrl: profile.avatarUrl ?? undefined,
          penName: profile.penName ?? undefined,
          portfolioUrl: profile.portfolioUrl ?? undefined,
          skills: profile.skills ?? undefined,
          phoneNumber: profile.phoneNumber ?? undefined,
        }, response.data.token, response.data.refreshToken || '', rememberMe);

        toast.success(response.message || 'Đăng nhập thành công');

        setTimeout(() => {
          const redirectPath = useAuthStore.getState().getRoleRedirectPath?.() || '/';
          navigate(redirectPath, { replace: true });
        }, 50);
        return;
      }

      const errorMsg = response.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setLocalError(errorMsg);
      toast.error(errorMsg);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const data = axiosError.response?.data;
      const errorMsg = String(data?.message ?? 'Có lỗi xảy ra khi đăng nhập');
      setLocalError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-60 blur-[1px] animate-shimmer-border"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(108,92,231,0.3), transparent, rgba(108,92,231,0.15), transparent)',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="relative w-full p-8 rounded-2xl bg-bg-secondary/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-in-up animate-glow-pulse">
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

          <div
            className="space-y-2 animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            <label className="text-sm font-medium text-text-primary" htmlFor="email">
              Tên đăng nhập / Email
            </label>
            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'email' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-brand transition-colors duration-300">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                placeholder="Nhập email hoặc tên đăng nhập"
              />
            </div>
          </div>

          <div
            className="space-y-2 animate-fade-in-up"
            style={{ animationDelay: '0.35s' }}
          >
            <label className="text-sm font-medium text-text-primary" htmlFor="password">
              Mật khẩu
            </label>
            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'password' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-brand transition-colors duration-300">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors duration-200"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div
            className="flex items-center justify-between gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.45s' }}
          >
            <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer select-none group/checkbox">
              <div className="relative flex items-center justify-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="sr-only peer"
                />
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-200 border
                  ${rememberMe 
                    ? 'bg-brand border-brand text-white shadow-[0_0_10px_rgba(108,92,231,0.5)]' 
                    : 'bg-bg-surface border-border-custom text-transparent group-hover/checkbox:border-brand/50'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <Check size={12} strokeWidth={3} className={rememberMe ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} style={{ transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                </div>
              </div>
              <span className={`text-sm transition-colors duration-200 ${rememberMe ? 'text-brand' : 'text-text-secondary group-hover/checkbox:text-text-primary'}`}>
                Ghi nhớ đăng nhập
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-brand hover:text-brand-hover transition-colors whitespace-nowrap"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.55s' }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex items-center justify-center py-3 px-4 bg-gradient-to-br from-brand to-brand-hover text-white rounded-lg font-medium overflow-hidden hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
            >
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
