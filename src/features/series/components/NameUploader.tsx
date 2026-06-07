import { Upload, FileText, X } from 'lucide-react';

interface NameUploaderProps {
  nameFile: File | null;
  nameFileName: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onOpenFilePicker: () => void;
}

export const NameUploader = ({
  nameFile,
  nameFileName,
  fileInputRef,
  onFileChange,
  onRemoveFile,
  onOpenFilePicker,
}: NameUploaderProps) => {
  return (
    <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={16} className="text-brand" />
        <h2 className="text-sm font-semibold text-text-primary">Bản phác thảo (Name) <span className="text-danger">*</span></h2>
      </div>
      <p className="text-xs text-text-muted mb-4">
        Upload bản phác thảo storyboard (PDF) để Editor đánh giá trước khi submit xét duyệt.
      </p>

      <div
        onClick={onOpenFilePicker}
        className={`
          relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300
          border-2 border-dashed bg-bg-surface
          ${nameFile
            ? 'border-success/30 hover:border-success/50'
            : 'border-border-custom hover:border-brand/30'
          }
        `}
      >
        {nameFile ? (
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{nameFileName}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {`${(nameFile.size / (1024 * 1024)).toFixed(2)} MB — PDF`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-lg bg-success/10 text-success text-[10px] font-semibold">
                ✓ Đã upload
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile();
                }}
                className="w-8 h-8 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-8 flex flex-col items-center justify-center gap-3 text-text-muted group-hover:text-brand/70 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center">
              <Upload size={22} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Kéo thả hoặc click để upload file PDF</p>
              <p className="text-xs mt-1 text-text-muted">Chỉ chấp nhận PDF (tối đa 20MB)</p>
            </div>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
};
