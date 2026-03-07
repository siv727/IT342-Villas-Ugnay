import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`lg:block ${mobileOpen ? 'block' : 'hidden'}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <div className={`transition-all duration-250 ease-in-out ${collapsed ? 'lg:ml-16' : 'lg:ml-[260px]'}`}>
        <Navbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
