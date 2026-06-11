import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  Plus, X, Send, Calendar, DollarSign, AlertCircle,
  BookOpen, FileText, Shield, Banknote, Loader2,
  CheckCircle2, Type, Image, Globe,
} from 'lucide-react';
import { formatVND, MOCK_WALLET, MOCK_TRANSACTIONS } from '../../wallet';
import { MOCK_TASKS } from '../data/mockData';
import type { MockTask } from '../data/mockData';
import { MOCK_SERIES, MOCK_CHAPTERS } from '../../series';
import { CustomSelect } from '../../../components/common/CustomSelect';
import type { SelectOption } from '../../../components/common/CustomSelect';

// ─── Mock Pages (will come from API later) ──────────────────
// Hierarchy: Series → Chapter → Page → Region → Task (ERD)
const MOCK_PAGES: Record<string, { id: string; pageNumber: number }[]> = {
  'ch-4': Array.from({ length: 28 }, (_, i) => ({ id: `pg-4-${i + 1}`, pageNumber: i + 1 })),
  'ch-3': Array.from({ length: 26 }, (_, i) => ({ id: `pg-3-${i + 1}`, pageNumber: i + 1 })),
  'ch-2': Array.from({ length: 22 }, (_, i) => ({ id: `pg-2-${i + 1}`, pageNumber: i + 1 })),
  'ch-7': Array.from({ length: 24 }, (_, i) => ({ id: `pg-7-${i + 1}`, pageNumber: i + 1 })),
  'ch-5': Array.from({ length: 20 }, (_, i) => ({ id: `pg-5-${i + 1}`, pageNumber: i + 1 })),
  'ch-8': Array.from({ length: 22 }, (_, i) => ({ id: `pg-8-${i + 1}`, pageNumber: i + 1 })),
  'ch-6': Array.from({ length: 18 }, (_, i) => ({ id: `pg-6-${i + 1}`, pageNumber: i + 1 })),
  'ch-1': Array.from({ length: 24 }, (_, i) => ({ id: `pg-1-${i + 1}`, pageNumber: i + 1 })),
};

// ─── Types ───────────────────────────────────────────────────
interface CreateTaskFormData {
  seriesId: string;
  chapterId: string;
  pageId: string;
  taskName: string;
  amount: string;
  deadline: string;
  note: string;
}

interface CreateTaskFormErrors {
  seriesId?: string;
  chapterId?: string;
  pageId?: string;
  taskName?: string;
  amount?: string;
  deadline?: string;
}

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated?: (task: MockTask) => void;
}

// ─── Component ───────────────────────────────────────────────
export const CreateTaskModal = ({ onClose, onTaskCreated }: CreateTaskModalProps) => {
  const [formData, setFormData] = useState<CreateTaskFormData>({
    seriesId: '',
    chapterId: '',
    pageId: '',
    taskName: '',
    amount: '',
    deadline: '',
    note: '',
  });
  const [errors, setErrors] = useState<CreateTaskFormErrors>({});
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  // ─── Derived Data ──────────────────────────────────────────

  const availableChapters = useMemo(
    () => formData.seriesId
      ? MOCK_CHAPTERS.filter((ch) => ch.seriesId === formData.seriesId)
      : [],
    [formData.seriesId],
  );

  const availablePages = useMemo(
    () => formData.chapterId ? (MOCK_PAGES[formData.chapterId] || []) : [],
    [formData.chapterId],
  );

  const selectedPage = useMemo(
    () => availablePages.find((p) => p.id === formData.pageId),
    [formData.pageId, availablePages],
  );

  // ─── SelectOption arrays for CustomSelect ──────────────────
  const seriesOptions: SelectOption[] = useMemo(
    () => MOCK_SERIES
      .filter((s) => s.status !== 'Cancelled' && s.status !== 'Draft')
      .map((s) => ({ value: s.id, label: s.title })),
    [],
  );

  const chapterOptions: SelectOption[] = useMemo(
    () => availableChapters.map((ch) => ({
      value: ch.id,
      label: `Ch.${ch.chapterNumber}: ${ch.title}`,
    })),
    [availableChapters],
  );

  const pageOptions: SelectOption[] = useMemo(
    () => availablePages.map((p) => ({ value: p.id, label: `Trang ${p.pageNumber}` })),
    [availablePages],
  );

  const amountNum = Number(formData.amount) || 0;

  // Calculate how the lock will split between SF and WB (Rule F03)
  const lockBreakdown = useMemo(() => {
    if (amountNum <= 0) return { sf: 0, wb: 0, insufficient: false };

    const availableSF = MOCK_WALLET.setupFundBalance - MOCK_WALLET.lockedAmount;
    const sfPortion = Math.min(amountNum, Math.max(0, availableSF));
    const wbPortion = amountNum - sfPortion;
    const insufficient = wbPortion > MOCK_WALLET.withdrawableBalance;

    return { sf: sfPortion, wb: wbPortion, insufficient };
  }, [amountNum]);

  // Minimum deadline is tomorrow
  const minDeadline = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  // ─── Validation ────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: CreateTaskFormErrors = {};

    if (!formData.seriesId) newErrors.seriesId = 'Vui lòng chọn Series';
    if (!formData.chapterId) newErrors.chapterId = 'Vui lòng chọn Chapter';
    if (!formData.pageId) newErrors.pageId = 'Vui lòng chọn trang';
    if (!formData.taskName || formData.taskName.trim().length < 3) {
      newErrors.taskName = 'Tên task phải có ít nhất 3 ký tự';
    }
    if (!formData.amount || amountNum <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    } else if (amountNum < 50000) {
      newErrors.amount = 'Số tiền tối thiểu 50,000₫';
    } else if (lockBreakdown.insufficient) {
      newErrors.amount = 'Số dư ví không đủ để Lock';
    }
    if (!formData.deadline) newErrors.deadline = 'Vui lòng chọn deadline';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Update field helper ───────────────────────────────────
  const updateField = <K extends keyof CreateTaskFormData>(field: K, value: CreateTaskFormData[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'seriesId') { next.chapterId = ''; next.pageId = ''; }
      if (field === 'chapterId') { next.pageId = ''; }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ─── Submit Handler ────────────────────────────────────────
  const handleCreate = async () => {
    if (!validate()) return;

    setCreating(true);
    await new Promise((r) => setTimeout(r, 1500));

    const page = availablePages.find((p) => p.id === formData.pageId)!;
    const chapter = availableChapters.find((ch) => ch.id === formData.chapterId)!;
    const series = MOCK_SERIES.find((s) => s.id === formData.seriesId)!;

    const taskId = `task-${Date.now()}`;
    const newTask: MockTask = {
      id: taskId,
      taskName: formData.taskName.trim(),
      regionId: '',        // Sẽ gắn khi tạo từ Canvas (chọn Region trước)
      regionLabel: '',
      pageId: formData.pageId,
      pageName: `Trang ${page.pageNumber}`,
      chapterId: formData.chapterId,
      chapterTitle: `Ch.${chapter.chapterNumber}: ${chapter.title}`,
      seriesId: formData.seriesId,
      seriesTitle: series.title,
      assignedAssistantName: null,  // Đăng lên Bảng việc làm, chờ Assistant nhận
      status: 'Pending',
      amount: amountNum,
      deadline: new Date(formData.deadline + 'T23:59:59Z').toISOString(),
      extensionUsed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ─── Mock Lock Funds (T01 + F03) ───────────────────────
    const { sf, wb } = lockBreakdown;
    MOCK_WALLET.setupFundBalance -= sf;
    MOCK_WALLET.withdrawableBalance -= wb;
    MOCK_WALLET.lockedAmount += amountNum;

    const refCode = `TASK-${String(MOCK_TASKS.length + 1).padStart(3, '0')}`;
    MOCK_TRANSACTIONS.unshift({
      id: `tx-${Date.now()}`,
      type: 'Lock',
      amount: -amountNum,
      setupFundAmount: sf > 0 ? -sf : 0,
      withdrawableAmount: wb > 0 ? -wb : 0,
      referenceId: taskId,
      referenceCode: refCode,
      description: `Lock tiền cho Task: ${formData.taskName.trim()} → Bảng việc làm${wb > 0 ? ' (SF thiếu → WB bù)' : ''}`,
      createdAt: new Date().toISOString(),
    });

    MOCK_TASKS.push(newTask);
    onTaskCreated?.(newTask);

    setCreating(false);
    setSuccess(true);

    toast.success(
      `Đã đăng Task "${newTask.taskName}" lên Bảng việc làm & Lock ${formatVND(amountNum)}`,
      { duration: 4000 },
    );

    setTimeout(() => { onClose(); }, 800);
  };

  // ─── Success Overlay ───────────────────────────────────────
  if (success) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-lg-custom animate-scale-in p-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-bounce">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Đã đăng lên Bảng việc làm!</h3>
          <p className="text-sm text-text-muted text-center">
            Lock <span className="text-text-primary font-semibold">{formatVND(amountNum)}</span> · Chờ Trợ lý nhận việc
          </p>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-lg-custom animate-scale-in max-h-[90vh] overflow-y-auto">

        {/* ─── Header ─── */}
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between sticky top-0 bg-bg-secondary z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Plus size={18} className="text-brand" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Đăng việc mới</h2>
              <p className="text-[11px] text-text-muted">Đăng việc → Lock tiền → Chờ Trợ lý nhận (T01)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* ─── Form ─── */}
        <div className="p-6 space-y-5">

          {/* Task Queue info banner */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-info/5 border border-info/20 rounded-lg">
            <Globe size={14} className="text-info flex-shrink-0" />
            <p className="text-[11px] text-info">
              Task sẽ được đăng lên <strong>Bảng việc làm công khai</strong>. Bất kỳ Trợ lý nào đều có thể nhận việc.
            </p>
          </div>

          {/* ─── Series + Chapter (Cascade Row 1) ─── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <BookOpen size={12} />
                Series <span className="text-danger">*</span>
              </label>
              <CustomSelect
                options={seriesOptions}
                value={formData.seriesId}
                onChange={(v) => updateField('seriesId', v)}
                placeholder="Chọn series..."
                error={!!errors.seriesId}
                icon={<BookOpen size={14} />}
              />
              {errors.seriesId && <p className="text-[11px] text-danger mt-1">{errors.seriesId}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <FileText size={12} />
                Chapter <span className="text-danger">*</span>
              </label>
              <CustomSelect
                options={chapterOptions}
                value={formData.chapterId}
                onChange={(v) => updateField('chapterId', v)}
                placeholder={formData.seriesId ? 'Chọn chapter...' : 'Chọn series trước'}
                disabled={!formData.seriesId}
                error={!!errors.chapterId}
                icon={<FileText size={14} />}
              />
              {errors.chapterId && <p className="text-[11px] text-danger mt-1">{errors.chapterId}</p>}
            </div>
          </div>

          {/* ─── Page Selection ─── */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
              <Image size={12} />
              Trang (Page) <span className="text-danger">*</span>
            </label>
            <CustomSelect
              options={pageOptions}
              value={formData.pageId}
              onChange={(v) => updateField('pageId', v)}
              placeholder={formData.chapterId ? 'Chọn trang...' : 'Chọn chapter trước'}
              disabled={!formData.chapterId}
              error={!!errors.pageId}
              icon={<Image size={14} />}
            />
            {errors.pageId && <p className="text-[11px] text-danger mt-1">{errors.pageId}</p>}
            {selectedPage && formData.chapterId && (
              <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                <FileText size={10} />
                Trang {selectedPage.pageNumber} · {availableChapters.find((ch) => ch.id === formData.chapterId)?.title}
              </p>
            )}
          </div>

          {/* Task Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
              <Type size={12} />
              Tên Task <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.taskName}
              onChange={(e) => updateField('taskName', e.target.value)}
              placeholder="VD: Vẽ nền trang 5, Tô bóng nhân vật chính..."
              maxLength={100}
              className={`w-full px-3 py-2.5 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all ${
                errors.taskName ? 'border-danger/50' : 'border-border-custom'
              }`}
            />
            {errors.taskName && <p className="text-[11px] text-danger mt-1">{errors.taskName}</p>}
            <p className="text-[10px] text-text-muted mt-1 text-right">{formData.taskName.length}/100</p>
          </div>

          {/* Amount + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <DollarSign size={12} />
                Số tiền (VND) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                placeholder="350,000"
                min="50000"
                step="10000"
                className={`w-full px-3 py-2.5 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all ${
                  errors.amount ? 'border-danger/50' : 'border-border-custom'
                }`}
              />
              {errors.amount && <p className="text-[11px] text-danger mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <Calendar size={12} />
                Deadline <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
                min={minDeadline}
                className={`w-full px-3 py-2.5 bg-bg-surface border rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all ${
                  errors.deadline ? 'border-danger/50' : 'border-border-custom'
                }`}
              />
              {errors.deadline && <p className="text-[11px] text-danger mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => updateField('note', e.target.value)}
              placeholder="Mô tả yêu cầu chi tiết cho Assistant..."
              rows={2}
              className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all resize-none"
            />
          </div>

          {/* ─── Wallet Lock Preview (Rule F03) ─── */}
          {amountNum > 0 && (
            <div className="bg-bg-surface border border-border-custom rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <AlertCircle size={13} className="text-warning" />
                Xem trước Lock tiền (T01)
              </p>

              <div className="space-y-2">
                {lockBreakdown.sf > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-info flex items-center gap-1">
                      <Shield size={11} /> Quỹ sản xuất (SF)
                    </span>
                    <span className="text-[11px] font-semibold text-info">-{formatVND(lockBreakdown.sf)}</span>
                  </div>
                )}
                {lockBreakdown.wb > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-success flex items-center gap-1">
                      <Banknote size={11} /> Quỹ khả dụng (WB)
                    </span>
                    <span className="text-[11px] font-semibold text-success">-{formatVND(lockBreakdown.wb)}</span>
                  </div>
                )}
                <div className="border-t border-border-custom pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-text-secondary font-medium">Tổng Lock</span>
                  <span className={`text-xs font-bold ${lockBreakdown.insufficient ? 'text-danger' : 'text-text-primary'}`}>
                    {formatVND(amountNum)}
                  </span>
                </div>
              </div>

              {!lockBreakdown.insufficient && (
                <div className="bg-bg-secondary rounded-lg p-2.5 space-y-1">
                  <p className="text-[10px] text-text-muted font-medium">Số dư sau Lock:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-info flex items-center gap-1"><Shield size={9} /> SF</span>
                    <span className="text-[10px] font-semibold text-text-secondary">
                      {formatVND(MOCK_WALLET.setupFundBalance - lockBreakdown.sf)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-success flex items-center gap-1"><Banknote size={9} /> WB</span>
                    <span className="text-[10px] font-semibold text-text-secondary">
                      {formatVND(MOCK_WALLET.withdrawableBalance - lockBreakdown.wb)}
                    </span>
                  </div>
                </div>
              )}

              {lockBreakdown.insufficient && (
                <div className="bg-danger/5 border border-danger/20 rounded-lg p-2">
                  <p className="text-[10px] text-danger font-medium">
                    ⚠ Số dư không đủ. SF còn: {formatVND(Math.max(0, MOCK_WALLET.setupFundBalance - MOCK_WALLET.lockedAmount))}, WB còn: {formatVND(MOCK_WALLET.withdrawableBalance)}
                  </p>
                </div>
              )}

              {!lockBreakdown.insufficient && (
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-2">
                  <p className="text-[10px] text-warning font-medium">
                    Tiền sẽ bị khoá ngay khi đăng Task. Chỉ hoàn lại khi Task bị hủy (Unlock).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="px-6 py-4 border-t border-border-custom flex items-center justify-between sticky bottom-0 bg-bg-secondary rounded-b-2xl">
          <div className="text-[10px] text-text-muted space-y-0.5">
            <p className="flex items-center gap-1">
              <Shield size={9} className="text-info" />
              SF: <span className="text-text-secondary font-medium">{formatVND(MOCK_WALLET.setupFundBalance)}</span>
            </p>
            <p className="flex items-center gap-1">
              <Banknote size={9} className="text-success" />
              WB: <span className="text-text-secondary font-medium">{formatVND(MOCK_WALLET.withdrawableBalance)}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || lockBreakdown.insufficient}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
                creating || lockBreakdown.insufficient
                  ? 'bg-brand/40 text-white/60 cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5'
              }`}
            >
              {creating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Đang Lock & đăng...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Đăng lên Bảng việc làm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
