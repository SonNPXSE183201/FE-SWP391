import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Palette,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Plus,
  X,
  UploadCloud,
  FileImage,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { usePortfolioStats, usePortfolioSamples, useUploadPortfolioSample } from '../hooks/usePortfolio';
import { taskApi } from '../../tasks/api/task.api';
import { formatVND } from '../../wallet';

const CATEGORIES = ['All', 'Lineart', 'Background', 'Screentone', 'Coloring'];

export const PortfolioFeature = () => {
  const [activeTab, setActiveTab] = useState<'samples' | 'history'>('samples');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lineart');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch API data
  const { data: stats, isLoading: statsLoading } = usePortfolioStats();
  const { data: samples = [], isLoading: samplesLoading } = usePortfolioSamples();
  const uploadMutation = useUploadPortfolioSample();

  // Fetch tasks for history
  const { data: tasksRes, isLoading: tasksLoading } = useQuery({
    queryKey: ['portfolio', 'tasks'],
    queryFn: () => taskApi.getMyTasks({ pageSize: 100 }),
  });

  const rawData = (tasksRes?.data as any)?.Data ?? (tasksRes?.data as any)?.data;
  const tasks: any[] = rawData?.Items ?? rawData?.items ?? (Array.isArray(rawData) ? rawData : []);

  const handleOpenUpload = () => {
    setTitle('');
    setCategory('Lineart');
    setImageUrl('');
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề tác phẩm');
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('Vui lòng cung cấp link hình ảnh');
      return;
    }

    try {
      await uploadMutation.mutateAsync({ title, category, imageUrl });
      toast.success('Thêm tác phẩm thành công!');
      setShowUploadModal(false);
    } catch {
      toast.error('Thêm tác phẩm thất bại. Vui lòng thử lại.');
    }
  };

  const filteredSamples = selectedCategory === 'All'
    ? samples
    : samples.filter((s: any) => s.category === selectedCategory);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Palette size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Portfolio Trợ lý</h1>
            <p className="page-header__subtitle">Quản lý và trưng bày các tác phẩm mẫu của bạn</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Task hoàn thành</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {statsLoading ? '...' : stats?.tasksCompleted || 0}
            </p>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Tỷ lệ duyệt</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {statsLoading ? '...' : `${stats?.approveRate || 100}%`}
            </p>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Tổng thu nhập</p>
            <p className="text-2xl font-bold text-brand mt-1 font-mono">
              {statsLoading ? '...' : formatVND(stats?.earnings || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-border-custom">
        <nav className="flex gap-4 -mb-px">
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 bg-transparent cursor-pointer ${
              activeTab === 'samples'
                ? 'text-brand border-brand font-bold'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            Tác phẩm mẫu
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 bg-transparent cursor-pointer ${
              activeTab === 'history'
                ? 'text-brand border-brand font-bold'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            Lịch sử Task
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'samples' ? (
          <div className="space-y-6">
            {/* Toolbar for Samples */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5 bg-bg-secondary p-1 border border-border-custom rounded-xl">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all ${
                      selectedCategory === cat
                        ? 'bg-brand text-white shadow-brand'
                        : 'bg-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {cat === 'All' ? 'Tất cả' : cat}
                  </button>
                ))}
              </div>

              {/* Upload Trigger */}
              <button
                onClick={handleOpenUpload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-semibold transition-all border-none cursor-pointer hover:-translate-y-0.5"
              >
                <Plus size={14} />
                Thêm tác phẩm mẫu
              </button>
            </div>

            {/* Showcase Grid */}
            {samplesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredSamples.length === 0 ? (
              <div className="bg-bg-secondary border border-border-custom rounded-xl p-12 text-center text-text-muted">
                Chưa có tác phẩm nào thuộc nhóm này
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSamples.map((sample: any) => (
                  <div
                    key={sample.id}
                    className="group relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden shadow-sm hover:border-brand/35 transition-all duration-300"
                  >
                    {/* Media Container */}
                    <div className="aspect-[4/3] bg-bg-surface overflow-hidden relative">
                      <img
                        src={sample.imageUrl}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={sample.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-9 h-9 rounded-lg bg-bg-surface hover:bg-bg-primary text-text-primary flex items-center justify-center transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-text-primary truncate">{sample.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-brand text-[10px] font-semibold">
                          {sample.category}
                        </span>
                        <span className="text-[10px] text-text-muted">{sample.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Task History Table */
          <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
            {tasksLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center text-text-muted">Chưa có lịch sử Task</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-text-secondary">
                  <thead className="bg-bg-surface/50 border-b border-border-custom text-text-muted text-[10px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Mã Task</th>
                      <th className="px-6 py-4">Tên công việc / Vai trò</th>
                      <th className="px-6 py-4">Nhuận bút</th>
                      <th className="px-6 py-4">Hạn chót</th>
                      <th className="px-6 py-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom">
                    {tasks.map((task: any) => (
                      <tr key={task.id} className="hover:bg-bg-surface/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-text-primary">#{task.id}</td>
                        <td className="px-6 py-4 font-medium text-text-primary">
                          {task.title || `${task.seriesTitle || 'Series'} - Task`}
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-primary">
                          {formatVND(task.amount)}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {new Date(task.deadline).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            task.status === 'Approved' ? 'bg-success/10 text-success' :
                            task.status === 'In_Progress' ? 'bg-blue-500/10 text-blue-400' :
                            task.status === 'Revision' ? 'bg-warning/10 text-warning' :
                            'bg-bg-surface border border-border-custom text-text-muted'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Upload Modal ─── */}
      {showUploadModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-border-custom pb-4 mb-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Plus size={18} className="text-brand" /> Thêm tác phẩm mẫu
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Tiêu đề tác phẩm</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Phác thảo bối cảnh phố đêm..."
                  className="w-full bg-bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Loại (Category)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                >
                  <option value="Lineart">Lineart (Đi nét)</option>
                  <option value="Background">Background (Bối cảnh)</option>
                  <option value="Screentone">Screentone (Đổ bóng)</option>
                  <option value="Coloring">Coloring (Lên màu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Link hình ảnh (URL)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand"
                  required
                />
              </div>

              <div className="pt-4 border-t border-border-custom flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-border-custom bg-transparent hover:bg-bg-surface text-text-secondary rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="px-5 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-semibold cursor-pointer border-none flex items-center gap-1.5 shadow-brand"
                >
                  {uploadMutation.isPending && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Thêm tác phẩm
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
