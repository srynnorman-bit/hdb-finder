import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: string; badge?: number }[] = [
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'favorites', label: 'Favorites', icon: 'favorite', badge: favoritesCount },
    { id: 'community', label: 'Community', icon: 'forum' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#f9f9ff]/90 backdrop-blur-xl border-t border-[#e7eeff] shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#003d9b] font-medium scale-105'
                  : 'text-[#434654] hover:text-[#091c35] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    isActive ? 'fill' : ''
                  }`}
                >
                  {item.icon}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#003d9b] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[12px] leading-[16px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
