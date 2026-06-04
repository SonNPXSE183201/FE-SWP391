import { Wallet } from 'lucide-react';

export const MangakaWalletPage = () => {
  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Wallet size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Ví tiền</h1>
            <p className="page-header__subtitle">Quản lý quỹ sản xuất và giao dịch</p>
          </div>
        </div>
      </div>
      {/* TODO: 2-compartment wallet display, transaction history, deposit/withdraw */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-bg-secondary border border-blue-500/20 rounded-xl p-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium mb-3">
            Quỹ sản xuất
          </span>
          <div className="text-2xl font-bold text-text-primary">— ₫</div>
          <p className="text-xs text-text-muted mt-1">SetupFundBalance</p>
        </div>
        <div className="bg-bg-secondary border border-emerald-500/20 rounded-xl p-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-3">
            Quỹ khả dụng
          </span>
          <div className="text-2xl font-bold text-text-primary">— ₫</div>
          <p className="text-xs text-text-muted mt-1">WithdrawableBalance</p>
        </div>
      </div>
    </div>
  );
};
