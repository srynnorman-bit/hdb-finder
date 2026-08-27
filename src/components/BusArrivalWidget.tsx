import React, { useState, useEffect, useCallback } from 'react';
import { BusArrivalResponse } from '../types';

interface BusArrivalWidgetProps {
  initialBusStopCode?: string;
  initialServiceNo?: string;
  defaultBusStops?: { code: string; description: string; popularServices?: string[] }[];
}

export const BusArrivalWidget: React.FC<BusArrivalWidgetProps> = ({
  initialBusStopCode = '83139',
  initialServiceNo = '',
  defaultBusStops = [
    { code: '83139', description: 'Tampines Ave 7 (Opp Blk 390)', popularServices: ['15', '21', '27', '168'] },
    { code: '76141', description: 'Tampines Central 1 (Tampines Stn)', popularServices: ['3', '15', '21', '27'] },
    { code: '53009', description: 'Bishan St 13 (Bishan Int)', popularServices: ['50', '52', '53', '410G'] },
    { code: '53231', description: 'Bishan Rd (Opp Bishan Stn)', popularServices: ['71', '156', '88'] },
  ],
}) => {
  const [busStopCode, setBusStopCode] = useState(initialBusStopCode);
  const [serviceNo, setServiceNo] = useState(initialServiceNo);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BusArrivalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(20);

  const fetchArrivals = useCallback(async (stopCode: string, svcNo?: string) => {
    if (!stopCode || !stopCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let url = `/api/bus-arrival?BusStopCode=${encodeURIComponent(stopCode.trim())}`;
      if (svcNo && svcNo.trim()) {
        url += `&ServiceNo=${encodeURIComponent(svcNo.trim())}`;
      }

      let res = await fetch(url);
      if (!res.ok) {
        let altUrl = `/api/busArrival?BusStopCode=${encodeURIComponent(stopCode.trim())}`;
        if (svcNo && svcNo.trim()) altUrl += `&ServiceNo=${encodeURIComponent(svcNo.trim())}`;
        res = await fetch(altUrl);
      }
      if (!res.ok) {
        let altUrl2 = `/api/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(stopCode.trim())}`;
        if (svcNo && svcNo.trim()) altUrl2 += `&ServiceNo=${encodeURIComponent(svcNo.trim())}`;
        res = await fetch(altUrl2);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error || `Arrival service returned error ${res.status}`);
        setData(null);
      } else {
        const json: BusArrivalResponse = await res.json();
        setData(json);
        setLastUpdated(new Date());
        setCountdown(20);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to arrival service';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArrivals(busStopCode, serviceNo);
  }, [busStopCode, serviceNo, fetchArrivals]);

  // 20-second countdown and auto-refresh loop
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchArrivals(busStopCode, serviceNo);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, busStopCode, serviceNo, fetchArrivals]);

  const calculateMinutes = (isoDateString?: string) => {
    if (!isoDateString) return null;
    const arrivalTime = new Date(isoDateString).getTime();
    const now = Date.now();
    const diffMs = arrivalTime - now;
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins <= 0) return 'Arr';
    if (diffMins === 1) return '1 min';
    return `${diffMins} mins`;
  };

  const getLoadBadge = (load?: string) => {
    switch (load) {
      case 'SEA':
        return { label: 'Seats Avail', bg: 'bg-[#82f9be] text-[#002113]', dot: 'bg-[#004e32]' };
      case 'SDA':
        return { label: 'Standing Avail', bg: 'bg-[#fef3c7] text-[#92400e]', dot: 'bg-[#d97706]' };
      case 'LSD':
        return { label: 'Limited Standing', bg: 'bg-[#ffdad6] text-[#93000a]', dot: 'bg-[#ba1a1a]' };
      default:
        return { label: 'Seats Avail', bg: 'bg-[#dfe8ff] text-[#003d9b]', dot: 'bg-[#003d9b]' };
    }
  };

  const getBusTypeIcon = (type?: string) => {
    if (type === 'DD') return 'Double Deck';
    if (type === 'BD') return 'Bendy';
    return 'Single Deck';
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e7eeff] flex flex-col gap-3 shadow-xs">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#006844]">
          <span className="material-symbols-outlined text-[20px]">directions_bus</span>
          <h3 className="text-[12px] font-bold tracking-wider uppercase text-[#003d9b]">
            Live Bus Arrivals (LTA v3)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {autoRefresh && (
            <span className="text-[11px] text-[#737685] tabular-nums font-medium">
              Refresh in {countdown}s
            </span>
          )}
          <button
            onClick={() => fetchArrivals(busStopCode, serviceNo)}
            disabled={loading}
            className="p-1 rounded-md text-[#003d9b] hover:bg-[#e7eeff] transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Preset Bus Stop Chips */}
      {defaultBusStops.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {defaultBusStops.map((stop) => (
            <button
              key={stop.code}
              onClick={() => {
                setBusStopCode(stop.code);
                setServiceNo('');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                busStopCode === stop.code
                  ? 'bg-[#00687a] text-white'
                  : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff]'
              }`}
            >
              Stop {stop.code} ({stop.description.split('(')[0].trim()})
            </button>
          ))}
        </div>
      )}

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#737685] block mb-0.5">
            Bus Stop Code (e.g. 83139)
          </label>
          <input
            type="text"
            value={busStopCode}
            onChange={(e) => setBusStopCode(e.target.value)}
            placeholder="83139"
            className="w-full bg-[#f0f3ff] text-[#091c35] text-[13px] px-3 py-1.5 rounded-lg border border-[#dfe8ff] focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#737685] block mb-0.5">
            Filter Service No (Opt)
          </label>
          <input
            type="text"
            value={serviceNo}
            onChange={(e) => setServiceNo(e.target.value)}
            placeholder="e.g. 15"
            className="w-full bg-[#f0f3ff] text-[#091c35] text-[13px] px-3 py-1.5 rounded-lg border border-[#dfe8ff] focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg text-[#93000a] text-[12px] flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            {error.includes('credential not configured') && (
              <p className="text-[11px] text-[#434654] mt-1">
                To connect to Singapore LTA DataMall, provide your API key in the AI Studio Settings secrets panel as <code>LTA_DATAMALL_ACCOUNT_KEY</code>.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bus Services Results */}
      {data && data.Services && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#737685]">
            <span>Stop #{data.BusStopCode} • {data.Services.length} active service{data.Services.length === 1 ? '' : 's'}</span>
            {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
          </div>

          {data.Services.length === 0 ? (
            <div className="p-4 text-center text-[#737685] text-[12px] bg-[#f9f9ff] rounded-lg">
              No active buses arriving currently for stop {data.BusStopCode}.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {data.Services.map((svc) => {
                const nextMins = calculateMinutes(svc.NextBus?.EstimatedArrival);
                const next2Mins = calculateMinutes(svc.NextBus2?.EstimatedArrival);
                const next3Mins = calculateMinutes(svc.NextBus3?.EstimatedArrival);
                const loadBadge = getLoadBadge(svc.NextBus?.Load);

                return (
                  <div
                    key={svc.ServiceNo}
                    className="p-2.5 bg-[#f9f9ff] rounded-lg border border-[#e7eeff] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#003d9b] text-white flex items-center justify-center font-bold text-[15px] shadow-2xs">
                        {svc.ServiceNo}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#737685]">
                          Op: {svc.Operator} • {getBusTypeIcon(svc.NextBus?.Type)}
                          {svc.NextBus?.Feature === 'WAB' && ' ♿'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-2 h-2 rounded-full ${loadBadge.dot}`} />
                          <span className="text-[11px] font-semibold text-[#091c35]">
                            {loadBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <span className="text-[15px] font-bold text-[#003d9b] tabular-nums">
                          {nextMins || '-'}
                        </span>
                        <div className="flex gap-1.5 text-[10px] text-[#737685] tabular-nums">
                          {next2Mins && <span>Next: {next2Mins}</span>}
                          {next3Mins && <span>• {next3Mins}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
