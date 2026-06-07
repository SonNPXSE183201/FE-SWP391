import { useState, useMemo, useEffect } from 'react';
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, TrendingUp,
  Clock, Lock, Search, Filter,
  Shield, Banknote,
} from 'lucide-react';

import {
  TX_TYPE_CONFIG, TX_FILTER_OPTIONS, formatVND,
  MOCK_WALLET, MOCK_TRANSACTIONS,
  WalletActionModal,
} from '../index';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';

export const MangakaWalletFeature = () => {
  const [txTypeFilter, setTxTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [walletAction, setWalletAction] = useState<'deposit' | 'withdraw' | null>(null);

  const filteredTx = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchesType = !txTypeFilter || tx.type === txTypeFilter;
      const matchesSearch = !searchQuery ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [txTypeFilter, searchQuery]);

  const pagination = usePagination(filteredTx, { pageSize: 10 });

  useEffect(() => {
    pagination.goToPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txTypeFilter, searchQuery]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Wallet size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Ví tiền</h1>
            <p className="text-xs text-text-muted mt-0.5">Quản lý tài chính & giao dịch</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWalletAction('deposit')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-success/10 hover:bg-success/20 text-success rounded-xl text-sm font-medium transition-all border border-success/20 cursor-pointer"
          >
            <ArrowDownToLine size={14} />
            Nạp tiền
          </button>
          <button
            onClick={() => setWalletAction('withdraw')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-bg-secondary hover:bg-bg-surface text-text-primary rounded-xl text-sm font-medium transition-all border border-border-custom cursor-pointer"
          >
            <ArrowUpFromLine size={14} />
            Rút tiền
          </button>
        </div>
      </div>

      {/* ─── Wallet Balances — 2 ngăn ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Setup Fund Balance — Xanh dương */}
        <div className="relative overflow-hidden bg-gradient-to-br from-info/[0.08] to-brand/[0.05] border border-info/20 rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-info" />
              <span className="text-xs font-medium text-info uppercase tracking-wider">Quỹ sản xuất</span>
            </div>
            <div className="text-3xl font-bold text-text-primary mt-2">
              {formatVND(MOCK_WALLET.setupFundBalance)}
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              SetupFundBalance — Vốn do Board cấp. Ưu tiên Lock trước.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[10px] font-medium">
                <Lock size={10} />
                Đang lock: {formatVND(MOCK_WALLET.lockedAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Withdrawable Balance — Xanh lá */}
        <div className="relative overflow-hidden bg-gradient-to-br from-success/[0.08] to-secondary/[0.05] border border-success/20 rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Banknote size={16} className="text-success" />
              <span className="text-xs font-medium text-success uppercase tracking-wider">Quỹ khả dụng</span>
            </div>
            <div className="text-3xl font-bold text-text-primary mt-2">
              {formatVND(MOCK_WALLET.withdrawableBalance)}
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              WithdrawableBalance — Nhuận bút + tự nạp. Có thể rút ra.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-medium">
                <TrendingUp size={10} />
                Nhuận bút tháng: +{formatVND(3200000)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total summary */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-text-muted" />
          <span className="text-sm text-text-secondary">Tổng số dư:</span>
          <span className="text-sm font-bold text-text-primary">{formatVND(MOCK_WALLET.totalBalance)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-info flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-info inline-block" />
            SF: {formatVND(MOCK_WALLET.setupFundBalance)}
          </span>
          <span className="text-[11px] text-success flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            WB: {formatVND(MOCK_WALLET.withdrawableBalance)}
          </span>
        </div>
      </div>

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
        <div className="space-y-2">
          {pagination.paginatedData.map((tx) => {
            const cfg = TX_TYPE_CONFIG[tx.type];
            const TxIcon = cfg.icon;
            const date = new Date(tx.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            });

            return (
              <div key={tx.id} className="group bg-bg-secondary border border-border-custom rounded-xl p-4 hover:border-brand/15 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <TxIcon size={16} className={cfg.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">{tx.referenceCode}</span>
                    </div>
                    <p className="text-sm text-text-primary mt-0.5 truncate">{tx.description}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${tx.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatVND(Math.abs(tx.amount))}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">{date}</div>
                  </div>
                </div>

                {/* Fund breakdown */}
                {(tx.setupFundAmount !== 0 || tx.withdrawableAmount !== 0) && (
                  <div className="flex items-center gap-3 mt-2 ml-12 text-[10px]">
                    {tx.setupFundAmount !== 0 && (
                      <span className="text-info">
                        SF: {tx.setupFundAmount >= 0 ? '+' : ''}{formatVND(Math.abs(tx.setupFundAmount))}
                      </span>
                    )}
                    {tx.withdrawableAmount !== 0 && (
                      <span className="text-success">
                        WB: {tx.withdrawableAmount >= 0 ? '+' : ''}{formatVND(Math.abs(tx.withdrawableAmount))}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
      {walletAction && <WalletActionModal mode={walletAction} onClose={() => setWalletAction(null)} />}
    </div>
  );
};
