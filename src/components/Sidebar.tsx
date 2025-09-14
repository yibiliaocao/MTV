'use client';

import { Clover, Film, Home, Menu, Search, Star, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
}

interface CustomParent {
  name: string;
  children?: CustomChild[];
}

interface CustomChild {
  name: string;
  href: string;
}

interface SidebarContextType {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextType>({ isCollapsed: false });
export const useSidebar = () => useContext(SidebarContext);

const Logo = () => <Link href="/" className="flex items-center justify-center h-16 select-none hover:opacity-80 transition-opacity duration-200">
  <span className="text-2xl font-bold text-green-600 tracking-tight">MySite</span>
</Link>;

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => typeof window !== 'undefined' && window.__sidebarCollapsed ? window.__sidebarCollapsed : false);
  const [active, setActive] = useState(pathname);

  useLayoutEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      const val = JSON.parse(saved);
      setIsCollapsed(val);
      if (typeof window !== 'undefined') window.__sidebarCollapsed = val;
    }
  }, []);

  const handleToggle = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    if (typeof window !== 'undefined') window.__sidebarCollapsed = newState;
  }, [isCollapsed]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { icon: Film, label: '电影', href: '/douban?type=movie' },
    { icon: Tv, label: '剧集', href: '/douban?type=tv' },
    { icon: Clover, label: '综艺', href: '/douban?type=show' },
  ]);

  useEffect(() => {
    const runtimeConfig = (window as any).RUNTIME_CONFIG;
    if (runtimeConfig?.CUSTOM_PARENT_CATEGORY?.length) {
      const customMenu: MenuItem[] = (runtimeConfig.CUSTOM_PARENT_CATEGORY as CustomParent[]).map(parent => ({
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
        <aside className={`fixed top-0 left-0 h-screen bg-white/40 backdrop-blur-xl transition-all duration-300 border-r border-gray-200/50 z-10 shadow-lg dark:bg-gray-900/70 dark:border-gray-700/50 ${isCollapsed ? 'w-16' : 'w-64'}`}>
          <div className="flex h-full flex-col">
            <div className="relative h-16">
              {!isCollapsed && <Logo />}
              <button onClick={handleToggle} className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50">
                <Menu className="h-4 w-4" />
              </button>
            </div>
            <nav className="px-2 mt-4 space-y-1">
              <Link href="/" className={`group flex items-center rounded-lg px-2 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 font-medium min-h-[40px] gap-3 justify-start`}>
                <Home className="h-4 w-4 text-gray-500 group-hover:text-green-600" />
                {!isCollapsed && <span>首页</span>}
              </Link>
              <Link href="/search" className={`group flex items-center rounded-lg px-2 py-2 pl-4 text-gray-700 hover:bg-gray-100/30 hover:text-green-600 font-medium min-h-[40px] gap-3 justify-start`}>
                <Search className="h-4 w-4 text-gray-500 group-hover:text-green-600" />
                {!isCollapsed && <span>搜索</span>}
              </Link>
            </nav>
            <div className="flex-1 overflow-y-auto px-2 pt-4 space-y-1">
              {menuItems.map(item => (
                <Link key={item.label} href={item.href} className="group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 min-h-[40px] gap-3 justify-start">
                  <item.icon className="h-4 w-4 text-gray-500 group-hover:text-green-600" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        </aside>
        <div className={`transition-all duration-300 sidebar-offset ${isCollapsed ? 'w-16' : 'w-64'}`}></div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
