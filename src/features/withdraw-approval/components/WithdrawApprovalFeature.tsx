import { useMemo, useState } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import {
  ArrowUpFromLine,
  Loader2,
  Search,
  Clock,
  User,
  Building2,
  CreditCard,
  Hash,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { usePendingWithdrawals } from '../hooks/usePendingWithdrawals';
import { useApproveWithdraw } from '../hooks/useApproveWithdraw';
import type { PendingWithdrawal } from '../types/withdrawApproval.types';
import { formatVND } from '../../wallet';
import { formatTransactionDateTime } from '../../wallet';
import { getRequesterRoleLabel, getRequesterRoleStyle } from '../utils/withdrawApproval.utils';
import {
  MotionStagger,
  MotionItem,
  MotionTableRow,
  containerVariants,
  listItemVariants,
} from '../../../components/common/animation';
import { motion } from 'framer-motion';

const displayUser = (tx: PendingWithdrawal) =>
  tx.toUserFullName || tx.fromUserFullName || tx.toUserName || tx.fromUserName || `User #${tx.toUserId ?? tx.fromUserId ?? '—'}`;

export const WithdrawApprovalFeature = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PendingWithdrawal | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [noteError, setNoteError] = useState(false);

  const { data: withdrawals = [], isLoading, isError, error, refetch, isFetching } = usePendingWithdrawals();
  const approveMutation = useApproveWithdraw();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return withdrawals;
    return withdrawals.filter((tx) =>
      displayUser(tx).toLowerCase().includes(q)
      || getRequesterRoleLabel(tx).toLowerCase().includes(q)
      || (tx.bankAccountNumber ?? '').toLowerCase().includes(q)
      || (tx.bankName ?? '').toLowerCase().includes(q),
    );
  }, [withdrawals, search]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0),
    [filtered],
  );

  const closeModal = () => {
    setSelected(null);
    setAdminNote('');
    setNoteError(false);
  };

  const submitDecision = (isApproved: boolean) => {
    if (!selected?.id) return;
    const note = adminNote.trim();
    if (!note) {
      setNoteError(true);
      return;
    }
    setNoteError(false);
    approveMutation.mutate(
      { transactionId: selected.id, isApproved, adminNote: note },
      { onSuccess: () => closeModal() },
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
            <ArrowUpFromLine size={20} className="text-danger" />
          </div>
          <div>
            <h1 className="page-header__title">Duyệt rút tiền</h1>
            <p className="page-header__subtitle">Phê duyệt hoặc từ chối yêu cầu rút tiền từ Tác giả / Trợ lý</p>
          </div>
        </div>
      </div>

      <MotionStagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MotionItem>
        <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-4 h-full">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Chờ duyệt</span>
          <p className="text-2xl font-bold text-text-primary mt-1">{filtered.length}</p>
        </div>
        </MotionItem>
        <MotionItem>
        <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-4 h-full">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Tổng tiền chờ</span>
          <p className="text-lg font-bold text-danger mt-1">{formatVND(totalAmount)}</p>
        </div>
        </MotionItem>
        <MotionItem>
        <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-4 h-full">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Trạng thái</span>
          <p className="text-sm font-medium text-warning mt-2 flex items-center gap-2">
            <Clock size={14} />
            {isFetching ? 'Đang cập nhật...' : 'Chờ duyệt — Quản trị viên'}
          </p>
        </div>
        </MotionItem>
      </MotionStagger>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên, vai trò, ngân hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-4 py-2.5 text-sm font-medium rounded-xl border border-border-custom bg-bg-secondary hover:bg-bg-surface text-text-secondary cursor-pointer disabled:opacity-50"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Loader2 size={28} className="animate-spin text-brand mb-3" />
            <span className="text-sm">Đang tải yêu cầu rút tiền...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-danger text-sm mb-3">{error?.message || 'Lỗi tải dữ liệu'}</p>
            <button type="button" onClick={() => refetch()} className="text-sm text-brand hover:underline cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <ArrowUpFromLine size={36} className="opacity-30 mb-3" />
            <p className="text-sm">Không có yêu cầu rút tiền nào đang chờ duyệt</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-custom text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-5 py-4 font-medium">Người yêu cầu</th>
                  <th className="px-5 py-4 font-medium">Vai trò</th>
                  <th className="px-5 py-4 font-medium">Số tiền</th>
                  <th className="px-5 py-4 font-medium">Ngân hàng</th>
                  <th className="px-5 py-4 font-medium">Thời gian</th>
                  <th className="px-5 py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <motion.tbody
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {filtered.map((tx) => (
                  <MotionTableRow
                    key={tx.id}
                    variants={listItemVariants}
                    className="border-b border-border-custom/60 hover:bg-bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-text-muted shrink-0" />
                        <span className="font-medium text-text-primary">{displayUser(tx)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRequesterRoleStyle(tx)}`}>
                        {getRequesterRoleLabel(tx)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-danger">{formatVND(Math.abs(tx.amount ?? 0))}</td>
                    <td className="px-5 py-4 text-text-secondary">{tx.bankName || '—'}</td>
                    <td className="px-5 py-4 text-text-muted text-xs whitespace-nowrap">
                      {tx.createAt ? formatTransactionDateTime(tx.createAt) : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(tx);
                          setAdminNote('');
                          setNoteError(false);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20 cursor-pointer"
                      >
                        Xem & duyệt
                      </button>
                    </td>
                  </MotionTableRow>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <AnimatedModal open onClose={closeModal} panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-lg-custom">
            <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Chi tiết yêu cầu rút tiền</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {displayUser(selected)} · {getRequesterRoleLabel(selected)}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="w-8 h-8 rounded-lg bg-bg-surface hover:bg-bg-primary flex items-center justify-center text-text-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center py-2">
                <p className="text-3xl font-bold font-mono text-danger">{formatVND(Math.abs(selected.amount ?? 0))}</p>
                <p className="text-xs text-text-muted mt-1">Số tiền yêu cầu rút</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 py-2 border-b border-border-custom/50">
                  <span className="flex items-center gap-2 text-text-muted"><User size={14} /> Người yêu cầu</span>
                  <span className="text-text-primary font-medium text-right">{displayUser(selected)}</span>
                </div>
                <div className="flex justify-between gap-4 py-2 border-b border-border-custom/50">
                  <span className="flex items-center gap-2 text-text-muted"><User size={14} /> Vai trò</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRequesterRoleStyle(selected)}`}>
                    {getRequesterRoleLabel(selected)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 py-2 border-b border-border-custom/50">
                  <span className="flex items-center gap-2 text-text-muted"><Building2 size={14} /> Ngân hàng</span>
                  <span className="text-text-primary text-right">{selected.bankName || '—'}</span>
                </div>
                <div className="flex justify-between gap-4 py-2 border-b border-border-custom/50">
                  <span className="flex items-center gap-2 text-text-muted"><CreditCard size={14} /> Số tài khoản</span>
                  <span className="text-text-primary font-mono text-right">{selected.bankAccountNumber || '—'}</span>
                </div>
                <div className="flex justify-between gap-4 py-2 border-b border-border-custom/50">
                  <span className="flex items-center gap-2 text-text-muted"><User size={14} /> Chủ tài khoản</span>
                  <span className="text-text-primary text-right">{selected.bankAccountName || '—'}</span>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <span className="flex items-center gap-2 text-text-muted"><Hash size={14} /> Thời gian</span>
                  <span className="text-text-primary text-right">
                    {selected.createAt ? formatTransactionDateTime(selected.createAt) : '—'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1.5">
                  Ghi chú Admin <span className="text-danger">*</span>
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => {
                    setAdminNote(e.target.value);
                    if (e.target.value.trim()) setNoteError(false);
                  }}
                  rows={3}
                  placeholder="Ghi chú phê duyệt hoặc lý do từ chối..."
                  className={`w-full px-3 py-2 bg-bg-primary border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 resize-none ${
                    noteError ? 'border-danger' : 'border-border-custom'
                  }`}
                />
                {noteError && (
                  <p className="text-xs text-danger mt-1">Vui lòng nhập ghi chú trước khi xử lý.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-custom flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 text-sm rounded-xl border border-border-custom text-text-secondary hover:text-text-primary cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => submitDecision(false)}
                disabled={approveMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 cursor-pointer disabled:opacity-50"
              >
                <XCircle size={14} />
                Từ chối
              </button>
              <button
                type="button"
                onClick={() => submitDecision(true)}
                disabled={approveMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-success text-white hover:bg-success/90 cursor-pointer disabled:opacity-50"
              >
                {approveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Phê duyệt
              </button>
            </div>
        </AnimatedModal>
      )}
    </div>
  );
};
