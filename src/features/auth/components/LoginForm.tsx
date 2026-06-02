import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { loginApi } from '../../../api/auth.api';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
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
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-bg-secondary/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in-up">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Đăng Nhập</h2>
        <p className="text-text-secondary">Chào mừng bạn quay lại với Inku</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {localError && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
            {localError}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary" htmlFor="email">
            Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-brand transition-colors">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              placeholder="nhap@email.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-text-primary" htmlFor="password">
              Mật khẩu
            </label>
            <a href="#" className="text-xs text-brand hover:text-brand-hover transition-colors">
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-brand transition-colors">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center">
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-br from-brand to-brand-hover text-white rounded-lg font-medium hover:shadow-lg hover:shadow-brand/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Đăng nhập
              <ArrowRight className="ml-2" size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-sm text-text-secondary">
          Bạn là Assistant chưa có tài khoản?{' '}
          <a href="#" className="text-brand font-medium hover:text-brand-hover transition-colors">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
};
