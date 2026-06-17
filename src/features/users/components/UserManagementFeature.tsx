import { useState } from 'react';
import { Users, Search, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type UserListItem } from '../../admin/api/admin.api';

// Mock Data as fallback since backend is not ready
const mockUsers: UserListItem[] = [
  { id: 'u1', email: 'assistant_new@inku.com', fullName: 'Nguyễn Trần Trợ Lý', role: 'Assistant', status: 'Pending', createdAt: '2026-06-05T10:00:00Z' },
  { id: 'u2', email: 'editor_1@inku.com', fullName: 'Trần Biên Tập', role: 'Editor', status: 'Active', createdAt: '2026-05-20T08:30:00Z' },
  { id: 'u3', email: 'mangaka_pro@inku.com', fullName: 'Oda Eiichiro', role: 'Mangaka', status: 'Active', createdAt: '2026-01-15T09:15:00Z' },
  { id: 'u4', email: 'assistant_2@inku.com', fullName: 'Lê Minh Họa', role: 'Assistant', status: 'Active', createdAt: '2026-04-10T14:20:00Z' },
];

export const UserManagementFeature = () => {
  const queryClient = useQueryClient();
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const { data: users = [], isLoading: loading } = useQuery<UserListItem[]>({
    queryKey: ['admin-users', filterRole, filterStatus],
    queryFn: async () => {
      try {
        // Try real API, if fails fallback to mock
        const response = await adminApi.getUsers({
          role: filterRole !== 'All' ? filterRole : undefined,
          status: filterStatus !== 'All' ? filterStatus : undefined
        });
        return response.data.data;
      } catch {
        // Fallback to mock
        await new Promise(resolve => setTimeout(resolve, 800));
        let filtered = [...mockUsers];
        if (filterRole !== 'All') filtered = filtered.filter(u => u.role === filterRole);
        if (filterStatus !== 'All') filtered = filtered.filter(u => u.status === filterStatus);
        return filtered;
      }
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      // Mocking API call
      // await adminApi.approveAssistant({ userId, approved });
      return { userId, approved };
    },
    onSuccess: ({ userId, approved }) => {
      queryClient.setQueryData(['admin-users', filterRole, filterStatus], (oldData: UserListItem[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(u => u.id === userId ? { ...u, status: approved ? 'Active' : 'Rejected' } : u);
      });
      toast.success(approved ? 'Đã duyệt tài khoản Assistant' : 'Đã từ chối tài khoản Assistant');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi duyệt tài khoản');
    }
  });

  const handleApprove = (userId: string, approved: boolean) => {
    approveMutation.mutate({ userId, approved });
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Users size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Quản lý người dùng</h1>
            <p className="page-header__subtitle">Phê duyệt tài khoản Assistant và quản lý thành viên</p>
          </div>
        </div>
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
          <select
            className="bg-bg-secondary border border-border-custom rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">Tất cả Role</option>
            <option value="Assistant">Assistant</option>
            <option value="Mangaka">Mangaka</option>
            <option value="Editor">Editor</option>
          </select>
          <select
            className="bg-bg-secondary border border-border-custom rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Active">Hoạt động</option>
          </select>
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
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Ngày tạo</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">Không tìm thấy người dùng nào</td>
                  </tr>
                ) : (
                  users.map((user) => (
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${user.status === 'Active' ? 'bg-green-500/10 text-green-400' :
                            user.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-red-500/10 text-red-400'
                          }`}>
                          {user.status === 'Active' && <CheckCircle size={12} />}
                          {user.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-right">
                        {user.role === 'Assistant' && user.status === 'Pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApprove(user.id, true)}
                              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                            >
                              <CheckCircle size={14} /> Duyệt
                            </button>
                            <button
                              onClick={() => handleApprove(user.id, false)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                            >
                              <XCircle size={14} /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-primary rounded-md transition-colors">
                            <MoreVertical size={16} />
                          </button>
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
    </div>
  );
};
