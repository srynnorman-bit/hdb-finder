/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ActiveTab, HdbArea } from './types';
import { HDB_AREAS } from './data/hdbData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AreaCard } from './components/AreaCard';
import { AddAreaModal } from './components/AddAreaModal';
import { AreaDetailModal } from './components/AreaDetailModal';
import { FavoritesView } from './components/FavoritesView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>(['tampines', 'bishan']);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['tampines', 'bishan']);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [detailedArea, setDetailedArea] = useState<HdbArea | null>(null);

  // Toggle favorite for an area
  const handleToggleFavorite = (areaId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
    );
  };

  // Remove an area from the active search comparison
  const handleRemoveArea = (areaId: string) => {
    setSelectedAreaIds((prev) => prev.filter((id) => id !== areaId));
  };

  // Add or remove area in the AddArea modal
  const handleToggleAreaFromModal = (areaId: string) => {
    setSelectedAreaIds((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
    );
  };

  // Get active areas objects
  const activeAreas = HDB_AREAS.filter((area) => selectedAreaIds.includes(area.id));

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#091c35] flex flex-col antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedAreaCount={selectedAreaIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto pt-16 pb-24 px-4 py-6">
        {activeTab === 'search' && (
          <div className="flex flex-col gap-6">
            {/* Title & Subtitle */}
            <div className="flex flex-col gap-1">
              <h1 className="text-[28px] leading-[34px] font-bold text-[#091c35] tracking-tight">
                Search Results
              </h1>
              <p className="text-[14px] leading-[20px] text-[#434654]">
                Showing data for {selectedAreaIds.length} selected area{selectedAreaIds.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {activeAreas.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#00687a] text-white rounded-full transition-all shadow-2xs"
                >
                  <span className="text-[12px] leading-[16px] font-medium">{area.name}</span>
                  <button
                    onClick={() => handleRemoveArea(area.id)}
                    className="flex items-center justify-center hover:opacity-80 transition-opacity p-0.5"
                    aria-label={`Remove ${area.name}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#dfe8ff] hover:bg-[#cadbfc] text-[#091c35] rounded-full cursor-pointer transition-colors shadow-2xs font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span className="text-[12px] leading-[16px]">Add Area</span>
              </button>
            </div>

            {/* Area Cards */}
            {activeAreas.length > 0 ? (
              <div className="flex flex-col gap-6">
                {activeAreas.map((area) => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    isFavorite={favoriteIds.includes(area.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetails={(a) => setDetailedArea(a)}
                    onRemoveArea={handleRemoveArea}
                    canRemove={activeAreas.length > 1}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-[#e7eeff] text-center flex flex-col items-center gap-4 shadow-xs mt-4">
                <div className="w-12 h-12 rounded-full bg-[#f0f3ff] text-[#003d9b] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">location_city</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#091c35]">No areas selected</h3>
                  <p className="text-[13px] text-[#434654] mt-1">
                    Select Singapore HDB towns to compare median prices and nearby amenities.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-2 bg-[#003d9b] text-white text-[13px] font-semibold rounded-xl hover:bg-[#003d9b]/90 transition-all shadow-sm"
                >
                  + Add Areas
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onViewDetails={(a) => setDetailedArea(a)}
            onNavigateToSearch={() => setActiveTab('search')}
          />
        )}

        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoritesCount={favoriteIds.length}
      />

      {/* Add Area Modal */}
      <AddAreaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedAreaIds={selectedAreaIds}
        onToggleArea={handleToggleAreaFromModal}
      />

      {/* Detailed Area Modal */}
      <AreaDetailModal
        area={detailedArea}
        isOpen={!!detailedArea}
        onClose={() => setDetailedArea(null)}
        isFavorite={detailedArea ? favoriteIds.includes(detailedArea.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
