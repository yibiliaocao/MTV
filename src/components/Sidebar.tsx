'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Menu } from 'lucide-react';

export interface CustomChild {
  name: string;
  type: string;
}

export interface CustomParent {
  name: string;
  children?: CustomChild[];
}

interface SidebarProps {
  activeParent?: string;
  activeChild?: string;
  config?: CustomParent[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeParent, activeChild, config }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!config || config.length === 0) return null;

  return (
    <aside className="bg-gray-100 h-full p-4 border-r overflow-auto md:w-64 w-64 fixed md:static z-50 top-0 left-0 transition-transform md:translate-x-0"
           style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
      {/* 移动端展开按钮 */}
      <button
        className="md:hidden mb-4 flex items-center space-x-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={20} /> <span>{isOpen ? '关闭菜单' : '打开菜单'}</span>
      </button>

      <ul>
        {config.map(parent => (
          <li key={parent.name} className="mb-2">
            <div className="flex items-center space-x-2 font-bold">
              <Star size={16} /> <span>{parent.name}</span>
            </div>
            {parent.children && (
              <ul className="ml-4 mt-1">
                {parent.children.map(child => (
                  <li key={child.name}>
                    <Link
                      href={`/custom?parent=${encodeURIComponent(parent.name)}&child=${encodeURIComponent(child.type)}`}
                      className={`flex items-center space-x-1 hover:text-blue-500 ${
                        activeParent === parent.name && activeChild === child.type
                          ? 'text-blue-600 font-bold'
                          : ''
                      }`}
                      onClick={() => setIsOpen(false)} // 点击子分类自动关闭移动端菜单
                    >
                      <Star size={14} /> <span>{child.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
