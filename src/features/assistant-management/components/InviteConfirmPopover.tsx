import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  UserCheck,
  UserPlus,
  Loader2,
  CheckCircle2,
  Clock,
  CircleDashed,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { fixMojibake } from '../../../utils/fixMojibake';
import { ROLE_OPTIONS, type TeamRole } from '../../series/constants/teamRoles';
import { useMySeries } from '../../series/hooks/useSeries';
import {
  useInviteSeriesAssistant,
  useSeriesTeam,
} from '../../series/hooks/useSeriesTeam';
import type { AssistantBrowseItem } from '../../series/types/assistantBrowse.types';
import { splitTags } from '../../series/utils/assistantInvite.utils';
import {
  getTeamComposition,
  type TeamRoleCompositionItem,
} from '../../series/utils/teamComposition.utils';
import { AssistantAvatar } from './AssistantAvatar';

interface InviteConfirmPopoverProps {
  assistant: AssistantBrowseItem;
  onClose: () => void;
  onSuccess?: () => void;
}

const roleStatusIcon = (status: string) => {
  if (status === 'filled')
    return <CheckCircle2 size={12} className="text-success shrink-0" />;
  if (status === 'pending')
    return <Clock size={12} className="text-warning shrink-0" />;
  return <CircleDashed size={12} className="text-text-muted shrink-0" />;
};

export const InviteConfirmPopover = ({
  assistant,
  onClose,
  onSuccess,
}: InviteConfirmPopoverProps) => {
  const displayName = fixMojibake(assistant.fullName);
  const assistantTags = useMemo(
    () => splitTags(fixMojibake(assistant.specialtyTags)),
    [assistant.specialtyTags],
  );

  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  /* ── data fetching ── */
  const { data: mySeries = [] } = useMySeries();
  const { data: members = [] } = useSeriesTeam(selectedSeriesId || undefined);
  const inviteMutation = useInviteSeriesAssistant(selectedSeriesId || undefined);

  const seriesOptions = useMemo(
    () => mySeries
      .filter((s) => s.status === 'Published')
      .map((s) => ({ value: s.id, label: s.title })),
    [mySeries],
  );

  const composition = useMemo(
    () => getTeamComposition(members),
    [members],
  );

  /* ── member status in selected series ── */
  const memberEntry = useMemo(
    () => members.find((m) => m.assistantId === assistant.id),
    [members, assistant.id],
  );
  
  const currentRoles = useMemo(
    () => {
      if (!memberEntry) return [];
      if (memberEntry.status !== 'Active' && memberEntry.status !== 'Pending') return [];
      return memberEntry.roleInTeam.split(',').map(r => r.trim());
    },
    [memberEntry]
  );

  /* When series changes → auto-pick a smart role */
  useEffect(() => {
    if (!selectedSeriesId) {
      setSelectedRoles([]);
      return;
    }

    // Only pick from roles the user doesn't already have
    const availableItems = composition.items.filter(
      (item) => item.status !== 'filled' && !currentRoles.includes(item.role)
    );

    const matchingMissing = availableItems.find(
      (item) => item.status === 'missing' && assistantTags.includes(item.role)
    );

    if (matchingMissing) {
      setSelectedRoles([matchingMissing.role]);
    } else {
      const nextMissing = availableItems.find((i) => i.status === 'missing');
      const nextPending = availableItems.find((i) => i.status === 'pending');
      const fallback = availableItems[0];
      
      const pickedRole = nextMissing?.role ?? nextPending?.role ?? fallback?.role;
      if (pickedRole) {
        setSelectedRoles([pickedRole]);
      } else {
        setSelectedRoles([]);
      }
    }
  }, [selectedSeriesId, composition, assistantTags, currentRoles]);
  
  const hasSelectedRole = selectedRoles.some(r => currentRoles.includes(r));
  
  const isAlreadyInTeam =
    memberEntry?.status === 'Active' || memberEntry?.status === 'Pending';

  /* ── handlers ── */
  const handleConfirm = async () => {
    if (!selectedSeriesId || selectedRoles.length === 0) return;
    try {
      await inviteMutation.mutateAsync({
        assistantId: assistant.id,
        roleInTeam: selectedRoles.join(', '),
      });
      toast.success(`Đã gửi lời mời ${displayName} vào vai trò ${selectedRoles.join(', ')}`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg || 'Không gửi được lời mời');
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  /* ── role checklist mini ── */
  const renderRoleChecklist = () => {
    if (!selectedSeriesId) return null;

    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
        {composition.items.map((item) => {
          const isMatch = assistantTags.includes(item.role);
          const isSelected = selectedRoles.includes(item.role);
          const isRoleHeld = currentRoles.includes(item.role);
          const isDisabled = item.status === 'filled' || isRoleHeld;

          return (
            <button
              key={item.role}
              type="button"
              onClick={() => {
                if (!isDisabled) {
                  setSelectedRoles((prev) =>
                    prev.includes(item.role)
                      ? prev.filter((r) => r !== item.role)
                      : [...prev, item.role]
                  );
                }
              }}
              disabled={isDisabled}
              className={`flex items-center gap-1.5 text-[11px] py-1.5 px-2 rounded-lg border transition-all text-left cursor-pointer ${
                isSelected
                  ? 'border-brand/40 bg-brand/10 text-brand font-semibold ring-1 ring-brand/20'
                  : isDisabled
                    ? 'border-transparent bg-transparent text-text-muted cursor-not-allowed opacity-60'
                    : 'border-border-custom bg-bg-surface/50 text-text-secondary hover:bg-white/[0.04] hover:text-text-primary hover:border-brand/30'
              }`}
            >
              {roleStatusIcon(item.status)}
              <span className="truncate">{item.role}</span>
              {isMatch && !isDisabled && (
                <Sparkles size={10} className="text-warning shrink-0 ml-auto" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Popover card */}
      <div
        className="relative w-full max-w-3xl min-h-[500px] flex flex-col bg-bg-secondary border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label={`Mời ${displayName}`}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06] rounded-t-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <AssistantAvatar
                name={displayName}
                avatarUrl={assistant.avatarUrl}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Mời tham gia team bộ truyện
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/8 bg-transparent border-none cursor-pointer transition-colors"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>

          {/* Skill tags */}
          {assistantTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {assistantTags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    selectedRoles.includes(tag)
                      ? 'bg-success/15 text-success ring-1 ring-success/25'
                      : 'bg-brand/10 text-brand'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 flex-1">
          {/* Series picker */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
              <BookOpen size={13} />
              Bộ truyện
            </label>
            {seriesOptions.length > 0 ? (
              <CustomSelect
                options={seriesOptions}
                value={selectedSeriesId}
                onChange={setSelectedSeriesId}
                placeholder="Chọn bộ truyện..."
                searchPlaceholder="Tìm kiếm bộ truyện..."
                icon={<BookOpen size={14} />}
                searchable
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border-custom bg-bg-surface/50 px-4 py-3 text-center">
                <p className="text-sm font-medium text-text-secondary mb-1">Không có dự án nào khả dụng</p>
                <p className="text-xs text-text-muted">Chỉ bộ truyện đang xuất bản mới có thể tuyển trợ lý.</p>
              </div>
            )}
          </div>

          {/* Role picker + checklist */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
              <UserCheck size={13} />
              Chọn vai trò
              {selectedSeriesId && (
                <span className="text-text-muted font-normal ml-auto">
                  {composition.filledCount}/{composition.totalRoles} đã có
                </span>
              )}
            </label>
            {renderRoleChecklist()}
          </div>

          {/* Status hint */}
          {hasSelectedRole ? (
            <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2.5 text-xs text-warning">
              <Clock size={13} className="shrink-0" />
              Trợ lý đã đảm nhận các vai trò này trong team.
            </div>
          ) : isAlreadyInTeam ? (
            <div className="flex items-center gap-2 rounded-xl bg-info/10 px-3 py-2.5 text-xs text-info">
              <CheckCircle2 size={13} className="shrink-0" />
              Trợ lý đang ở trong team. Vai trò mới sẽ được bổ sung ngay.
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] bg-bg-primary/30 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-text-secondary bg-transparent border border-white/[0.08] hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={
                !selectedSeriesId ||
                selectedRoles.length === 0 ||
                inviteMutation.isPending ||
                hasSelectedRole
              }
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-none transition-all ${
                !selectedSeriesId || selectedRoles.length === 0 || hasSelectedRole
                  ? 'bg-bg-surface text-text-muted cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand to-brand-hover text-white cursor-pointer hover:shadow-brand hover:-translate-y-0.5 disabled:opacity-60'
              }`}
            >
              {inviteMutation.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <UserPlus size={15} />
              )}
              {inviteMutation.isPending ? 'Đang gửi...' : 'Xác nhận mời'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
