import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRespondSeriesInvite } from '../hooks/useSeriesTeam';
import { motion } from 'framer-motion';

export const SeriesInviteRespondFeature = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const respond = useRespondSeriesInvite(seriesId);

  const handle = async (accept: boolean) => {
    try {
      await respond.mutateAsync(accept);
      toast.success(accept ? 'Đã tham gia nhóm dự án!' : 'Đã từ chối lời mời.');
      navigate('/assistant/tasks');
    } catch {
      toast.error('Không xử lý được lời mời');
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 p-2 rounded-lg text-text-muted hover:text-text-primary border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="bg-bg-secondary border border-border-custom rounded-2xl p-6 text-center space-y-4">
        <h1 className="text-lg font-bold text-text-primary">Lời mời tham gia dự án</h1>
        <p className="text-sm text-text-secondary">
          Mangaka mời bạn vào nhóm làm việc cố định của bộ truyện. Chấp nhận để nhận Task được giao trực tiếp.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => handle(false)}
            disabled={respond.isPending}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border-custom bg-bg-surface text-sm font-medium cursor-pointer hover:border-danger/40 hover:text-danger disabled:opacity-60"
          >
            {respond.isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            Từ chối
          </button>
          <button
            type="button"
            onClick={() => handle(true)}
            disabled={respond.isPending}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-white text-sm font-semibold border-none cursor-pointer hover:bg-green-600 disabled:opacity-60"
          >
            {respond.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Chấp nhận
          </button>
        </div>
      </div>
    </motion.div>
  );
};
