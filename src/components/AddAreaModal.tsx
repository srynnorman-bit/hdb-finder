import React, { useState, useMemo } from 'react';
import { ALL_HDB_TOWNS, HDB_AREAS } from '../data/hdbData';

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAreaIds: string[];
  onToggleArea: (areaId: string) => void;
}

export const AddAreaModal: React.FC<AddAreaModalProps> = ({
  isOpen,
  onClose,
  selectedAreaIds,
  onToggleArea,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const regions = ['All', 'East', 'Central', 'North-East', 'West', 'North'];

  const filteredTowns = useMemo(() => {
    return ALL_HDB_TOWNS.filter((town) => {
      const matchesSearch = town.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        town.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === 'All' || town.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-lg bg-[#f9f9ff] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden border border-[#e7eeff] animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* Modal Header */}
        <div className="px-4 pt-4 pb-3 border-b border-[#e7eeff] bg-white flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#091c35]">Add Areas to Compare</h2>
            <p className="text-[12px] text-[#434654]">Select HDB towns to compare prices and amenities</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737685] hover:bg-[#f0f3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search & Region Filter */}
        <div className="p-4 bg-white border-b border-[#e7eeff] flex flex-col gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#737685] text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search town (e.g. Bedok, Punggol)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f0f3ff] text-[#091c35] placeholder-[#737685] text-[14px] pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003d9b]/40"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#737685] hover:text-[#091c35]"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 text-[12px] font-medium rounded-full whitespace-nowrap transition-colors ${
                  selectedRegion === reg
                    ? 'bg-[#003d9b] text-white shadow-xs'
                    : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff]'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Town List */}
        <div className="overflow-y-auto p-4 flex flex-col gap-2 divide-y divide-[#f0f3ff]">
          {filteredTowns.map((town) => {
            const isSelected = selectedAreaIds.includes(town.id);
            const areaDetail = HDB_AREAS.find((a) => a.id === town.id);

            return (
              <div
                key={town.id}
                onClick={() => onToggleArea(town.id)}
                className={`pt-2 first:pt-0 pb-2 flex items-center justify-between cursor-pointer rounded-xl px-2 transition-colors ${
                  isSelected ? 'bg-[#e7eeff]/60' : 'hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-[16px] font-semibold ${
                      isSelected
                        ? 'bg-[#003d9b] text-white'
                        : 'bg-[#dfe8ff] text-[#003d9b]'
                    }`}
                  >
                    {town.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-[#091c35]">
                        {town.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#f0f3ff] text-[#00687a]">
                        {town.region}
                      </span>
                    </div>
                    {areaDetail ? (
                      <p className="text-[12px] text-[#434654]">
                        4-Room median: <strong className="text-[#091c35]">${(areaDetail.priceTrends.room4 / 1000).toFixed(0)}k</strong> • MRT {areaDetail.amenities.transport.mrtStation}
                      </p>
                    ) : (
                      <p className="text-[12px] text-[#737685]">
                        Comprehensive amenity & resale data available
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                      isSelected
                        ? 'bg-[#00687a] text-white'
                        : 'bg-[#dfe8ff] text-[#003d9b] hover:bg-[#cadbfc]'
                    }`}
                  >
                    {isSelected ? 'Selected ✓' : '+ Add'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTowns.length === 0 && (
            <div className="py-8 text-center text-[#737685] text-[14px]">
              No HDB towns found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#e7eeff] flex items-center justify-between">
          <span className="text-[12px] text-[#434654]">
            <strong>{selectedAreaIds.length}</strong> area{selectedAreaIds.length === 1 ? '' : 's'} selected
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#003d9b] text-white text-[14px] font-medium rounded-xl hover:bg-[#003d9b]/90 shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
