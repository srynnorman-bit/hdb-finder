import React, { useState } from 'react';
import { HdbArea, FlatType } from '../types';
import { BusArrivalWidget } from './BusArrivalWidget';
import { LiveResaleDataSection } from './LiveResaleDataSection';
import { OneMapWidget } from './OneMapWidget';

interface AreaDetailModalProps {
  area: HdbArea | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (areaId: string) => void;
}

export const AreaDetailModal: React.FC<AreaDetailModalProps> = ({
  area,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'transactions' | 'bus' | 'onemap' | 'amenities' | 'calculator'>('trends');
  const [selectedFlatType, setSelectedFlatType] = useState<FlatType>('4-Room');

  if (!isOpen || !area) return null;

  const formatPrice = (price: number) => '$' + price.toLocaleString('en-US');

  // Simple Affordability calculation
  const getMedianPriceForFlat = (flatType: FlatType) => {
    switch (flatType) {
      case '3-Room':
        return area.priceTrends.room3;
      case '4-Room':
        return area.priceTrends.room4;
      case '5-Room':
        return area.priceTrends.room5;
      case 'Executive':
        return area.priceTrends.executive || 850000;
      default:
        return area.priceTrends.room4;
    }
  };

  const targetPrice = getMedianPriceForFlat(selectedFlatType);
  const estimatedDownpayment = targetPrice * 0.20; // 20% downpayment
  const loanPrincipal = targetPrice - estimatedDownpayment;
  // HDB loan at 2.6% over 25 years
  const monthlyInterestRate = 0.026 / 12;
  const numPayments = 25 * 12;
  const estimatedMonthlyInstallment = Math.round(
    (loanPrincipal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numPayments)) /
    (Math.pow(1 + monthlyInterestRate, numPayments) - 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-[#f9f9ff] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-[#e7eeff] animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#e7eeff] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003d9b] text-white flex items-center justify-center font-bold text-lg">
              {area.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-bold text-[#091c35]">{area.name}</h2>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#dfe8ff] text-[#003d9b]">
                  {area.region}
                </span>
              </div>
              <p className="text-[12px] text-[#434654]">Singapore HDB Estate & Live Data Profile</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(area.id)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'text-[#ba1a1a] bg-[#ffdad6]'
                  : 'text-[#737685] hover:bg-[#f0f3ff]'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isFavorite ? 'fill' : ''}`}>
                favorite
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#737685] hover:bg-[#f0f3ff]"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e7eeff] bg-[#f0f3ff] px-3 pt-2 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('trends')}
            className={`pb-2 px-3 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'trends'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-[#434654] hover:text-[#091c35]'
            }`}
          >
            Price Trends
          </button>
          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`pb-2 px-3 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'transactions'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-[#434654] hover:text-[#091c35]'
            }`}
          >
            Live Resales (Data.gov.sg)
          </button>
          <button
            onClick={() => setActiveSubTab('bus')}
            className={`pb-2 px-3 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'bus'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-[#434654] hover:text-[#091c35]'
            }`}
          >
            Bus Arrivals (LTA v3)
          </button>
          <button
            onClick={() => setActiveSubTab('onemap')}
            className={`pb-2 px-3 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'onemap'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-[#434654] hover:text-[#091c35]'
            }`}
          >
            OneMap Geospatial
          </button>
          <button
            onClick={() => setActiveSubTab('amenities')}
            className={`pb-2 px-3 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'amenities'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-[#434654] hover:text-[#091c35]'
            }`}
          >
            Amenities
          </button>
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`pb-2 px-3 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'calculator'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-[#434654] hover:text-[#091c35]'
            }`}
          >
            Mortgage Est.
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Subtab 1: Price Trends */}
          {activeSubTab === 'trends' && (
            <div className="flex flex-col gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#e7eeff] shadow-xs">
                <h3 className="text-[12px] font-bold tracking-wider uppercase text-[#003d9b] mb-3">
                  Current Median Prices ({area.priceTrends.quarter})
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-[#f9f9ff] border border-[#e7eeff]">
                    <span className="text-[11px] text-[#434654]">3-Room</span>
                    <p className="text-[15px] font-bold text-[#091c35] mt-0.5">
                      {formatPrice(area.priceTrends.room3)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f0f3ff] border border-[#cadbfc]">
                    <span className="text-[11px] text-[#003d9b] font-medium">4-Room (Popular)</span>
                    <p className="text-[15px] font-bold text-[#003d9b] mt-0.5">
                      {formatPrice(area.priceTrends.room4)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f9f9ff] border border-[#e7eeff]">
                    <span className="text-[11px] text-[#434654]">5-Room</span>
                    <p className="text-[15px] font-bold text-[#091c35] mt-0.5">
                      {formatPrice(area.priceTrends.room5)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quarterly Trajectory */}
              <div className="bg-white p-4 rounded-xl border border-[#e7eeff] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-bold tracking-wider uppercase text-[#003d9b]">
                    Quarterly Historical Movement
                  </h3>
                  <span className="text-[11px] text-[#00687a] bg-[#e7eeff] px-2 py-0.5 rounded-full font-semibold">
                    +{area.priceTrends.yoyChange}% past year
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {area.quarterlyTrends.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#f0f3ff] last:border-none text-[13px]">
                      <span className="font-semibold text-[#091c35] w-20">{q.quarter}</span>
                      <div className="flex gap-4 tabular-nums text-[12px]">
                        <span className="text-[#434654]">3R: <strong>${(q.room3 / 1000).toFixed(0)}k</strong></span>
                        <span className="text-[#003d9b]">4R: <strong>${(q.room4 / 1000).toFixed(0)}k</strong></span>
                        <span className="text-[#00687a]">5R: <strong>${(q.room5 / 1000).toFixed(0)}k</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#f0f3ff] p-3.5 rounded-xl text-[12px] text-[#434654] leading-relaxed">
                <strong>Town Overview:</strong> {area.description}
              </div>
            </div>
          )}

          {/* Subtab 2: Live Data.gov.sg Resales */}
          {activeSubTab === 'transactions' && (
            <LiveResaleDataSection
              defaultTown={area.name.toUpperCase()}
              defaultFlatType="4 ROOM"
            />
          )}

          {/* Subtab 3: Live LTA v3 Bus Arrivals */}
          {activeSubTab === 'bus' && (
            <BusArrivalWidget
              initialBusStopCode={area.name.toLowerCase() === 'tampines' ? '83139' : '53009'}
              initialServiceNo={area.name.toLowerCase() === 'tampines' ? '15' : ''}
              defaultBusStops={
                area.amenities.transport.nearbyBusStops || [
                  { code: '83139', description: `${area.name} Ave 7 (Opp Blk 390)`, popularServices: ['15', '21', '27'] },
                  { code: '76141', description: `${area.name} Central 1 (MRT)`, popularServices: ['3', '15', '21'] },
                ]
              }
            />
          )}

          {/* Subtab 4: OneMap Geospatial */}
          {activeSubTab === 'onemap' && (
            <OneMapWidget
              initialSearch={`${area.name} MRT`}
              initialStartCoord="1.3521,103.9452"
              initialEndCoord="1.3533,103.9447"
            />
          )}

          {/* Subtab 5: Amenities */}
          {activeSubTab === 'amenities' && (
            <div className="flex flex-col gap-3">
              <div className="bg-white p-4 rounded-xl border border-[#e7eeff] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#93000a]">
                  <span className="material-symbols-outlined">restaurant</span>
                  <h4 className="font-bold text-[13px]">Hawker & Food Centres ({area.amenities.hawkerCentres.count})</h4>
                </div>
                <ul className="list-disc list-inside text-[13px] text-[#434654] flex flex-col gap-1 pl-1">
                  {area.amenities.hawkerCentres.names.map((name, i) => (
                    <li key={i}><span className="font-medium text-[#091c35]">{name}</span></li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e7eeff] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#003d9b]">
                  <span className="material-symbols-outlined">school</span>
                  <h4 className="font-bold text-[13px]">Primary & Secondary Schools ({area.amenities.schools.count})</h4>
                </div>
                <ul className="list-disc list-inside text-[13px] text-[#434654] flex flex-col gap-1 pl-1">
                  {area.amenities.schools.names.map((name, i) => (
                    <li key={i}><span className="font-medium text-[#091c35]">{name}</span></li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e7eeff] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#004e32]">
                  <span className="material-symbols-outlined">directions_subway</span>
                  <h4 className="font-bold text-[13px]">Transit & MRT Connection</h4>
                </div>
                <p className="text-[13px] text-[#091c35] font-medium">
                  {area.amenities.transport.summary}
                </p>
                <div className="flex gap-2">
                  {area.amenities.transport.lines.map((line) => (
                    <span key={line} className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#82f9be] text-[#002113]">
                      {line} Line
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e7eeff] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#434654]">
                  <span className="material-symbols-outlined">local_parking</span>
                  <h4 className="font-bold text-[13px]">Live Carpark Status</h4>
                </div>
                <p className="text-[13px] text-[#434654]">
                  Current status at <strong>{area.amenities.carparks.location}</strong>:
                  <span className="ml-1 font-semibold text-[#091c35]">
                    {area.amenities.carparks.lots} available lots ({area.amenities.carparks.status} occupancy availability)
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Subtab 6: Mortgage Calculator */}
          {activeSubTab === 'calculator' && (
            <div className="flex flex-col gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#e7eeff] flex flex-col gap-3">
                <h4 className="font-bold text-[14px] text-[#091c35]">
                  Mortgage & Installment Simulator ({area.name})
                </h4>

                <div className="flex gap-2">
                  {(['3-Room', '4-Room', '5-Room'] as FlatType[]).map((ft) => (
                    <button
                      key={ft}
                      onClick={() => setSelectedFlatType(ft)}
                      className={`flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors ${
                        selectedFlatType === ft
                          ? 'bg-[#003d9b] text-white'
                          : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff]'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-[#f0f3ff] rounded-xl flex flex-col gap-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#434654]">Median Price:</span>
                    <strong className="text-[#091c35]">{formatPrice(targetPrice)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#434654]">20% Downpayment (CPF/Cash):</span>
                    <strong className="text-[#091c35]">{formatPrice(estimatedDownpayment)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#434654]">80% Loan Amount:</span>
                    <strong className="text-[#091c35]">{formatPrice(loanPrincipal)}</strong>
                  </div>
                  <div className="pt-2 border-t border-[#cadbfc] flex justify-between items-baseline">
                    <span className="font-bold text-[#003d9b]">Est. Monthly Installment (2.6%):</span>
                    <span className="text-[18px] font-bold text-[#003d9b] tabular-nums">
                      ${estimatedMonthlyInstallment}/mo
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#737685]">
                  *Based on 25-year HDB concessionary loan at 2.60% p.a. CPF Housing Grants can further lower the downpayment and loan quantum.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#e7eeff] flex items-center justify-between">
          <div className="text-[12px] text-[#434654]">
            Median {selectedFlatType}: <strong className="text-[#003d9b]">{formatPrice(targetPrice)}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#003d9b] text-white text-[13px] font-semibold rounded-xl hover:bg-[#003d9b]/90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
