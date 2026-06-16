import { useState } from 'react';
import { Users, Search, CheckCircle, XCircle, UserPlus, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../admin/api/admin.api';
import { CreateUserModal } from './CreateUserModal';
import { CustomSelect } from '../../../components/common/CustomSelect';

export const UserManagementFeature = () => {
  const queryClient = useQueryClient();
  const [filterRole, setFilterRole] = useState('All');
  // Default to Pending because backend doesn't have an API to get all users
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch users. Since backend lacks a general GET API, we prioritize the pending assistants API
  // or fallback to an empty array for other filters until backend provides the API.
  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['admin-users', filterRole, filterStatus],
    queryFn: async () => {
      try {
        if (filterStatus === 'Pending') {
          const res = await adminApi.getPendingAssistants();
          const items = res.data.Data || [];
          return items.map((u) => ({
            id: u.Id?.toString() || Math.random().toString(),
            email: u.Email || '',
            fullName: u.FullName || u.UserName || '',
            role: 'Assistant',
            portfolioUrl: u.PortfolioUrl || '',
            skills: u.Skills || '',
            status: u.Status || 'Pending',
            createdAt: new Date().toISOString()
          }));
        } else {
          // Attempt to call the missing generic API
          const response = await adminApi.getUsers({
            role: filterRole !== 'All' ? filterRole : undefined,
            status: filterStatus !== 'All' ? filterStatus : undefined
          });
          return response.data.Data || (response.data as any).data || [];
        }
      } catch (error) {
        console.warn("Backend API for listing users might be missing.", error);
        return [];
      }
    }
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => adminApi.approveUser(userId),
    onSuccess: () => {
      toast.success('Đã duyệt tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Có lỗi xảy ra khi duyệt tài khoản')
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => adminApi.rejectUser(userId),
    onSuccess: () => {
      toast.success('Đã từ chối tài khoản');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Có lỗi xảy ra khi từ chối tài khoản')
  });

  const lockMutation = useMutation({
    mutationFn: (userId: string) => adminApi.lockUser(userId),
    onSuccess: () => {
      toast.success('Đã khóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Có lỗi xảy ra khi khóa tài khoản')
  });

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Users size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Quản lý người dùng</h1>
            <p className="page-header__subtitle">Quản lý tài khoản, phân quyền và phê duyệt</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium shadow-lg shadow-brand/20"
        >
          <UserPlus size={18} /> Tạo người dùng
        </button>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm email, tên..."
            className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-custom rounded-lg focus:outline-none focus:border-brand text-sm"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <CustomSelect
            options={[
              { value: 'All', label: 'Tất cả Role' },
              { value: 'Assistant', label: 'Assistant' },
              { value: 'Mangaka', label: 'Mangaka' },
              { value: 'Editor', label: 'Editor' },
            ]}
            value={filterRole}
            onChange={setFilterRole}
            className="w-[160px]"
          />
          <CustomSelect
            options={[
              { value: 'All', label: 'Tất cả trạng thái' },
              { value: 'Pending', label: 'Chờ duyệt' },
              { value: 'Active', label: 'Hoạt động' },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-[180px]"
          />
        </div>
      </div>

      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary/50 text-text-secondary text-sm border-b border-border-custom">
                  <th className="p-4 font-medium">Họ tên</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Vai trò</th>
                  <th className="p-4 font-medium">Portfolio / Skills</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Ngày tạo</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      Không tìm thấy người dùng nào (Lưu ý: Backend chưa có API GET All Users)
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="border-b border-border-custom/50 hover:bg-bg-primary/30 transition-colors">
                      <td className="p-4 font-medium text-text-primary">{user.fullName}</td>
                      <td className="p-4 text-text-secondary">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'Assistant' ? 'bg-purple-500/10 text-purple-400' :
                            user.role === 'Mangaka' ? 'bg-blue-500/10 text-blue-400' :
                              user.role === 'Editor' ? 'bg-orange-500/10 text-orange-400' :
                                'bg-gray-500/10 text-gray-400'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {user.portfolioUrl ? (
                            <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline text-xs flex items-center gap-1 w-fit">
                              Xem Portfolio ↗
                            </a>
                          ) : (
                            <span className="text-text-muted text-xs italic">Chưa cập nhật</span>
                          )}
                          {user.skills && (
                            <span className="text-xs text-text-secondary truncate max-w-[150px]" title={user.skills}>
                              {user.skills}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${user.status === 'Active' ? 'bg-green-500/10 text-green-400' :
                            user.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                              user.status === 'Locked' ? 'bg-red-500/10 text-red-400' :
                                'bg-red-500/10 text-red-400'
                          }`}>
                          {user.status === 'Active' && <CheckCircle size={12} />}
                          {user.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
                          {user.status === 'Locked' && <Lock size={12} />}
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-right">
                        {user.status === 'Pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => approveMutation.mutate(user.id)}
                              disabled={approveMutation.isPending}
                              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                            >
                              <CheckCircle size={14} /> Duyệt
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(user.id)}
                              disabled={rejectMutation.isPending}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                            >
                              <XCircle size={14} /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {user.status === 'Active' && (
                              <button
                                onClick={() => lockMutation.mutate(user.id)}
                                disabled={lockMutation.isPending}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                              >
                                <Lock size={14} /> Khóa
                              </button>
                            )}
                            {user.status === 'Locked' && (
                              <button
                                onClick={() => approveMutation.mutate(user.id)}
                                disabled={approveMutation.isPending}
                                className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                              >
                                <Unlock size={14} /> Mở khóa
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateUserModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};
