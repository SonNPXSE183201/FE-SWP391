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
  TrendingUp,
  TrendingDown,
  Equal,
  Info,
  Upload,
  ArrowDownToLine,
  ArrowUpFromLine,
  HelpCircle,
} from 'lucide-react';
import { useReconciliation } from '../hooks/useReconciliation';
import { useImportReconciliationCsv } from '../hooks/useImportReconciliationCsv';
import { CustomDatePicker } from '../../../components/common/CustomDatePicker';
import type { ReconciliationRecord, ReconciliationStatus, ReconciliationParams } from '../types/reconciliation.types';
import { toReconciliationStatus } from '../types/reconciliation.types';
import type { ReconciliationReportDto } from '../../../api/generated/types';
import {
  formatReconciliationCurrency,
  formatPaymentStatus,
  formatReconciliationDate,
  getReconciliationStatusHelp,
  getTransactionTypeLabel,
  inferTransactionType,
} from '../utils/reconciliation.utils';
import { getRoleBadgeStyle, getRoleLabel } from '../../../utils/roleDisplay';

const STATUS_FILTERS: { value: ReconciliationStatus | 'All'; label: string; hint: string }[] = [
  { value: 'All', label: 'Tất cả', hint: '' },
  { value: 'Matched', label: 'Khớp', hint: 'Đã đối soát OK' },
  { value: 'Mismatch', label: 'Lệch', hint: 'Trạng thái không khớp' },
  { value: 'Missing', label: 'Thiếu mã', hint: 'Thiếu ReferenceCode' },
  { value: 'Pending', label: 'Đang chờ', hint: 'Chưa hoàn tất' },
];

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

const TransactionTypeBadge = ({ record }: { record: ReconciliationRecord }) => {
  const type = inferTransactionType(record);
  if (type === 'deposit') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success">
        <ArrowDownToLine size={10} />
        Nạp tiền
      </span>
    );
  }
  if (type === 'withdraw') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-danger/10 text-danger">
        <ArrowUpFromLine size={10} />
        Rút tiền
      </span>
    );
  }
  return <span className="text-[10px] text-text-muted">{getTransactionTypeLabel(record)}</span>;
};

export const ReconciliationFeature = () => {
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'All'>('All');
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
    if (!q) return records;
    return records.filter((r) =>
      r.userName?.toLowerCase().includes(q)
      || getTransactionTypeLabel(r).toLowerCase().includes(q)
      || getRoleLabel(r.userRole).toLowerCase().includes(q),
    );
  }, [data?.records, searchCode]);

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

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Receipt size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Đối soát giao dịch VNPay</h1>
            <p className="page-header__subtitle">Kiểm tra giao dịch nạp/rút giữa cổng VNPay và ví nội bộ</p>
          </div>
        </div>
      </div>

      {/* Purpose callout */}
      <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-brand shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
          <p>
            <strong className="text-text-primary">Mục đích:</strong> Admin dùng trang này để phát hiện giao dịch
            {' '}<em>bất thường</em> — ví dụ user đã trả tiền trên VNPay nhưng ví không cộng tiền, hoặc giao dịch
            thiếu mã <code className="text-xs bg-bg-surface px-1 rounded">ReferenceCode</code> (quy tắc F04).
          </p>
          <p className="text-xs text-text-muted">
            <strong className="text-text-secondary">Tra cứu</strong> xem danh sách và lọc theo trạng thái.
            {' '}<strong className="text-text-secondary">Import CSV</strong> từ VNPay để đối soát hàng loạt và nhận báo cáo chi tiết.
          </p>
        </div>
      </div>

      {/* CSV Import */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Upload size={16} className="text-brand" />
            Import file đối soát VNPay
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Định dạng CSV: <span className="font-mono">TxnRef, Amount, ResponseCode, PayDate</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand/90 cursor-pointer disabled:opacity-50"
          >
            {importMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Chọn file CSV
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2.5 text-sm rounded-xl border border-border-custom text-text-secondary hover:text-text-primary cursor-pointer disabled:opacity-50"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Tổng giao dịch</span>
              <ArrowLeftRight size={16} className="text-brand" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{summary.totalRecords ?? 0}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs">
              <span className="text-success font-medium">{summary.matchedCount ?? 0} khớp</span>
              {(summary.pendingCount ?? 0) > 0 && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="text-info font-medium">{summary.pendingCount} chờ</span>
                </>
              )}
              {needsAttentionCount > 0 && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="text-warning font-medium">{needsAttentionCount} cần kiểm tra</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Tổng tiền (VNPay)</span>
              <TrendingUp size={16} className="text-info" />
            </div>
            <p className="text-lg font-bold text-text-primary">{formatReconciliationCurrency(summary.totalVnpayAmount ?? 0)}</p>
            <p className="text-[10px] text-text-muted mt-1">Theo bản ghi đang hiển thị</p>
          </div>

          <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Tổng tiền (Hệ thống)</span>
              <TrendingDown size={16} className="text-success" />
            </div>
            <p className="text-lg font-bold text-text-primary">{formatReconciliationCurrency(summary.totalInternalAmount ?? 0)}</p>
            <p className="text-[10px] text-text-muted mt-1">Số dư ghi nhận nội bộ</p>
          </div>

          <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Chênh lệch số tiền</span>
              <Equal size={16} className={(summary.differenceAmount ?? 0) === 0 ? 'text-success' : 'text-danger'} />
            </div>
            <p className={`text-lg font-bold ${(summary.differenceAmount ?? 0) === 0 ? 'text-success' : 'text-danger'}`}>
              {(summary.differenceAmount ?? 0) === 0 ? '0 ₫' : formatReconciliationCurrency(summary.differenceAmount ?? 0)}
            </p>
            {(summary.differenceAmount ?? 0) === 0 ? (
              <span className="text-[10px] text-success font-medium">Số tiền hai phía bằng nhau</span>
            ) : (
              <span className="text-[10px] text-danger font-medium">Có chênh lệch — xem chi tiết</span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Tìm theo tên, vai trò, loại GD..."
              className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <CustomDatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Từ ngày"
              className="w-[140px]"
            />
            <span className="text-text-muted text-xs">→</span>
            <CustomDatePicker
              value={dateTo}
              onChange={setDateTo}
              min={dateFrom || undefined}
              placeholder="Đến ngày"
              className="w-[140px]"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 bg-bg-secondary border border-border-custom rounded-xl p-1">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all ${
                statusFilter === sf.value
                  ? 'bg-brand text-white shadow-brand'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : displayRecords.length === 0 ? (
          <div className="text-center py-20">
            <Receipt size={40} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted">Không có giao dịch phù hợp với bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-secondary">
              <thead className="bg-bg-surface/50 border-b border-border-custom text-text-muted text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-4">Loại</th>
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4">Số tiền</th>
                  <th className="px-5 py-4">Kết quả</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4 text-right" />
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
                      <td className="px-5 py-4">
                        <TransactionTypeBadge record={record} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-text-primary font-medium">{record.userName}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeStyle(record.userRole)}`}>
                          {getRoleLabel(record.userRole)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className={`text-xs font-mono font-semibold ${amountMismatch ? 'text-warning' : 'text-text-primary'}`}>
                          {formatReconciliationCurrency(record.vnpayAmount ?? 0)}
                        </p>
                        {amountMismatch && (
                          <p className="text-[10px] text-warning mt-0.5">
                            Hệ thống: {formatReconciliationCurrency(record.internalAmount ?? 0)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
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
                      <td className="px-5 py-4">
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

      {/* ─── Detail Comparison Modal ─── */}
      {selectedRecord && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRecord(null)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-4xl shadow-xl animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-custom bg-bg-secondary">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <ArrowLeftRight size={16} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Chi tiết đối soát</h3>
                  <p className="text-[10px] text-text-muted">
                    {selectedRecord.userName} · {getRoleLabel(selectedRecord.userRole)} · {formatReconciliationDate(selectedRecord.vnpayDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = getStatusConfig(toReconciliationStatus(selectedRecord.status));
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                      <cfg.icon size={11} />
                      {cfg.label}
                    </span>
                  );
                })()}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              <div className="flex items-start gap-2 text-xs text-text-muted bg-bg-surface border border-border-custom rounded-xl p-3">
                <HelpCircle size={14} className="shrink-0 mt-0.5" />
                <span>{getReconciliationStatusHelp(toReconciliationStatus(selectedRecord.status))}</span>
              </div>

              {/* Info */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted">Loại giao dịch</span>
                    <p className="mt-1"><TransactionTypeBadge record={selectedRecord} /></p>
                  </div>
                  <div>
                    <span className="text-text-muted">Người dùng</span>
                    <p className="font-semibold text-text-primary mt-0.5">{selectedRecord.userName}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Vai trò</span>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeStyle(selectedRecord.userRole)}`}>
                        {getRoleLabel(selectedRecord.userRole)}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-muted">Mô tả</span>
                    <p className="font-medium text-text-primary mt-0.5">{selectedRecord.description}</p>
                  </div>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* VNPay side */}
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-custom">
                    <div className="w-6 h-6 rounded-lg bg-info/10 flex items-center justify-center">
                      <TrendingUp size={12} className="text-info" />
                    </div>
                    <h4 className="text-xs font-bold text-info uppercase tracking-wider">VNPay</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Số tiền</span>
                      <p className={`text-lg font-bold mt-0.5 ${(selectedRecord.vnpayAmount ?? 0) !== (selectedRecord.internalAmount ?? 0) ? 'text-warning' : 'text-text-primary'}`}>
                        {formatReconciliationCurrency(selectedRecord.vnpayAmount ?? 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Ngày giao dịch</span>
                      <p className="text-xs text-text-primary mt-0.5">
                        {formatReconciliationDate(selectedRecord.vnpayDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Trạng thái</span>
                      <p className="text-xs font-semibold text-text-primary mt-0.5">{formatPaymentStatus(selectedRecord.vnpayStatus)}</p>
                    </div>
                  </div>
                </div>

                {/* Internal side */}
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-custom">
                    <div className="w-6 h-6 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingDown size={12} className="text-success" />
                    </div>
                    <h4 className="text-xs font-bold text-success uppercase tracking-wider">Hệ thống</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Số tiền</span>
                      <p className={`text-lg font-bold mt-0.5 ${(selectedRecord.vnpayAmount ?? 0) !== (selectedRecord.internalAmount ?? 0) ? 'text-warning' : 'text-text-primary'}`}>
                        {(selectedRecord.internalAmount ?? 0) > 0 ? formatReconciliationCurrency(selectedRecord.internalAmount ?? 0) : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Ngày giao dịch</span>
                      <p className="text-xs text-text-primary mt-0.5">
                        {formatReconciliationDate(selectedRecord.internalDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Trạng thái</span>
                      <p className="text-xs font-semibold text-text-primary mt-0.5">{formatPaymentStatus(selectedRecord.internalStatus)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difference highlight */}
              {(selectedRecord.vnpayAmount ?? 0) !== (selectedRecord.internalAmount ?? 0) && (
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-warning" />
                    <h4 className="text-xs font-bold text-warning">Chênh lệch phát hiện</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-text-secondary">VNPay: <strong className="text-text-primary">{formatReconciliationCurrency(selectedRecord.vnpayAmount ?? 0)}</strong></span>
                    <span className="text-text-muted">vs</span>
                    <span className="text-text-secondary">Nội bộ: <strong className="text-text-primary">{formatReconciliationCurrency(selectedRecord.internalAmount ?? 0)}</strong></span>
                    <span className="ml-auto text-danger font-bold">
                      Δ {formatReconciliationCurrency(Math.abs((selectedRecord.vnpayAmount ?? 0) - (selectedRecord.internalAmount ?? 0)))}
                    </span>
                  </div>
                </div>
              )}

              {/* Discrepancy note */}
              {selectedRecord.discrepancyNote && (
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-text-primary mb-2">📝 Ghi chú phân tích</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{selectedRecord.discrepancyNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
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
