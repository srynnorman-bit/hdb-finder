import React from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  selectedAreaCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'search':
        return 'Search';
      case 'favorites':
        return 'Favorites';
      case 'profile':
        return 'Profile';
      default:
        return 'Search';
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-[#f9f9ff]/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e7eeff]">
      <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            alt="HDB Finder Logo"
            className="h-8 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC24YDkRr19bA6c9P_oDlmfBKL6aKZspvBq6MzQlG8Wke2o28Y7iXvDn2TK_4ses4LppDPP68m2ZnvHFGAWxsviPEnzXpYfF6_pIH1CCGCWXqX7cIvDQ5zu07TLwtWDn2qT7gbU5fP_6dEHBbaKYjpGUmw2AP9NkAdTE-7vCFNbMGKbAWqVkLuIPnl3Urpz54Q4bM1GdEj6tU2_NMIni8prGgallzhL7rYgBkUsxeplkHPoTbW3m112kA"
            onClick={() => onTabChange('search')}
          />
          <h1 className="text-[20px] leading-[26px] font-semibold text-[#003d9b] tracking-tight">
            {getTitle()}
          </h1>
        </div>

        <button
          onClick={() => onTabChange('profile')}
          className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-[#003d9b]/30 transition-transform active:scale-95"
          aria-label="User Profile"
        >
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#dfe8ff]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuByZr8-_fD44_scv9mcVzF1M5xE5vy-luWK0VrJKVnicNTgUOa1fRaaFx9XPLnio53zPdMMhuSJoobr-Sqz3iAk4jHPX_nRlfJmh6B8J7_uns85Md_HV2gg1qm_KryHzjG4ekwXNzppoIJ9vJL--Sh-WI3XqZLGyGb6y4iBFrRhw4nuHS6VZpPCGcqLpbJhaZcwCrWQ_koFZFcYMlObIG8H6Jf8Kqz8xWtIbrh5gAokbHZEMpBF0dcOew"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
