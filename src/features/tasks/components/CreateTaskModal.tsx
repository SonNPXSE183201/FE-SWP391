import { useState, useMemo } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, X, Send, Calendar, DollarSign, AlertCircle,
  BookOpen, FileText, Shield, Banknote, Loader2,
  CheckCircle2, Type, Image, Wallet, UserCheck,
} from 'lucide-react';
import { useWallet, formatVND, formatVNDInput, parseVND } from '../../wallet';
import { getWalletLockedAmount } from '../../wallet';
import { useMySeries, useChapters, useChapterPages } from '../../series';
import { useSeriesActiveTeam } from '../../series/hooks/useSeriesTeam';
import { taskApi } from '../api/task.api';
import type { ApiResponse } from '../../../api/axios';
import type { TasksDto } from '../../../api/generated/types';
import { CustomDatePicker } from '../../../components/common/CustomDatePicker';
import { HelpTip } from '../../../components/common/HelpTip';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { TEAM_ROLES, TeamRole } from '../../series/constants/teamRoles';
import { ACCEPTANCE_CRITERIA_TEMPLATES } from '../constants/acceptanceTemplates';

// ─── Types ───────────────────────────────────────────────────
interface CreateTaskFormData {
  seriesId: string;
  chapterId: string;
  pageId: string;
  taskName: string;
  acceptanceCriteria: string;
  amount: string;
  deadline: string;
  note: string;
  assistantId: string;
  regionId?: string | number;
}

interface CreateTaskFormErrors {
  seriesId?: string;
  chapterId?: string;
  pageId?: string;
  taskName?: string;
  acceptanceCriteria?: string;
  amount?: string;
  deadline?: string;
  assistantId?: string;
}

export interface TaskContext {
  seriesId: string;
  chapterId: string;
  pageId: string;
  taskName: string;
  regionId?: string | number;
}

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated?: () => void;
  initialContext: TaskContext; // Bắt buộc phải có
}

const AMOUNT_PRESETS = [100000, 200000, 350000, 500000];

const parseCriteriaItems = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- [ ] ') || line.startsWith('- [x] '))
    .map((line) => line.replace(/^- \[[ x]\]\s*/, '').trim())
    .filter(Boolean);

const buildCriteriaMarkdown = (items: string[]) =>
  items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- [ ] ${item}`)
    .join('\n');

// ─── Component ───────────────────────────────────────────────
export const CreateTaskModal = ({ onClose, onTaskCreated, initialContext }: CreateTaskModalProps) => {
  const queryClient = useQueryClient();
  const initialAcceptanceTemplate = ACCEPTANCE_CRITERIA_TEMPLATES[initialContext.taskName as TeamRole] ?? '';
  const [formData, setFormData] = useState<CreateTaskFormData>({
    seriesId: initialContext.seriesId,
    chapterId: initialContext.chapterId,
    pageId: initialContext.pageId,
    taskName: initialContext.taskName || '',
    acceptanceCriteria: initialAcceptanceTemplate,
    amount: '',
    deadline: '',
    note: '',
    assistantId: '',
    regionId: initialContext.regionId,
  });
  const [criteriaItems, setCriteriaItems] = useState<string[]>(() => parseCriteriaItems(initialAcceptanceTemplate));
  const [errors, setErrors] = useState<CreateTaskFormErrors>({});
  const [success, setSuccess] = useState(false);

  // ─── Data Hooks ────────────────────────────────────────────
  const { data: walletData } = useWallet();
  const wallet = walletData?.wallet;

  const { data: seriesList = [] } = useMySeries({ pageSize: 100 });
  const { data: chaptersList = [] } = useChapters(formData.seriesId, { pageSize: 100 });
  const { data: pagesList = [] } = useChapterPages(formData.chapterId);
  const { data: activeTeam = [], isLoading: teamLoading } = useSeriesActiveTeam(formData.seriesId);



  const availablePages = pagesList;

  const amountNum = Number(formData.amount) || 0;

  // Calculate how the lock will split between SF and WB (Rule F03)
  const lockBreakdown = useMemo(() => {
    if (amountNum <= 0 || !wallet) return { sf: 0, wb: 0, insufficient: false };

    const availableSF = (wallet.setupFundBalance ?? 0) - getWalletLockedAmount(wallet);
    const sfPortion = Math.min(amountNum, Math.max(0, availableSF));
    const wbPortion = amountNum - sfPortion;
    const insufficient = wbPortion > (wallet.withdrawableBalance ?? 0);

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

    if (!formData.taskName) {
      newErrors.taskName = 'Vui lòng chọn Kỹ thuật vẽ (Tên công việc)';
    }
    if (criteriaItems.filter((item) => item.trim()).length === 0) {
      newErrors.acceptanceCriteria = 'Vui lòng thêm ít nhất 1 tiêu chí nghiệm thu';
    }
    if (!formData.amount || amountNum <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    } else if (amountNum < 50000) {
      newErrors.amount = 'Số tiền tối thiểu 50.000 ₫';
    } else if (lockBreakdown.insufficient) {
      newErrors.amount = 'Số dư ví không đủ để khoá';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Vui lòng chọn hạn chót';
    } else if (formData.deadline < minDeadline) {
      newErrors.deadline = 'Hạn chót phải từ ngày mai trở đi';
    }
    if (!formData.assistantId) {
      newErrors.assistantId = 'Phải chọn Trợ lý trong nhóm dự án';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Update field helper ───────────────────────────────────
  const updateField = <K extends keyof CreateTaskFormData>(field: K, value: CreateTaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateCriteriaItems = (items: string[]) => {
    setCriteriaItems(items);
    updateField('acceptanceCriteria', buildCriteriaMarkdown(items));
  };

  const handleCriteriaChange = (index: number, value: string) => {
    updateCriteriaItems(criteriaItems.map((item, i) => (i === index ? value : item)));
  };

  const handleAddCriteria = () => {
    updateCriteriaItems([...criteriaItems, '']);
  };

  const handleRemoveCriteria = (index: number) => {
    updateCriteriaItems(criteriaItems.filter((_, i) => i !== index));
  };

  const handleRoleChange = (role: TeamRole) => {
    updateField('taskName', role);
    if (!formData.acceptanceCriteria || formData.acceptanceCriteria === '' || Object.values(ACCEPTANCE_CRITERIA_TEMPLATES).includes(formData.acceptanceCriteria)) {
      const template = ACCEPTANCE_CRITERIA_TEMPLATES[role];
      setCriteriaItems(parseCriteriaItems(template));
      updateField('acceptanceCriteria', template);
    }
  };

  // ─── Submit Mutation ────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async () => {
      let finalRegionId: number;

      if (formData.regionId != null && formData.regionId !== '') {
        const parsed = Number(formData.regionId);
        finalRegionId = Number.isNaN(parsed) ? 1 : parsed;
      } else {
        throw new Error('Không tìm thấy vùng hợp lệ. Bạn phải khoanh vùng trên khung vẽ trước khi tạo công việc.');
      }

      const res = await taskApi.create({
        regionId: finalRegionId,
        description: formData.taskName + (formData.note ? `\\n\\nGhi chú thêm:\\n${formData.note}` : ''),
        acceptanceCriteria: formData.acceptanceCriteria,
        assistantId: Number(formData.assistantId),
        paymentAmount: amountNum,
        deadline: new Date(formData.deadline + 'T23:59:59Z').toISOString(),
      });
      const resData = res.data as ApiResponse<TasksDto>;
      if (!resData?.success) throw new Error(resData?.message || 'Lỗi tạo công việc');
      return resData.data;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success(`Đã giao việc cho Trợ lý & khoá ${formatVND(amountNum)}`, { duration: 4000 });
      // Invalidate all task-related queries so every page sees the new task
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      // Invalidate canvas regions so the "Đã gán task" badge updates
      queryClient.invalidateQueries({ queryKey: ['canvas', 'regions'] });
      setTimeout(() => { onTaskCreated?.(); onClose(); }, 800);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Có lỗi xảy ra khi tạo công việc');
    }
  });

  const handleCreate = () => {
    if (!validate()) return;
    createMutation.mutate();
  };

  // ─── Success Overlay ───────────────────────────────────────
  if (success) {
    return (
      <AnimatedModal
        open
        onClose={() => {}}
        closeOnBackdrop={false}
        panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-lg-custom p-12 flex flex-col items-center gap-4"
      >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-bounce">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Đã giao việc!</h3>
          <p className="text-sm text-text-muted text-center">
            Khoá <span className="text-text-primary font-semibold">{formatVND(amountNum)}</span> · Trợ lý sẽ nhận thông báo
          </p>
      </AnimatedModal>
    );
  }

  // ─── Reusable field label ──────────────────────────────────
  const inputBase =
    'w-full px-3.5 py-2.5 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15 transition-all';

  return (
    <AnimatedModal
      open
      onClose={onClose}
      backdropClassName="absolute inset-0 bg-black/70 backdrop-blur-sm"
      panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-lg-custom flex flex-col overflow-hidden"
    >

        {/* ─── Header ─── */}
        <div className="relative px-6 py-4 border-b border-border-custom flex items-center justify-between bg-gradient-to-r from-brand/10 via-brand/[0.04] to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center shadow-brand">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-text-primary">Đăng việc mới</h2>
                <HelpTip
                  size="sm"
                  title="Giao việc trong nhóm dự án"
                  content={<>Chỉ có thể giao việc cho <strong>trợ lý thuộc nhóm bộ truyện</strong>. Mời thành viên tại trang chi tiết bộ truyện trước khi giao việc.</>}
                />
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Chọn trợ lý trong nhóm, khoá tiền rồi giao việc
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">

          {/* ─── Two columns: form | lock preview ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5 items-start">

            {/* Left column — context + inputs */}
            <div className="space-y-3">
              {/* Context card */}
              <div className="relative overflow-hidden rounded-xl border border-border-custom bg-bg-surface p-3.5">
                <span className="absolute left-0 top-0 h-full w-1 bg-brand/70" />
                <div className="flex items-center gap-2 pl-1">
                  <BookOpen size={15} className="text-brand" />
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {seriesList.find((s) => String(s.id) === formData.seriesId)?.title || 'Đang tải...'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 pl-1 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <FileText size={13} /> {chaptersList.find((c) => String(c.id) === formData.chapterId)?.title || 'Đang tải...'}
                  </span>
                  <span className="text-text-muted">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Image size={13} /> Trang {availablePages.find((p) => String(p.id) === formData.pageId)?.pageNumber || '...'}
                  </span>
                </div>
                {initialContext.taskName && (
                  <div className="mt-3 pt-3 border-t border-border-custom flex items-center gap-2.5 pl-1">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Type size={15} className="text-brand" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-text-muted uppercase tracking-wide">Tên công việc (từ khung vẽ)</span>
                      <span className="text-sm font-semibold text-text-primary truncate">{initialContext.taskName}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Work name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-2">
                  <Type size={13} />
                  Kỹ thuật vẽ (Tên công việc) <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TEAM_ROLES.map((role) => (
                    <label
                      key={role}
                      className={`flex items-center justify-center py-2 px-3 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors ${
                        formData.taskName === role
                          ? 'bg-brand/10 border-brand/50 text-brand'
                          : 'bg-bg-surface border-border-custom text-text-secondary hover:border-brand/30 hover:bg-brand/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="taskRole"
                        value={role}
                        checked={formData.taskName === role}
                        onChange={() => handleRoleChange(role)}
                        className="sr-only"
                      />
                      {role}
                    </label>
                  ))}
                </div>
                {errors.taskName && <p className="text-[11px] text-danger mt-1">{errors.taskName}</p>}
              </div>

              {/* Acceptance Criteria */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                    <CheckCircle2 size={13} />
                    Tiêu chí nghiệm thu <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.taskName && ACCEPTANCE_CRITERIA_TEMPLATES[formData.taskName as TeamRole]) {
                        const template = ACCEPTANCE_CRITERIA_TEMPLATES[formData.taskName as TeamRole];
                        setCriteriaItems(parseCriteriaItems(template));
                        updateField('acceptanceCriteria', template);
                      }
                    }}
                    disabled={!formData.taskName}
                    className="text-[11px] font-medium text-brand hover:text-brand-hover disabled:text-text-muted disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
                  >
                    Điền lại mẫu
                  </button>
                </div>
                <div className={`rounded-xl border bg-bg-surface/45 p-2.5 space-y-2 ${errors.acceptanceCriteria ? 'border-danger/50' : 'border-border-custom'}`}>
                  {criteriaItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border-custom bg-bg-primary/40 px-3 py-4 text-center">
                      <p className="text-xs text-text-muted">Chọn kỹ thuật để tự động điền mẫu tiêu chí.</p>
                    </div>
                  ) : (
                    criteriaItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="mt-2 h-3.5 w-3.5 rounded-[4px] border-2 border-text-muted/40 shrink-0" />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleCriteriaChange(index, e.target.value)}
                          placeholder="Nhập tiêu chí nghiệm thu..."
                          className="flex-1 px-3 py-2 bg-bg-primary border border-border-custom rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/15 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCriteria(index)}
                          className="mt-0.5 w-8 h-8 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 bg-transparent border-none cursor-pointer transition-colors flex items-center justify-center shrink-0"
                          aria-label="Xóa tiêu chí"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={handleAddCriteria}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-brand/35 bg-brand/5 text-xs font-medium text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    Thêm tiêu chí
                  </button>
                </div>
                {errors.acceptanceCriteria && <p className="text-[11px] text-danger mt-1">{errors.acceptanceCriteria}</p>}
              </div>



              {/* Assistant picker: chỉ thành viên đang hoạt động trong nhóm bộ truyện */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  <UserCheck size={13} />
                  Trợ lý phụ trách <span className="text-danger">*</span>
                </label>
                {teamLoading ? (
                  <div className="flex items-center gap-2 text-xs text-text-muted py-2">
                    <Loader2 size={14} className="animate-spin" /> Đang tải nhóm dự án...
                  </div>
                ) : activeTeam.length === 0 ? (
                  <p className="text-[11px] text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
                    Chưa có trợ lý đang hoạt động trong nhóm. Vào trang bộ truyện để mời thành viên trước khi giao việc.
                  </p>
                ) : (
                  <CustomSelect
                    options={(() => {
                      if (!formData.taskName) {
                        return activeTeam.map((m) => ({
                          value: String(m.assistantId),
                          label: m.assistantName ?? 'Chưa rõ'
                        }));
                      }
                      // Strict filter: only show assistants who have this role
                      const matches = activeTeam.filter(m => m.roleInTeam?.includes(formData.taskName));

                      return matches.map((m) => ({
                        value: String(m.assistantId),
                        label: m.assistantName ?? 'Chưa rõ'
                      }));
                    })()}
                    value={formData.assistantId}
                    onChange={(val) => updateField('assistantId', val)}
                    placeholder="-- Chọn trợ lý --"
                    error={!!errors.assistantId}
                  />
                )}
                {errors.assistantId && <p className="text-[11px] text-danger mt-1">{errors.assistantId}</p>}
              </div>

              {/* Deadline */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  <Calendar size={13} />
                  Hạn chót <span className="text-danger">*</span>
                </label>
                <CustomDatePicker
                  value={formData.deadline}
                  onChange={(v) => updateField('deadline', v)}
                  min={minDeadline}
                  error={!!errors.deadline}
                />
                {errors.deadline && <p className="text-[11px] text-danger mt-1">{errors.deadline}</p>}
              </div>

              {/* Note */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  <FileText size={13} />
                  Ghi chú <span className="text-text-muted font-normal">(không bắt buộc)</span>
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => updateField('note', e.target.value)}
                  placeholder="Mô tả yêu cầu chi tiết cho trợ lý..."
                  rows={3}
                  className={`${inputBase} border-border-custom resize-none`}
                />
              </div>
            </div>

            {/* Right column — wallet lock preview & extra fields */}
            <div className="space-y-3">
              {/* Amount */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  <DollarSign size={13} />
                  Số tiền (VND) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatVNDInput(formData.amount)}
                    onChange={(e) => {
                      const digits = parseVND(e.target.value);
                      updateField('amount', digits ? String(digits) : '');
                    }}
                    placeholder="350.000"
                    className={`${inputBase} pr-12 text-base font-semibold ${errors.amount ? 'border-danger/50' : 'border-border-custom'}`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium pointer-events-none">VND</span>
                </div>
                {errors.amount && <p className="text-[11px] text-danger mt-1">{errors.amount}</p>}
                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {AMOUNT_PRESETS.map((v) => {
                    const active = amountNum === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => updateField('amount', String(v))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-brand/15 border-brand/50 text-brand'
                            : 'bg-bg-surface border-border-custom text-text-secondary hover:border-brand/40 hover:text-brand'
                        }`}
                      >
                        {v.toLocaleString('vi-VN')}
                      </button>
                    );
                  })}
                </div>
              </div>
              {amountNum > 0 ? (
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                    <AlertCircle size={15} className="text-warning" />
                    Xem trước khoá tiền
                    <HelpTip
                      className="ml-auto"
                      size="sm"
                      placement="bottom-end"
                      title="Lưu ý khoá tiền"
                      content="Tiền sẽ bị khoá ngay khi đăng việc. Chỉ hoàn lại khi công việc bị huỷ (mở khoá)."
                    />
                  </p>

                  <div className="space-y-2">
                    {lockBreakdown.sf > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-info flex items-center gap-1.5">
                          <Shield size={12} /> Quỹ sản xuất
                        </span>
                        <span className="text-xs font-semibold text-info">-{formatVND(lockBreakdown.sf)}</span>
                      </div>
                    )}
                    {lockBreakdown.wb > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-success flex items-center gap-1.5">
                          <Banknote size={12} /> Quỹ khả dụng
                        </span>
                        <span className="text-xs font-semibold text-success">-{formatVND(lockBreakdown.wb)}</span>
                      </div>
                    )}
                    <div className="border-t border-border-custom pt-2 flex items-center justify-between">
                      <span className="text-xs text-text-secondary font-medium">Tổng khoá</span>
                      <span className={`text-base font-bold ${lockBreakdown.insufficient ? 'text-danger' : 'text-text-primary'}`}>
                        {formatVND(amountNum)}
                      </span>
                    </div>
                  </div>

                  {!lockBreakdown.insufficient && (
                    <div className="bg-bg-secondary rounded-lg p-3 space-y-1.5">
                      <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Số dư sau khoá</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-info flex items-center gap-1.5"><Shield size={11} /> Quỹ sản xuất</span>
                        <span className="text-[11px] font-semibold text-text-secondary">
                          {formatVND((wallet?.setupFundBalance || 0) - lockBreakdown.sf)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-success flex items-center gap-1.5"><Banknote size={11} /> Quỹ khả dụng</span>
                        <span className="text-[11px] font-semibold text-text-secondary">
                          {formatVND((wallet?.withdrawableBalance || 0) - lockBreakdown.wb)}
                        </span>
                      </div>
                    </div>
                  )}

                  {lockBreakdown.insufficient && (
                    <div className="bg-danger/5 border border-danger/20 rounded-lg p-2.5">
                      <p className="text-[11px] text-danger font-medium leading-relaxed">
                        ⚠ Số dư không đủ. Quỹ sản xuất còn: {formatVND(Math.max(0, (wallet?.setupFundBalance ?? 0) - (wallet ? getWalletLockedAmount(wallet) : 0)))}, Quỹ khả dụng còn: {formatVND((wallet?.withdrawableBalance ?? 0))}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="min-h-[160px] rounded-xl border border-dashed border-border-custom bg-bg-surface/40 flex flex-col items-center justify-center gap-2.5 text-center p-6">
                  <div className="w-11 h-11 rounded-full bg-bg-surface flex items-center justify-center">
                    <Wallet size={20} className="text-text-muted" />
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Nhập số tiền để xem trước<br />khoản khoá từ ví của bạn
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="px-6 py-3.5 border-t border-border-custom flex items-center justify-between gap-4 bg-bg-secondary rounded-b-2xl">
          <div className="text-[11px] text-text-muted space-y-0.5 hidden sm:block">
            <p className="flex items-center gap-1.5">
              <Shield size={10} className="text-info" />
              Quỹ sản xuất: <span className="text-text-secondary font-medium">{formatVND(wallet?.setupFundBalance || 0)}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Banknote size={10} className="text-success" />
              Quỹ khả dụng: <span className="text-text-secondary font-medium">{formatVND(wallet?.withdrawableBalance || 0)}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || lockBreakdown.insufficient}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all ${createMutation.isPending || lockBreakdown.insufficient
                ? 'bg-brand/40 text-white/60 cursor-not-allowed'
                : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5'
                }`}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang khoá & đăng...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Xác nhận giao việc
                </>
              )}
            </button>
          </div>
        </div>
    </AnimatedModal>
  );
};
