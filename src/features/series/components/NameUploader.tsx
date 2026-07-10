import { Upload, FileText, X, Loader2, ExternalLink } from 'lucide-react';
import { NEMU_MANUSCRIPT_LABEL, NEMU_MANUSCRIPT_UPLOAD_HINT, MANUSCRIPT_DROP_HINT, MANUSCRIPT_UPLOADING_LABEL } from '../constants/seriesCopy';

interface NameUploaderProps {
  nameFileUrl: string | null;
  nameFileName: string;
  isUploading: boolean;
  isRemoving: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onOpenFilePicker: () => void;
}

export const NameUploader = ({
  nameFileUrl,
  nameFileName,
  isUploading,
  isRemoving,
  fileInputRef,
  onFileChange,
  onRemoveFile,
  onOpenFilePicker,
}: NameUploaderProps) => {
  const isBusy = isUploading || isRemoving;
  const hasFile = !!nameFileUrl;

  return (
    <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={16} className="text-brand" />
        <h2 className="text-sm font-semibold text-text-primary">{NEMU_MANUSCRIPT_LABEL} <span className="text-danger">*</span></h2>
      </div>
      <p className="text-xs text-text-muted mb-4">{NEMU_MANUSCRIPT_UPLOAD_HINT}</p>

      <div
        onClick={isBusy ? undefined : onOpenFilePicker}
        className={`
          relative rounded-xl overflow-hidden transition-all duration-300
          border-2 border-dashed bg-bg-surface
          ${isBusy ? 'cursor-wait opacity-80' : 'cursor-pointer group'}
          ${hasFile
            ? 'border-success/30 hover:border-success/50'
            : 'border-border-custom hover:border-brand/30'
          }
        `}
      >
        {isUploading ? (
          <div className="px-5 py-8 flex flex-col items-center justify-center gap-3 text-text-muted">
            <Loader2 size={28} className="animate-spin text-brand" />
            <p className="text-sm font-medium">{MANUSCRIPT_UPLOADING_LABEL}</p>
          </div>
        ) : hasFile ? (
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{nameFileName}</p>
              <p className="text-xs text-text-muted mt-0.5">PDF · Đã lưu trên hệ thống</p>
            </div>
            <div className="flex items-center gap-2">
              {nameFileUrl && (
                <a
                  href={nameFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-lg bg-brand/10 hover:bg-brand/20 text-brand flex items-center justify-center transition-colors no-underline"
                  title="Xem / tải PDF"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <span className="px-2 py-1 rounded-lg bg-success/10 text-success text-[10px] font-semibold">
                ✓ Đã upload
              </span>
              <button
                type="button"
                disabled={isRemoving}
                onClick={(e) => {
                  e.stopPropagation();
                  void onRemoveFile();
                }}
                className="w-8 h-8 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center transition-colors border-none cursor-pointer disabled:opacity-50"
              >
                {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-8 flex flex-col items-center justify-center gap-3 text-text-muted group-hover:text-brand/70 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center">
              <Upload size={22} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{MANUSCRIPT_DROP_HINT}</p>
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
        disabled={isBusy}
      />
    </div>
  );
};
