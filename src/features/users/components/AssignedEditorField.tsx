import { Loader2 } from 'lucide-react';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { useEditors } from '../hooks/useEditors';

interface AssignedEditorFieldProps {
  value: number | undefined;
  onChange: (editorId: number | undefined) => void;
  error?: string;
  required?: boolean;
}

export const AssignedEditorField = ({
  value,
  onChange,
  error,
  required = true,
}: AssignedEditorFieldProps) => {
  const { data: editors = [], isLoading } = useEditors();

  const options = [
    ...(required ? [] : [{ value: '', label: '— Chưa gán —' }]),
    ...editors.map((editor) => ({
      value: String(editor.id),
      label: editor.fullName
        ? `${editor.fullName}${editor.email ? ` (${editor.email})` : ''}`
        : editor.email ?? `Editor #${editor.id}`,
    })),
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        Biên tập viên phụ trách
        {required && <span className="text-danger"> *</span>}
      </label>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted py-2">
          <Loader2 size={16} className="animate-spin" />
          Đang tải danh sách Editor...
        </div>
      ) : editors.length === 0 ? (
        <p className="text-xs text-warning py-2">
          Chưa có Editor Active. Tạo tài khoản Editor trước khi gán cho Mangaka.
        </p>
      ) : (
        <CustomSelect
          options={options}
          value={value != null ? String(value) : ''}
          onChange={(val) => onChange(val ? Number(val) : undefined)}
          className="w-full"
          placeholder="Chọn Editor phụ trách"
        />
      )}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
      <p className="text-xs text-text-muted mt-1.5">
        Mọi Series của Mangaka sẽ tự động gán cho Editor này khi nộp duyệt.
      </p>
    </div>
  );
};
