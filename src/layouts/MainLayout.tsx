import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './MainLayout.css';

export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
    // Close mobile menu when toggling collapse
    setMobileOpen(false);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={handleToggleCollapse}
        onCloseMobile={handleCloseMobile}
      />

      {/* Main content area */}
      <div
        className={`main-content-wrapper ${
          sidebarCollapsed ? 'main-content-wrapper--collapsed' : ''
        }`}
      >
        {/* Header */}
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        {/* Page content via Outlet */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
