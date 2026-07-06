import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, Save, Loader2, UserCircle, Lock } from 'lucide-react';
import { AnimatedModal } from '../../../components/common/animation';
import { useAuthStore } from '../../../stores/authStore';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { HelpTip } from '../../../components/common/HelpTip';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { user } = useAuthStore();
  const role = user?.role ?? 'Mangaka';
  const showPenName = ['Mangaka'].includes(role);
  const updateProfileMutation = useUpdateProfile();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    penName: user?.penName || '',
    skills: user?.skills || '',
    portfolioUrl: user?.portfolioUrl || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName?.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (form.fullName.length > 100) {
      newErrors.fullName = 'Họ và tên không được vượt quá 100 ký tự';
    }

    if (showPenName) {
      if (!form.penName?.trim()) {
        newErrors.penName = 'Bút danh / Tên hiển thị không được để trống';
      } else if (form.penName.length > 100) {
        newErrors.penName = 'Bút danh không được vượt quá 100 ký tự';
      }
    }

    if (form.phoneNumber && !/^[0-9]{10,11}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    if (role === 'Assistant' && form.portfolioUrl && !/^https?:\/\/.+/.test(form.portfolioUrl)) {
      newErrors.portfolioUrl = 'Link Portfolio phải là một URL hợp lệ (bắt đầu bằng http:// hoặc https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    updateProfileMutation.mutate({
      fullName: form.fullName,
      penName: form.penName,
      portfolioUrl: form.portfolioUrl,
      skills: form.skills,
      phoneNumber: form.phoneNumber,
      avatarUrl: user?.avatarUrl,
    }, {
      onSuccess: () => {
        toast.success('Đã cập nhật thông tin hồ sơ thành công!');
        onClose();
      }
    });
  };

  return (
    <AnimatedModal
      open={isOpen}
      onClose={onClose}
      zIndex={100}
      containerClassName="flex items-center justify-center p-4 sm:p-0"
      panelClassName="w-full max-w-md bg-bg-primary border border-border-custom rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
    >
        <div className="flex items-center justify-between p-4 border-b border-border-custom bg-bg-secondary/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
              <UserCircle size={18} />
            </div>
            <h3 className="font-bold text-text-primary">Chỉnh sửa hồ sơ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors border-none cursor-pointer bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4 hide-scrollbar">
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-text-secondary">Địa chỉ email</label>
                <HelpTip content="Email dùng để định danh tài khoản nên không thể thay đổi." />
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-bg-surface/50 border border-border-custom rounded-xl text-sm text-text-muted cursor-not-allowed outline-none pr-10"
                />
                <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Họ và tên <span className="text-danger">*</span></label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, fullName: e.target.value }));
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
                className={`w-full px-4 py-2.5 bg-bg-secondary border ${errors.fullName ? 'border-danger' : 'border-border-custom'} rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all`}
                placeholder="Nhập họ và tên"
              />
              {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName}</p>}
            </div>

            {showPenName && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">Bút danh / Tên hiển thị <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={form.penName}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, penName: e.target.value }));
                    if (errors.penName) setErrors(prev => ({ ...prev, penName: '' }));
                  }}
                  className={`w-full px-4 py-2.5 bg-bg-secondary border ${errors.penName ? 'border-danger' : 'border-border-custom'} rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all`}
                  placeholder="Nhập bút danh"
                />
                {errors.penName && <p className="text-xs text-danger mt-1">{errors.penName}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Số điện thoại</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, phoneNumber: e.target.value }));
                  if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }));
                }}
                className={`w-full px-4 py-2.5 bg-bg-secondary border ${errors.phoneNumber ? 'border-danger' : 'border-border-custom'} rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all`}
                placeholder="Nhập số điện thoại"
              />
              {errors.phoneNumber && <p className="text-xs text-danger mt-1">{errors.phoneNumber}</p>}
            </div>

            {role === 'Assistant' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Kỹ năng chuyên môn</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    placeholder="VD: Lineart, Đổ bóng, Tô màu..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Link Portfolio / Mẫu vẽ</label>
                  <input
                    type="url"
                    value={form.portfolioUrl}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, portfolioUrl: e.target.value }));
                      if (errors.portfolioUrl) setErrors(prev => ({ ...prev, portfolioUrl: '' }));
                    }}
                    className={`w-full px-4 py-2.5 bg-bg-secondary border ${errors.portfolioUrl ? 'border-danger' : 'border-border-custom'} rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all`}
                    placeholder="https://..."
                  />
                  {errors.portfolioUrl && <p className="text-xs text-danger mt-1">{errors.portfolioUrl}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-4 flex items-center justify-end gap-3 border-t border-border-custom bg-bg-secondary/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors border-none cursor-pointer bg-transparent"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-brand/20 border-none cursor-pointer"
          >
            {updateProfileMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
    </AnimatedModal>
  );
};
