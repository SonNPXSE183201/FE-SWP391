import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { UserRole } from "../stores/authStore";
import { Logo } from "../components/common/Logo";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Wallet,
  BarChart3,
  Vote,
  Calendar,
  Users,
  Shield,
  FileSignature,
  Receipt,
  ArrowUpFromLine,
  PanelLeftClose,
  PanelLeft,
  Palette,
  BriefcaseBusiness,
  Mailbox,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAssistantInvites } from "../features/assistant-management";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: number;
}

interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

// Navigation configs per role
const getNavSections = (role: UserRole, invitesCount: number = 0): NavSectionConfig[] => {
  switch (role) {
    case "Mangaka":
      return [
        {
          title: "Tổng quan",
          items: [
            {
              label: "Bảng tin",
              path: "/mangaka",
              icon: <LayoutDashboard size={20} />,
            },
          ],
        },
        {
          title: "Tác phẩm",
          items: [
            {
              label: "Danh sách truyện",
              path: "/mangaka/series",
              icon: <BookOpen size={20} />,
            },
            {
              label: "Quản lý bản thảo",
              path: "/mangaka/manuscripts",
              icon: <FileText size={20} />,
            },
          ],
        },
        {
          title: "Nhân sự & Công việc",
          items: [
            {
              label: "Tìm cộng sự",
              path: "/mangaka/assistants",
              icon: <Users size={20} />,
            },
            {
              label: "Giao việc & Tiến độ",
              path: "/mangaka/tasks",
              icon: <ClipboardList size={20} />,
            },
          ],
        },
        {
          title: "Tài chính",
          items: [
            {
              label: "Quản lý doanh thu",
              path: "/mangaka/wallet",
              icon: <Wallet size={20} />,
            },
          ],
        },
      ];

    case "Assistant":
      return [
        {
          title: "Tổng quan",
          items: [
            {
              label: "Bảng tin",
              path: "/assistant",
              icon: <LayoutDashboard size={20} />,
            },
          ],
        },
        {
          title: "Hồ sơ & Công việc",
          items: [
            {
              label: "Lời mời dự án",
              path: "/assistant/invites",
              icon: <Mailbox size={20} />,
              badge: invitesCount,
            },
            {
              label: "Bảng việc làm",
              path: "/assistant/tasks",
              icon: <ClipboardList size={20} />,
            },
            {
              label: "Portfolio",
              path: "/assistant/portfolio",
              icon: <Palette size={20} />,
            },
            {
              label: "Hồ sơ nghề nghiệp",
              path: "/assistant/profile",
              icon: <BriefcaseBusiness size={20} />,
            },
          ],
        },
        {
          title: "Tài chính",
          items: [
            {
              label: "Thu nhập",
              path: "/assistant/wallet",
              icon: <Wallet size={20} />,
            },
          ],
        },
      ];

    case "Editor":
      return [
        {
          title: "Tổng quan",
          items: [
            {
              label: "Bảng tin",
              path: "/editor",
              icon: <LayoutDashboard size={20} />,
            },
          ],
        },
        {
          title: "Nghiệp vụ Biên tập",
          items: [
            {
              label: "Thẩm định dự án",
              path: "/editor/series-review",
              icon: <BookOpen size={20} />,
            },
            {
              label: "Biên tập chương",
              path: "/editor/chapter-review",
              icon: <FileText size={20} />,
            },

            {
              label: "Phân xử tranh chấp",
              path: "/editor/disputes",
              icon: <Shield size={20} />,
            },
          ],
        },
      ];

    case "Board":
      return [
        {
          title: "Tổng quan",
          items: [
            {
              label: "Bảng tin",
              path: "/board",
              icon: <LayoutDashboard size={20} />,
            },
          ],
        },
        {
          title: "Nghiệp vụ Hội đồng",
          items: [
            {
              label: "Bỏ phiếu",
              path: "/board/voting",
              icon: <Vote size={20} />,
            },
            {
              label: "Xếp hạng",
              path: "/board/ranking",
              icon: <BarChart3 size={20} />,
            },
            {
              label: "Nhập liệu xếp hạng",
              path: "/board/ranking-data",
              icon: <FileSignature size={20} />,
            },
            {
              label: "Lịch xuất bản",
              path: "/board/schedule",
              icon: <Calendar size={20} />,
            },
          ],
        },
      ];

    case "Admin":
      return [
        {
          title: "Tổng quan",
          items: [
            {
              label: "Bảng tin",
              path: "/admin",
              icon: <LayoutDashboard size={20} />,
            },
          ],
        },
        {
          title: "Vận hành & Hệ thống",
          items: [
            {
              label: "Quản lý người dùng",
              path: "/admin/users",
              icon: <Users size={20} />,
            },
            {
              label: "Hợp đồng",
              path: "/admin/contracts",
              icon: <FileSignature size={20} />,
            },
            {
              label: "Đối soát giao dịch",
              path: "/admin/reconciliation",
              icon: <Receipt size={20} />,
            },
            {
              label: "Duyệt rút tiền",
              path: "/admin/withdraw-approval",
              icon: <ArrowUpFromLine size={20} />,
            },
            {
              label: "Biểu quyết HĐ",
              path: "/admin/board-voting",
              icon: <Vote size={20} />,
            },
          ],
        },
      ];

    default:
      return [];
  }
};

export const Sidebar = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const { data: invites = [] } = useAssistantInvites();

  if (!user) return null;

  const navSections = getNavSections(user.role, invites.length);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[35] bg-black/50 backdrop-blur-sm lg:hidden animate-sidebar-overlay"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="main-sidebar"
        className={`
          fixed top-0 left-0 z-40 flex flex-col h-screen bg-bg-primary border-r border-border-custom
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center h-16 px-4 border-b border-border-custom flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && <Logo size="sm" showText />}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg-custom bg-transparent text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-all duration-200 border-none cursor-pointer"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-bg-surface">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive =
                  item.path === `/${user.role.toLowerCase()}`
                    ? location.pathname === item.path
                    : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`
                      ui-nav-item group flex items-center gap-2 my-0.5 rounded-lg-custom text-sm font-medium
                      no-underline border border-transparent
                      ${collapsed ? "justify-center p-2.5" : "px-4 py-2.5"}
                      ${
                        isActive
                          ? "bg-brand/[0.12] text-brand border-brand/20 hover:bg-brand/[0.18] hover:text-brand-hover"
                          : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                      }
                    `}
                    onClick={onCloseMobile}
                  >
                    <span className="flex items-center justify-center shrink-0 w-5 h-5">
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && item.badge > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger text-white text-[11px] font-bold shrink-0">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
