import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminApi } from "../../admin";
import type { UpdateUserByAdminDto } from "../../../api/generated/types";

interface UseAdminUsersOptions {
  filterRole: string;
  filterStatus: string;
  search: string;
  page: string | number;
  pageSize: number;
}

export const useAdminUsers = ({
  filterRole,
  filterStatus,
  search,
  page,
  pageSize,
}: UseAdminUsersOptions) => {
  return useQuery({
    queryKey: ["admin-users", filterRole, filterStatus, search, page, pageSize],
    queryFn: async () => {
      const response = await adminApi.getUsers({
        role: filterRole !== "All" ? filterRole : undefined,
        status: filterStatus !== "All" ? filterStatus : undefined,
        search: search || undefined,
        page: Number(page),
        pageSize,
      });
      return response.data.data;
    },
  });
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.approveUser(userId),
    onSuccess: () => {
      toast.success("Đã duyệt tài khoản thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Có lỗi xảy ra khi duyệt tài khoản"),
  });
};

export const useRejectUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.rejectUser(userId),
    onSuccess: () => {
      toast.success("Đã từ chối tài khoản");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Có lỗi xảy ra khi từ chối tài khoản"),
  });
};

export const useLockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.lockUser(userId),
    onSuccess: () => {
      toast.success("Đã khóa tài khoản thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Có lỗi xảy ra khi khóa tài khoản"),
  });
};

export const useUnlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.unlockUser(userId),
    onSuccess: () => {
      toast.success("Đã mở khóa tài khoản thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Có lỗi xảy ra khi mở khóa tài khoản"),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserByAdminDto }) =>
      adminApi.updateUser(id, data),
    onSuccess: (res) => {
      const responseData = res.data;
      if (responseData.success) {
        toast.success(responseData.message || "Cập nhật tài khoản thành công");
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      } else {
        toast.error(responseData.message || "Có lỗi xảy ra");
      }
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || "Có lỗi xảy ra khi cập nhật tài khoản");
    },
  });
};
