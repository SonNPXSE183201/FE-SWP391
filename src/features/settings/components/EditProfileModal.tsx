import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { X, Save, Loader2, UserCircle, Lock, FileText } from 'lucide-react';
import { AnimatedModal } from '../../../components/common/animation';
import { useAuthStore } from '../../../stores/authStore';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { HelpTip } from '../../../components/common/HelpTip';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIELD_CLASS =
  'w-full px-4 py-2.5 bg-bg-secondary border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all';

const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
};

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { user } = useAuthStore();
  const role = user?.role ?? 'Mangaka';
  const isMangaka = role === 'Mangaka';
  const updateProfileMutation = useUpdateProfile();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    penName: user?.penName || '',
    skills: user?.skills || '',
    portfolioUrl: user?.portfolioUrl || '',
    phoneNumber: user?.phoneNumber || '',
    citizenId: user?.citizenId || '',
    citizenIdIssueDate: toDateInputValue(user?.citizenIdIssueDate),
    citizenIdIssuePlace: user?.citizenIdIssuePlace || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (form.fullName.length > 100) {
      newErrors.fullName = 'Họ và tên không được vượt quá 100 ký tự';
    }

    if (isMangaka) {
      if (!form.penName.trim()) {
        newErrors.penName = 'Bút danh không được để trống';
      } else if (form.penName.length > 100) {
        newErrors.penName = 'Bút danh không được vượt quá 100 ký tự';
      }

      if (!form.citizenId.trim()) {
        newErrors.citizenId = 'Số CMND/CCCD không được để trống';
      } else if (!/^[0-9]{9,12}$/.test(form.citizenId)) {
        newErrors.citizenId = 'Số CMND/CCCD phải có từ 9 đến 12 chữ số';
      }

      if (!form.citizenIdIssueDate) {
        newErrors.citizenIdIssueDate = 'Ngày cấp CMND/CCCD không được để trống';
      } else {
        const issueDate = new Date(form.citizenIdIssueDate);
        if (Number.isNaN(issueDate.getTime()) || issueDate >= new Date()) {
          newErrors.citizenIdIssueDate = 'Ngày cấp phải là một ngày trong quá khứ';
        }
      }

      if (!form.citizenIdIssuePlace.trim()) {
        newErrors.citizenIdIssuePlace = 'Nơi cấp CMND/CCCD không được để trống';
      } else if (form.citizenIdIssuePlace.length > 200) {
        newErrors.citizenIdIssuePlace = 'Nơi cấp CMND/CCCD không được vượt quá 200 ký tự';
      }
    }

    if (form.phoneNumber && !/^[0-9]{10,11}$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ, cần 10 đến 11 chữ số';
    }

    if (role === 'Assistant' && form.portfolioUrl && !/^https?:\/\/.+/.test(form.portfolioUrl)) {
      newErrors.portfolioUrl = 'Link Portfolio phải bắt đầu bằng http:// hoặc https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    updateProfileMutation.mutate(
      {
        fullName: form.fullName.trim(),
        penName: isMangaka ? form.penName.trim() : undefined,
        portfolioUrl: form.portfolioUrl,
        skills: form.skills,
        phoneNumber: form.phoneNumber,
        avatarUrl: user?.avatarUrl,
        citizenId: isMangaka ? form.citizenId.trim() : undefined,
        citizenIdIssueDate: isMangaka ? form.citizenIdIssueDate : undefined,
        citizenIdIssuePlace: isMangaka ? form.citizenIdIssuePlace.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Đã cập nhật thông tin hồ sơ thành công');
          onClose();
        },
      },
    );
  };

  const inputClass = (key: string) =>
    `${FIELD_CLASS} ${errors[key] ? 'border-danger' : 'border-border-custom'}`;

  return (
    <AnimatedModal
      open={isOpen}
      onClose={onClose}
      zIndex={100}
      containerClassName="flex items-center justify-center p-4 sm:p-0"
      panelClassName="w-full max-w-2xl bg-bg-primary border border-border-custom rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-border-custom bg-bg-secondary/50 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
            <UserCircle size={18} />
          </div>
          <h3 className="font-bold text-text-primary">Chỉnh sửa hồ sơ</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors border-none cursor-pointer bg-transparent"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-5 hide-scrollbar">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
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
            <label className="block text-sm font-medium text-text-secondary">
              Họ và tên <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
              className={inputClass('fullName')}
              placeholder="Nhập họ và tên"
            />
            {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">Số điện thoại</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setField('phoneNumber', e.target.value.replace(/[^\d\s]/g, ''))}
              className={inputClass('phoneNumber')}
              placeholder="Nhập số điện thoại"
            />
            {errors.phoneNumber && <p className="text-xs text-danger mt-1">{errors.phoneNumber}</p>}
          </div>
        </section>

        {isMangaka && (
          <section className="space-y-4 rounded-2xl border border-border-custom bg-bg-secondary/30 p-4">
            <div className="flex items-center gap-2 text-text-primary">
              <FileText size={16} className="text-brand" />
              <h4 className="text-sm font-semibold">Thông tin tác giả để lập hợp đồng</h4>
              <HelpTip
                size="sm"
                width="20rem"
                content="Các thông tin này được đưa vào mẫu hợp đồng PDF. Hãy kiểm tra kỹ trước khi tạo hợp đồng mới."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  Bút danh <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={form.penName}
                  onChange={(e) => setField('penName', e.target.value)}
                  className={inputClass('penName')}
                  placeholder="Nhập bút danh"
                />
                {errors.penName && <p className="text-xs text-danger mt-1">{errors.penName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                  Số CMND/CCCD <span className="text-danger">*</span>
                  <HelpTip size="sm" content="Nhập 9 đến 12 chữ số, không nhập khoảng trắng hoặc dấu gạch." />
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.citizenId}
                  onChange={(e) => setField('citizenId', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className={inputClass('citizenId')}
                  placeholder="079099001125"
                />
                {errors.citizenId && <p className="text-xs text-danger mt-1">{errors.citizenId}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  Ngày cấp CMND/CCCD <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={form.citizenIdIssueDate}
                  onChange={(e) => setField('citizenIdIssueDate', e.target.value)}
                  className={inputClass('citizenIdIssueDate')}
                />
                {errors.citizenIdIssueDate && (
                  <p className="text-xs text-danger mt-1">{errors.citizenIdIssueDate}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  Nơi cấp CMND/CCCD <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={form.citizenIdIssuePlace}
                  onChange={(e) => setField('citizenIdIssuePlace', e.target.value)}
                  className={inputClass('citizenIdIssuePlace')}
                  placeholder="Cục CSQLHC"
                />
                {errors.citizenIdIssuePlace && (
                  <p className="text-xs text-danger mt-1">{errors.citizenIdIssuePlace}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {role === 'Assistant' && (
          <section className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Kỹ năng chuyên môn</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setField('skills', e.target.value)}
                className="w-full px-4 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                placeholder="VD: Lineart, Đổ bóng, Tô màu..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Link Portfolio / Mẫu vẽ</label>
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => setField('portfolioUrl', e.target.value)}
                className={inputClass('portfolioUrl')}
                placeholder="https://..."
              />
              {errors.portfolioUrl && <p className="text-xs text-danger mt-1">{errors.portfolioUrl}</p>}
            </div>
          </section>
        )}
      </div>

      <div className="p-4 flex items-center justify-end gap-3 border-t border-border-custom bg-bg-secondary/50 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors border-none cursor-pointer bg-transparent"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
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
