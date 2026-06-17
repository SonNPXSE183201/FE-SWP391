import { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  UserPlus,
  Lock,
  Unlock,
} from "lucide-react";
import { CreateUserModal } from "./CreateUserModal";
import { CustomSelect } from "../../../components/common/CustomSelect";
import { Pagination } from "../../../components/common/Pagination";
import { generatePageRange } from "../../../hooks/usePagination";
import {
  useAdminUsers,
  useApproveUser,
  useRejectUser,
  useLockUser,
} from "../hooks/useAdminUsers";

export const UserManagementFeature = () => {
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [filterRole, filterStatus, debouncedSearch]);

  const { data: usersData, isLoading: loading } = useAdminUsers({
    filterRole,
    filterStatus,
    search: debouncedSearch,
    page,
    pageSize,
  });

  const users = usersData?.Items || [];
  const totalItems = usersData?.TotalItems || 0;
  const totalPages = usersData?.TotalPages || 1;
  const currentPage = usersData?.PageNumber || page;

  const pageRange = generatePageRange(currentPage, totalPages, 1);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Mutations
  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();
  const lockMutation = useLockUser();

  return (
    <div className="flex flex-col h-full">
      <div className="page-header flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Users size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Quản lý người dùng</h1>
            <p className="page-header__subtitle">
              Quản lý tài khoản, phân quyền và phê duyệt
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium shadow-lg shadow-brand/20"
        >
          <UserPlus size={18} /> Tạo người dùng
        </button>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm email, tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-custom rounded-lg focus:outline-none focus:border-brand text-sm text-text-primary"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <CustomSelect
            options={[
              { value: "All", label: "Tất cả Role" },
              { value: "Assistant", label: "Assistant" },
              { value: "Mangaka", label: "Mangaka" },
              { value: "Editor", label: "Editor" },
            ]}
            value={filterRole}
            onChange={setFilterRole}
            className="w-[160px]"
          />
          <CustomSelect
            options={[
              { value: "All", label: "Tất cả trạng thái" },
              { value: "Pending", label: "Chờ duyệt" },
              { value: "Active", label: "Hoạt động" },
              { value: "Locked", label: "Đã khóa" },
            ]}
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-[180px]"
          />
        </div>
      </div>

      <div className="mt-6 flex-1 flex flex-col min-h-0">
        <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden flex flex-col h-full">
          {loading ? (
            <div className="flex-1 flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-bg-secondary z-10 shadow-sm">
                    <tr className="bg-bg-primary/50 text-text-secondary text-sm border-b border-border-custom">
                      <th className="p-4 font-medium rounded-tl-lg">Họ tên</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Vai trò</th>
                      <th className="p-4 font-medium">Trạng thái</th>
                      <th className="p-4 font-medium text-right rounded-tr-lg">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-text-muted">
                          Không tìm thấy người dùng nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.Id}
                          className="border-b border-border-custom/50 hover:bg-bg-primary/30 transition-colors"
                        >
                          <td className="p-4 font-medium text-text-primary">
                            {user.FullName || user.UserName}
                          </td>
                          <td className="p-4 text-text-secondary">{user.Email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                user.RoleId === 5
                                  ? "bg-purple-500/10 text-purple-400" // Assistant
                                  : user.RoleId === 4
                                    ? "bg-blue-500/10 text-blue-400" // Mangaka
                                    : user.RoleId === 3
                                      ? "bg-indigo-500/10 text-indigo-400" // Board
                                      : user.RoleId === 2
                                        ? "bg-orange-500/10 text-orange-400" // Editor
                                        : "bg-gray-500/10 text-gray-400" // Admin
                              }`}
                            >
                              {user.RoleId === 5 ? "Assistant" : user.RoleId === 4 ? "Mangaka" : user.RoleId === 3 ? "Board" : user.RoleId === 2 ? "Editor" : "Admin"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${
                                user.Status === "Active"
                                  ? "bg-green-500/10 text-green-400"
                                  : user.Status === "Pending"
                                    ? "bg-yellow-500/10 text-yellow-400"
                                    : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {user.Status === "Active" && <CheckCircle size={12} />}
                              {user.Status === "Pending" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                              )}
                              {user.Status === "Locked" && <Lock size={12} />}
                              {user.Status === "Rejected" && <XCircle size={12} />}
                              {user.Status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {user.Status === "Pending" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => approveMutation.mutate(user.Id!)}
                                  disabled={approveMutation.isPending}
                                  className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                                >
                                  <CheckCircle size={14} /> Duyệt
                                </button>
                                <button
                                  onClick={() => rejectMutation.mutate(user.Id!)}
                                  disabled={rejectMutation.isPending}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                                >
                                  <XCircle size={14} /> Từ chối
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                {user.Status === "Active" && (
                                  <button
                                    onClick={() => lockMutation.mutate(user.Id!)}
                                    disabled={lockMutation.isPending}
                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                                  >
                                    <Lock size={14} /> Khóa
                                  </button>
                                )}
                                {user.Status === "Locked" && (
                                  <button
                                    onClick={() => approveMutation.mutate(user.Id!)}
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

              {totalPages > 1 && (
                <div className="p-4 border-t border-border-custom bg-bg-secondary">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageRange={pageRange}
                    totalItems={totalItems}
                    startItem={startItem}
                    endItem={endItem}
                    canGoNext={currentPage < totalPages}
                    canGoPrev={currentPage > 1}
                    onPageChange={setPage}
                    onNextPage={() => setPage((p) => p + 1)}
                    onPrevPage={() => setPage((p) => p - 1)}
                    itemLabel="người dùng"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateUserModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};
