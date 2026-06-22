import { useState } from 'react';
import { X, Pencil, Loader2 } from 'lucide-react';
import type { components } from '../../../api/generated/schema';
import type { UpdateUserByAdminDto } from '../../../api/generated/types';
import { AssignedEditorField } from './AssignedEditorField';
import { useUpdateUser } from '../hooks/useAdminUsers';

type UserListItem = components['schemas']['UserListItemDto'];

interface EditUserModalProps {
  user: UserListItem;
  onClose: () => void;
}

export const EditUserModal = ({ user, onClose }: EditUserModalProps) => {
  const updateMutation = useUpdateUser();
  const [formData, setFormData] = useState<UpdateUserByAdminDto>({
    email: user.email ?? '',
    fullName: user.fullName ?? '',
    assignedEditorId: user.assignedEditorId ?? undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email?.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    }
    if (!formData.assignedEditorId) {
      newErrors.assignedEditorId = 'Vui lòng chọn Editor phụ trách cho Mangaka';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || user.id == null) return;
    updateMutation.mutate(
      { id: Number(user.id), data: formData },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-primary w-full max-w-md rounded-2xl border border-border-custom shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border-custom bg-bg-secondary/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
              <Pencil size={18} />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Chỉnh sửa Mangaka</h3>
              <p className="text-xs text-text-muted">{user.email}</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`w-full bg-bg-secondary border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand ${errors.email ? 'border-danger' : 'border-border-custom'}`}
              value={formData.email ?? ''}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
            />
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Họ và tên <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`w-full bg-bg-secondary border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand ${errors.fullName ? 'border-danger' : 'border-border-custom'}`}
              value={formData.fullName ?? ''}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
            />
            {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName}</p>}
          </div>

          <AssignedEditorField
            value={formData.assignedEditorId ?? undefined}
            onChange={(editorId) => {
              setFormData({ ...formData, assignedEditorId: editorId });
              setErrors((prev) => ({ ...prev, assignedEditorId: '' }));
            }}
            error={errors.assignedEditorId}
          />

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
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
