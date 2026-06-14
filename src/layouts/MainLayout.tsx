import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSignalR } from '../hooks/useSignalR';

export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialize SignalR connection for the whole app
  useSignalR();

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
    setMobileOpen(false);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={handleToggleCollapse}
        onCloseMobile={handleCloseMobile}
      />

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-[margin-left] duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
        `}
      >
        {/* Header */}
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        {/* Page content */}
        <main className="flex-1 p-6 max-w-[1440px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
