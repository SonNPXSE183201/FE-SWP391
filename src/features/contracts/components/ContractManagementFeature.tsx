import { useMemo, useState } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
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
  Eye,
  ExternalLink,
  Hash,
  FileText,
} from 'lucide-react';

import { CustomSelect } from '../../../components/common/CustomSelect';
import { HelpTip } from '../../../components/common/HelpTip';
import type { SelectOption } from '../../../components/common/CustomSelect';
import { CustomDatePicker } from '../../../components/common/CustomDatePicker';
import { useApprovedSeries, useContractTemplates, useCreateContract, useUpdateContract } from '../hooks/useContract';
import type { ApprovedSeriesContractDto, ContractAddendumDto } from '../api/contract.api';
import { formatVND, formatVNDInput } from '../../../utils/currency';
import { getGenreLabel } from '../../../constants/genres';
import { MotionStagger, MotionItem, MotionListItem, containerVariants } from '../../../components/common/animation';
import { motion } from 'framer-motion';

type FilterStatus = 'all' | 'pending' | 'contracted';
type EffectiveDateMode = 'immediate' | 'scheduled';

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

const SCHEDULE_LABELS: Record<string, string> = {
  Weekly: '1 tuần 1 lần',
  'Bi-weekly': '2 tuần 1 lần',
  Monthly: '1 tháng 1 lần',
};

const formatSchedule = (schedule: string) => {
  if (!schedule || schedule === 'Chưa thiết lập' || schedule === 'Not configured') {
    return { label: 'Chưa có lịch', muted: true };
  }
  const cleanSchedule = schedule.split(' (')[0];
  return { label: SCHEDULE_LABELS[cleanSchedule] || cleanSchedule, muted: false };
};

const isSignedContract = (status?: string | null) =>
  ['signed', 'active'].includes((status ?? '').trim().toLowerCase());

const getContractStatusLabel = (status?: string | null) => {
  const normalized = (status ?? '').trim().toLowerCase();
  if (normalized === 'signed') return 'Đã ký HĐ';
  if (normalized === 'pending') return 'Chờ tác giả ký';
  if (normalized === 'active') return 'Đang hiệu lực';
  return 'Chưa lập HĐ';
};

const getEmptyMessage = (filter: FilterStatus, search: string): { title: string; hint: string } => {
  if (search.trim()) {
    return {
      title: `Không tìm thấy kết quả cho "${search.trim()}"`,
      hint: 'Thử tìm bằng tên bộ truyện hoặc tên tác giả khác.',
    };
  }
  if (filter === 'pending') {
    return {
      title: 'Không có bộ truyện nào đang chờ lập hợp đồng',
      hint: 'Bộ truyện sẽ xuất hiện ngay sau khi Hội đồng phê duyệt vốn thực tế.',
    };
  }
  if (filter === 'contracted') {
    return {
      title: 'Chưa có bộ truyện nào đã lập hợp đồng',
      hint: 'Hợp đồng sau khi tạo sẽ được quản lý tại đây.',
    };
  }

  return {
    title: 'Chưa có bộ truyện nào',
    hint: 'Chưa có bộ truyện nào đủ điều kiện lập hợp đồng.',
  };
};

export const ContractManagementFeature = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<ApprovedSeriesContractDto | null>(null);
  const [baseGenkouryoPrice, setBaseGenkouryoPrice] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [updateGenkouryoPrice, setUpdateGenkouryoPrice] = useState('');
  const [effectiveDateMode, setEffectiveDateMode] = useState<EffectiveDateMode>('immediate');
  const [updateEndDate, setUpdateEndDate] = useState('');

  const minEffectiveDate = useMemo(() => toDateInputValue(new Date()), []);

  const { data: seriesList = [], isLoading, isError, refetch, isFetching } = useApprovedSeries();
  const { data: contractTemplates = [], isLoading: isLoadingTemplates } = useContractTemplates();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();

  const templateOptions = useMemo<SelectOption[]>(
    () =>
      contractTemplates.map((template) => ({
        value: String(template.id ?? ''),
        label: `Mẫu v${template.version ?? template.id}${template.isActive ? ' - Đang dùng' : ''}`,
        icon: <FileText size={14} />,
      })),
    [contractTemplates],
  );

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
        s.title?.toLowerCase().includes(q) ||
        s.mangakaName?.toLowerCase().includes(q);
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

  const handleOpenDetailModal = (series: ApprovedSeriesContractDto) => {
    setSelectedSeries(series);
    setShowDetailModal(true);
  };

  const handleOpenContractModal = (series: ApprovedSeriesContractDto) => {
    setSelectedSeries(series);
    setBaseGenkouryoPrice('');
    const activeTemplate = contractTemplates.find((template) => template.isActive) ?? contractTemplates[0];
    setSelectedTemplateId(activeTemplate?.id ? String(activeTemplate.id) : '');
    setShowContractModal(true);
  };

  const handleOpenUpdateModal = (series: ApprovedSeriesContractDto) => {
    setSelectedSeries(series);
    const existingPrice = series.genkouryoPrice ? String(series.genkouryoPrice) : '';
    setUpdateGenkouryoPrice(existingPrice);
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
    if (!selectedTemplateId || Number(selectedTemplateId) <= 0) {
      toast.error('Vui lòng chọn mẫu hợp đồng.');
      return;
    }
    if (!selectedSeries) return;

    createContract.mutate(
      {
        seriesId: selectedSeries.id ?? '',
        baseGenkouryoPrice: Number(baseGenkouryoPrice),
        templateId: Number(selectedTemplateId),
      },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <FileSignature size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Quản lý Hợp đồng</h1>
            <p className="page-header__subtitle">
              Lập hợp đồng nhuận bút và quản lý phụ lục cho bộ truyện đã được Hội đồng phê duyệt
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <MotionStagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MotionItem>
        <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-4 h-full">
          <div className="flex items-center gap-2 text-text-muted">
            <Clock size={14} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Chờ lập HĐ</span>
          </div>
          <p className="text-2xl font-bold text-warning mt-2">{pendingCount}</p>
          <p className="text-[11px] text-text-muted mt-1">Bộ truyện đã duyệt, chưa có hợp đồng</p>
        </div>
        </MotionItem>
        <MotionItem>
        <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-4 h-full">
          <div className="flex items-center gap-2 text-text-muted">
            <FileCheck size={14} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Đã có HĐ</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{contractedCount}</p>
          <p className="text-[11px] text-text-muted mt-1">Đã thiết lập nhuận bút cơ bản</p>
        </div>
        </MotionItem>
        <MotionItem>
        <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-4 h-full">
          <div className="flex items-center gap-2 text-text-muted">
            <Banknote size={14} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Tổng ngân sách duyệt</span>
          </div>
          <p className="text-lg font-bold text-text-primary mt-2">{formatVND(totalBudget)}</p>
          <p className="text-[11px] text-text-muted mt-1">Tổng ngân sách Hội đồng đã phê duyệt</p>
        </div>
        </MotionItem>
      </MotionStagger>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bộ truyện hoặc tác giả..."
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

      {/* List */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Loader2 size={28} className="animate-spin text-brand mb-3" />
            <span className="text-sm">Đang tải danh sách bộ truyện...</span>
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
          <motion.div
            className="divide-y divide-border-custom/60"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {filteredData.map((series) => {
              const schedule = formatSchedule(series.publishSchedule ?? '');
              const isContracted = series.hasContract;
              const isSigned = isSignedContract(series.contractStatus);

              return (
                <MotionListItem key={series.id}>
                <div
                  onClick={() => isContracted && handleOpenDetailModal(series)}
                  className={`
                    group relative px-5 py-4 transition-all
                    ${isContracted
                      ? `${isSigned ? 'border-l-emerald-500/40 hover:border-l-emerald-400' : 'border-l-warning/40 hover:border-l-warning'} cursor-pointer hover:bg-bg-surface/60 border-l-2`
                      : 'border-l-2 border-l-transparent hover:bg-bg-surface/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-5">
                    {/* Series info — main content area */}
                    <div className="flex items-center gap-3 min-w-0 w-[260px] shrink-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isContracted ? (isSigned ? 'bg-emerald-500/10' : 'bg-warning/10') : 'bg-brand/10'}`}>
                        <BookOpen size={15} className={isContracted ? (isSigned ? 'text-emerald-400' : 'text-warning') : 'text-brand'} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-text-primary truncate group-hover:text-brand transition-colors">
                          {series.title}
                        </p>
                        {(series.genres?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(series.genres ?? []).slice(0, 3).map((g) => (
                              <span
                                key={g}
                                className="px-1.5 py-0.5 rounded-md bg-bg-surface text-text-muted text-[10px] font-medium"
                              >
                                {getGenreLabel(g)}
                              </span>
                            ))}
                            {(series.genres?.length ?? 0) > 3 && (
                              <span className="text-[10px] text-text-muted">
                                +{(series.genres?.length ?? 0) - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Author */}
                    <div className="hidden lg:flex items-center gap-1.5 w-[140px] shrink-0">
                      <div className="w-6 h-6 rounded-full bg-bg-surface flex items-center justify-center shrink-0">
                        <User size={11} className="text-text-muted" />
                      </div>
                      <span className="text-xs text-text-secondary truncate">{series.mangakaName}</span>
                    </div>

                    {/* Budget + Price — key financial info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Ngân sách</p>
                          <p className="text-sm font-semibold text-text-primary whitespace-nowrap mt-0.5">
                            {formatVND(series.approvedBudget)}
                          </p>
                        </div>
                        {isContracted && series.genkouryoPrice && (
                          <>
                            <div className="w-px h-8 bg-border-custom" />
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Nhuận bút</p>
                              <p className="text-sm font-semibold text-emerald-400 whitespace-nowrap mt-0.5">
                                {formatVND(series.genkouryoPrice)}<span className="text-text-muted font-normal text-[10px]"> /trang</span>
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Publishing cadence + approval date */}
                    <div className="hidden xl:flex flex-col items-end gap-1 w-[120px] shrink-0">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="text-text-muted" />
                        <span className={`text-[11px] whitespace-nowrap ${schedule.muted ? 'text-text-muted italic' : 'text-text-secondary'}`}>
                          {schedule.label}
                        </span>
                      </div>
                      {series.approvedAt && (
                        <span className="text-[10px] text-text-muted whitespace-nowrap">
                          Duyệt {formatApprovedDate(series.approvedAt)}
                        </span>
                      )}
                    </div>

                    {/* Status + Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      {isContracted ? (
                        <>
                          <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${isSigned ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                            {isSigned ? <Check size={10} /> : <Clock size={10} />}
                            {getContractStatusLabel(series.contractStatus)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSigned) {
                                handleOpenUpdateModal(series);
                              } else {
                                handleOpenDetailModal(series);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-bg-surface hover:bg-brand/10 text-text-secondary hover:text-brand rounded-xl text-xs font-medium border border-border-custom cursor-pointer transition-all hover:border-brand/30 hover:shadow-sm"
                          >
                            <Pencil size={12} />
                            {isSigned ? 'Phụ lục' : 'Chi tiết'}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-warning/10 text-warning border border-warning/20">
                            <Clock size={10} />
                            Chờ HĐ
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenContractModal(series)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-semibold border-none cursor-pointer transition-all shadow-sm shadow-brand/25 hover:shadow-md hover:shadow-brand/30"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                            Tạo HĐ
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
                </MotionListItem>
              );
            })}
          </motion.div>
        )}

        {!isLoading && !isError && filteredData.length > 0 && (
          <div className="px-5 py-3 border-t border-border-custom bg-bg-surface/30 text-xs text-text-muted flex items-center justify-between">
            <span>Hiển thị {filteredData.length} / {seriesList.length} bộ truyện</span>
            {contractedCount > 0 && (
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Eye size={10} />
                Nhấn vào dòng đã có HĐ để xem chi tiết
              </span>
            )}
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      {showContractModal && selectedSeries && (
        <AnimatedModal open onClose={() => setShowContractModal(false)} panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-lg">
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
                    Tác giả
                    <HelpTip size="sm" content="Tác giả sở hữu bộ truyện và sẽ là bên ký hợp đồng điện tử." />
                  </span>
                  <span className="text-sm font-medium text-text-primary">{selectedSeries.mangakaName}</span>
                </div>
                <div className="h-px bg-border-custom" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-text-secondary flex items-center gap-2">
                    <Calendar size={13} className="text-text-muted" />
                    Lịch xuất bản
                    <HelpTip size="sm" content="Tần suất xuất bản đã được khai báo cho bộ truyện, dùng làm căn cứ trong hợp đồng." />
                  </span>
                  <span className="text-sm font-medium text-text-primary text-right">
                    {formatSchedule(selectedSeries.publishSchedule ?? '').label}
                  </span>
                </div>
              </div>

              <div className="bg-brand/5 border border-brand/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium flex items-center gap-1.5">
                      Ngân sách Hội đồng đã duyệt
                      <HelpTip size="sm" content="Mức vốn thực tế Hội đồng đã phê duyệt cho bộ truyện. Admin chỉ lập hợp đồng theo mức vốn này." />
                    </p>
                    <p className="text-xl font-bold text-text-primary mt-1">
                      {formatVND(selectedSeries.approvedBudget)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                    <Banknote size={20} className="text-brand" />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  Mẫu hợp đồng <span className="text-danger">*</span>
                  <HelpTip size="sm" content="Chọn mẫu nội dung dùng để sinh file PDF hợp đồng cho tác giả xem và ký." />
                </label>
                <CustomSelect
                  options={templateOptions}
                  value={selectedTemplateId}
                  onChange={setSelectedTemplateId}
                  placeholder={isLoadingTemplates ? 'Đang tải mẫu hợp đồng...' : 'Chọn mẫu hợp đồng...'}
                  icon={<FileText size={14} />}
                  disabled={isLoadingTemplates || templateOptions.length === 0}
                />
                {templateOptions.length === 0 && !isLoadingTemplates && (
                  <p className="text-[11px] text-danger mt-1.5">
                    Chưa có mẫu hợp đồng khả dụng. Vui lòng tạo hoặc kích hoạt một mẫu trước.
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  Đơn giá nhuận bút cơ bản / trang (VND) <span className="text-danger">*</span>
                  <HelpTip
                    size="sm"
                    content="Nhập số tiền trả cho mỗi trang hợp lệ. Khoản này dùng để tính nhuận bút và có thể điều chỉnh sau bằng phụ lục hợp đồng."
                  />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={baseGenkouryoPrice ? formatVNDInput(baseGenkouryoPrice) : ''}
                    onChange={handlePriceInputChange}
                    placeholder="VD: 50.000"
                    className="w-full px-4 py-2.5 pr-20 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                    VND/trang
                  </span>
                </div>
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
                disabled={createContract.isPending || isLoadingTemplates || templateOptions.length === 0}
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
        </AnimatedModal>
      )}

      {/* Update Contract Modal */}
      {showUpdateModal && selectedSeries && (
        <AnimatedModal open onClose={() => setShowUpdateModal(false)} panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-lg">
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
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Tác giả</p>
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
                  <HelpTip
                    size="sm"
                    content="Đơn giá mới sẽ thay thế mức đang áp dụng từ thời điểm hiệu lực của phụ lục."
                  />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={updateGenkouryoPrice ? formatVNDInput(updateGenkouryoPrice) : ''}
                    onChange={(e) => setUpdateGenkouryoPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="VD: 60.000"
                    className="w-full px-4 py-2.5 pr-20 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                    VND/trang
                  </span>
                </div>
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
        </AnimatedModal>
      )}

      {/* Contract Detail Modal */}
      {showDetailModal && selectedSeries && selectedSeries.hasContract && (
        <AnimatedModal open onClose={() => setShowDetailModal(false)} panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-border-custom bg-bg-primary/35 shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-info" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-text-primary">Chi tiết Hợp đồng</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-text-muted truncate">{selectedSeries.title}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isSignedContract(selectedSeries.contractStatus) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                      {isSignedContract(selectedSeries.contractStatus) ? <Check size={10} /> : <Clock size={10} />}
                      {getContractStatusLabel(selectedSeries.contractStatus)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface border-none bg-transparent cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {selectedSeries.contractFileUrl ? (
                <div className="rounded-2xl border border-info/25 bg-info/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                      <FileCheck size={19} className="text-info" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary">Bản hợp đồng PDF</p>
                        <HelpTip
                          size="sm"
                          width="20rem"
                          content="Đây là file PDF backend đã tạo và upload lên Firebase. Nút xem sẽ mở trực tiếp file trong tab mới, giống khi kiểm tra bằng Swagger."
                        />
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Dùng để đối chiếu nội dung hợp đồng trước và sau khi tác giả ký.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(selectedSeries.contractFileUrl ?? '', '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-info hover:bg-info/90 text-white text-sm font-semibold border-none cursor-pointer transition-colors shrink-0"
                  >
                    <Eye size={14} />
                    Xem hợp đồng
                    <ExternalLink size={13} />
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-warning/25 bg-warning/5 p-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-warning" />
                    <p className="text-sm font-semibold text-text-primary">Chưa có file PDF</p>
                    <HelpTip
                      size="sm"
                      content="Hợp đồng có dữ liệu trong hệ thống nhưng chưa có đường dẫn PDF. Hãy kiểm tra lại API tạo hợp đồng hoặc trạng thái upload Firebase."
                    />
                  </div>
                </div>
              )}

              {/* Contract info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-surface border border-border-custom rounded-xl px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium flex items-center gap-1">
                    <Hash size={10} />
                    Mã hợp đồng
                  </p>
                  <p className="text-sm font-semibold text-text-primary mt-1 font-mono">#{selectedSeries.contractId}</p>
                </div>
                <div className="bg-bg-surface border border-border-custom rounded-xl px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium flex items-center gap-1.5">
                    <Calendar size={10} />
                    Ngày ký
                    <HelpTip size="sm" content="Ngày này chỉ có sau khi tác giả xác nhận ký hợp đồng trên hệ thống." />
                  </p>
                  <p className="text-sm font-semibold text-text-primary mt-1">
                    {selectedSeries.signedDate ? formatApprovedDate(selectedSeries.signedDate) : '-'}
                  </p>
                </div>
              </div>

              {/* Author and series */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-text-primary">Thông tin bộ truyện</p>
                  <HelpTip
                    size="sm"
                    content="Các thông tin này được lấy từ hồ sơ bộ truyện đã được Hội đồng duyệt vốn."
                  />
                </div>
                <div className="h-px bg-border-custom" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-text-secondary flex items-center gap-2">
                    <User size={13} className="text-text-muted" />
                    Tác giả
                  </span>
                  <span className="text-sm font-medium text-text-primary">{selectedSeries.mangakaName}</span>
                </div>
                <div className="h-px bg-border-custom" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-text-secondary flex items-center gap-2">
                    <BookOpen size={13} className="text-text-muted" />
                    Bộ truyện
                  </span>
                  <span className="text-sm font-medium text-text-primary">{selectedSeries.title}</span>
                </div>
                <div className="h-px bg-border-custom" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-text-secondary flex items-center gap-2">
                    <Calendar size={13} className="text-text-muted" />
                    Lịch xuất bản
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {formatSchedule(selectedSeries.publishSchedule ?? '').label}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-brand/5 border border-brand/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                        Đơn giá nhuận bút cơ bản
                      </p>
                      <HelpTip size="sm" content="Đơn giá đang áp dụng cho mỗi trang hợp lệ của bộ truyện." />
                    </div>
                    <p className="text-xl font-bold text-text-primary mt-1">
                      {selectedSeries.genkouryoPrice ? formatVND(selectedSeries.genkouryoPrice).replace(' VND', '') : '—'}
                      <span className="text-xs font-normal text-text-muted ml-1">VND / trang</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                    <Banknote size={20} className="text-brand" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-brand/10 grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Ngân sách duyệt</p>
                      <HelpTip size="sm" content="Đây là mức vốn Hội đồng đã duyệt. Hệ thống dùng quỹ này để thanh toán nhuận bút theo tiến độ." />
                    </div>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">{formatVND(selectedSeries.approvedBudget)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Ngày ký</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">
                      {selectedSeries.signedDate ? formatApprovedDate(selectedSeries.signedDate) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Addendums history */}
              {selectedSeries.addendums && selectedSeries.addendums.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1.5">
                    <FileSignature size={12} />
                    Lịch sử phụ lục ({selectedSeries.addendums.length})
                    <HelpTip
                      size="sm"
                      width="20rem"
                      content="Phụ lục được dùng khi cần đổi đơn giá hoặc điều khoản sau khi hợp đồng chính đã có hiệu lực."
                    />
                  </p>
                  <div className="space-y-2">
                    {selectedSeries.addendums.map((addendum: ContractAddendumDto, idx: number) => (
                      <div
                        key={addendum.id}
                        className="bg-bg-surface border border-border-custom rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-warning/10 flex items-center justify-center text-[10px] font-bold text-warning">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-text-primary">
                              {formatVND(addendum.newGenkouryoPrice)} / trang
                            </p>
                            <p className="text-[10px] text-text-muted mt-0.5">
                              Hiệu lực: {formatApprovedDate(addendum.effectiveDate ?? '')}
                              {addendum.signedDate && ` · Ký: ${formatApprovedDate(addendum.signedDate)}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedSeries.addendums || selectedSeries.addendums.length === 0) && (
                <div className="text-center py-5 rounded-xl border border-dashed border-border-custom bg-bg-surface/40">
                  <p className="text-xs text-text-muted">Chưa có phụ lục nào được tạo.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-custom bg-bg-primary/35 rounded-b-2xl shrink-0">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2.5 border border-border-custom hover:bg-bg-surface rounded-xl text-sm bg-transparent cursor-pointer text-text-secondary transition-colors"
              >
                Đóng
              </button>
              {isSignedContract(selectedSeries.contractStatus) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenUpdateModal(selectedSeries);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium border-none cursor-pointer transition-colors shadow-sm shadow-brand/20"
                >
                  <Pencil size={14} />
                  Tạo phụ lục mới
                </button>
              )}
            </div>
        </AnimatedModal>
      )}

    </div>
  );
};
