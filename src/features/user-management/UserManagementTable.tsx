import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsersAPI,type User } from '../../api/user'; // Import hàm gọi API và kiểu dữ liệu từ Bước 1

export const UserManagementTable: React.FC = () => {
  // Quản lý số trang hiện tại, mặc định bắt đầu từ trang 1
  const [page, setPage] = useState<number>(1);
  const limit = 10; // Cấu hình hiển thị 10 dòng trên 1 trang

  // Sử dụng React Query để tự động gọi API và quản lý cache theo từng số trang (page)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', page], // Mỗi khi page đổi, React Query tự fetch lại dữ liệu trang mới
    queryFn: () => getUsersAPI(page, limit),
    placeholderData: (previousData) => previousData, // Giúp giao diện mượt mà, không bị giật trắng khi đổi trang
  });

  // Hàm helper để tô màu cho các trạng thái (Status) theo mô tả của leader
  const getStatusBadgeClass = (status: User['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'; // Đang hoạt động: Xanh lá
      case 'Pending':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'; // Đang chờ duyệt: Vàng/Cam
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';     // Từ chối duyệt: Đỏ nhạt
      case 'Locked':
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';   // Bị chặn: Xám
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-slate-400">Đang tải danh sách người dùng...</div>;
  }

  if (isError) {
    return <div className="p-6 text-center text-red-400">Gặp lỗi khi tải dữ liệu: {(error as Error).message}</div>;
  }

  // Lấy danh sách và thông tin phân trang từ dữ liệu trả về của API
  const userList = data?.users || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Quản lý Thành viên (Admin)</h2>
        <p className="text-sm text-slate-400 mt-1">Xem, phân trang và quản lý trạng thái hoạt động của người dùng hệ thống.</p>
      </div>

      {/* BẢNG DANH SÁCH USER (MAP DATA) */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="min-w-full table-auto text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Mã số</th>
              <th className="px-6 py-4">Họ và tên</th>
              <th className="px-6 py-4">Địa chỉ Email</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {userList.length > 0 ? (
              userList.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{user.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{user.fullName}</td>
                  <td className="px-6 py-4 text-slate-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Không tìm thấy người dùng nào trong hệ thống.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION UI) */}
      <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
        <div>
          Trang <span className="text-white font-medium">{page}</span> trên tổng số <span className="text-white font-medium">{totalPages}</span> trang
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
          >
            Trang trước
          </button>
          <button
            onClick={() => setPage((prev) => (page < totalPages ? prev + 1 : prev))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
};