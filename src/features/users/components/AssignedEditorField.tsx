import { Loader2 } from 'lucide-react';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { HelpTip } from '../../../components/common/HelpTip';
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
    ...(required ? [] : [{ value: '', label: 'Chưa gán' }]),
    ...editors.map((editor) => ({
      value: String(editor.id),
      label: editor.fullName
        ? `${editor.fullName}${editor.email ? ` (${editor.email})` : ''}`
        : editor.email ?? `Biên tập viên #${editor.id}`,
    })),
  ];

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5">
        Biên tập viên phụ trách
        {required && <span className="text-danger">*</span>}
        <HelpTip
          size="sm"
          content="Mọi bộ truyện của tác giả sẽ tự động gán cho biên tập viên này khi tác giả nộp duyệt."
        />
      </label>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted py-2">
          <Loader2 size={16} className="animate-spin" />
          Đang tải danh sách biên tập viên...
        </div>
      ) : editors.length === 0 ? (
        <p className="text-xs text-warning py-2">
          Chưa có biên tập viên đang hoạt động. Hãy tạo tài khoản biên tập viên trước.
        </p>
      ) : (
        <CustomSelect
          options={options}
          value={value != null ? String(value) : ''}
          onChange={(val) => onChange(val ? Number(val) : undefined)}
          className="w-full"
          placeholder="Chọn biên tập viên phụ trách"
        />
      )}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
};
