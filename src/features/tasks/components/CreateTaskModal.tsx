import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, X, Send, Calendar, DollarSign, AlertCircle,
  BookOpen, FileText, Shield, Banknote, Loader2,
  CheckCircle2, Type, Image, Globe,
} from 'lucide-react';
import { useWallet, formatVND } from '../../wallet';
import { useMySeries, useChapters, useChapterPages } from '../../series';
import { taskApi } from '../api/task.api';
import { CustomDatePicker } from '../../../components/common/CustomDatePicker';

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

export interface TaskContext {
  seriesId: string;
  chapterId: string;
  pageId: string;
  taskName: string;
  regionId?: string;
}

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated?: () => void;
  initialContext: TaskContext; // Bắt buộc phải có
}

// ─── Component ───────────────────────────────────────────────
export const CreateTaskModal = ({ onClose, onTaskCreated, initialContext }: CreateTaskModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateTaskFormData>({
    seriesId: initialContext.seriesId,
    chapterId: initialContext.chapterId,
    pageId: initialContext.pageId,
    taskName: initialContext.taskName || '',
    amount: '',
    deadline: '',
    note: '',
  });
  const [errors, setErrors] = useState<CreateTaskFormErrors>({});
  const [success, setSuccess] = useState(false);

  // ─── Data Hooks ────────────────────────────────────────────
  const { data: walletData } = useWallet();
  const wallet = walletData?.wallet;

  const { data: seriesList = [] } = useMySeries({ pageSize: 100 });
  const { data: chaptersList = [] } = useChapters(formData.seriesId, { pageSize: 100 });
  const { data: pagesList = [] } = useChapterPages(formData.chapterId);


  const availablePages = pagesList;



  const amountNum = Number(formData.amount) || 0;

  // Calculate how the lock will split between SF and WB (Rule F03)
  const lockBreakdown = useMemo(() => {
    if (amountNum <= 0 || !wallet) return { sf: 0, wb: 0, insufficient: false };

    const availableSF = wallet.setupFundBalance - wallet.lockedAmount; // Rough estimation, accurate one needs locked sf/wb breakdown
    const sfPortion = Math.min(amountNum, Math.max(0, availableSF));
    const wbPortion = amountNum - sfPortion;
    const insufficient = wbPortion > wallet.withdrawableBalance;

    return { sf: sfPortion, wb: wbPortion, insufficient };
  }, [amountNum, wallet]);

  // Minimum deadline is tomorrow
  const minDeadline = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  // ─── Validation ────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: CreateTaskFormErrors = {};

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
    if (!formData.deadline) {
      newErrors.deadline = 'Vui lòng chọn deadline';
    } else if (formData.deadline < minDeadline) {
      newErrors.deadline = 'Deadline phải từ ngày mai trở đi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Update field helper ───────────────────────────────────
  const updateField = <K extends keyof CreateTaskFormData>(field: K, value: CreateTaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ─── Submit Mutation ────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async () => {
      let finalRegionId: number;

      if (initialContext.regionId) {
        // Handle mock string ID vs real numeric ID
        const parsed = Number(initialContext.regionId);
        finalRegionId = isNaN(parsed) ? 1 : parsed;
      } else {
        throw new Error('Không tìm thấy Region hợp lệ. Bạn phải khoanh vùng trên Canvas trước khi tạo Task.');
      }

      const res = await taskApi.create({
        RegionId: finalRegionId,
        Description: formData.taskName,
        PaymentAmount: amountNum,
        Deadline: new Date(formData.deadline + 'T23:59:59Z').toISOString(),
      });
      const resData = res.data as {
        success?: boolean;
        IsSuccess?: boolean;
        Message?: string;
        message?: string;
        Data?: unknown;
        data?: unknown;
      };
      if (!resData?.success && !resData?.IsSuccess) throw new Error(resData?.Message || resData?.message || 'Lỗi tạo task');
      return resData?.Data || resData?.data;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success(`Đã đăng Task "${formData.taskName}" lên Bảng việc làm & Lock ${formatVND(amountNum)}`, { duration: 4000 });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setTimeout(() => { onTaskCreated?.(); onClose(); }, 800);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Có lỗi xảy ra khi tạo task');
    }
  });

  const handleCreate = () => {
    if (!validate()) return;
    createMutation.mutate();
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
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-xl shadow-lg-custom animate-scale-in max-h-[95vh] overflow-y-auto">

        {/* ─── Header ─── */}
        <div className="px-5 py-3.5 border-b border-border-custom flex items-center justify-between sticky top-0 bg-bg-secondary z-10 rounded-t-2xl">
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
        <div className="p-5 space-y-3">

          {/* Task Queue info banner */}
          <div className="flex items-center gap-2 px-3 py-2 bg-info/5 border border-info/20 rounded-lg">
            <Globe size={14} className="text-info flex-shrink-0" />
            <p className="text-[11px] text-info">
              Task sẽ được đăng lên <strong>Bảng việc làm công khai</strong>. Bất kỳ Trợ lý nào đều có thể nhận việc.
            </p>
          </div>

          {/* ─── Context Info (Required) ─── */}
          <div className="flex flex-col gap-1.5 p-3 bg-bg-surface border border-border-custom rounded-xl">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-brand" />
              <span className="text-sm font-medium text-text-primary">
                {seriesList.find((s) => s.id === formData.seriesId)?.title || 'Đang tải...'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">
                {chaptersList.find((c) => c.id === formData.chapterId)?.title || 'Đang tải...'}
              </span>
              <span className="text-text-muted text-[10px]">•</span>
              <Image size={14} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">
                Trang {availablePages.find((p) => p.id === formData.pageId)?.pageNumber || 'Đang tải...'}
              </span>
            </div>
            {initialContext.taskName && (
              <div className="mt-2 pt-2 border-t border-border-custom flex items-start gap-2">
                <Type size={14} className="text-brand mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted">Tên Task (từ Canvas)</span>
                  <span className="text-sm font-medium text-text-primary">{initialContext.taskName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Task Name (Only show if not provided by context) */}
          {!initialContext.taskName && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1">
                <Type size={12} />
                Tên Task <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.taskName}
                onChange={(e) => updateField('taskName', e.target.value)}
                placeholder="VD: Vẽ nền trang 5, Tô bóng nhân vật chính..."
                maxLength={100}
                className={`w-full px-3 py-2 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all ${errors.taskName ? 'border-danger/50' : 'border-border-custom'
                  }`}
              />
              {errors.taskName && <p className="text-[11px] text-danger mt-1">{errors.taskName}</p>}
            </div>
          )}

          {/* Amount + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1">
                <DollarSign size={12} />
                Số tiền (VND) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                placeholder="350000"
                className={`w-full px-3 py-2 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all ${errors.amount ? 'border-danger/50' : 'border-border-custom'
                  }`}
              />
              {!errors.amount && formData.amount && (
                <p className="text-[11px] text-brand/80 mt-1 italic font-medium">
                  Hiển thị: {Number(formData.amount).toLocaleString('vi-VN')} ₫
                </p>
              )}
              {errors.amount && <p className="text-[11px] text-danger mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1">
                <Calendar size={12} />
                Deadline <span className="text-danger">*</span>
              </label>
              <CustomDatePicker
                value={formData.deadline}
                onChange={(v) => updateField('deadline', v)}
                min={minDeadline}
                error={!!errors.deadline}
              />
              {errors.deadline && <p className="text-[11px] text-danger mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1">
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => updateField('note', e.target.value)}
              placeholder="Mô tả yêu cầu chi tiết cho Assistant..."
              rows={1}
              className="w-full px-3 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all resize-none"
            />
          </div>

          {/* ─── Wallet Lock Preview (Rule F03) ─── */}
          {amountNum > 0 && (
            <div className="bg-bg-surface border border-border-custom rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <AlertCircle size={13} className="text-warning" />
                Xem trước Lock tiền (T01)
              </p>

              <div className="space-y-1.5">
                {lockBreakdown.sf > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-info flex items-center gap-1">
                      <Shield size={11} /> Quỹ sản xuất
                    </span>
                    <span className="text-[11px] font-semibold text-info">-{formatVND(lockBreakdown.sf)}</span>
                  </div>
                )}
                {lockBreakdown.wb > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-success flex items-center gap-1">
                      <Banknote size={11} /> Quỹ khả dụng
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
                    <span className="text-[10px] text-info flex items-center gap-1"><Shield size={9} /> Quỹ sản xuất</span>
                    <span className="text-[10px] font-semibold text-text-secondary">
                      {formatVND((wallet?.setupFundBalance || 0) - lockBreakdown.sf)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-success flex items-center gap-1"><Banknote size={9} /> Quỹ khả dụng</span>
                    <span className="text-[10px] font-semibold text-text-secondary">
                      {formatVND((wallet?.withdrawableBalance || 0) - lockBreakdown.wb)}
                    </span>
                  </div>
                </div>
              )}

              {lockBreakdown.insufficient && (
                <div className="bg-danger/5 border border-danger/20 rounded-lg p-2">
                  <p className="text-[10px] text-danger font-medium">
                    ⚠ Số dư không đủ. Quỹ sản xuất còn: {formatVND(Math.max(0, (wallet?.setupFundBalance || 0) - (wallet?.lockedAmount || 0)))}, Quỹ khả dụng còn: {formatVND((wallet?.withdrawableBalance || 0))}
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
        <div className="px-5 py-3 border-t border-border-custom flex items-center justify-between sticky bottom-0 bg-bg-secondary rounded-b-2xl">
          <div className="text-[10px] text-text-muted space-y-0.5">
            <p className="flex items-center gap-1">
              <Shield size={9} className="text-info" />
              Quỹ sản xuất: <span className="text-text-secondary font-medium">{formatVND(wallet?.setupFundBalance || 0)}</span>
            </p>
            <p className="flex items-center gap-1">
              <Banknote size={9} className="text-success" />
              Quỹ khả dụng: <span className="text-text-secondary font-medium">{formatVND(wallet?.withdrawableBalance || 0)}</span>
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
              disabled={createMutation.isPending || lockBreakdown.insufficient}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${createMutation.isPending || lockBreakdown.insufficient
                  ? 'bg-brand/40 text-white/60 cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5'
                }`}
            >
              {createMutation.isPending ? (
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
