import { useState } from 'react';
import { useAssistantInvites, type AssistantInviteDto } from '../hooks/useAssistantInvites';
import { useRespondSeriesInvite } from '../../series/hooks/useSeriesTeam';
import { Loader2, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { assistantInvitesKeys } from '../hooks/useAssistantInvites';
import { InviteDetailModal } from './InviteDetailModal';

export const AssistantInvitesFeature = () => {
  const { data: invites = [], isLoading } = useAssistantInvites();
  const queryClient = useQueryClient();
  const [selectedInvite, setSelectedInvite] = useState<AssistantInviteDto | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="bg-bg-secondary border border-dashed border-border-custom rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center mb-4">
          <Clock size={28} className="text-text-muted" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2">Chưa có lời mời nào</h3>
        <p className="text-text-secondary">Bạn hiện không có lời mời tham gia dự án nào chờ xử lý.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invites.map((invite) => (
          <InviteCard
            key={`${invite.seriesId}-${invite.roleInTeam}`}
            invite={invite}
            onViewDetail={() => setSelectedInvite(invite)}
          />
        ))}
      </div>

      {selectedInvite && (
        <InviteDetailModalWrapper
          invite={selectedInvite}
          onClose={() => setSelectedInvite(null)}
        />
      )}
    </div>
  );
};

/** Wrapper that handles the respond mutation for the selected invite */
const InviteDetailModalWrapper = ({
  invite,
  onClose,
}: {
  invite: AssistantInviteDto;
  onClose: () => void;
}) => {
  const respond = useRespondSeriesInvite(invite.seriesId.toString());
  const queryClient = useQueryClient();

  const handleRespond = async (accept: boolean) => {
    try {
      await respond.mutateAsync(accept);
      toast.success(accept ? 'Đã tham gia nhóm dự án!' : 'Đã từ chối lời mời.');
      queryClient.invalidateQueries({ queryKey: assistantInvitesKeys.all });
      onClose();
    } catch {
      toast.error('Không xử lý được lời mời');
    }
  };

  return (
    <InviteDetailModal
      invite={invite}
      onClose={onClose}
      onRespond={handleRespond}
      isPending={respond.isPending}
    />
  );
};

const InviteCard = ({
  invite,
  onViewDetail,
}: {
  invite: AssistantInviteDto;
  onViewDetail: () => void;
}) => {
  const respond = useRespondSeriesInvite(invite.seriesId.toString());
  const queryClient = useQueryClient();

  const handle = async (accept: boolean) => {
    try {
      await respond.mutateAsync(accept);
      toast.success(accept ? 'Đã tham gia nhóm dự án!' : 'Đã từ chối lời mời.');
      queryClient.invalidateQueries({ queryKey: assistantInvitesKeys.all });
    } catch {
      toast.error('Không xử lý được lời mời');
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-custom rounded-2xl p-5 flex flex-col hover:border-brand/30 transition-colors group">
      {/* Clickable content area */}
      <div
        className="flex gap-4 items-start mb-4 cursor-pointer"
        onClick={onViewDetail}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onViewDetail(); }}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-surface shrink-0 ring-1 ring-white/[0.06]">
          {invite.coverUrl ? (
            <img src={invite.coverUrl} alt={invite.seriesTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted font-bold text-xl bg-gradient-to-br from-brand/10 to-info/10">
              {invite.seriesTitle.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text-primary truncate group-hover:text-brand transition-colors" title={invite.seriesTitle}>
            {invite.seriesTitle}
          </h3>
          <p className="text-sm text-brand font-medium mt-1">Vai trò: {invite.roleInTeam}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-text-muted">
              {new Date(invite.createAt).toLocaleDateString('vi-VN')}
            </p>
            {invite.mangakaName && (
              <p className="text-xs text-text-secondary truncate">
                bởi {invite.mangakaName}
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye size={16} className="text-text-muted" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          type="button"
          onClick={() => handle(false)}
          disabled={respond.isPending}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border-custom bg-bg-surface text-sm font-medium cursor-pointer hover:border-danger/40 hover:text-danger transition-colors disabled:opacity-60"
        >
          {respond.isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
          Từ chối
        </button>
        <button
          type="button"
          onClick={() => handle(true)}
          disabled={respond.isPending}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-success text-white text-sm font-semibold border-none cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-60"
        >
          {respond.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          Chấp nhận
        </button>
      </div>
    </div>
  );
};

