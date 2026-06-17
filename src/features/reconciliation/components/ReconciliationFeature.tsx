import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Receipt,
  Search,
  Calendar,
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
} from 'lucide-react';
import { useReconciliation, type ReconciliationRecord, type ReconciliationStatus, type ReconciliationParams } from '../hooks/useReconciliation';

const STATUS_FILTERS: { value: ReconciliationStatus | 'All'; label: string }[] = [
  { value: 'All', label: 'Tất cả' },
  { value: 'Matched', label: 'Khớp' },
  { value: 'Mismatch', label: 'Lệch' },
  { value: 'Missing', label: 'Thiếu' },
  { value: 'Pending', label: 'Đang xử lý' },
];

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const getStatusConfig = (status: ReconciliationStatus) => {
  switch (status) {
    case 'Matched':
      return { label: 'Khớp', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle };
    case 'Mismatch':
      return { label: 'Lệch', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle };
    case 'Missing':
      return { label: 'Thiếu', color: 'text-danger', bg: 'bg-danger/10', icon: XCircle };
    case 'Pending':
      return { label: 'Đang xử lý', color: 'text-info', bg: 'bg-info/10', icon: Clock };
  }
};

export const ReconciliationFeature = () => {
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'All'>('All');
  const [searchCode, setSearchCode] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(null);

  const params = useMemo<ReconciliationParams>(() => ({
    status: statusFilter,
    referenceCode: searchCode || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
  }), [statusFilter, searchCode, dateFrom, dateTo]);

  const { data, isLoading } = useReconciliation(params);
  const records = data?.records ?? [];
  const summary = data?.summary;

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
            <p className="page-header__subtitle">So khớp giao dịch giữa VNPay và hệ thống nội bộ</p>
          </div>
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
            <p className="text-2xl font-bold text-text-primary">{summary.totalRecords}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-success font-medium">{summary.matchedCount} khớp</span>
              <span className="text-[10px] text-text-muted">•</span>
              <span className="text-xs text-danger font-medium">{summary.mismatchCount + summary.missingCount} lỗi</span>
            </div>
          </div>

          <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">VNPay tổng</span>
              <TrendingUp size={16} className="text-info" />
            </div>
            <p className="text-lg font-bold text-text-primary">{formatCurrency(summary.totalVnpayAmount)}</p>
          </div>

          <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Nội bộ tổng</span>
              <TrendingDown size={16} className="text-success" />
            </div>
            <p className="text-lg font-bold text-text-primary">{formatCurrency(summary.totalInternalAmount)}</p>
          </div>

          <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Chênh lệch</span>
              <Equal size={16} className={summary.differenceAmount === 0 ? 'text-success' : 'text-danger'} />
            </div>
            <p className={`text-lg font-bold ${summary.differenceAmount === 0 ? 'text-success' : 'text-danger'}`}>
              {summary.differenceAmount === 0 ? '0 ₫' : formatCurrency(summary.differenceAmount)}
            </p>
            {summary.differenceAmount === 0 ? (
              <span className="text-[10px] text-success font-medium">✓ Cân bằng</span>
            ) : (
              <span className="text-[10px] text-danger font-medium">⚠ Cần kiểm tra</span>
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
              placeholder="Mã tham chiếu, mã VNPay..."
              className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-8 pr-3 py-2 bg-bg-secondary border border-border-custom rounded-xl text-xs text-text-primary focus:outline-none focus:border-brand"
              />
            </div>
            <span className="text-text-muted text-xs">→</span>
            <div className="relative">
              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-8 pr-3 py-2 bg-bg-secondary border border-border-custom rounded-xl text-xs text-text-primary focus:outline-none focus:border-brand"
              />
            </div>
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
        ) : records.length === 0 ? (
          <div className="text-center py-20">
            <Receipt size={40} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted">Không có giao dịch phù hợp với bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-secondary">
              <thead className="bg-bg-surface/50 border-b border-border-custom text-text-muted text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-4">Mã tham chiếu</th>
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">VNPay</th>
                  <th className="px-5 py-4">Nội bộ</th>
                  <th className="px-5 py-4">Ngày GD</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {records.map((record) => {
                  const statusCfg = getStatusConfig(record.status);
                  const amountMismatch = record.vnpayAmount !== record.internalAmount;

                  return (
                    <tr key={record.id} className="hover:bg-bg-surface/30 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs font-mono font-semibold text-text-primary">{record.referenceCode}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{record.vnpayTransactionId}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-text-primary font-medium">{record.userName}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className={`text-xs font-mono font-semibold ${amountMismatch ? 'text-warning' : 'text-text-primary'}`}>
                            {formatCurrency(record.vnpayAmount)}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">{record.vnpayStatus}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className={`text-xs font-mono font-semibold ${amountMismatch ? 'text-warning' : 'text-text-primary'}`}>
                            {record.internalAmount > 0 ? formatCurrency(record.internalAmount) : '—'}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">{record.internalStatus}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-text-secondary">
                          {new Date(record.vnpayDate).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                          <statusCfg.icon size={11} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-bg-surface border border-border-custom rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-brand/20 transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                          Xem
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
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-2xl shadow-xl animate-fade-in max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border-custom bg-bg-secondary rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <ArrowLeftRight size={16} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Chi tiết đối soát</h3>
                  <p className="text-[10px] text-text-muted">{selectedRecord.referenceCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = getStatusConfig(selectedRecord.status);
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
              {/* Info */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted">Người dùng</span>
                    <p className="font-semibold text-text-primary mt-0.5">{selectedRecord.userName}</p>
                  </div>
                  <div>
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
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Mã giao dịch</span>
                      <p className="font-mono text-sm font-semibold text-text-primary mt-0.5">{selectedRecord.vnpayTransactionId}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Số tiền</span>
                      <p className={`text-lg font-bold mt-0.5 ${selectedRecord.vnpayAmount !== selectedRecord.internalAmount ? 'text-warning' : 'text-text-primary'}`}>
                        {formatCurrency(selectedRecord.vnpayAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Ngày giao dịch</span>
                      <p className="text-xs text-text-primary mt-0.5">
                        {selectedRecord.vnpayDate ? new Date(selectedRecord.vnpayDate).toLocaleString('vi-VN') : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Trạng thái</span>
                      <p className="text-xs font-semibold text-text-primary mt-0.5">{selectedRecord.vnpayStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Internal side */}
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-custom">
                    <div className="w-6 h-6 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingDown size={12} className="text-success" />
                    </div>
                    <h4 className="text-xs font-bold text-success uppercase tracking-wider">Nội bộ</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Mã giao dịch</span>
                      <p className="font-mono text-sm font-semibold text-text-primary mt-0.5">
                        {selectedRecord.internalTransactionId || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Số tiền</span>
                      <p className={`text-lg font-bold mt-0.5 ${selectedRecord.vnpayAmount !== selectedRecord.internalAmount ? 'text-warning' : 'text-text-primary'}`}>
                        {selectedRecord.internalAmount > 0 ? formatCurrency(selectedRecord.internalAmount) : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Ngày giao dịch</span>
                      <p className="text-xs text-text-primary mt-0.5">
                        {selectedRecord.internalDate ? new Date(selectedRecord.internalDate).toLocaleString('vi-VN') : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Trạng thái</span>
                      <p className="text-xs font-semibold text-text-primary mt-0.5">{selectedRecord.internalStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Difference highlight */}
              {selectedRecord.vnpayAmount !== selectedRecord.internalAmount && (
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-warning" />
                    <h4 className="text-xs font-bold text-warning">Chênh lệch phát hiện</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-text-secondary">VNPay: <strong className="text-text-primary">{formatCurrency(selectedRecord.vnpayAmount)}</strong></span>
                    <span className="text-text-muted">vs</span>
                    <span className="text-text-secondary">Nội bộ: <strong className="text-text-primary">{formatCurrency(selectedRecord.internalAmount)}</strong></span>
                    <span className="ml-auto text-danger font-bold">
                      Δ {formatCurrency(Math.abs(selectedRecord.vnpayAmount - selectedRecord.internalAmount))}
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
    </div>
  );
};
