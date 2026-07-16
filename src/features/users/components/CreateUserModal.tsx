import { useState } from 'react';
import { X, UserPlus, Loader2, ShieldCheck, FileText } from 'lucide-react';
import { AnimatedModal } from '../../../components/common/animation';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../admin';
import type { CreateUserByAdminDto } from '../../../api/generated/types';
import type { ApiResponse } from '../../../api/axios';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { HelpTip } from '../../../components/common/HelpTip';
import { AssignedEditorField } from './AssignedEditorField';

interface CreateUserModalProps {
  onClose: () => void;
}

type CreateUserFormData = CreateUserByAdminDto & {
  citizenId?: string | null;
  citizenIdIssueDate?: string | null;
  citizenIdIssuePlace?: string | null;
};

const ROLE_OPTIONS = [
  { value: '2', label: 'Biên tập viên' },
  { value: '3', label: 'Hội đồng biên tập' },
  { value: '4', label: 'Tác giả' },
];

const FIELD_BASE_CLASS =
  'w-full bg-bg-secondary border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand placeholder:text-text-muted/50 transition-colors';

const normalizeUsername = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
};

export const CreateUserModal = ({ onClose }: CreateUserModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateUserFormData>({
    roleId: 4,
    userName: '',
    email: '',
    fullName: '',
    penName: '',
    citizenId: '',
    citizenIdIssueDate: '',
    citizenIdIssuePlace: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMangaka = formData.roleId === 4;

  const createMutation = useMutation({
    mutationFn: (data: CreateUserFormData) => adminApi.createUser(data),
    onSuccess: (res) => {
      const responseData = res.data as ApiResponse<unknown> & {
        IsSuccess?: boolean;
        Message?: string;
        Errors?: Record<string, string[]>;
      };

      if (responseData.success) {
        toast.success(responseData.message || 'Tạo người dùng thành công');
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['admin-editors'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
        onClose();
        return;
      }

      toast.error(responseData.message || 'Có lỗi xảy ra');
      if (responseData.Errors) {
        const newErrors: Record<string, string> = {};
        Object.keys(responseData.Errors).forEach((key) => {
          newErrors[key] = responseData.Errors?.[key]?.[0] ?? '';
        });
        setErrors(newErrors);
      }
    },
    onError: (error: unknown) => {
      const data = (error as {
        response?: {
          data?: {
            errors?: Record<string, string[]>;
            Errors?: Record<string, string[]>;
            message?: string;
            Message?: string;
          };
        };
      }).response?.data;

      const errObj = data?.errors || data?.Errors;
      if (errObj) {
        const newErrors: Record<string, string> = {};
        Object.keys(errObj).forEach((key) => {
          newErrors[key] = errObj[key][0];
        });
        setErrors(newErrors);
        toast.error('Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại');
        return;
      }

      toast.error(data?.message || data?.Message || 'Có lỗi xảy ra khi tạo người dùng');
    },
  });

  const setField = <K extends keyof CreateUserFormData>(key: K, value: CreateUserFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.userName?.trim()) {
      newErrors.userName = 'Tên đăng nhập không được để trống';
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.userName)) {
      newErrors.userName = 'Tên đăng nhập chỉ được chứa chữ cái không dấu, số, dấu gạch dưới hoặc dấu chấm';
    }

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    }

    if (isMangaka) {
      if (!formData.penName?.trim()) {
        newErrors.penName = 'Bút danh không được để trống khi tạo tác giả';
      }

      if (!formData.assignedEditorId) {
        newErrors.assignedEditorId = 'Vui lòng chọn biên tập viên phụ trách';
      }

      if (!formData.citizenId?.trim()) {
        newErrors.citizenId = 'Số CMND/CCCD không được để trống';
      } else if (!/^[0-9]{9,12}$/.test(formData.citizenId)) {
        newErrors.citizenId = 'Số CMND/CCCD phải có từ 9 đến 12 chữ số';
      }

      if (!formData.citizenIdIssueDate) {
        newErrors.citizenIdIssueDate = 'Ngày cấp CMND/CCCD không được để trống';
      } else {
        const issueDate = new Date(formData.citizenIdIssueDate);
        if (Number.isNaN(issueDate.getTime()) || issueDate >= new Date()) {
          newErrors.citizenIdIssueDate = 'Ngày cấp phải là một ngày trong quá khứ';
        }
      }

      if (!formData.citizenIdIssuePlace?.trim()) {
        newErrors.citizenIdIssuePlace = 'Nơi cấp CMND/CCCD không được để trống';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (): CreateUserFormData => {
    const payload: CreateUserFormData = {
      roleId: formData.roleId,
      email: formData.email?.trim() ?? '',
      userName: normalizeUsername(formData.userName ?? ''),
      fullName: formData.fullName?.trim() ?? '',
    };

    if (isMangaka) {
      payload.penName = formData.penName?.trim() || null;
      payload.assignedEditorId = formData.assignedEditorId;
      payload.citizenId = formData.citizenId?.trim() || null;
      payload.citizenIdIssueDate = formData.citizenIdIssueDate || null;
      payload.citizenIdIssuePlace = formData.citizenIdIssuePlace?.trim() || null;
    }

    return payload;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate(buildPayload());
  };

  const fieldClass = (key: string) =>
    `${FIELD_BASE_CLASS} ${errors[key] ? 'border-danger' : 'border-border-custom'}`;

  return (
    <AnimatedModal
      open
      onClose={onClose}
      panelClassName="bg-bg-primary w-full max-w-2xl rounded-2xl border border-border-custom shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom bg-bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Tạo người dùng mới</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Tạo tài khoản nội bộ cho biên tập viên, hội đồng hoặc tác giả.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto">
        <div className="p-5 space-y-5">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-text-primary">
              <ShieldCheck size={16} className="text-brand" />
              <h4 className="text-sm font-semibold">Thông tin tài khoản</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
                  Vai trò <span className="text-danger">*</span>
                  <HelpTip
                    size="sm"
                    content="Trợ lý vẽ tự đăng ký ở trang đăng ký công khai. Admin không tạo trực tiếp tài khoản trợ lý tại đây."
                  />
                </label>
                <CustomSelect
                  options={ROLE_OPTIONS}
                  value={String(formData.roleId)}
                  onChange={(value) => {
                    const roleId = Number(value);
                    setFormData((prev) => ({
                      ...prev,
                      roleId,
                      assignedEditorId: roleId === 4 ? prev.assignedEditorId : undefined,
                      penName: roleId === 4 ? prev.penName : '',
                      citizenId: roleId === 4 ? prev.citizenId : '',
                      citizenIdIssueDate: roleId === 4 ? prev.citizenIdIssueDate : '',
                      citizenIdIssuePlace: roleId === 4 ? prev.citizenIdIssuePlace : '',
                    }));
                    setErrors({});
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={fieldClass('email')}
                  placeholder="nguyenvana@gmail.com"
                  value={formData.email || ''}
                  onChange={(e) => {
                    const email = e.target.value;
                    setFormData((prev) => {
                      const currentPrefix = prev.email?.split('@')[0] || '';
                      const next: CreateUserFormData = { ...prev, email };
                      if (!prev.userName || prev.userName === currentPrefix) {
                        next.userName = normalizeUsername(email.split('@')[0] || '');
                      }
                      return next;
                    });
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
                  Tên đăng nhập <span className="text-danger">*</span>
                  <HelpTip
                    size="sm"
                    content="Tên đăng nhập được tự động gợi ý từ email. Chỉ dùng chữ không dấu, số, dấu gạch dưới hoặc dấu chấm."
                  />
                </label>
                <input
                  type="text"
                  className={fieldClass('userName')}
                  placeholder="nguyenvana"
                  value={formData.userName || ''}
                  onChange={(e) => setField('userName', normalizeUsername(e.target.value))}
                />
                {errors.userName && <p className="text-xs text-danger mt-1">{errors.userName}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Họ và tên <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={fieldClass('fullName')}
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName || ''}
                  onChange={(e) => setField('fullName', e.target.value)}
                />
                {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName}</p>}
              </div>
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
                  content="Các thông tin này được đưa vào mẫu hợp đồng PDF. Nếu thiếu, hệ thống không thể tạo hợp đồng cho tác giả."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Bút danh <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={fieldClass('penName')}
                    placeholder="Oda Eiichiro"
                    value={formData.penName || ''}
                    onChange={(e) => setField('penName', e.target.value)}
                  />
                  {errors.penName && <p className="text-xs text-danger mt-1">{errors.penName}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
                    Số CMND/CCCD <span className="text-danger">*</span>
                    <HelpTip size="sm" content="Nhập 9 đến 12 chữ số, không nhập khoảng trắng hoặc dấu gạch." />
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={fieldClass('citizenId')}
                    placeholder="079099001125"
                    value={formData.citizenId || ''}
                    onChange={(e) => setField('citizenId', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  />
                  {errors.citizenId && <p className="text-xs text-danger mt-1">{errors.citizenId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Ngày cấp CMND/CCCD <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className={fieldClass('citizenIdIssueDate')}
                    value={toDateInputValue(formData.citizenIdIssueDate)}
                    onChange={(e) => setField('citizenIdIssueDate', e.target.value)}
                  />
                  {errors.citizenIdIssueDate && (
                    <p className="text-xs text-danger mt-1">{errors.citizenIdIssueDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Nơi cấp CMND/CCCD <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={fieldClass('citizenIdIssuePlace')}
                    placeholder="Cục CSQLHC"
                    value={formData.citizenIdIssuePlace || ''}
                    onChange={(e) => setField('citizenIdIssuePlace', e.target.value)}
                  />
                  {errors.citizenIdIssuePlace && (
                    <p className="text-xs text-danger mt-1">{errors.citizenIdIssuePlace}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <AssignedEditorField
                    value={formData.assignedEditorId ?? undefined}
                    onChange={(editorId) => {
                      setField('assignedEditorId', editorId);
                    }}
                    error={errors.assignedEditorId}
                  />
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-5 py-4 border-t border-border-custom bg-bg-primary/95 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Tạo tài khoản
          </button>
        </div>
      </form>
    </AnimatedModal>
  );
};
