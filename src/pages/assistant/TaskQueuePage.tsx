import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, Search, Filter, Play, Download, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { taskApi } from '../../features/tasks/api/task.api';

// --- Mock Types ---
type TaskStatus = 'Available' | 'In_Progress' | 'Pending_Review' | 'Approved' | 'Revision' | 'Cancelled';

interface MockTask {
  id: string;
  seriesTitle: string;
  chapterNumber: number;
  regionType: string;
  amount: number;
  deadline: string;
  status: TaskStatus;
}

const initialMockTasks: MockTask[] = [
  { id: 't1', seriesTitle: 'One Piece', chapterNumber: 1102, regionType: 'Lineart', amount: 500000, deadline: '2026-06-08T10:00:00Z', status: 'Available' },
  { id: 't2', seriesTitle: 'Naruto', chapterNumber: 500, regionType: 'Background', amount: 300000, deadline: '2026-06-07T15:00:00Z', status: 'Available' },
  { id: 't3', seriesTitle: 'Bleach', chapterNumber: 420, regionType: 'Screentone', amount: 250000, deadline: '2026-06-06T12:00:00Z', status: 'In_Progress' },
  { id: 't4', seriesTitle: 'One Punch Man', chapterNumber: 150, regionType: 'Coloring', amount: 800000, deadline: '2026-06-05T09:00:00Z', status: 'Pending_Review' },
];

export const TaskQueuePage = () => {
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Available' | 'MyTasks'>('Available');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Attempt real API
        if (activeTab === 'Available') {
          await taskApi.getAvailableTasks();
        } else {
          await taskApi.getMyTasks();
        }
      } catch (error) {
        // Fallback to Mock
      } finally {
        setTimeout(() => {
          if (activeTab === 'Available') {
            setTasks(initialMockTasks.filter(t => t.status === 'Available'));
          } else {
            setTasks(initialMockTasks.filter(t => t.status !== 'Available'));
          }
          setLoading(false);
        }, 600);
      }
    };
    fetchTasks();
  }, [activeTab]);

  const handleAcceptTask = (taskId: string) => {
    try {
      // Mock Accept Task
      const taskIndex = initialMockTasks.findIndex(t => t.id === taskId);
      if (taskIndex > -1) {
        initialMockTasks[taskIndex].status = 'In_Progress';
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success('Nhận việc thành công! Task đã được chuyển sang "Việc của tôi"');
      }
    } catch (error) {
      toast.error('Lỗi khi nhận việc');
    }
  };

  const handleSubmitTask = (taskId: string) => {
    try {
      const taskIndex = initialMockTasks.findIndex(t => t.id === taskId);
      if (taskIndex > -1) {
        initialMockTasks[taskIndex].status = 'Pending_Review';
        // Force re-render if we are in MyTasks
        setTasks(initialMockTasks.filter(t => t.status !== 'Available'));
        toast.success('Đã nộp kết quả chờ duyệt!');
      }
    } catch (error) {
      toast.error('Lỗi khi nộp bài');
    }
  };

  const renderTaskCard = (task: MockTask) => (
    <div key={task.id} className="bg-bg-secondary border border-border-custom hover:border-brand/50 transition-all rounded-xl p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{task.seriesTitle} - Ch. {task.chapterNumber}</h3>
          <span className="inline-block mt-1 px-2.5 py-1 bg-brand/10 text-brand rounded-md text-xs font-medium border border-brand/20">
            {task.regionType}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-400">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(task.amount)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Clock size={16} className="text-orange-400" />
        <span>Deadline: {new Date(task.deadline).toLocaleString('vi-VN')}</span>
      </div>

      <div className="pt-4 border-t border-border-custom flex justify-end gap-2">
        {task.status === 'Available' && (
          <button 
            onClick={() => handleAcceptTask(task.id)}
            className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Play size={16} /> Nhận việc
          </button>
        )}
        
        {task.status === 'In_Progress' && (
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-bg-surface hover:bg-bg-primary text-text-primary border border-border-custom rounded-lg text-sm font-medium transition-colors">
              <Download size={16} /> Tải tài nguyên
            </button>
            <button 
              onClick={() => handleSubmitTask(task.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Upload size={16} /> Nộp bài
            </button>
          </>
        )}

        {task.status === 'Pending_Review' && (
          <span className="flex items-center gap-2 text-yellow-400 font-medium text-sm">
            <Clock size={16} /> Đang chờ duyệt
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Hàng chờ công việc</h1>
            <p className="page-header__subtitle">Tìm kiếm và nhận Task mới</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-border-custom">
        <button 
          onClick={() => setActiveTab('Available')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'Available' ? 'border-brand text-brand' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          Task khả dụng
        </button>
        <button 
          onClick={() => setActiveTab('MyTasks')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'MyTasks' ? 'border-brand text-brand' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          Việc của tôi
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted">
            <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
            <p>Không có công việc nào trong danh sách này</p>
          </div>
        ) : (
          tasks.map(renderTaskCard)
        )}
      </div>
    </div>
  );
};
