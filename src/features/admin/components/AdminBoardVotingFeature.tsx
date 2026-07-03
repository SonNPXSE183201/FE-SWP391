import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Loader2,
  Save,
  Vote,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Clock,
  Percent,
  Users,
  Settings2,
  Inbox,
  Crown,
  RefreshCw,
  Sparkles,
  Radio,
  UserX,
  Scale,
  ArrowRight,
  CircleDot,
} from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import { showAppError, showAppSuccess } from '../../../utils/appToast';
import {
  useBoardMembers,
  useBoardVotingConfig,
  useBoardVotingRules,
  useEscalatedVotes,
  useManualResolveVote,
  useUpdateBoardVotingConfig,
} from '../hooks/useBoardVotingAdmin';
import type { BoardVotingConfigDto } from '../api/boardVoting.api';
import { formatVND } from '../../../utils/currency';
import { calcBoardVotesRequired, calcEffectiveThresholdPercent } from '../../voting/voting.utils';

const PRESETS = [
  { label: 'Đa số đơn giản (51%)', approve: 51 },
  { label: 'Siêu đa số (~66%)', approve: 66 },
  { label: 'Khó duyệt (75%)', approve: 75 },
] as const;

const MIN_BOARD_MEMBERS = 3;



const calcRequired = calcBoardVotesRequired;

const inputClass =
  'w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border-custom text-sm text-text-primary focus:outline-none focus:border-brand/50 transition-colors';

export const AdminBoardVotingFeature = () => {
  const { data: config, isLoading, isFetching: configFetching } = useBoardVotingConfig();
  const { data: liveRules, isFetching: rulesFetching } = useBoardVotingRules();
  const {
    data: boardMembers = [],
    isLoading: boardMembersLoading,
    isFetching: membersFetching,
  } = useBoardMembers();
  const { data: escalated = [], isLoading: escalatedLoading } = useEscalatedVotes();
  const updateConfig = useUpdateBoardVotingConfig();
  const resolveVote = useManualResolveVote();

  const [form, setForm] = useState<BoardVotingConfigDto | null>(null);
  const [configSnapshot, setConfigSnapshot] = useState<BoardVotingConfigDto | null | undefined>(undefined);
  const [resolveTarget, setResolveTarget] = useState<{ id: number; title: string } | null>(null);
  const [resolveApproved, setResolveApproved] = useState(true);
  const [resolveReason, setResolveReason] = useState('');
  const [resolveBudget, setResolveBudget] = useState(0);

  if (config !== configSnapshot) {
    setConfigSnapshot(config ?? null);
    setForm(config ?? null);
  }

  // Gỡ Chủ tịch khỏi form khi TV đã bị khóa / không còn trong danh sách active
  useEffect(() => {
    if (!form?.chairUserId || boardMembersLoading) return;
    const stillActive = boardMembers.some((m) => Number(m.id) === form.chairUserId);
    if (stillActive) return;

    const serverChairActive =
      config?.chairUserId != null &&
      boardMembers.some((m) => Number(m.id) === config.chairUserId);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync chair when member list changes
    setForm((prev) =>
      prev
        ? {
            ...prev,
            chairUserId: serverChairActive ? config!.chairUserId! : null,
            chairUserName: serverChairActive ? (config!.chairUserName ?? undefined) : undefined,
            chairIsValid: serverChairActive ? config?.chairIsValid : true,
            chairInvalidWarning: serverChairActive ? config?.chairInvalidWarning : undefined,
          }
        : prev,
    );
  }, [boardMembers, boardMembersLoading, form?.chairUserId, config]);

  const boardCount = liveRules?.boardMemberCount ?? 6;
  const selectedChair = useMemo(() => {
    if (!form?.chairUserId) return null;
    return boardMembers.find((m) => Number(m.id) === form.chairUserId) ?? null;
  }, [boardMembers, form]);

  const chairSelectionInvalid = useMemo(() => {
    if (!form?.chairUserId) return false;
    return !boardMembers.some((m) => Number(m.id) === form.chairUserId);
  }, [form, boardMembers]);

  const preview = useMemo(() => {
    if (!form) return null;
    const chairWeight = liveRules?.chairWeight ?? (boardCount % 2 === 0 ? 2 : 3);
    const totalWeight = liveRules?.totalWeight ?? chairWeight + boardCount - 1;
    const approveReq = liveRules?.approveRequired ?? calcRequired(totalWeight, form.approvalThresholdPercent);
    const chairIsValid = liveRules?.chairIsValid !== false && !chairSelectionInvalid;
    const chairLabel = chairIsValid
      ? (selectedChair?.fullName ?? liveRules?.chairUserName ?? form.chairUserName)
      : undefined;
    return { approveReq, totalWeight, chairWeight, chairLabel, chairIsValid };
  }, [form, boardCount, selectedChair, liveRules, chairSelectionInvalid]);

  const chairWarning =
    liveRules?.chairInvalidWarning ??
    (form?.chairIsValid === false ? form.chairInvalidWarning : null) ??
    (chairSelectionInvalid
      ? `Chủ tịch đã chọn (${form?.chairUserName ?? `#${form?.chairUserId}`}) không còn là thành viên HĐ đang hoạt động. Khóa tài khoản sẽ tự gỡ Chủ tịch — vui lòng chọn người khác.`
      : null);

  const isLiveSyncing = configFetching || rulesFetching || membersFetching;

  const hasUnsavedChanges = useMemo(() => {
    if (!config || !form) return false;
    return (
      config.approvalThresholdPercent !== form.approvalThresholdPercent ||
      config.autoResolveHours !== form.autoResolveHours ||
      config.clearVotesOnResubmit !== form.clearVotesOnResubmit ||
      (config.chairUserId ?? null) !== (form.chairUserId ?? null)
    );
  }, [config, form]);

  const chairMode = useMemo(() => {
    if (chairSelectionInvalid || liveRules?.chairIsValid === false) return 'invalid' as const;
    if (selectedChair) return 'assigned' as const;
    return 'none' as const;
  }, [chairSelectionInvalid, liveRules?.chairIsValid, selectedChair]);

  const approveEffectivePercent = preview
    ? calcEffectiveThresholdPercent(preview.approveReq, preview.totalWeight)
    : 0;

  const handleChairSelect = (memberId: number | null, memberName?: string) => {
    if (!form) return;
    const isDeselect = memberId !== null && form.chairUserId === memberId;
    setForm({
      ...form,
      chairUserId: isDeselect ? null : memberId,
      chairUserName: isDeselect ? undefined : memberName,
    });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (form.chairUserId && chairSelectionInvalid) {
      showAppError('Chủ tịch HĐ phải là thành viên đang hoạt động (Active).');
      return;
    }
    try {
      await updateConfig.mutateAsync({
        autoResolveHours: form.autoResolveHours,
        approvalThresholdPercent: form.approvalThresholdPercent,
        clearVotesOnResubmit: form.clearVotesOnResubmit,
        chairUserId: form.chairUserId ?? null,
      });
      showAppSuccess('Đã lưu cấu hình biểu quyết.');
    } catch {
      showAppError('Lưu cấu hình thất bại.');
    }
  };

  const handleManualResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget || !resolveReason.trim()) return;
    try {
      await resolveVote.mutateAsync({
        seriesId: String(resolveTarget.id),
        dto: {
          approved: resolveApproved,
          reason: resolveReason.trim(),
          approvedBudget: resolveApproved ? resolveBudget : undefined,
        },
      });
      showAppSuccess('Đã ghi nhận quyết định thủ công.');
      setResolveTarget(null);
      setResolveReason('');
    } catch {
      showAppError('Quyết định thủ công thất bại.');
    }
  };

  if (isLoading || !form || !preview) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex flex-wrap items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Vote size={20} className="text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="page-header__title">Cấu hình biểu quyết Hội đồng</h1>
              <HelpTip
                content={
                  <>
                    <p className="mb-2">Thiết lập quy tắc tự động khi Hội đồng vote series.</p>
                    <ul className="list-disc pl-4 space-y-1 text-text-muted">
                      <li>Đủ % phiếu → duyệt hoặc từ chối ngay</li>
                      <li>Hòa → theo chính sách bạn chọn</li>
                      <li>Hết giờ → hệ thống tự chốt</li>
                    </ul>
                  </>
                }
                title="Trang này dùng để làm gì?"
                ariaLabel="Giải thích trang cấu hình"
                placement="bottom-start"
                width="20rem"
              />
            </div>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Trọng số tự điều chỉnh theo số TV HĐ đang Active. Khóa tài khoản → danh sách và quy tắc cập nhật realtime.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-medium ${
                  isLiveSyncing
                    ? 'bg-brand/10 text-brand border-brand/25'
                    : 'bg-success/10 text-success border-success/20'
                }`}
              >
                <Radio size={10} className={isLiveSyncing ? 'animate-pulse' : ''} />
                {isLiveSyncing ? 'Đang đồng bộ…' : 'Đồng bộ realtime'}
              </span>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-medium">
                  <CircleDot size={10} />
                  Có thay đổi chưa lưu
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {boardCount < MIN_BOARD_MEMBERS && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-danger/30 bg-danger/10 text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-danger" />
          <div>
            <p className="font-medium text-danger">Hội đồng chưa đủ thành viên</p>
            <p className="text-xs text-danger/90 mt-1 leading-relaxed">
              Cần ít nhất {MIN_BOARD_MEMBERS} TV HĐ Active để biểu quyết. Hiện có {boardCount} — mở khóa hoặc thêm tài khoản Board tại{' '}
              <Link to="/admin/users" className="underline font-medium hover:text-danger">
                Quản lý người dùng
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {chairWarning && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-200">
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-medium text-amber-100">Chủ tịch Hội đồng không hợp lệ</p>
            <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">{chairWarning}</p>
          </div>
        </div>
      )}

      {!chairWarning && chairMode === 'none' && boardCount >= MIN_BOARD_MEMBERS && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-brand/25 bg-brand/5 text-sm">
          <Scale size={18} className="shrink-0 mt-0.5 text-brand" />
          <div>
            <p className="font-medium text-text-primary">Chưa chỉ định Chủ tịch HĐ</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Mọi TV đang được tính <strong className="text-text-secondary">1 phiếu</strong> khi vote. Chọn Chủ tịch bên dưới để áp dụng trọng số cao hơn ({preview.chairWeight} phiếu với {boardCount} TV).
            </p>
          </div>
        </div>
      )}

      {!chairWarning && chairMode === 'assigned' && selectedChair && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-success/25 bg-success/5 text-sm">
          <Crown size={18} className="shrink-0 mt-0.5 text-amber-400" />
          <div className="min-w-0">
            <p className="font-medium text-text-primary">
              Chủ tịch: <span className="text-amber-300">{selectedChair.fullName}</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              Trọng số {preview.chairWeight} phiếu · TV thường 1 phiếu · Tổng {preview.totalWeight} trọng số
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-bg-secondary border border-border-custom rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Users size={17} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-text-primary leading-none">{boardCount}</p>
            <p className="text-[11px] text-text-muted mt-1">TV HĐ Active</p>
            <p className="text-[10px] text-text-muted/80 mt-0.5 truncate">Không tính tài khoản khóa</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
            <CheckCircle size={17} />
          </div>
          <div>
            <p className="text-lg font-bold text-success leading-none">
              {preview.approveReq}/{preview.totalWeight}
            </p>
            <p className="text-[11px] text-text-muted mt-1">Trọng số cần duyệt</p>
            <p className="text-[10px] text-success/80 mt-0.5">≈ {approveEffectivePercent}% tổng</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Scale size={17} />
          </div>
          <div>
            <p className="text-lg font-bold text-brand leading-none">{preview.totalWeight}</p>
            <p className="text-[11px] text-text-muted mt-1">Tổng trọng số</p>
            <p className="text-[10px] text-text-muted/80 mt-0.5">Luôn lẻ — không hòa</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Crown size={17} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-amber-300 leading-none">{preview.chairWeight}</p>
            <p className="text-[11px] text-text-muted mt-1">Trọng số Chủ tịch</p>
            <p className="text-[10px] text-text-muted/80 mt-0.5 truncate" title={preview.chairLabel ?? undefined}>
              {chairMode === 'assigned' && preview.chairLabel
                ? preview.chairLabel
                : chairMode === 'none'
                  ? 'Chưa chỉ định'
                  : 'Cần chọn lại'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSaveConfig} className="xl:col-span-3 space-y-4">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Quy tắc tự động</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        approvalThresholdPercent: preset.approve,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border-custom bg-bg-primary text-text-muted hover:text-brand hover:border-brand/30 cursor-pointer transition-colors"
                  >
                    <Sparkles size={10} className="inline mr-1 -mt-px" />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Percent size={12} className="text-success" />
                  % phiếu Đồng ý để duyệt
                </span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.approvalThresholdPercent}
                  onChange={(e) =>
                    setForm({ ...form, approvalThresholdPercent: Number(e.target.value) })
                  }
                  className={inputClass}
                />
                <span className="text-[11px] text-text-muted">
                  Hiện tại: cần <strong className="text-success">{preview.approveReq}</strong> trọng số / {preview.totalWeight}
                </span>
              </label>

              <label className="block space-y-1.5 sm:col-span-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Clock size={12} className="text-brand" />
                  Tự chốt sau (giờ)
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.autoResolveHours}
                  onChange={(e) => setForm({ ...form, autoResolveHours: Number(e.target.value) })}
                  className={inputClass}
                />
                <span className="text-[11px] text-text-muted">
                  Quá hạn mà chưa đủ ngưỡng → hệ thống tự kết thúc
                </span>
              </label>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-bg-primary border border-brand/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Crown size={14} className="text-amber-400" />
                  <span className="text-sm font-medium text-text-primary">Chủ tịch Hội đồng</span>
                  <HelpTip
                    content={
                      <>
                        <p className="mb-2">Chỉ hiển thị TV HĐ đang <strong>Active</strong>.</p>
                        <ul className="list-disc pl-4 space-y-1 text-text-muted">
                          <li>Khóa tài khoản → tự biến mất khỏi danh sách</li>
                          <li>Khóa Chủ tịch → hệ thống tự gỡ vai trò</li>
                          <li>Click lại TV đã chọn để bỏ chỉ định</li>
                        </ul>
                      </>
                    }
                    title="Chủ tịch HĐ"
                    size="sm"
                    ariaLabel="Giải thích Chủ tịch Hội đồng"
                  />
                </div>
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline"
                >
                  <UserX size={11} />
                  Quản lý / khóa TV
                  <ArrowRight size={11} />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-bg-secondary border border-border-custom text-text-muted">
                  {boardMembers.length} TV có thể chọn
                </span>
                <span className="text-[11px] text-text-muted">
                  CT = {preview.chairWeight} phiếu · TV thường = 1 · Tổng {preview.totalWeight}
                </span>
              </div>

                {boardMembersLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin text-brand" size={20} />
                  </div>
                ) : boardMembers.length === 0 ? (
                  <div className="text-center py-6 px-3 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5">
                    <UserX size={22} className="mx-auto text-amber-400 mb-2" />
                    <p className="text-xs font-medium text-amber-200">Không có TV HĐ Active</p>
                    <p className="text-[11px] text-text-muted mt-1">
                      Mở khóa tài khoản Board tại{' '}
                      <Link to="/admin/users" className="text-brand underline">
                        Quản lý người dùng
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChairSelect(null)}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                        !form.chairUserId
                          ? 'border-brand/50 bg-brand/10 ring-1 ring-brand/25'
                          : 'border-border-custom bg-bg-secondary hover:border-brand/25'
                      }`}
                    >
                      <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-bg-surface">
                        <Users size={14} className="text-text-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">Không chỉ định</p>
                        <p className="text-[11px] text-text-muted">Mọi TV = 1 phiếu khi vote</p>
                      </div>
                    </button>

                    {boardMembers.map((member) => {
                      const memberId = Number(member.id);
                      const selected = form.chairUserId === memberId;
                      const voteWeight = selected && chairMode !== 'invalid' ? preview.chairWeight : 1;
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleChairSelect(memberId, member.fullName ?? undefined)}
                          className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                            selected
                              ? 'border-amber-400/60 bg-amber-500/10 ring-1 ring-amber-400/30'
                              : 'border-border-custom bg-bg-secondary hover:border-amber-400/25'
                          }`}
                        >
                          <div
                            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                              selected ? 'bg-amber-500/20' : 'bg-bg-surface'
                            }`}
                          >
                            <Crown
                              size={14}
                              className={selected ? 'text-amber-400' : 'text-text-muted'}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-sm font-medium text-text-primary truncate">
                                {member.fullName ?? `User #${member.id}`}
                              </p>
                              <span
                                className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  selected
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-bg-surface text-text-muted'
                                }`}
                              >
                                {voteWeight}×
                              </span>
                            </div>
                            <p className="text-[11px] text-text-muted truncate">{member.email}</p>
                            {selected && (
                              <p className="text-[10px] text-amber-400/90 mt-0.5">Click lại để bỏ chọn</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedChair && !chairSelectionInvalid && (
                  <p className="text-xs text-brand flex items-center gap-1.5">
                    <CheckCircle size={13} />
                    Chủ tịch: <strong>{selectedChair.fullName}</strong> · {preview.chairWeight} phiếu
                  </p>
                )}
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.clearVotesOnResubmit
                    ? 'bg-brand/5 border-brand/25'
                    : 'bg-bg-primary border-border-custom'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.clearVotesOnResubmit}
                  onChange={(e) => setForm({ ...form, clearVotesOnResubmit: e.target.checked })}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    <RefreshCw size={13} className="text-brand" />
                    Xóa phiếu khi trình lại
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Editor trình lại Hội đồng → vote từ đầu
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={updateConfig.isPending || !hasUnsavedChanges}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-medium cursor-pointer border-none hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateConfig.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {hasUnsavedChanges ? 'Lưu cấu hình' : 'Đã lưu'}
            </button>
          </div>
        </form>

        {/* Live preview */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 space-y-4 h-full">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Vote size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Xem trước quy tắc</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand/15 text-brand font-medium uppercase tracking-wide">
                  Live
                </span>
                <HelpTip
                  content="Cập nhật theo số TV Active và Chủ tịch hiện tại — HĐ thấy tương tự trên /board/voting sau khi bạn lưu."
                  title="Preview"
                  size="sm"
                  ariaLabel="Giải thích preview"
                />
              </div>
              {isLiveSyncing && (
                <RefreshCw size={14} className="text-brand animate-spin" aria-label="Đang cập nhật" />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/15 font-medium">
                Duyệt ≥{preview.approveReq}/{preview.totalWeight}
                <span className="text-success/70 font-normal">
                  ({form.approvalThresholdPercent}%
                  {approveEffectivePercent !== form.approvalThresholdPercent
                    ? ` → ≥${approveEffectivePercent}%`
                    : ''}
                  )
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-bg-primary text-text-muted border border-border-custom">
                <Users size={10} />
                {boardCount} TV Active
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-medium ${
                  chairMode === 'assigned'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-bg-primary text-text-muted border-border-custom'
                }`}
              >
                <Crown size={10} />
                {chairMode === 'assigned' && preview.chairLabel
                  ? preview.chairLabel
                  : 'Chưa có Chủ tịch'}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-bg-primary border border-border-custom space-y-3 text-sm leading-relaxed text-text-secondary">
              <p>
                Với <strong className="text-text-primary">{boardCount} thành viên</strong> Hội đồng đang Active:
              </p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-success shrink-0 mt-0.5" />
                  <span>
                    Cần <strong className="text-success">{preview.approveReq}/{preview.totalWeight} trọng số Đồng ý</strong>{' '}
                    ({form.approvalThresholdPercent}%) → duyệt cấp vốn
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Crown size={14} className="text-brand shrink-0 mt-0.5" />
                  <span>
                    {chairMode === 'assigned' ? (
                      <>
                        Chủ tịch <strong className="text-amber-300">{preview.chairLabel}</strong> ={' '}
                        {preview.chairWeight} phiếu, TV thường = 1
                      </>
                    ) : (
                      <>
                        Chưa chỉ định Chủ tịch — <strong>mọi TV = 1 phiếu</strong> khi vote
                        {chairMode === 'invalid' && ' (cần chọn Chủ tịch mới)'}
                      </>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock size={14} className="text-brand shrink-0 mt-0.5" />
                  <span>
                    Sau <strong>{form.autoResolveHours} giờ</strong> → phe nhiều hơn thắng
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <UserX size={14} className="text-text-muted shrink-0 mt-0.5" />
                  <span className="text-text-muted">
                    Khóa TV HĐ → tự loại khỏi biểu quyết; trọng số và ngưỡng duyệt tính lại ngay
                  </span>
                </li>
              </ul>
            </div>

            {boardMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-text-secondary">Phân bổ trọng số hiện tại</p>
                <div className="flex flex-wrap gap-1.5">
                  {boardMembers.map((m) => {
                    const id = Number(m.id);
                    const isChair = form.chairUserId === id && chairMode === 'assigned';
                    const w = isChair ? preview.chairWeight : 1;
                    return (
                      <span
                        key={m.id}
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border ${
                          isChair
                            ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                            : 'border-border-custom bg-bg-primary text-text-muted'
                        }`}
                      >
                        {isChair && <Crown size={9} />}
                        <span className="truncate max-w-[8rem]">{m.fullName?.split(' ').pop()}</span>
                        <strong>{w}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg border border-dashed border-border-custom text-[11px] text-text-muted">
              Tổng trọng số luôn lẻ — không hòa phiếu. Ngân sách duyệt = trung bình có trọng số các phiếu Approve.
            </div>
          </div>
        </div>
      </div>

      {/* Escalated queue */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-text-primary">Chờ quyết định thủ công</h2>
            <HelpTip
              content="Series hòa phiếu hoặc không đủ ngưỡng sau khi tất cả HĐ đã vote. Bạn chọn Duyệt/Từ chối và ghi lý do."
              title="Leo thang là gì?"
              size="sm"
              ariaLabel="Giải thích leo thang"
            />
          </div>
          {escalated.length > 0 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400">
              {escalated.length} series
            </span>
          )}
        </div>

        {escalatedLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-brand" size={24} />
          </div>
        ) : escalated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border-custom bg-bg-primary/40">
            <div className="w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center mb-3">
              <Inbox size={22} className="text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary">Không có series chờ xử lý</p>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              Khi Hội đồng hòa phiếu (vd. 3–3), series sẽ xuất hiện ở đây để bạn quyết định.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {escalated.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-bg-primary border border-border-custom hover:border-amber-500/20 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{s.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    #{s.id} · {s.mangakaName ?? 'Mangaka'} · Hòa / chưa đủ ngưỡng
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResolveTarget({ id: s.id!, title: s.title ?? '' });
                    setResolveBudget(s.estimatedProductionBudget ?? 0);
                    setResolveApproved(true);
                    setResolveReason('');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand text-white border-none cursor-pointer hover:opacity-90 shrink-0"
                >
                  Quyết định
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {resolveTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <form
              onSubmit={handleManualResolve}
              className="w-full max-w-md bg-bg-secondary border border-border-custom rounded-xl shadow-2xl animate-fade-in"
            >
              <div className="flex items-start justify-between gap-3 p-5 border-b border-border-custom">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">Quyết định thủ công</p>
                  <h3 className="text-base font-semibold text-text-primary mt-1">{resolveTarget.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolveApproved(true)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                      resolveApproved
                        ? 'bg-success/10 text-success border-success/30'
                        : 'bg-bg-primary text-text-muted border-border-custom'
                    }`}
                  >
                    <CheckCircle size={15} />
                    Phê duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolveApproved(false)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                      !resolveApproved
                        ? 'bg-danger/10 text-danger border-danger/30'
                        : 'bg-bg-primary text-text-muted border-border-custom'
                    }`}
                  >
                    <XCircle size={15} />
                    Từ chối
                  </button>
                </div>

                {resolveApproved && (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-text-secondary">Ngân sách cấp phát</span>
                    <input
                      type="number"
                      value={resolveBudget}
                      onChange={(e) => setResolveBudget(Number(e.target.value))}
                      className={inputClass}
                    />
                    <span className="text-[11px] text-text-muted">{formatVND(resolveBudget)}</span>
                  </label>
                )}

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-text-secondary">
                    Lý do <span className="text-danger">*</span>
                  </span>
                  <textarea
                    value={resolveReason}
                    onChange={(e) => setResolveReason(e.target.value)}
                    rows={3}
                    required
                    className={`${inputClass} resize-none`}
                    placeholder="VD: Hòa 3–3, căn cứ tiềm năng thương mại quyết định duyệt thử 1 mùa..."
                  />
                </label>
              </div>

              <div className="flex gap-2 justify-end p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setResolveTarget(null)}
                  className="px-4 py-2 rounded-lg text-sm text-text-muted bg-bg-primary border border-border-custom cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resolveVote.isPending || !resolveReason.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand text-white border-none cursor-pointer disabled:opacity-50"
                >
                  {resolveVote.isPending ? 'Đang lưu...' : 'Xác nhận quyết định'}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </div>
  );
};
