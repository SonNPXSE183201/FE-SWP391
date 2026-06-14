import { useState, useEffect } from 'react';
import { ClipboardList, Clock, Play, Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { taskApi } from '../api/task.api';

export const TaskQueueFeature = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Available' | 'MyTasks'>('Available');

  // ========== GỌI API THẬT ==========
  // Trước đây: luôn dùng initialMockTasks (data giả)
  // Bây giờ: gọi taskApi → lấy data thật từ Backend
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        if (activeTab === 'Available') {
          const res = await taskApi.getAvailableTasks();
          if (!res.data) throw new Error('No data');
      
          // Handle both mock format and real backend format
          const items = (res.data as any).data || (res.data as any).Data || res.data;
          setTasks(items ?? []);
        } else {
          const res = await taskApi.getMyTasks();
          if (!res.data) throw new Error('No data');
      
          // Handle both mock format and real backend format
          const items = (res.data as any).data || (res.data as any).Data || res.data;
          setTasks(items ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        toast.error('Không thể tải danh sách task');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [activeTab]);

  // ========== NHẬN VIỆC ==========
  // Trước đây: filter mock array
  // Bây giờ: gọi API accept → xóa task khỏi list
  const handleAcceptTask = async (taskId: string) => {
    try {
      await taskApi.accept(taskId);
      toast.success('Nhận việc thành công!');
      setTasks(prev => prev.filter(t => (t.Id || t.id) !== taskId));
    } catch (error) {
      toast.error('Lỗi khi nhận việc');
    }
  };

  // ========== HELPER FUNCTIONS ==========
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Available: 'bg-green-500/20 text-green-400',
      In_Progress: 'bg-blue-500/20 text-blue-400',
      Pending_Review: 'bg-yellow-500/20 text-yellow-400',
      Approved: 'bg-emerald-500/20 text-emerald-400',
      Revision: 'bg-orange-500/20 text-orange-400',
      Cancelled: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  // ========== GIAO DIỆN ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <ClipboardList size={28} />
            Danh sách công việc
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {tasks.length} task hiện có
          </p>
        </div>
      </div>

      {/* Tabs: Việc có sẵn / Việc của tôi */}
      <div className="flex gap-2 border-b border-border-custom pb-0">
        {(['Available', 'MyTasks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
          >
            {tab === 'Available' ? '🔓 Việc có sẵn' : '📋 Việc của tôi'}
          </button>
        ))}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-brand" size={32} />
          <span className="ml-3 text-text-secondary">Đang tải...</span>
        </div>
      )}

      {/* Khi không có task */}
      {!loading && tasks.length === 0 && (
        <div className="text-center py-16 text-text-secondary">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Chưa có task nào</p>
          <p className="text-sm mt-1">
            {activeTab === 'Available'
              ? 'Hiện tại không có công việc nào đang chờ nhận'
              : 'Bạn chưa nhận công việc nào'}
          </p>
        </div>
      )}

      {/* Danh sách task */}
      {!loading && tasks.length > 0 && (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.Id || task.id}
              className="p-5 rounded-xl bg-bg-secondary border border-border-custom hover:border-brand/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Thông tin task */}
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary text-lg">
                    {task.TaskName || task.taskName || task.SeriesTitle || task.seriesTitle || 'Untitled Task'}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-text-secondary">
                    {(task.ChapterTitle || task.chapterTitle) && (
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {task.ChapterTitle || task.chapterTitle}
                      </span>
                    )}
                    {(task.RegionLabel || task.regionLabel || task.RegionType || task.regionType) && (
                      <span className="flex items-center gap-1">
                        <Play size={14} />
                        {task.RegionLabel || task.regionLabel || task.RegionType || task.regionType}
                      </span>
                    )}
                    {(task.Deadline || task.deadline) && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDeadline(task.Deadline || task.deadline)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status + Giá tiền */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.Status || task.status)}`}>
                    {task.Status || task.status}
                  </span>
                  <span className="text-brand font-bold">
                    {formatCurrency(task.Amount || task.amount || 0)}
                  </span>
                </div>
              </div>

              {/* Nút nhận việc — chỉ hiện ở tab Available */}
              {activeTab === 'Available' && (task.Status === 'Available' || task.status === 'Available') && (
                <div className="mt-4 pt-3 border-t border-border-custom">
                  <button
                    onClick={() => handleAcceptTask(task.Id || task.id)}
                    className="px-4 py-2 bg-gradient-to-br from-brand to-brand-hover text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-brand/25 transition-all duration-200"
                  >
                    <Download size={16} className="inline mr-2" />
                    Nhận việc
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};