import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { TopNavbar } from './TopNavbar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-300'
        )}
      >
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <TopNavbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
