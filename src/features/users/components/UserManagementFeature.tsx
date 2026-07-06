import { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  UserPlus,
  Lock,
  Unlock,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import type { components } from "../../../api/generated/schema";
import { CustomSelect } from "../../../components/common/CustomSelect";
import { Pagination } from "../../../components/common/Pagination";
import { generatePageRange } from "../../../hooks/usePagination";
import {
  useAdminUsers,
  useApproveUser,
  useRejectUser,
  useLockUser,
  useUnlockUser,
} from "../hooks/useAdminUsers";
import {
  MotionTableRow,
  containerVariants,
  listItemVariants,
} from "../../../components/common/animation";
import { motion } from "framer-motion";

const ROLE_LABELS: Record<string, string> = {
  'System Admin': 'Quản trị hệ thống',
  'Admin': 'Quản trị viên',
  'Editor': 'Biên tập viên',
  'Board': 'Hội đồng duyệt',
  'Mangaka': 'Tác giả',
  'Assistant': 'Trợ lý',
};

const STATUS_LABELS: Record<string, string> = {
  'Active': 'Hoạt động',
  'Pending': 'Chờ duyệt',
  'Locked': 'Đã khóa',
  'Rejected': 'Từ chối',
};

export const UserManagementFeature = () => {
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<components["schemas"]["UserListItemDto"] | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

  const users: components["schemas"]["UserListItemDto"][] = usersData?.items || [];
  const totalItems = usersData?.totalItems || 0;
  const totalPages = usersData?.totalPages || 1;
  const currentPage = usersData?.pageNumber || page;

  const pageRange = generatePageRange(currentPage, totalPages, 1);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Mutations
  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();
  const lockMutation = useLockUser();
  const unlockMutation = useUnlockUser();

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
              { value: "All", label: "Tất cả vai trò" },
              { value: "Assistant", label: "Trợ lý" },
              { value: "Mangaka", label: "Tác giả" },
              { value: "Editor", label: "Biên tập viên" },
              { value: "Board", label: "Hội đồng duyệt" },
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
                      <th className="p-4 font-medium">Editor phụ trách</th>
                      <th className="p-4 font-medium">Ngày tạo</th>
                      <th className="p-4 font-medium text-right rounded-tr-lg">Thao tác</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    className="text-sm"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted">
                          Không tìm thấy người dùng nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <MotionTableRow
                          key={user.id}
                          variants={listItemVariants}
                          className="border-b border-border-custom/50 hover:bg-bg-primary/30 transition-colors"
                        >
                          <td className="p-4 font-medium text-text-primary">
                            {user.fullName || user.email}
                          </td>
                          <td className="p-4 text-text-secondary">{user.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 w-fit ${
                                user.role === "Assistant"
                                  ? "bg-purple-500/10 text-purple-400"
                                  : user.role === "Mangaka"
                                  ? "bg-brand/10 text-brand"
                                  : user.role === "Editor"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : user.role === "Admin"
                                  ? "bg-rose-500/10 text-rose-400"
                                  : "bg-bg-surface text-text-secondary"
                              }`}
                            >
                              {user.role ? (ROLE_LABELS[user.role] || user.role) : '—'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${
                                user.status === "Active"
                                  ? "bg-green-500/10 text-green-400"
                                  : user.status === "Pending"
                                    ? "bg-yellow-500/10 text-yellow-400"
                                    : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {user.status === "Active" && <CheckCircle size={12} />}
                              {user.status === "Pending" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                              )}
                              {user.status === "Locked" && <Lock size={12} />}
                              {user.status === "Rejected" && <XCircle size={12} />}
                              {user.status ? (STATUS_LABELS[user.status] || user.status) : '—'}
                            </span>
                          </td>
                          <td className="p-4 text-text-secondary text-xs">
                            {user.role === "Mangaka"
                              ? user.assignedEditorName ?? (
                                  <span className="text-warning">Chưa gán</span>
                                )
                              : "—"}
                          </td>
                          <td className="p-4 text-text-secondary">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td className="p-4 text-right">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === user.id ? null : user.id!);
                                }}
                                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-primary transition-colors"
                              >
                                <MoreVertical size={18} />
                              </button>
                              {openMenuId === user.id && (
                                <div
                                  className="absolute right-0 mt-1 w-36 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] bg-bg-surface border border-border-custom ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden animate-dropdown-enter"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="py-1">
                                    {user.status === "Pending" ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            approveMutation.mutate(Number(user.id));
                                            setOpenMenuId(null);
                                          }}
                                          disabled={approveMutation.isPending}
                                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-success hover:bg-success/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                          <CheckCircle size={14} /> Duyệt
                                        </button>
                                        <button
                                          onClick={() => {
                                            rejectMutation.mutate(Number(user.id));
                                            setOpenMenuId(null);
                                          }}
                                          disabled={rejectMutation.isPending}
                                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-danger hover:bg-danger/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                          <XCircle size={14} /> Từ chối
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        {user.role === "Mangaka" && (user.status === "Active" || user.status === "Locked") && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingUser(user);
                                              setOpenMenuId(null);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-brand hover:bg-brand/10 flex items-center gap-2 transition-colors"
                                          >
                                            <Pencil size={14} /> Sửa
                                          </button>
                                        )}
                                        {user.status === "Active" && (
                                          <button
                                            onClick={() => {
                                              lockMutation.mutate(Number(user.id));
                                              setOpenMenuId(null);
                                            }}
                                            disabled={lockMutation.isPending}
                                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-danger hover:bg-danger/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                                          >
                                            <Lock size={14} /> Khóa
                                          </button>
                                        )}
                                        {user.status === "Locked" && (
                                          <button
                                            onClick={() => {
                                              unlockMutation.mutate(Number(user.id));
                                              setOpenMenuId(null);
                                            }}
                                            disabled={unlockMutation.isPending}
                                            className="w-full text-left px-4 py-2.5 text-xs font-medium text-success hover:bg-success/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                                          >
                                            <Unlock size={14} /> Mở khóa
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </MotionTableRow>
                      ))
                    )}
                  </motion.tbody>
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

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  );
};
