import { useState, useMemo, useEffect } from 'react';
import {
  Wallet, ArrowUpFromLine, TrendingUp,
  Clock, Search, Filter,
  Banknote, Loader2
} from 'lucide-react';

import { TX_TYPE_CONFIG, TX_FILTER_OPTIONS, formatVND } from '../constants';
import { WalletActionModal } from './WalletActionModal';
import { TransactionDetailModal } from './TransactionDetailModal';
import { useWallet } from '../hooks/useWallet';

import { calculateMonthlyStats, getTransactionAmountDisplay, formatTransactionDateTime, normalizeTransactionType, getTransactionDescription } from '../utils';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';
import type { TransactionDto } from '../../../api/generated/types';
import type { TransactionType } from '../../../types/status.types';
import { MotionItem, MotionListItem, containerVariants } from '../../../components/common/animation';
import { motion } from 'framer-motion';

export const AssistantWalletFeature = () => {
  const [txTypeFilter, setTxTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [walletAction, setWalletAction] = useState<'withdraw' | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionDto | null>(null);

  // Real-time wallet updates via SignalR


  const { data: response, isLoading, isError, error } = useWallet();

  const wallet = response?.wallet;
  const transactions = response?.transactions ?? [];

  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      const txType = normalizeTransactionType(tx.type ?? '');
      const description = getTransactionDescription(tx);
      const matchesType = !txTypeFilter || txType === txTypeFilter;
      const matchesSearch = !searchQuery ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.referenceCode ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, txTypeFilter, searchQuery]);

  const pagination = usePagination(filteredTx, { pageSize: 10 });

  useEffect(() => {
    pagination.goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txTypeFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
        <p className="text-text-secondary">Đang tải dữ liệu ví...</p>
      </div>
    );
  }

  if (isError || !wallet) {
    return (
      <div className="p-6 bg-danger/10 border border-danger/20 rounded-xl">
        <h3 className="text-danger font-semibold mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-sm text-danger/80">{error?.message || 'Không thể lấy thông tin ví. Vui lòng thử lại sau.'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Wallet size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Ví tiền</h1>
            <p className="text-xs text-text-muted mt-0.5">Quản lý nhuận bút & rút tiền</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWalletAction('withdraw')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-bg-secondary hover:bg-bg-surface text-text-primary rounded-xl text-sm font-medium transition-all border border-border-custom cursor-pointer"
          >
            <ArrowUpFromLine size={14} />
            Rút tiền
          </button>
        </div>
      </div>

      {/* ─── Wallet Balances — 1 ngăn ─── */}
      <MotionItem className="mt-6">
        {/* Withdrawable Balance — Xanh lá */}
        <div className="relative overflow-hidden bg-gradient-to-br from-success/[0.08] to-secondary/[0.05] border border-success/20 rounded-2xl p-6 md:w-1/2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Banknote size={16} className="text-success" />
              <span className="text-xs font-medium text-success uppercase tracking-wider">Số dư khả dụng</span>
            </div>
            <div className="text-3xl font-bold text-text-primary mt-2">
              {formatVND(wallet.withdrawableBalance ?? 0)}
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              WithdrawableBalance — Nhuận bút hoàn thành Task. Có thể rút ra.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-medium">
                <TrendingUp size={10} />
                Thu nhập tháng: +{formatVND(calculateMonthlyStats(transactions).totalIncome)}
              </span>
            </div>
          </div>
        </div>
      </MotionItem>

      {/* ─── Transaction History ─── */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Clock size={18} className="text-text-muted" />
            Lịch sử giao dịch
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text" placeholder="Tìm mã giao dịch..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-2 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-all"
              />
            </div>
            <div className="w-[160px]">
              <CustomSelect
                options={TX_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={txTypeFilter}
                onChange={(v) => setTxTypeFilter(v)}
                placeholder="Tất cả loại"
                icon={<Filter size={14} />}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {pagination.paginatedData.map((tx) => {
            const txType = normalizeTransactionType(String(tx.type));
            const cfg = TX_TYPE_CONFIG[txType] || TX_TYPE_CONFIG[tx.type as TransactionType] || { icon: Wallet, bg: 'bg-bg-surface', color: 'text-text-muted', label: tx.type, sign: '' as const };
            const TxIcon = cfg.icon;
            const amountDisplay = getTransactionAmountDisplay(tx);
            const date = formatTransactionDateTime(tx.createAt);
            const description = getTransactionDescription(tx);

            return (
              <MotionListItem key={String(tx.id)}>
              <div onClick={() => setSelectedTx(tx)} className="group ui-card-interactive bg-bg-secondary border border-border-custom rounded-xl p-4 hover:border-brand/15 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <TxIcon size={16} className={cfg.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">{tx.referenceCode ?? '—'}</span>
                    </div>
                    <p className="text-sm text-text-primary mt-0.5 truncate">{description}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${amountDisplay.colorClass}`}>
                      {amountDisplay.sign}{formatVND(amountDisplay.value)}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">{date}</div>
                  </div>
                </div>
              </div>
              </MotionListItem>
            );
          })}
        </motion.div>

        {filteredTx.length === 0 && (
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-12 flex flex-col items-center gap-4">
            <Wallet size={40} className="text-text-muted" />
            <p className="text-sm text-text-secondary">Không có giao dịch nào</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageRange={pagination.pageRange}
          totalItems={pagination.totalItems}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          canGoNext={pagination.canGoNext}
          canGoPrev={pagination.canGoPrev}
          onPageChange={pagination.goToPage}
          onNextPage={pagination.nextPage}
          onPrevPage={pagination.prevPage}
          itemLabel="giao dịch"
        />
      </div>

      {/* Modal (Feature Component) */}
      {walletAction && (
        <WalletActionModal
          mode={walletAction}
          maxWithdrawAmount={wallet.withdrawableBalance ?? 0}
          onClose={() => setWalletAction(null)}
        />
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};
