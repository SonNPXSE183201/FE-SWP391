import { useState, useMemo } from 'react';
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, TrendingUp,
  Clock, Lock, ChevronDown, Search, Filter, CreditCard,
  Shield, Banknote, ExternalLink,
} from 'lucide-react';

// ─── Import from features (Feature-Driven Architecture) ─────
import { TX_TYPE_CONFIG, TX_FILTER_OPTIONS, formatVND, MOCK_WALLET, MOCK_TRANSACTIONS } from '../../features/wallet';


// ─── Deposit / Withdraw Modal ────────────────────────────────
const WalletActionModal = ({ mode, onClose }: { mode: 'deposit' | 'withdraw'; onClose: () => void }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const presetAmounts = mode === 'deposit'
    ? [500000, 1000000, 2000000, 5000000]
    : [500000, 1000000, 2000000];

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-md shadow-lg-custom animate-scale-in">
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mode === 'deposit' ? 'bg-success/10' : 'bg-danger/10'}`}>
              {mode === 'deposit'
                ? <ArrowDownToLine size={18} className="text-success" />
                : <ArrowUpFromLine size={18} className="text-danger" />
              }
            </div>
            <h2 className="text-base font-semibold text-text-primary">
              {mode === 'deposit' ? 'Nạp tiền (VNPay)' : 'Rút tiền'}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Số tiền (VND)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền..."
              className="w-full px-4 py-3 bg-bg-surface border border-border-custom rounded-xl text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  amount === String(a)
                    ? 'bg-brand/15 text-brand border-brand/30'
                    : 'bg-bg-surface text-text-secondary border-border-custom hover:border-brand/20'
                }`}
              >
                {formatVND(a)}
              </button>
            ))}
          </div>

          {mode === 'withdraw' && (
            <>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Ngân hàng</label>
                <select className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 cursor-pointer appearance-none">
                  <option>Vietcombank</option>
                  <option>Techcombank</option>
                  <option>MB Bank</option>
                  <option>BIDV</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Số tài khoản</label>
                <input type="text" placeholder="VD: 1234567890" className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-all" />
              </div>
              <div className="bg-info/5 border border-info/20 rounded-xl p-3">
                <p className="text-[11px] text-info">
                  Chỉ rút được từ <span className="font-semibold">Quỹ khả dụng</span> (WithdrawableBalance).
                  Hiện có: <span className="font-bold">{formatVND(MOCK_WALLET.withdrawableBalance)}</span>
                </p>
              </div>
            </>
          )}

          {mode === 'deposit' && (
            <div className="flex items-center gap-2 p-3 bg-bg-surface rounded-xl">
              <CreditCard size={16} className="text-text-muted" />
              <span className="text-[11px] text-text-secondary">Thanh toán qua cổng VNPay Sandbox</span>
              <ExternalLink size={12} className="text-text-muted ml-auto" />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-custom flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={loading || !amount} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
            loading || !amount ? 'bg-brand/40 text-white/60 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover text-white shadow-brand'
          }`}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
            ) : mode === 'deposit' ? (
              <><ArrowDownToLine size={14} />Nạp tiền</>
            ) : (
              <><ArrowUpFromLine size={14} />Rút tiền</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Wallet Page ────────────────────────────────────────
export const MangakaWalletPage = () => {
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
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <select value={txTypeFilter} onChange={(e) => setTxTypeFilter(e.target.value)}
                className="appearance-none pl-8 pr-8 py-2 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 cursor-pointer">
                {TX_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {filteredTx.map((tx) => {
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
      </div>

      {/* Modals */}
      {walletAction && <WalletActionModal mode={walletAction} onClose={() => setWalletAction(null)} />}
    </div>
  );
};
