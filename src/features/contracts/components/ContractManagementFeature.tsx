import { useMemo, useState } from 'react';
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
  Loader2,
  Clock,
  FileCheck,
  RefreshCw,
  Zap,
  CalendarClock,
} from 'lucide-react';

import { CustomSelect } from '../../../components/common/CustomSelect';
import type { SelectOption } from '../../../components/common/CustomSelect';
import { CustomDatePicker } from '../../../components/common/CustomDatePicker';
import { useApprovedSeries, useCreateContract, useUpdateContract } from '../hooks/useContract';
import type { ApprovedSeries } from '../api/contract.api';

type FilterStatus = 'all' | 'pending' | 'contracted';
type EffectiveDateMode = 'immediate' | 'scheduled';

const PRICE_PRESET_OPTIONS: SelectOption[] = [
  { value: '400000', label: '400.000 ₫ / trang' },
  { value: '500000', label: '500.000 ₫ / trang' },
  { value: '600000', label: '600.000 ₫ / trang' },
  { value: 'custom', label: 'Nhập thủ công...' },
];

const EFFECTIVE_DATE_OPTIONS: SelectOption[] = [
  { value: 'immediate', label: 'Có hiệu lực ngay', icon: <Zap size={14} /> },
  { value: 'scheduled', label: 'Có hiệu lực từ ngày', icon: <CalendarClock size={14} /> },
];

const toDateInputValue = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatCurrencyInput = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, '');
  if (!numericValue) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(numericValue));
};

const formatApprovedDate = (iso: string): string => {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '—';
  }
};

const formatSchedule = (schedule: string) => {
  if (!schedule || schedule === 'Chưa thiết lập') {
    return { label: 'Chưa thiết lập', muted: true };
  }
  return { label: schedule.split(' (')[0], muted: false };
};

const getEmptyMessage = (filter: FilterStatus, search: string): { title: string; hint: string } => {
  if (search.trim()) {
    return {
      title: `Không tìm thấy kết quả cho "${search.trim()}"`,
      hint: 'Thử tìm bằng tên series hoặc tên Mangaka khác.',
    };
  }
  if (filter === 'pending') {
    return {
      title: 'Không có series nào đang chờ lập hợp đồng',
      hint: 'Series cần được Hội đồng phê duyệt (Fund_Pending) trước khi xuất hiện tại đây.',
    };
  }
  if (filter === 'contracted') {
    return {
      title: 'Chưa có series nào đã lập hợp đồng',
      hint: 'Các hợp đồng đã tạo sẽ hiển thị tại tab này.',
    };
  }
  return {
    title: 'Danh sách trống',
    hint: 'Chưa có series nào đủ điều kiện lập hợp đồng.',
  };
};

export const ContractManagementFeature = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<ApprovedSeries | null>(null);
  const [baseGenkouryoPrice, setBaseGenkouryoPrice] = useState('');
  const [createPricePreset, setCreatePricePreset] = useState('custom');
  const [updateGenkouryoPrice, setUpdateGenkouryoPrice] = useState('');
  const [updatePricePreset, setUpdatePricePreset] = useState('custom');
  const [effectiveDateMode, setEffectiveDateMode] = useState<EffectiveDateMode>('immediate');
  const [updateEndDate, setUpdateEndDate] = useState('');

  const minEffectiveDate = useMemo(() => toDateInputValue(new Date()), []);

  const { data: seriesList = [], isLoading, isError, refetch, isFetching } = useApprovedSeries();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();

  const pendingCount = useMemo(
    () => seriesList.filter((s) => !s.hasContract).length,
    [seriesList],
  );
  const contractedCount = useMemo(
    () => seriesList.filter((s) => s.hasContract).length,
    [seriesList],
  );
  const totalBudget = useMemo(
    () => seriesList.reduce((sum, s) => sum + (s.approvedBudget ?? 0), 0),
    [seriesList],
  );

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return seriesList.filter((s) => {
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.mangakaName.toLowerCase().includes(q);
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'pending' && !s.hasContract) ||
        (filterStatus === 'contracted' && s.hasContract);
      return matchesSearch && matchesFilter;
    });
  }, [seriesList, searchQuery, filterStatus]);

  const emptyMessage = getEmptyMessage(filterStatus, searchQuery);

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseGenkouryoPrice(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleCreatePricePresetChange = (value: string) => {
    setCreatePricePreset(value);
    if (value !== 'custom') {
      setBaseGenkouryoPrice(value);
    }
  };

  const handleUpdatePricePresetChange = (value: string) => {
    setUpdatePricePreset(value);
    if (value !== 'custom') {
      setUpdateGenkouryoPrice(value);
    }
  };

  const handleOpenContractModal = (series: ApprovedSeries) => {
    setSelectedSeries(series);
    setBaseGenkouryoPrice('');
    setCreatePricePreset('custom');
    setShowContractModal(true);
  };

  const handleOpenUpdateModal = (series: ApprovedSeries) => {
    setSelectedSeries(series);
    const existingPrice = series.genkouryoPrice ? String(series.genkouryoPrice) : '';
    const matchedPreset = PRICE_PRESET_OPTIONS.find(
      (opt) => opt.value !== 'custom' && opt.value === existingPrice,
    );
    setUpdateGenkouryoPrice(existingPrice);
    setUpdatePricePreset(matchedPreset ? matchedPreset.value : 'custom');
    setEffectiveDateMode('immediate');
    setUpdateEndDate('');
    setShowUpdateModal(true);
  };

  const handleUpdateContract = () => {
    if (!selectedSeries?.contractId) return;
    if (!updateGenkouryoPrice || Number(updateGenkouryoPrice) <= 0) {
      toast.error('Vui lòng nhập đơn giá nhuận bút mới.');
      return;
    }
    if (effectiveDateMode === 'scheduled' && !updateEndDate) {
      toast.error('Vui lòng chọn ngày hiệu lực phụ lục.');
      return;
    }
    updateContract.mutate(
      {
        contractId: selectedSeries.contractId,
        genkouryoPrice: Number(updateGenkouryoPrice),
        endDate: effectiveDateMode === 'scheduled' ? updateEndDate : undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Đã cập nhật phụ lục HĐ cho "${selectedSeries.title}"`);
          setShowUpdateModal(false);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          toast.error(msg || 'Cập nhật thất bại. Vui lòng thử lại.');
        },
      },
    );
  };

  const handleCreateContract = () => {
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
      },
    );
  };

  const filterTabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: seriesList.length },
    { key: 'pending', label: 'Chờ HĐ', count: pendingCount },
    { key: 'contracted', label: 'Đã có HĐ', count: contractedCount },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <FileSignature size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Quản lý Hợp đồng</h1>
            <p className="page-header__subtitle">
              Lập hợp đồng nhuận bút và quản lý phụ lục cho series đã được Hội đồng phê duyệt
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
          <div className="flex items-center gap-2 text-text-muted">
            <Clock size={14} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Chờ lập HĐ</span>
          </div>
          <p className="text-2xl font-bold text-warning mt-2">{pendingCount}</p>
          <p className="text-[11px] text-text-muted mt-1">Series đã duyệt, chưa có hợp đồng</p>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
          <div className="flex items-center gap-2 text-text-muted">
            <FileCheck size={14} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Đã có HĐ</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{contractedCount}</p>
          <p className="text-[11px] text-text-muted mt-1">Đã thiết lập nhuận bút cơ bản</p>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-4">
          <div className="flex items-center gap-2 text-text-muted">
            <Banknote size={14} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Tổng ngân sách duyệt</span>
          </div>
          <p className="text-lg font-bold text-text-primary mt-2">{formatCurrency(totalBudget)}</p>
          <p className="text-[11px] text-text-muted mt-1">Tổng ngân sách Board đã phê duyệt</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên series hoặc Mangaka..."
            className="w-full pl-9 pr-4 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-bg-secondary border border-border-custom rounded-xl p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none
                  ${filterStatus === tab.key
                    ? 'bg-brand/15 text-brand shadow-sm'
                    : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface/50'
                  }
                `}
              >
                {tab.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                    filterStatus === tab.key ? 'bg-brand/20' : 'bg-bg-surface'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl border border-border-custom bg-bg-secondary hover:bg-bg-surface text-text-secondary cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Loader2 size={28} className="animate-spin text-brand mb-3" />
            <span className="text-sm">Đang tải danh sách series...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-danger text-sm mb-1">Không tải được dữ liệu từ server</p>
            <p className="text-text-muted text-xs mb-4">
              Kiểm tra backend đang chạy tại {import.meta.env.VITE_API_URL || 'localhost:5000'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm text-brand hover:underline cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-custom flex items-center justify-center mb-4">
              <FileSignature size={24} className="text-text-muted opacity-60" />
            </div>
            <p className="text-sm font-medium text-text-primary">{emptyMessage.title}</p>
            <p className="text-xs text-text-muted mt-1.5 max-w-sm">{emptyMessage.hint}</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 text-xs text-brand hover:underline cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-custom text-[11px] uppercase tracking-wider text-text-muted bg-bg-surface/40">
                  <th className="px-5 py-3.5 font-medium min-w-[220px]">Series</th>
                  <th className="px-5 py-3.5 font-medium">Mangaka</th>
                  <th className="px-5 py-3.5 font-medium">Ngân sách duyệt</th>
                  <th className="px-5 py-3.5 font-medium">Lịch XB</th>
                  <th className="px-5 py-3.5 font-medium">Ngày duyệt</th>
                  <th className="px-5 py-3.5 font-medium">Trạng thái</th>
                  <th className="px-5 py-3.5 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((series) => {
                  const schedule = formatSchedule(series.publishSchedule);
                  return (
                    <tr
                      key={series.id}
                      className="border-b border-border-custom/60 hover:bg-bg-surface/40 transition-colors last:border-b-0"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                            <BookOpen size={14} className="text-brand" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-text-primary truncate">{series.title}</p>
                            {series.genres.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {series.genres.slice(0, 3).map((g) => (
                                  <span
                                    key={g}
                                    className="px-1.5 py-0.5 rounded bg-brand/8 text-brand text-[10px] font-medium"
                                  >
                                    {g}
                                  </span>
                                ))}
                                {series.genres.length > 3 && (
                                  <span className="text-[10px] text-text-muted">
                                    +{series.genres.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-text-muted shrink-0" />
                          <span className="text-text-secondary">{series.mangakaName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-text-primary whitespace-nowrap">
                          {formatCurrency(series.approvedBudget)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-text-muted shrink-0" />
                          <span
                            className={`text-xs whitespace-nowrap ${
                              schedule.muted ? 'text-text-muted italic' : 'text-text-secondary'
                            }`}
                          >
                            {schedule.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">
                        {formatApprovedDate(series.approvedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        {series.hasContract ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check size={11} />
                            Đã có HĐ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-warning/10 text-warning border border-warning/20">
                            <Clock size={11} />
                            Chờ lập HĐ
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {series.hasContract ? (
                          <button
                            type="button"
                            onClick={() => handleOpenUpdateModal(series)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface hover:bg-brand/10 text-text-secondary hover:text-brand rounded-lg text-xs font-medium border border-border-custom cursor-pointer transition-colors"
                          >
                            <Pencil size={12} />
                            Phụ lục
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenContractModal(series)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-xs font-medium border-none cursor-pointer transition-colors shadow-sm shadow-brand/20"
                          >
                            <Plus size={12} />
                            Tạo HĐ
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && filteredData.length > 0 && (
          <div className="px-5 py-3 border-t border-border-custom bg-bg-surface/30 text-xs text-text-muted">
            Hiển thị {filteredData.length} / {seriesList.length} series
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      {showContractModal && selectedSeries && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowContractModal(false)}
          />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-lg animate-modal-enter">
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                  <FileSignature size={16} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Lập Hợp đồng</h3>
                  <p className="text-xs text-text-muted mt-0.5">{selectedSeries.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContractModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-text-secondary flex items-center gap-2">
                    <User size={13} className="text-text-muted" />
                    Mangaka
                  </span>
                  <span className="text-sm font-medium text-text-primary">{selectedSeries.mangakaName}</span>
                </div>
                <div className="h-px bg-border-custom" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-text-secondary flex items-center gap-2">
                    <Calendar size={13} className="text-text-muted" />
                    Lịch xuất bản
                  </span>
                  <span className="text-sm font-medium text-text-primary text-right">
                    {formatSchedule(selectedSeries.publishSchedule).label}
                  </span>
                </div>
              </div>

              <div className="bg-brand/5 border border-brand/20 rounded-xl p-4">
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

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Đơn giá nhuận bút cơ bản / trang (VNĐ) <span className="text-danger">*</span>
                </label>
                <CustomSelect
                  options={PRICE_PRESET_OPTIONS}
                  value={createPricePreset}
                  onChange={handleCreatePricePresetChange}
                  placeholder="Chọn mức giá..."
                  icon={<Banknote size={14} />}
                />
                {createPricePreset === 'custom' && (
                  <div className="relative mt-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={baseGenkouryoPrice ? formatCurrencyInput(baseGenkouryoPrice) : ''}
                      onChange={handlePriceInputChange}
                      placeholder="VD: 50.000"
                      className="w-full px-4 py-2.5 pr-20 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                      VNĐ/trang
                    </span>
                  </div>
                )}
                {createPricePreset !== 'custom' && baseGenkouryoPrice && (
                  <p className="text-[11px] text-brand/80 mt-1.5 font-medium">
                    Đã chọn: {formatCurrency(Number(baseGenkouryoPrice))} / trang
                  </p>
                )}
                <p className="text-[11px] text-text-muted mt-1.5">
                  Genkōryō = đơn giá × số trang hợp lệ. Có thể điều chỉnh sau qua phụ lục hợp đồng.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border-custom">
              <button
                type="button"
                onClick={() => setShowContractModal(false)}
                className="px-4 py-2.5 border border-border-custom hover:bg-bg-surface text-text-secondary rounded-xl text-sm font-medium bg-transparent cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateContract}
                disabled={createContract.isPending}
                className={`
                  inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all
                  ${createContract.isPending
                    ? 'bg-brand/50 text-white/70 cursor-not-allowed'
                    : 'bg-brand hover:bg-brand-hover text-white shadow-brand'
                  }
                `}
              >
                {createContract.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Tạo hợp đồng
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Update Contract Modal */}
      {showUpdateModal && selectedSeries && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUpdateModal(false)}
          />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-lg animate-modal-enter">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Pencil size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Cập nhật phụ lục HĐ</h3>
                  <p className="text-xs text-text-muted mt-0.5">{selectedSeries.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface border-none bg-transparent cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Series context */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-surface border border-border-custom rounded-xl px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Mangaka</p>
                  <p className="text-sm font-medium text-text-primary mt-1 flex items-center gap-1.5">
                    <User size={12} className="text-text-muted" />
                    {selectedSeries.mangakaName}
                  </p>
                </div>
                <div className="bg-bg-surface border border-border-custom rounded-xl px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Mã HĐ</p>
                  <p className="text-sm font-medium text-text-primary mt-1 font-mono">
                    #{selectedSeries.contractId}
                  </p>
                </div>
              </div>

              {/* New price */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  <Banknote size={12} />
                  Đơn giá nhuận bút mới <span className="text-danger">*</span>
                </label>
                <CustomSelect
                  options={PRICE_PRESET_OPTIONS}
                  value={updatePricePreset}
                  onChange={handleUpdatePricePresetChange}
                  placeholder="Chọn mức giá..."
                  icon={<Banknote size={14} />}
                />
                {updatePricePreset === 'custom' && (
                  <div className="relative mt-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={updateGenkouryoPrice ? formatCurrencyInput(updateGenkouryoPrice) : ''}
                      onChange={(e) => setUpdateGenkouryoPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="VD: 60.000"
                      className="w-full px-4 py-2.5 pr-20 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                      VNĐ/trang
                    </span>
                  </div>
                )}
                {updatePricePreset !== 'custom' && updateGenkouryoPrice && (
                  <p className="text-[11px] text-brand/80 mt-1.5 font-medium">
                    Đã chọn: {formatCurrency(Number(updateGenkouryoPrice))} / trang
                  </p>
                )}
              </div>

              {/* Effective date */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  <Calendar size={12} />
                  Thời điểm hiệu lực
                </label>
                <CustomSelect
                  options={EFFECTIVE_DATE_OPTIONS}
                  value={effectiveDateMode}
                  onChange={(v) => setEffectiveDateMode(v as EffectiveDateMode)}
                  placeholder="Chọn thời điểm..."
                />
                {effectiveDateMode === 'scheduled' && (
                  <div className="mt-2">
                    <CustomDatePicker
                      value={updateEndDate}
                      onChange={setUpdateEndDate}
                      min={minEffectiveDate}
                      placeholder="Chọn ngày hiệu lực"
                    />
                    <p className="text-[11px] text-text-muted mt-1.5">
                      Phụ lục sẽ có hiệu lực từ ngày đã chọn.
                    </p>
                  </div>
                )}
                {effectiveDateMode === 'immediate' && (
                  <p className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1">
                    <Zap size={11} className="text-warning" />
                    Áp dụng ngay sau khi lưu phụ lục.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-custom bg-bg-secondary/80 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2.5 border border-border-custom hover:bg-bg-surface rounded-xl text-sm bg-transparent cursor-pointer text-text-secondary transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpdateContract}
                disabled={updateContract.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm border-none cursor-pointer disabled:opacity-50 transition-colors shadow-sm shadow-brand/20"
              >
                {updateContract.isPending && <Loader2 size={14} className="animate-spin" />}
                {updateContract.isPending ? 'Đang lưu...' : 'Lưu phụ lục'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
