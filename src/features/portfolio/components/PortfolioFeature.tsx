
import { useQuery } from '@tanstack/react-query';

import {
  Palette,
  Briefcase,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { usePortfolioStats } from '../hooks/usePortfolio';
import { getPagedItems } from '../../../api/apiResponse';
import { taskApi } from '../../tasks/api/task.api';
import { formatVND } from '../../wallet';
import type { TasksDto } from '../../../api/generated/types';
import {
  MotionStagger,
  MotionItem,
  MotionTableRow,
  containerVariants,
  listItemVariants,
} from '../../../components/common/animation';
import { motion } from 'framer-motion';

interface PortfolioHistoryTask extends Pick<TasksDto, 'id' | 'deadline' | 'status'> {
  amount?: number;
  paymentAmount?: number;
  title?: string;
  taskName?: string;
  seriesTitle?: string;
}



export const PortfolioFeature = () => {
  // Fetch API data
  const { data: stats, isLoading: statsLoading } = usePortfolioStats();

  // Fetch tasks for history
  const { data: tasksRes, isLoading: tasksLoading } = useQuery({
    queryKey: ['portfolio', 'tasks'],
    queryFn: () => taskApi.getMyTasks({ pageSize: 100 }),
  });
  const tasks = getPagedItems<PortfolioHistoryTask>(tasksRes?.data?.data).map((task) => ({
    ...task,
    id: String((task as { id?: number | string }).id ?? ''),
    title: (task as { description?: string }).description,
    amount: (task as { paymentAmount?: number }).paymentAmount ?? 0,
    deadline: (task as { deadline?: string }).deadline ?? '',
    status: (task as { status?: string }).status ?? 'Pending',
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Palette size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Lịch sử làm việc</h1>
            <p className="page-header__subtitle">Thống kê và quản lý các Task bạn đã tham gia trên nền tảng</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MotionItem>
          <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4 h-full">
            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <Briefcase size={22} />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Task hoàn thành</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {statsLoading ? '...' : stats?.totalCompletedTasks || 0}
              </p>
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4 h-full">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Tỷ lệ duyệt</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {statsLoading ? '...' : `${stats?.onTimeRate || 100}%`}
              </p>
            </div>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-5 flex items-center gap-4 h-full">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-brand mt-1 font-mono">
                {statsLoading ? '...' : formatVND(stats?.totalEarnings || 0)}
              </p>
            </div>
          </div>
        </MotionItem>
      </MotionStagger>

      {/* Task History Table */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden mt-6">
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
                  <motion.tbody
                    className="divide-y divide-border-custom"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    {tasks.map((task) => (
                      <MotionTableRow
                        key={task.id}
                        variants={listItemVariants}
                        className="hover:bg-bg-surface/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-text-primary">#{task.id}</td>
                        <td className="px-6 py-4 font-medium text-text-primary">
                          {task.title ?? task.taskName ?? `${task.seriesTitle ?? 'Series'} - Task`}
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-primary">
                          {formatVND(task.paymentAmount ?? task.amount ?? 0)}
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
                      </MotionTableRow>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            )}
          </div>
    </div>
  );
};
