import { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Receipt,
  Search,
  Loader2,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowLeftRight,
  Eye,
  Upload,
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import { useReconciliation } from '../hooks/useReconciliation';
import { useImportReconciliationCsv } from '../hooks/useImportReconciliationCsv';
import { PlatformWalletCard } from './PlatformWalletCard';
import { ReconciliationDetailModal } from './ReconciliationDetailModal';
import { CustomDatePicker } from '../../../components/common/CustomDatePicker';
import type { ReconciliationRecord, ReconciliationStatus, ReconciliationParams } from '../types/reconciliation.types';
import { toReconciliationStatus } from '../types/reconciliation.types';
import type { ReconciliationReportDto } from '../../../api/generated/types';
import {
  formatReconciliationCurrency,
  formatReconciliationDate,
  getReconciliationStatusHelp,
  getTransactionTypeLabel,
  inferTransactionType,
  formatSignedReconciliationAmount,
  getAmountToneClass,
} from '../utils/reconciliation.utils';
import { getRoleBadgeStyle, getRoleLabel } from '../../../utils/roleDisplay';

const STATUS_FILTERS: { value: ReconciliationStatus | 'All'; label: string; hint: string }[] = [
  { value: 'All', label: 'Tất cả', hint: '' },
  { value: 'Matched', label: 'Khớp', hint: 'Đã đối soát OK' },
  { value: 'Mismatch', label: 'Lệch', hint: 'Trạng thái không khớp' },
  { value: 'Missing', label: 'Thiếu mã', hint: 'Thiếu ReferenceCode' },
  { value: 'Pending', label: 'Đang chờ', hint: 'Chưa hoàn tất' },
];

type CategoryFilter = 'all' | 'vnpay' | 'treasury' | 'funding';

const CATEGORY_FILTERS: { value: CategoryFilter; label: string; icon: typeof CreditCard }[] = [
  { value: 'all', label: 'Tất cả loại', icon: ArrowLeftRight },
  { value: 'vnpay', label: 'VNPay', icon: CreditCard },
  { value: 'treasury', label: 'Quỹ NXB', icon: Landmark },
  { value: 'funding', label: 'Cấp vốn SX', icon: ArrowLeftRight },
];

const matchesCategory = (record: ReconciliationRecord, category: CategoryFilter): boolean => {
  if (category === 'all') return true;
  const type = inferTransactionType(record);
  if (category === 'vnpay') return type === 'deposit' || type === 'withdraw';
  if (category === 'treasury') return type === 'platform_topup';
  if (category === 'funding') return type === 'funding';
  return true;
};

const getStatusConfig = (status: ReconciliationStatus) => {
  switch (status) {
    case 'Matched':
      return { label: 'Khớp', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle };
    case 'Mismatch':
      return { label: 'Lệch', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle };
    case 'Missing':
      return { label: 'Thiếu mã', color: 'text-danger', bg: 'bg-danger/10', icon: XCircle };
    case 'Pending':
      return { label: 'Đang chờ', color: 'text-info', bg: 'bg-info/10', icon: Clock };
  }
};

const getRowHighlight = (status: ReconciliationStatus): string => {
  switch (status) {
    case 'Mismatch':
      return 'bg-warning/[0.04]';
    case 'Missing':
      return 'bg-danger/[0.04]';
    case 'Pending':
      return 'bg-info/[0.03]';
    default:
      return '';
  }
};

const TransactionTypeBadge = ({ record, size = 'sm' }: { record: ReconciliationRecord; size?: 'sm' | 'md' }) => {
  const type = inferTransactionType(record);
  const px = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5';
  const text = size === 'md' ? 'text-[11px] font-bold tracking-wide' : 'text-[10px] font-semibold';
  const iconSize = size === 'md' ? 12 : 10;
  const stroke = size === 'md' ? 2.5 : 2;

  if (type === 'deposit') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full shadow-sm ${px} ${text} bg-success/10 text-success`}>
        <ArrowDownToLine size={iconSize} strokeWidth={stroke} />
        Nạp tiền
      </span>
    );
  }
  if (type === 'withdraw') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full shadow-sm ${px} ${text} bg-danger/10 text-danger`}>
        <ArrowUpFromLine size={iconSize} strokeWidth={stroke} />
        Rút tiền
      </span>
    );
  }
  if (type === 'funding') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full shadow-sm ${px} ${text} bg-brand/10 text-brand`}>
        <ArrowLeftRight size={iconSize} strokeWidth={stroke} />
        Cấp vốn SX
      </span>
    );
  }
  if (type === 'platform_topup') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full shadow-sm ${px} ${text} bg-info/10 text-info`}>
        <ArrowDownToLine size={iconSize} strokeWidth={stroke} />
        Nạp quỹ NXB
      </span>
    );
  }
  return <span className={`${text} text-text-muted`}>{getTransactionTypeLabel(record)}</span>;
};

const RECONCILIATION_HELP = (
  <ul className="space-y-2 list-none m-0 p-0">
    <li>
      <strong className="text-info">VNPay:</strong> Nạp/rút ví cá nhân — import CSV{' '}
      <span className="font-mono text-[10px]">TxnRef, Amount, ResponseCode, PayDate</span> để đối soát hàng loạt.
    </li>
    <li>
      <strong className="text-brand">Quỹ NXB:</strong> Admin nạp quỹ vào ví hệ thống trước khi cấp vốn series.
    </li>
    <li>
      <strong className="text-success">Cấp vốn SX:</strong> Tác giả xác nhận nhận vốn → 2 giao dịch liên kết, mã{' '}
      <span className="font-mono">FUND-S{'{seriesId}'}-...</span>
    </li>
    <li>
      <strong className="text-text-secondary">Trạng thái:</strong> Khớp · Lệch · Thiếu mã · Đang chờ.
    </li>
  </ul>
);

export const ReconciliationFeature = () => {
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchCode, setSearchCode] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(null);
  const [importReport, setImportReport] = useState<ReconciliationReportDto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const params = useMemo<ReconciliationParams>(() => ({
    status: statusFilter,
    from: dateFrom || undefined,
    to: dateTo || undefined,
  }), [statusFilter, dateFrom, dateTo]);

  const { data, isLoading, refetch, isFetching } = useReconciliation(params);
  const importMutation = useImportReconciliationCsv();
  const summary = data?.summary;

  const displayRecords = useMemo(() => {
    const records = data?.records ?? [];
    const q = searchCode.trim().toLowerCase();
    return records.filter((r) => {
      if (!matchesCategory(r, categoryFilter)) return false;
      if (!q) return true;
      return (
        r.userName?.toLowerCase().includes(q)
        || r.referenceCode?.toLowerCase().includes(q)
        || r.description?.toLowerCase().includes(q)
        || getTransactionTypeLabel(r).toLowerCase().includes(q)
        || getRoleLabel(r.userRole).toLowerCase().includes(q)
      );
    });
  }, [data?.records, searchCode, categoryFilter]);

  const typeBreakdown = useMemo(() => {
    const records = data?.records ?? [];
    return {
      vnpay: records.filter((r) => {
        const t = inferTransactionType(r);
        return t === 'deposit' || t === 'withdraw';
      }).length,
      treasury: records.filter((r) => inferTransactionType(r) === 'platform_topup').length,
      funding: records.filter((r) => inferTransactionType(r) === 'funding').length,
    };
  }, [data?.records]);

  const needsAttentionCount = summary
    ? (summary.mismatchCount ?? 0) + (summary.missingCount ?? 0)
    : 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: (report) => setImportReport(report),
    });
    e.target.value = '';
  };

  const setQuickDateRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateTo(to.toISOString().slice(0, 10));
    setDateFrom(from.toISOString().slice(0, 10));
  };

  const clearFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('all');
    setSearchCode('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = statusFilter !== 'All' || categoryFilter !== 'all' || searchCode || dateFrom || dateTo;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Hero: toolbar + ví quỹ */}
      <div className="grid lg:grid-cols-[1fr_minmax(280px,320px)] gap-4 items-stretch">
        <div className="rounded-xl border border-border-custom bg-bg-secondary overflow-hidden flex flex-col">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <Receipt size={18} className="text-brand" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-semibold text-text-primary">Đối soát giao dịch</h1>
                  <HelpTip
                    title="Luồng đối soát F02/F5.4"
                    ariaLabel="Xem hướng dẫn đối soát giao dịch"
                    placement="bottom-start"
                    width="22rem"
                    autoCloseMs={0}
                    size="sm"
                    content={RECONCILIATION_HELP}
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span className="inline-flex items-center gap-1">
                    <CreditCard size={11} className="text-info" />
                    VNPay
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Landmark size={11} className="text-brand" />
                    Quỹ NXB
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ArrowLeftRight size={11} className="text-success" />
                    Cấp vốn Tác giả
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileSelect} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-brand text-white hover:bg-brand/90 cursor-pointer disabled:opacity-50"
              >
                {importMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                Import CSV
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Làm mới danh sách"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border-custom text-text-secondary hover:text-text-primary hover:border-brand/30 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {summary && (
            <div className="px-4 pb-4 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-border-custom">
              <div className="rounded-lg bg-bg-primary/50 border border-border-custom/80 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Giao dịch</p>
                <p className="text-lg font-bold text-text-primary tabular-nums leading-tight">{summary.totalRecords ?? 0}</p>
                <p className="text-[10px] text-success font-medium mt-0.5">
                  {summary.matchedCount ?? 0} khớp
                  {needsAttentionCount > 0 && (
                    <span className="text-warning"> · {needsAttentionCount} cần xử lý</span>
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-bg-primary/50 border border-border-custom/80 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">VNPay</p>
                <p className="text-sm font-bold text-text-primary tabular-nums leading-tight truncate">
                  {formatReconciliationCurrency(summary.totalVnpayAmount ?? 0)}
                </p>
              </div>
              <div className="rounded-lg bg-bg-primary/50 border border-border-custom/80 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Hệ thống</p>
                <p className="text-sm font-bold text-text-primary tabular-nums leading-tight truncate">
                  {formatReconciliationCurrency(summary.totalInternalAmount ?? 0)}
                </p>
              </div>
              <div className={`rounded-lg px-3 py-2.5 border ${
                (summary.differenceAmount ?? 0) === 0
                  ? 'bg-success/[0.06] border-success/20'
                  : 'bg-danger/[0.06] border-danger/20'
              }`}>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Chênh lệch</p>
                <p className={`text-sm font-bold tabular-nums leading-tight ${
                  (summary.differenceAmount ?? 0) === 0 ? 'text-success' : 'text-danger'
                }`}>
                  {(summary.differenceAmount ?? 0) === 0 ? '0 ₫' : formatReconciliationCurrency(summary.differenceAmount ?? 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        <PlatformWalletCard className="h-full" />
      </div>

      {/* Lọc theo loại giao dịch */}
      {summary && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium mr-1">Loại:</span>
          {CATEGORY_FILTERS.filter((c) => c.value !== 'all').map((cat) => {
            const count = cat.value === 'vnpay' ? typeBreakdown.vnpay : cat.value === 'treasury' ? typeBreakdown.treasury : typeBreakdown.funding;
            const Icon = cat.icon;
            const active = categoryFilter === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoryFilter(active ? 'all' : cat.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                  active
                    ? 'bg-brand/15 border-brand/40 text-brand'
                    : 'bg-bg-secondary border-border-custom text-text-secondary hover:border-brand/25'
                }`}
              >
                <Icon size={12} />
                {cat.label}
                <span className={`tabular-nums ${active ? 'text-brand' : 'text-text-muted'}`}>{count}</span>
              </button>
            );
          })}
          {categoryFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className="text-[11px] text-text-muted hover:text-brand cursor-pointer bg-transparent border-none px-1"
            >
              Bỏ lọc loại
            </button>
          )}
        </div>
      )}

      {/* Filters + bảng */}
      <div className="rounded-xl border border-border-custom bg-bg-secondary overflow-hidden shadow-sm">
        <div className="p-3 border-b border-border-custom flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Tên, mã, loại GD..."
                className="w-full pl-9 pr-3 py-2 bg-bg-primary border border-border-custom rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
              />
            </div>
            <CustomDatePicker value={dateFrom} onChange={setDateFrom} placeholder="Từ ngày" className="w-[120px]" />
            <span className="text-text-muted text-xs hidden sm:inline">→</span>
            <CustomDatePicker value={dateTo} onChange={setDateTo} min={dateFrom || undefined} placeholder="Đến ngày" className="w-[120px]" />
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setQuickDateRange(d)}
                className="px-2 py-1.5 text-[10px] font-semibold rounded-lg border border-border-custom text-text-muted hover:text-brand hover:border-brand/30 cursor-pointer bg-bg-primary"
              >
                {d}d
              </button>
            ))}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-semibold text-danger hover:underline cursor-pointer bg-transparent border-none px-1"
              >
                Xóa lọc
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-bg-primary border border-border-custom rounded-lg p-0.5 overflow-x-auto shrink-0">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.value}
                onClick={() => setStatusFilter(sf.value)}
                title={sf.hint}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer border-none whitespace-nowrap transition-all ${
                  statusFilter === sf.value
                    ? 'bg-brand text-white'
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table body */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : displayRecords.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-custom flex items-center justify-center mx-auto mb-4">
              <Receipt size={28} className="text-text-muted/40" />
            </div>
            <p className="text-text-primary font-semibold mb-1">
              {hasActiveFilters ? 'Không có giao dịch phù hợp bộ lọc' : 'Chưa có giao dịch đối soát'}
            </p>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-4">
              {hasActiveFilters
                ? 'Thử xóa bộ lọc hoặc mở rộng khoảng thời gian.'
                : 'Giao dịch VNPay, nạp quỹ NXB và cấp vốn Tác giả sẽ hiển thị tại đây.'}
            </p>
            {hasActiveFilters ? (
              <button type="button" onClick={clearFilters} className="text-sm text-brand font-semibold hover:underline cursor-pointer bg-transparent border-none">
                Xóa tất cả bộ lọc
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-2 text-[11px] text-text-muted">
                <span className="px-2 py-1 rounded-lg bg-bg-surface border border-border-custom">Nạp VNPay → Deposit</span>
                <span className="px-2 py-1 rounded-lg bg-bg-surface border border-border-custom">Nạp quỹ → Platform_TopUp</span>
                <span className="px-2 py-1 rounded-lg bg-bg-surface border border-border-custom">Nhận vốn → Production_Funding</span>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-secondary">
              <thead className="bg-bg-surface/50 border-b border-border-custom text-text-muted text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Loại</th>
                  <th className="px-5 py-3.5">Người dùng</th>
                  <th className="px-5 py-3.5">Vai trò</th>
                  <th className="px-5 py-3.5">Số tiền</th>
                  <th className="px-5 py-3.5">Kết quả</th>
                  <th className="px-5 py-3.5">Thời gian</th>
                  <th className="px-5 py-3.5 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {displayRecords.map((record) => {
                  const status = toReconciliationStatus(record.status);
                  const statusCfg = getStatusConfig(status);
                  const amountMismatch = (record.vnpayAmount ?? 0) !== (record.internalAmount ?? 0);

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-bg-surface/30 transition-colors ${getRowHighlight(status)}`}
                    >
                      <td className="px-5 py-3.5">
                        <TransactionTypeBadge record={record} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-text-primary font-medium">{record.userName}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeStyle(record.userRole)}`}>
                          {getRoleLabel(record.userRole)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className={`text-xs font-mono font-semibold tabular-nums ${amountMismatch ? 'text-warning' : getAmountToneClass(record.vnpayAmount ?? 0)}`}>
                          {formatSignedReconciliationAmount(record.vnpayAmount ?? 0)}
                        </p>
                        {amountMismatch && (
                          <p className="text-[10px] text-warning mt-0.5">
                            Hệ thống: {formatReconciliationCurrency(record.internalAmount ?? 0)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}
                          title={getReconciliationStatusHelp(status)}
                        >
                          <statusCfg.icon size={11} />
                          {statusCfg.label}
                        </span>
                        {record.discrepancyNote && status !== 'Matched' && (
                          <p className="text-[10px] text-text-muted mt-1 max-w-[140px] line-clamp-2" title={record.discrepancyNote}>
                            {record.discrepancyNote}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          {formatReconciliationDate(record.vnpayDate)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-bg-surface border border-border-custom rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-brand/20 transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecord && (
        <ReconciliationDetailModal
          record={selectedRecord}
          statusCfg={getStatusConfig(toReconciliationStatus(selectedRecord.status))}
          onClose={() => setSelectedRecord(null)}
          typeBadge={<TransactionTypeBadge record={selectedRecord} size="md" />}
        />
      )}

      {/* Import report modal */}
      {importReport && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setImportReport(null)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-xl animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <h3 className="text-base font-semibold text-text-primary">Kết quả import CSV</h3>
              <button
                type="button"
                onClick={() => setImportReport(null)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-surface rounded-xl p-3 border border-border-custom">
                  <p className="text-[10px] text-text-muted uppercase">Tổng dòng</p>
                  <p className="text-xl font-bold text-text-primary">{importReport.totalRows ?? 0}</p>
                </div>
                <div className="bg-bg-surface rounded-xl p-3 border border-border-custom">
                  <p className="text-[10px] text-text-muted uppercase">Khớp</p>
                  <p className="text-xl font-bold text-success">{importReport.matchedCount ?? 0}</p>
                </div>
                <div className="bg-bg-surface rounded-xl p-3 border border-border-custom">
                  <p className="text-[10px] text-text-muted uppercase">Đã xử lý</p>
                  <p className="text-xl font-bold text-brand">{importReport.resolvedCount ?? 0}</p>
                </div>
                <div className="bg-bg-surface rounded-xl p-3 border border-border-custom">
                  <p className="text-[10px] text-text-muted uppercase">Chưa xử lý</p>
                  <p className="text-xl font-bold text-warning">{importReport.unresolvedCount ?? 0}</p>
                </div>
              </div>
              {(importReport.details?.length ?? 0) > 0 && (
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4 max-h-48 overflow-y-auto">
                  <h4 className="text-xs font-semibold text-text-primary mb-2">Chi tiết</h4>
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    {importReport.details!.map((line, i) => (
                      <li key={i} className="leading-relaxed">• {line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
