import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { KeyRound, Loader2, Eye, EyeOff, X, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../../../stores/authStore';
interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setLocalError(null);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };
    const handleClose = () => {
        if (!isLoading) {
            resetForm();
            onClose();
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        // Validation
        if (!currentPassword) {
            setLocalError('Vui lòng nhập mật khẩu hiện tại');
            return;
        }
        if (!newPassword) {
            setLocalError('Vui lòng nhập mật khẩu mới');
            return;
        }
        if (newPassword.length < 8) {
            setLocalError('Mật khẩu mới phải có ít nhất 8 ký tự');
            return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(newPassword)) {
            setLocalError('Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt');
            return;
        }
        if (currentPassword === newPassword) {
            setLocalError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setLocalError('Mật khẩu xác nhận không khớp');
            return;
        }
        setIsLoading(true);
        try {
            const response = await authApi.changePassword({
                currentPassword,
                newPassword,
                confirmNewPassword,
            });
            if (response.IsSuccess) {
                logout();
                resetForm();
                onClose();
                toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.');
                navigate('/login', { replace: true });
                return;
            }

            const errorMsg = response.Message || 'Mật khẩu hiện tại không đúng. Vui lòng thử lại.';
            setLocalError(errorMsg);
            toast.error(errorMsg);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { Message?: string; message?: string } } };
            const errorMsg =
                axiosError.response?.data?.Message ||
                axiosError.response?.data?.message ||
                'Mật khẩu hiện tại không đúng. Vui lòng thử lại.';
            setLocalError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={handleClose}
            />
            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 animate-scale-in">
                {/* Shimmer border */}
                <div
                    className="absolute -inset-[1px] rounded-2xl opacity-60 blur-[1px] animate-shimmer-border"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(108,92,231,0.3), transparent, rgba(108,92,231,0.15), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                />
                <div className="relative p-8 rounded-2xl bg-bg-secondary/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all duration-200 disabled:opacity-50"
                        aria-label="Đóng"
                    >
                        <X size={20} />
                    </button>
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-brand/20 to-brand-hover/10 flex items-center justify-center border border-brand/20">
                            <ShieldCheck className="text-brand" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-1">Đổi mật khẩu</h3>
                        <p className="text-text-secondary text-sm">Bảo mật tài khoản bằng mật khẩu mới</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {localError && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
                                {localError}
                            </div>
                        )}
                        {/* Current Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary" htmlFor="current-password">
                                Mật khẩu hiện tại
                            </label>
                            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'current' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary group-focus-within:text-brand transition-colors duration-300">
                                    <KeyRound size={18} />
                                </div>
                                <input
                                    id="current-password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    onFocus={() => setFocusedField('current')}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-11 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors duration-200"
                                    tabIndex={-1}
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        {/* Separator */}
                        <div className="border-t border-white/5" />
                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary" htmlFor="modal-new-password">
                                Mật khẩu mới
                            </label>
                            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'new' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
                                <input
                                    id="modal-new-password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onFocus={() => setFocusedField('new')}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={isLoading}
                                    className="w-full px-4 pr-11 py-2.5 bg-bg-surface border border-border-custom rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all duration-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary transition-colors duration-200"
                                    tabIndex={-1}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-text-muted">
                                Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                            </p>
                        </div>
                        {/* Confirm New Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-primary" htmlFor="modal-confirm-password">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className={`relative group rounded-lg transition-shadow duration-300 ${focusedField === 'confirm' ? 'shadow-[0_0_20px_rgba(108,92,231,0.15)]' : ''}`}>
                                <input
                                    id="modal-confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    onFocus={() => setFocusedField('confirm')}
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
                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 py-2.5 px-4 bg-bg-surface border border-border-custom text-text-secondary rounded-lg font-medium hover:bg-bg-primary hover:text-text-primary transition-all duration-200 disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative flex-1 flex items-center justify-center py-2.5 px-4 bg-gradient-to-br from-brand to-brand-hover text-white rounded-lg font-medium overflow-hidden hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <span className="relative z-10 flex items-center">
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        'Xác nhận'
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
