import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../admin/api/admin.api';
import type { CreateUserByAdminDto } from '../../../api/generated/types';
import { CustomSelect } from '../../../components/common/CustomSelect';

interface CreateUserModalProps {
  onClose: () => void;
}

export const CreateUserModal = ({ onClose }: CreateUserModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateUserByAdminDto>({
    roleId: 4, // Default to Mangaka (4)
    userName: '',
    email: '',
    fullName: '',
    penName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (data: CreateUserByAdminDto) => adminApi.createUser(data),
    onSuccess: (res) => {
      const responseData = res.data as any;
      if (responseData.IsSuccess || responseData.success) {
        toast.success(responseData.Message || responseData.message || 'Tạo người dùng thành công');
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        onClose();
      } else {
        toast.error(responseData.Message || responseData.message || 'Có lỗi xảy ra');
        if (responseData.Errors) {
           const newErrors: Record<string, string> = {};
           Object.keys(responseData.Errors).forEach(k => {
             newErrors[k] = responseData.Errors[k][0];
           });
           setErrors(newErrors);
        }
      }
    },
    onError: (error: any) => {
      const data = error.response?.data;
      if (data?.errors || data?.Errors) {
        const errObj = data.errors || data.Errors;
        const newErrors: Record<string, string> = {};
        Object.keys(errObj).forEach(k => {
          newErrors[k] = errObj[k][0];
        });
        setErrors(newErrors);
        toast.error('Dữ liệu không hợp lệ, vui lòng kiểm tra lại');
      } else {
        const msg = data?.message || data?.Message || 'Có lỗi xảy ra khi tạo người dùng';
        toast.error(msg);
      }
    }
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.userName) {
      newErrors.userName = 'Tên đăng nhập không được để trống';
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.userName)) {
      newErrors.userName = 'Tên đăng nhập chỉ được chứa chữ cái không dấu, số, _ hoặc .';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Họ và tên không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-primary w-full max-w-md rounded-2xl border border-border-custom shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-custom bg-bg-secondary/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
              <UserPlus size={18} />
            </div>
            <h3 className="font-bold text-text-primary">Tạo người dùng mới</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Vai trò <span className="text-danger">*</span>
            </label>
            <CustomSelect
              options={[
                { value: '2', label: 'Editor (Biên tập viên)' },
                { value: '3', label: 'Editorial Board (Hội đồng)' },
                { value: '4', label: 'Mangaka (Tác giả)' },
              ]}
              value={String(formData.roleId)}
              onChange={(val) => {
                setFormData({ ...formData, roleId: Number(val) });
                setErrors((prev) => ({ ...prev, roleId: '' }));
              }}
              className="w-full"
            />
            {errors.roleId && <p className="text-xs text-danger mt-1">{errors.roleId}</p>}
            <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
              <span className="text-brand">*</span>
              Tài khoản Assistant (Trợ lý) phải tự đăng ký trên Landing Page.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`w-full bg-bg-secondary border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand placeholder:text-text-muted/50 ${errors.email ? 'border-danger' : 'border-border-custom'}`}
              placeholder="nguyenvana@gmail.com"
              value={formData.email || ''}
              onChange={(e) => {
                const email = e.target.value;
                setFormData((prev: CreateUserByAdminDto) => {
                  const updated = { ...prev, email: email };
                  if (!prev.userName || prev.userName === (prev.email?.split('@')[0] || '')) {
                    updated.userName = email.split('@')[0] || '';
                  }
                  return updated;
                });
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
            />
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Tên đăng nhập <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`w-full bg-bg-secondary border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand placeholder:text-text-muted/50 ${errors.userName ? 'border-danger' : 'border-border-custom'}`}
              placeholder="nguyenvana"
              value={formData.userName || ''}
              onChange={(e) => {
                setFormData({ ...formData, userName: e.target.value });
                setErrors((prev) => ({ ...prev, userName: '' }));
              }}
            />
            {errors.userName ? (
              <p className="text-xs text-danger mt-1">{errors.userName}</p>
            ) : (
              <p className="text-xs text-text-muted mt-1.5 italic">
                Chỉ chứa chữ cái không dấu, số, _, hoặc .
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Họ và tên <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`w-full bg-bg-secondary border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand placeholder:text-text-muted/50 ${errors.fullName ? 'border-danger' : 'border-border-custom'}`}
              placeholder="Nguyễn Văn A"
              value={formData.fullName || ''}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
            />
            {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName}</p>}
          </div>

          {formData.roleId === 4 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Bút danh (Pen Name)
              </label>
              <input
                type="text"
                className="w-full bg-bg-secondary border border-border-custom rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand placeholder:text-text-muted/50"
                placeholder="Oda Eiichiro"
                value={formData.penName || ''}
                onChange={(e) => setFormData({ ...formData, penName: e.target.value })}
              />
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-custom mt-6">
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
      </div>
    </div>
  );
};
