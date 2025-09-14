'use client';

import { Clover, Film, Home, Menu, Search, Star, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

export interface CustomChild {
  name: string;
  type: 'movie' | 'tv';
  query: string;
}

export interface CustomParent {
  name: string;
  children: CustomChild[];
}

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

interface SidebarContextType {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextType>({ isCollapsed: false });
export const useSidebar = () => useContext(SidebarContext);

const Logo = () => <Link href="/" className="flex items-center justify-center h-16 font-bold text-2xl text-green-600">MoonTV</Link>;

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  activePath?: string;
}

declare global {
  interface Window {
    __sidebarCollapsed?: boolean;
    RUNTIME_CONFIG?: {
      CUSTOM_PARENT_CATEGORY?: CustomParent[];
    };
  }
}

const Sidebar = ({ onToggle, activePath = '/' }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => window.__sidebarCollapsed ?? false);

  useLayoutEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      const val = JSON.parse(saved);
      setIsCollapsed(val);
      window.__sidebarCollapsed = val;
    }
  }, []);

  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCollapsed) document.documentElement.dataset.sidebarCollapsed = 'true';
      else delete document.documentElement.dataset.sidebarCollapsed;
    }
  }, [isCollapsed]);

  const [active, setActive] = useState(activePath);

  useEffect(() => {
    const fullPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    setActive(activePath || fullPath);
  }, [activePath, pathname, searchParams]);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    window.__sidebarCollapsed = newState;
    onToggle?.(newState);
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { icon: Film, label: '电影', href: '/douban?type=movie' },
    { icon: Tv, label: '剧集', href: '/douban?type=tv' },
    { icon: Clover, label: '综艺', href: '/douban?type=show' },
  ]);

  useEffect(() => {
    const runtimeConfig = window.RUNTIME_CONFIG;
    if (runtimeConfig?.CUSTOM_PARENT_CATEGORY?.length) {
      const customMenu: MenuItem[] = runtimeConfig.CUSTOM_PARENT_CATEGORY.map((parent: CustomParent) => ({
        icon: Star,
        label: parent.name,
        href: `/custom?parent=${encodeURIComponent(parent.name)}`,
      }));
      setMenuItems(prev => [...prev, ...customMenu]);
    }
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className="hidden md:flex">
        <aside
          data-sidebar
          className={`fixed top-0 left-0 h-screen bg-white/40 backdrop-blur-xl transition-all duration-300 border-r border-gray-200/50 z-10 shadow-lg dark:bg-gray-900/70 dark:border-gray-700/50 ${isCollapsed ? 'w-16' : 'w-64'}`}
        >
          <div className="flex h-full flex-col">
            <div className="relative h-16">
              {!isCollapsed && <Logo />}
              <button onClick={handleToggle} className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100/50">
                <Menu className="h-4 w-4" />
              </button>
            </div>
            <nav className="px-2 mt-4 space-y-1">
              <Link href="/" className={`group flex items-center rounded-lg px-2 py-2 pl-4 ${active === '/' ? 'bg-green-500/20 text-green-700' : ''}`}>
                <Home className="h-4 w-4 mr-2" /> {!isCollapsed && '首页'}
              </Link>
              <Link href="/search" className={`group flex items-center rounded-lg px-2 py-2 pl-4 ${active.startsWith('/search') ? 'bg-green-500/20 text-green-700' : ''}`}>
                <Search className="h-4 w-4 mr-2" /> {!isCollapsed && '搜索'}
              </Link>
            </nav>
            <div className="flex-1 overflow-y-auto px-2 pt-4">
              <div className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = decodeURIComponent(active) === decodeURIComponent(item.href);
                  return (
                    <Link key={item.label} href={item.href} className={`group flex items-center rounded-lg px-2 py-2 pl-4 ${isActive ? 'bg-green-500/20 text-green-700' : ''}`}>
                      <Icon className="h-4 w-4 mr-2" /> {!isCollapsed && item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
        <div className={`transition-all duration-300 sidebar-offset ${isCollapsed ? 'w-16' : 'w-64'}`}></div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
