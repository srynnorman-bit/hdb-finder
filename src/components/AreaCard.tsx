import React, { useState } from 'react';
import { HdbArea } from '../types';

interface AreaCardProps {
  area: HdbArea;
  isFavorite: boolean;
  onToggleFavorite: (areaId: string) => void;
  onViewDetails: (area: HdbArea) => void;
  onRemoveArea?: (areaId: string) => void;
  canRemove?: boolean;
}

export const AreaCard: React.FC<AreaCardProps> = ({
  area,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
}) => {
  const [showPriceInsight, setShowPriceInsight] = useState(false);

  const formatPrice = (price: number) => {
    return '$' + price.toLocaleString('en-US');
  };

  const getCarparkDot = (status: 'High' | 'Medium' | 'Low') => {
    switch (status) {
      case 'High':
        return {
          dotBg: 'bg-[#004e32]',
          textColor: 'text-[#004e32]',
        };
      case 'Low':
        return {
          dotBg: 'bg-[#ba1a1a]',
          textColor: 'text-[#ba1a1a]',
        };
      case 'Medium':
      default:
        return {
          dotBg: 'bg-[#b45309]',
          textColor: 'text-[#b45309]',
        };
    }
  };

  const carparkStyle = getCarparkDot(area.amenities.carparks.status);

  return (
    <section className="flex flex-col gap-3 group">
      {/* Area Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[20px] leading-[26px] font-semibold text-[#091c35] tracking-tight">
            {area.name}
          </h2>
          <span className="text-[11px] font-medium text-[#737685] uppercase tracking-wider">
            {area.region}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetails(area)}
            className="text-[12px] font-medium text-[#003d9b] hover:bg-[#e7eeff] px-2 py-1 rounded-md transition-colors flex items-center gap-0.5"
            title={`View full ${area.name} details & transactions`}
          >
            <span>Explore</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
          
          <button
            onClick={() => onToggleFavorite(area.id)}
            className={`p-1.5 rounded-full transition-all active:scale-90 ${
              isFavorite
                ? 'text-[#ba1a1a] bg-[#ffdad6]/60'
                : 'text-[#737685] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30'
            }`}
            aria-label={isFavorite ? `Remove ${area.name} from favorites` : `Add ${area.name} to favorites`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isFavorite ? 'fill' : ''}`}>
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* Price Trends Card */}
      <div 
        onClick={() => setShowPriceInsight(!showPriceInsight)}
        className="bg-white rounded-xl p-3 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[#e7eeff] hover:border-[#cadbfc] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between text-[#003d9b]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">trending_up</span>
            <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] uppercase text-[#003d9b]">
              HDB PRICE TRENDS (MEDIAN)
            </h3>
          </div>
          <span className="text-[11px] font-medium text-[#00687a] bg-[#f0f3ff] px-1.5 py-0.5 rounded">
            +{area.priceTrends.yoyChange}% YoY
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-[12px] leading-[16px] font-normal text-[#434654]">3-Room</span>
            <span className="text-[14px] leading-[20px] font-semibold text-[#091c35] tabular-nums">
              {formatPrice(area.priceTrends.room3)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] leading-[16px] font-normal text-[#434654]">4-Room</span>
            <span className="text-[14px] leading-[20px] font-semibold text-[#091c35] tabular-nums">
              {formatPrice(area.priceTrends.room4)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] leading-[16px] font-normal text-[#434654]">5-Room</span>
            <span className="text-[14px] leading-[20px] font-semibold text-[#091c35] tabular-nums">
              {formatPrice(area.priceTrends.room5)}
            </span>
          </div>
        </div>

        {showPriceInsight && (
          <div className="pt-2 border-t border-[#f0f3ff] flex items-center justify-between text-[11px] text-[#434654] bg-[#f9f9ff] -mx-3 -mb-3 p-2.5 rounded-b-xl">
            <span>Est. Median PSF: <strong className="text-[#091c35]">${area.priceTrends.medianPsf}/sqft</strong></span>
            <span className="text-[#003d9b] font-medium flex items-center gap-0.5">
              Tap for full price history &rarr;
            </span>
          </div>
        )}
      </div>

      {/* Amenities Section */}
      <div className="bg-white rounded-xl p-3 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[#e7eeff]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] leading-[16px] font-bold tracking-[0.05em] uppercase text-[#003d9b]">
            NEARBY AMENITIES (WITHIN 2KM)
          </h3>
          <span className="text-[11px] text-[#737685]">Radius 2.0km</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Hawker Centres */}
          <div 
            onClick={() => onViewDetails(area)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-[#f9f9ff] p-1 -mx-1 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] leading-[16px] font-medium text-[#091c35]">
                Hawker Centres ({area.amenities.hawkerCentres.count})
              </span>
              <span className="text-[12px] leading-[16px] text-[#434654] truncate">
                {area.amenities.hawkerCentres.names.join(', ')}
              </span>
            </div>
          </div>

          {/* Schools */}
          <div 
            onClick={() => onViewDetails(area)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-[#f9f9ff] p-1 -mx-1 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0052cc] text-[#c4d2ff] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] leading-[16px] font-medium text-[#091c35]">
                Schools
              </span>
              <span className="text-[12px] leading-[16px] text-[#434654] truncate">
                {area.amenities.schools.names.join(', ')}
              </span>
            </div>
          </div>

          {/* Transport */}
          <div 
            onClick={() => onViewDetails(area)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-[#f9f9ff] p-1 -mx-1 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#006844] text-[#72e9af] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">directions_subway</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] leading-[16px] font-medium text-[#091c35]">
                Transport
              </span>
              <span className="text-[12px] leading-[16px] text-[#434654] truncate">
                {area.amenities.transport.summary}
              </span>
            </div>
          </div>

          {/* Carpark Availability */}
          <div 
            onClick={() => onViewDetails(area)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-[#f9f9ff] p-1 -mx-1 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#d6e3ff] text-[#434654] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">local_parking</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] leading-[16px] font-medium text-[#091c35]">
                Carpark Availability
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${carparkStyle.dotBg}`} />
                <span className={`text-[12px] leading-[16px] ${carparkStyle.textColor} font-medium`}>
                  {area.amenities.carparks.status} ({area.amenities.carparks.lots} lots) at {area.amenities.carparks.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
