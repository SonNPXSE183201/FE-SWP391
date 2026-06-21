import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';

const forgotPasswordRequestApi = async (data: { email: string }): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/forgot-password/request', data);
    return response.data;
};

export const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!email.trim()) {
            setLocalError('Vui lòng nhập địa chỉ email');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLocalError('Định dạng email không hợp lệ');
            return;
        }

        setIsLoading(true);
        try {
            const response = await forgotPasswordRequestApi({ email: email.trim() });
            if (response.success) {
                setIsSubmitted(true);
                toast.success(response.message || 'Mã xác nhận đã được gửi đến email của bạn');
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { Message?: string } } };
            const errorMsg = axiosError.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            setLocalError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueToReset = () => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
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

            <div className="relative w-full p-8 rounded-2xl bg-bg-secondary/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-in-up">
                <div className="mb-8 text-center animate-hero-text-reveal" style={{ animationDelay: '0.15s' }}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-hover/10 flex items-center justify-center border border-brand/20">
                        <Mail className="text-brand" size={28} />
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Quên mật khẩu</h2>
                    <p className="text-text-secondary text-sm">
                        {isSubmitted
                            ? 'Kiểm tra hộp thư email để lấy mã xác nhận'
                            : 'Nhập email để nhận mã xác nhận đặt lại mật khẩu'}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {localError && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
                                {localError}
                            </div>
                        )}

                        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                            <label className="text-sm font-medium text-text-primary" htmlFor="forgot-email">
                                Địa chỉ Email
                            </label>
                            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'email' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-brand transition-colors duration-300">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                                    placeholder="nhap@email.com"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
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
                                            Gửi mã xác nhận
                                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                            <p className="text-green-400 text-sm">
                                ✅ Mã xác nhận đã được gửi đến <strong>{email}</strong>
                            </p>
                            <p className="text-text-muted text-xs mt-2">
                                Vui lòng kiểm tra cả thư mục Spam nếu không thấy email.
                            </p>
                        </div>

                        <button
                            onClick={handleContinueToReset}
                            className="relative w-full flex items-center justify-center py-3 px-4 bg-gradient-to-br from-brand to-brand-hover text-white rounded-lg font-medium overflow-hidden hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group"
                        >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="relative z-10 flex items-center">
                                Tiếp tục đặt lại mật khẩu
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
                            </span>
                        </button>
                    </div>
                )}

                <div
                    className="mt-8 pt-6 border-t border-white/10 text-center animate-fade-in-up"
                    style={{ animationDelay: '0.45s' }}
                >
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};
