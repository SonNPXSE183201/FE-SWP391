import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { KeyRound, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { resetPasswordApi } from '../api/auth.api';
export const ResetPasswordForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const emailFromQuery = searchParams.get('email') || '';
    const [email, setEmail] = useState(emailFromQuery);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        // Validation
        if (!email.trim()) {
            setLocalError('Vui lòng nhập địa chỉ email');
            return;
        }
        if (!resetCode.trim()) {
            setLocalError('Vui lòng nhập mã xác nhận');
            return;
        }
        if (!newPassword) {
            setLocalError('Vui lòng nhập mật khẩu mới');
            return;
        }
        if (newPassword.length < 8) {
            setLocalError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(newPassword)) {
            setLocalError('Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setLocalError('Mật khẩu xác nhận không khớp');
            return;
        }
        setIsLoading(true);
        try {
            const response = await resetPasswordApi({
                email: email.trim(),
                resetCode: resetCode.trim(),
                newPassword,
                confirmNewPassword,
            });
            if (response.IsSuccess) {
                setIsSuccess(true);
                toast.success(response.Message || 'Đặt lại mật khẩu thành công!');
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { Message?: string } } };
            const errorMsg = axiosError.response?.data?.Message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            setLocalError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Shimmer border glow */}
            <div
                className="absolute -inset-[1px] rounded-2xl opacity-60 blur-[1px] animate-shimmer-border"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(108,92,231,0.3), transparent, rgba(108,92,231,0.15), transparent)',
                    backgroundSize: '200% 100%',
                }}
            />
            {/* Card container */}
            <div className="relative w-full p-8 rounded-2xl bg-bg-secondary/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-in-up">
                {/* Header */}
                <div className="mb-8 text-center animate-hero-text-reveal" style={{ animationDelay: '0.15s' }}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-hover/10 flex items-center justify-center border border-brand/20">
                        {isSuccess
                            ? <ShieldCheck className="text-green-400" size={28} />
                            : <KeyRound className="text-brand" size={28} />
                        }
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">
                        {isSuccess ? 'Thành công!' : 'Đặt lại mật khẩu'}
                    </h2>
                    <p className="text-text-secondary text-sm">
                        {isSuccess
                            ? 'Mật khẩu đã được cập nhật. Bạn có thể đăng nhập ngay.'
                            : 'Nhập mã xác nhận từ email và mật khẩu mới'}
                    </p>
                </div>
                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {localError && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
                                {localError}
                            </div>
                        )}
                        {/* Email field */}
                        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <label className="text-sm font-medium text-text-primary" htmlFor="reset-email">
                                Email
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                disabled={isLoading || !!emailFromQuery}
                                className={`w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300 ${emailFromQuery ? 'opacity-60' : ''} ${focusedField === 'email' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}
                                placeholder="nhap@email.com"
                            />
                        </div>
                        {/* Reset Code field */}
                        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <label className="text-sm font-medium text-text-primary" htmlFor="reset-code">
                                Mã xác nhận
                            </label>
                            <input
                                id="reset-code"
                                type="text"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                onFocus={() => setFocusedField('code')}
                                onBlur={() => setFocusedField(null)}
                                disabled={isLoading}
                                maxLength={10}
                                className={`w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300 tracking-widest text-center font-mono text-lg ${focusedField === 'code' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}
                                placeholder="Nhập mã từ email"
                                autoFocus
                            />
                        </div>
                        {/* New Password field */}
                        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <label className="text-sm font-medium text-text-primary" htmlFor="new-password">
                                Mật khẩu mới
                            </label>
                            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'password' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
                                <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={isLoading}
                                    className="w-full px-4 pr-11 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors duration-200"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-text-muted">
                                Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                            </p>
                        </div>
                        {/* Confirm Password field */}
                        <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                            <label className="text-sm font-medium text-text-primary" htmlFor="confirm-new-password">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'confirmPassword' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
                                <input
                                    id="confirm-new-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={isLoading}
                                    className="w-full px-4 pr-11 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors duration-200"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        {/* Submit button */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
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
                                            Đặt lại mật khẩu
                                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Success state */
                    <div className="space-y-6">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                            <p className="text-green-400 text-sm">
                                ✅ Mật khẩu đã được đặt lại thành công!
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="relative w-full flex items-center justify-center py-3 px-4 bg-gradient-to-br from-brand to-brand-hover text-white rounded-lg font-medium overflow-hidden hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 group"
                        >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="relative z-10 flex items-center">
                                Đăng nhập ngay
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
                            </span>
                        </button>
                    </div>
                )}
                {/* Back to login link */}
                <div
                    className="mt-8 pt-6 border-t border-white/10 text-center animate-fade-in-up"
                    style={{ animationDelay: '0.7s' }}
                >
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Gửi lại mã xác nhận
                    </Link>
                </div>
            </div>
        </div>
    );
};
