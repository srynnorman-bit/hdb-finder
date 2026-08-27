import React, { useState } from 'react';
import { HdbArea, FlatType } from '../types';
import { HDB_AREAS } from '../data/hdbData';

interface FavoritesViewProps {
  favoriteIds: string[];
  onToggleFavorite: (areaId: string) => void;
  onViewDetails: (area: HdbArea) => void;
  onNavigateToSearch: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteIds,
  onToggleFavorite,
  onViewDetails,
  onNavigateToSearch,
}) => {
  const [selectedFlatType, setSelectedFlatType] = useState<FlatType>('4-Room');

  const favoriteAreas = HDB_AREAS.filter((a) => favoriteIds.includes(a.id));

  const formatPrice = (price: number) => '$' + price.toLocaleString('en-US');

  const getPriceForFlat = (area: HdbArea, flatType: FlatType) => {
    switch (flatType) {
      case '3-Room':
        return area.priceTrends.room3;
      case '4-Room':
        return area.priceTrends.room4;
      case '5-Room':
        return area.priceTrends.room5;
      default:
        return area.priceTrends.room4;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-[34px] font-bold text-[#091c35] tracking-tight">
          Favorites & Comparison
        </h1>
        <p className="text-[14px] leading-[20px] text-[#434654]">
          {favoriteAreas.length > 0
            ? `Comparing ${favoriteAreas.length} saved areas side by side`
            : 'No saved areas yet. Add areas from Search to compare.'}
        </p>
      </div>

      {favoriteAreas.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-[#e7eeff] text-center flex flex-col items-center gap-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">favorite</span>
          </div>
          <div className="max-w-xs">
            <h3 className="text-[16px] font-bold text-[#091c35]">Your favorites list is empty</h3>
            <p className="text-[13px] text-[#434654] mt-1">
              Tap the heart icon on any estate (like Tampines or Bishan) to compare metrics and receive price alerts.
            </p>
          </div>
          <button
            onClick={onNavigateToSearch}
            className="px-5 py-2.5 bg-[#003d9b] text-white text-[14px] font-semibold rounded-xl hover:bg-[#003d9b]/90 transition-all shadow-sm"
          >
            Explore Areas
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Comparison Flat Type Selector */}
          <div className="bg-white p-4 rounded-xl border border-[#e7eeff] flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#003d9b]">
                Select Flat Type for Comparison Matrix
              </span>
              <span className="text-[12px] font-semibold text-[#00687a]">
                {selectedFlatType} Selected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['3-Room', '4-Room', '5-Room'] as FlatType[]).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setSelectedFlatType(ft)}
                  className={`py-2 text-[13px] font-semibold rounded-lg transition-all ${
                    selectedFlatType === ft
                      ? 'bg-[#003d9b] text-white shadow-xs'
                      : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff]'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="bg-white rounded-xl border border-[#e7eeff] shadow-xs overflow-hidden">
            <div className="p-3.5 bg-[#f0f3ff] border-b border-[#e7eeff] flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#091c35]">
                Estate Comparison Matrix ({selectedFlatType})
              </h3>
              <span className="text-[11px] text-[#737685]">Latest Resale Data</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] divide-y divide-[#f0f3ff]">
                <thead>
                  <tr className="bg-[#f9f9ff] text-[11px] uppercase tracking-wider text-[#434654]">
                    <th className="py-2.5 px-3 font-bold">Metric</th>
                    {favoriteAreas.map((area) => (
                      <th key={area.id} className="py-2.5 px-3 font-bold text-[#003d9b]">
                        {area.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3ff]">
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#434654]">Median Price</td>
                    {favoriteAreas.map((area) => (
                      <td key={area.id} className="py-3 px-3 font-bold text-[#091c35] tabular-nums">
                        {formatPrice(getPriceForFlat(area, selectedFlatType))}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#434654]">Est. Median PSF</td>
                    {favoriteAreas.map((area) => (
                      <td key={area.id} className="py-3 px-3 text-[#091c35] tabular-nums font-semibold">
                        ${area.priceTrends.medianPsf}/sqft
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#434654]">YoY Growth</td>
                    {favoriteAreas.map((area) => (
                      <td key={area.id} className="py-3 px-3 text-[#00687a] font-semibold tabular-nums">
                        +{area.priceTrends.yoyChange}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#434654]">Nearest MRT</td>
                    {favoriteAreas.map((area) => (
                      <td key={area.id} className="py-3 px-3 text-[#091c35]">
                        <span className="font-semibold">{area.amenities.transport.mrtStation}</span>
                        <span className="text-[11px] text-[#737685] block">({area.amenities.transport.distanceKm}km)</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#434654]">Hawker Centres</td>
                    {favoriteAreas.map((area) => (
                      <td key={area.id} className="py-3 px-3 text-[#091c35]">
                        <span className="font-semibold text-[#ba1a1a]">{area.amenities.hawkerCentres.count} centres</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#434654]">Schools (2km)</td>
                    {favoriteAreas.map((area) => (
                      <td key={area.id} className="py-3 px-3 text-[#091c35]">
                        <span className="font-semibold text-[#003d9b]">{area.amenities.schools.count} schools</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#434654]">Carpark Status</td>
                    {favoriteAreas.map((area) => (
                      <td key={area.id} className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            area.amenities.carparks.status === 'High'
                              ? 'bg-[#82f9be] text-[#002113]'
                              : area.amenities.carparks.status === 'Low'
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : 'bg-[#fef3c7] text-[#92400e]'
                          }`}
                        >
                          {area.amenities.carparks.status} ({area.amenities.carparks.lots} lots)
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards List for Individual Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-[#091c35]">
              Saved Areas
            </h3>
            {favoriteAreas.map((area) => (
              <div
                key={area.id}
                className="bg-white p-4 rounded-xl border border-[#e7eeff] flex items-center justify-between shadow-2xs hover:border-[#cadbfc] transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[16px] font-bold text-[#091c35]">{area.name}</h4>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f0f3ff] text-[#00687a]">
                      {area.region}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#434654] mt-0.5">
                    4-Room: <strong className="text-[#091c35]">{formatPrice(area.priceTrends.room4)}</strong> • {area.amenities.transport.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewDetails(area)}
                    className="px-3 py-1.5 bg-[#f0f3ff] hover:bg-[#dfe8ff] text-[#003d9b] text-[12px] font-semibold rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onToggleFavorite(area.id)}
                    className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-full transition-colors"
                    title="Remove from favorites"
                  >
                    <span className="material-symbols-outlined text-[20px] fill">favorite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
