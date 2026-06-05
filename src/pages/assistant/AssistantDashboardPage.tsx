import React from 'react';
import { LayoutDashboard, TrendingUp, CheckCircle, Clock, Star } from 'lucide-react';

export const AssistantDashboardPage = () => {
  // Mock Data
  const stats = {
    inProgress: 2,
    completed: 15,
    averageRating: 4.8,
    monthlyIncome: 15500000
  };

  const recentTasks = [
    { id: 1, title: 'One Piece - Ch. 1102 (Lineart)', status: 'Approved', amount: 500000, date: '2026-06-04' },
    { id: 2, title: 'Naruto - Ch. 500 (Background)', status: 'In_Progress', amount: 300000, date: '2026-06-05' },
    { id: 3, title: 'Bleach - Ch. 420 (Screentone)', status: 'Pending_Review', amount: 250000, date: '2026-06-05' }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Dashboard Trợ lý vẽ</h1>
            <p className="page-header__subtitle">Tổng quan công việc và thu nhập</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-center z-10">
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Task đang làm</span>
            <Clock size={18} className="text-blue-400" />
          </div>
          <span className="text-3xl font-bold text-text-primary z-10">{stats.inProgress}</span>
        </div>

        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-center z-10">
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Task hoàn thành</span>
            <CheckCircle size={18} className="text-green-400" />
          </div>
          <span className="text-3xl font-bold text-text-primary z-10">{stats.completed}</span>
        </div>

        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-center z-10">
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Đánh giá TB</span>
            <Star size={18} className="text-yellow-400" />
          </div>
          <span className="text-3xl font-bold text-text-primary z-10">{stats.averageRating} / 5.0</span>
        </div>

        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex justify-between items-center z-10">
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Thu nhập tháng</span>
            <TrendingUp size={18} className="text-brand" />
          </div>
          <span className="text-2xl font-bold text-brand z-10">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.monthlyIncome)}
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border-custom">
          <h2 className="text-lg font-bold text-text-primary">Hoạt động gần đây</h2>
        </div>
        <div className="divide-y divide-border-custom">
          {recentTasks.map(task => (
            <div key={task.id} className="p-5 flex items-center justify-between hover:bg-bg-primary/50 transition-colors">
              <div>
                <p className="font-medium text-text-primary mb-1">{task.title}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{new Date(task.date).toLocaleDateString('vi-VN')}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    task.status === 'Approved' ? 'bg-green-500/10 text-green-400' :
                    task.status === 'In_Progress' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="font-bold text-text-primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(task.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
