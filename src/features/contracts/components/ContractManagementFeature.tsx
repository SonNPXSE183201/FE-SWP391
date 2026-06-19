import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  FileSignature,
  Plus,
  X,
  Check,
  Banknote,
  User,
  Calendar,
  BookOpen,
  Search,
  Pencil,
} from 'lucide-react';

// ─── Mock Data ───
import { useApprovedSeries, useCreateContract, useUpdateContract } from '../hooks/useContract';
import type { ApprovedSeries } from '../api/contract.api';

export const ContractManagementFeature = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'contracted'>('pending');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<ApprovedSeries | null>(null);
  const [baseGenkouryoPrice, setBaseGenkouryoPrice] = useState('');
  const [updateGenkouryoPrice, setUpdateGenkouryoPrice] = useState('');
  const [updateEndDate, setUpdateEndDate] = useState('');
  
  const { data: seriesList = [], isLoading, isError } = useApprovedSeries();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatCurrencyInput = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(numericValue));
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setBaseGenkouryoPrice(raw);
  };

  const handleOpenContractModal = (series: ApprovedSeries) => {
    setSelectedSeries(series);
    setBaseGenkouryoPrice('');
    setShowContractModal(true);
  };

  const handleOpenUpdateModal = (series: ApprovedSeries) => {
    setSelectedSeries(series);
    setUpdateGenkouryoPrice(series.genkouryoPrice ? String(series.genkouryoPrice) : '');
    setUpdateEndDate(series.endDate ? series.endDate.slice(0, 10) : '');
    setShowUpdateModal(true);
  };

  const handleUpdateContract = () => {
    if (!selectedSeries?.contractId) return;
    if (!updateGenkouryoPrice && !updateEndDate) {
      toast.error('Vui lòng nhập ít nhất một trường cần cập nhật.');
      return;
    }
    updateContract.mutate(
      {
        contractId: selectedSeries.contractId,
        genkouryoPrice: updateGenkouryoPrice ? Number(updateGenkouryoPrice) : undefined,
        endDate: updateEndDate || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Đã cập nhật phụ lục HĐ cho "${selectedSeries.title}"`);
          setShowUpdateModal(false);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { Message?: string } } })?.response?.data?.Message;
          toast.error(msg || 'Cập nhật thất bại. Kiểm tra BE đang chạy hoặc contractId có tồn tại.');
        },
      }
    );
  };

  const handleCreateContract = async () => {
    if (!baseGenkouryoPrice || Number(baseGenkouryoPrice) <= 0) {
      toast.error('Vui lòng nhập đơn giá nhuận bút hợp lệ.');
      return;
    }
    if (!selectedSeries) return;

    createContract.mutate(
      { seriesId: selectedSeries.id, baseGenkouryoPrice: Number(baseGenkouryoPrice) },
      {
        onSuccess: () => {
          toast.success(`Đã tạo hợp đồng cho "${selectedSeries.title}"!`);
          setShowContractModal(false);
          setSelectedSeries(null);
        },
        onError: () => toast.error('Có lỗi xảy ra. Vui lòng thử lại.'),
      }
    );
  };

  // Filter data
  const filteredData = seriesList.filter((s: ApprovedSeries) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mangakaName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !s.hasContract) ||
      (filterStatus === 'contracted' && s.hasContract);
    return matchesSearch && matchesFilter;
  });

  const pendingCount = seriesList.filter((s: ApprovedSeries) => !s.hasContract).length;

  return (
    <div className="animate-fade-in">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <FileSignature size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Quản lý Hợp đồng</h1>
            <p className="page-header__subtitle">
              {isLoading ? 'Đang tải...' : `${pendingCount} series đang chờ lập hợp đồng`}
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && isError && seriesList.length === 0 && (
        <div className="mt-4 p-4 rounded-xl bg-warning/10 border border-warning/20 text-sm text-warning">
          Không tải được danh sách từ BE. Kiểm tra backend đang chạy tại {import.meta.env.VITE_API_URL || 'localhost'}.
        </div>
      )}

      {/* ─── Toolbar ─── */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên series hoặc Mangaka..."
            className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-brand/50 focus:ring-brand/20 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-bg-surface border border-border-custom rounded-xl p-1">
          {[
            { key: 'pending' as const, label: 'Chờ HĐ', count: pendingCount },
            { key: 'contracted' as const, label: 'Đã có HĐ', count: seriesList.length - pendingCount },
            { key: 'all' as const, label: 'Tất cả', count: seriesList.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none
                ${filterStatus === tab.key
                  ? 'bg-brand/15 text-brand'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                filterStatus === tab.key ? 'bg-brand/20' : 'bg-bg-secondary'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border-custom bg-bg-surface/50">
          <div className="col-span-4">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Series</span>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Mangaka</span>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Ngân sách</span>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Lịch XB</span>
          </div>
          <div className="col-span-2 text-right">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Hành động</span>
          </div>
        </div>

        {/* Table body */}
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <FileSignature size={40} className="text-text-muted" />
            <p className="text-sm text-text-secondary">Không có dữ liệu phù hợp</p>
          </div>
        ) : (
          filteredData.map((series: ApprovedSeries, idx: number) => (
            <div
              key={series.id}
              className={`grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-bg-surface/50 transition-colors ${
                idx < filteredData.length - 1 ? 'border-b border-border-custom' : ''
              }`}
            >
              {/* Series */}
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} className="text-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{series.title}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {series.genres.slice(0, 2).map((g: string) => (
                        <span key={g} className="px-1.5 py-0 rounded bg-brand/8 text-brand text-[9px] font-medium">{g}</span>
                      ))}
                      {series.genres.length > 2 && (
                        <span className="text-[9px] text-text-muted">+{series.genres.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mangaka */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <User size={11} className="text-text-muted" />
                  <span className="text-xs text-text-secondary truncate">{series.mangakaName}</span>
                </div>
              </div>

              {/* Budget */}
              <div className="col-span-2">
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(series.approvedBudget)}
                </span>
              </div>

              {/* Schedule */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} className="text-text-muted" />
                  <span className="text-xs text-text-secondary">{series.publishSchedule.split(' (')[0]}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                {series.hasContract ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                      <Check size={12} />
                      Đã có HĐ
                    </span>
                    <button
                      onClick={() => handleOpenUpdateModal(series)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-bg-surface hover:bg-brand/10 text-text-secondary hover:text-brand rounded-lg text-[10px] font-medium border-none cursor-pointer"
                    >
                      <Pencil size={12} />
                      Phụ lục
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenContractModal(series)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/15 text-brand rounded-lg text-xs font-medium transition-colors border-none cursor-pointer"
                  >
                    <Plus size={12} />
                    Tạo HĐ
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Contract Modal ─── */}
      {showContractModal && selectedSeries && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowContractModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-lg animate-modal-enter">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                  <FileSignature size={16} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Lập Hợp đồng</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">{selectedSeries.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Series info summary */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-text-muted" />
                    <span className="text-xs text-text-secondary">Mangaka</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{selectedSeries.mangakaName}</span>
                </div>
                <div className="h-px bg-border-custom" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-text-muted" />
                    <span className="text-xs text-text-secondary">Lịch xuất bản</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{selectedSeries.publishSchedule}</span>
                </div>
              </div>

              {/* Approved budget (read-only) */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                      Ngân sách Board đã duyệt
                    </p>
                    <p className="text-xl font-bold text-text-primary mt-1">
                      {formatCurrency(selectedSeries.approvedBudget)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                    <Banknote size={20} className="text-brand" />
                  </div>
                </div>
              </div>

              {/* Base Genkouryo Price */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Đơn giá Nhuận bút cơ bản / trang (VNĐ) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={baseGenkouryoPrice ? formatCurrencyInput(baseGenkouryoPrice) : ''}
                    onChange={handlePriceInputChange}
                    placeholder="VD: 50,000"
                    className="w-full px-4 py-2.5 pr-20 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-brand/50 focus:ring-brand/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                    VNĐ/trang
                  </span>
                </div>
                <p className="text-[10px] text-text-muted mt-1.5">
                  Genkoūryō = Đơn giá × ValidPageCount. Có thể điều chỉnh sau qua Addendum.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border-custom bg-bg-secondary rounded-b-2xl">
              <button
                onClick={() => setShowContractModal(false)}
                className="px-4 py-2.5 border border-border-custom hover:bg-bg-surface text-text-secondary rounded-xl text-sm font-medium transition-colors bg-transparent cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateContract}
                disabled={createContract.isPending}
                className={`
                  inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all
                  ${createContract.isPending
                    ? 'bg-brand/50 text-white/70 cursor-not-allowed'
                    : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
              >
                {createContract.isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Tạo và gửi Hợp đồng
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* ─── Update Contract Modal (F5.5) ─── */}
      {showUpdateModal && selectedSeries && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpdateModal(false)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Cập nhật Phụ lục HĐ (F5.5)</h3>
                <p className="text-[10px] text-text-muted mt-0.5">{selectedSeries.title}</p>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary border-none bg-transparent cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Đơn giá Genkōryō mới (VNĐ/trang)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={updateGenkouryoPrice ? formatCurrencyInput(updateGenkouryoPrice) : ''}
                  onChange={(e) => setUpdateGenkouryoPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="VD: 60,000"
                  className="w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Ngày kết thúc hợp đồng</label>
                <input
                  type="date"
                  value={updateEndDate}
                  onChange={(e) => setUpdateEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-border-custom">
              <button onClick={() => setShowUpdateModal(false)} className="px-4 py-2.5 border border-border-custom rounded-xl text-sm bg-transparent cursor-pointer">Hủy</button>
              <button
                onClick={handleUpdateContract}
                disabled={updateContract.isPending}
                className="px-4 py-2.5 bg-brand text-white rounded-xl text-sm border-none cursor-pointer disabled:opacity-50"
              >
                {updateContract.isPending ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
