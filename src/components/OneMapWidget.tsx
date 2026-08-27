import React, { useState } from 'react';
import {
  OneMapSearchResponse,
  OneMapRevGeocodeResponse,
  OneMapRouteResponse,
} from '../types';

interface OneMapWidgetProps {
  initialSearch?: string;
  initialStartCoord?: string;
  initialEndCoord?: string;
}

export const OneMapWidget: React.FC<OneMapWidgetProps> = ({
  initialSearch = 'raffles place',
  initialStartCoord = '1.3521,103.9452', // Tampines
  initialEndCoord = '1.3533,103.9447',   // Tampines MRT
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'revgeocode' | 'route'>('search');

  // Search state
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<OneMapSearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // RevGeocode state
  const [revLocation, setRevLocation] = useState('1.3521,103.9452');
  const [revBuffer, setRevBuffer] = useState('40');
  const [revLoading, setRevLoading] = useState(false);
  const [revResult, setRevResult] = useState<OneMapRevGeocodeResponse | null>(null);
  const [revError, setRevError] = useState<string | null>(null);

  // Routing state
  const [startCoord, setStartCoord] = useState(initialStartCoord);
  const [endCoord, setEndCoord] = useState(initialEndCoord);
  const [routeType, setRouteType] = useState<'walk' | 'drive' | 'cycle' | 'pt'>('walk');
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<OneMapRouteResponse | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleSearch = async (valToSearch?: string) => {
    const term = valToSearch || searchVal;
    if (!term.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    try {
      let res = await fetch(`/api/onemap/search?searchVal=${encodeURIComponent(term.trim())}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
      if (!res.ok) {
        res = await fetch(`/api/common/elastic/search?searchVal=${encodeURIComponent(term.trim())}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
      }
      if (!res.ok) {
        res = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(term.trim())}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setSearchError(errJson.error || `OneMap search failed with status ${res.status}`);
        setSearchResult(null);
      } else {
        const json: OneMapSearchResponse = await res.json();
        setSearchResult(json);
      }
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : 'Failed to reach OneMap service');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRevGeocode = async () => {
    if (!revLocation.trim()) return;

    setRevLoading(true);
    setRevError(null);
    try {
      let res = await fetch(`/api/onemap/revgeocode?location=${encodeURIComponent(revLocation.trim())}&buffer=${revBuffer}&addressType=All`);
      if (!res.ok) {
        res = await fetch(`/api/public/revgeocode?location=${encodeURIComponent(revLocation.trim())}&buffer=${revBuffer}&addressType=All`);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setRevError(errJson.error || `OneMap rev-geocode failed with status ${res.status}`);
        setRevResult(null);
      } else {
        const json: OneMapRevGeocodeResponse = await res.json();
        setRevResult(json);
      }
    } catch (err: unknown) {
      setRevError(err instanceof Error ? err.message : 'Failed to reach OneMap service');
    } finally {
      setRevLoading(false);
    }
  };

  const handleRoute = async () => {
    if (!startCoord.trim() || !endCoord.trim()) return;

    setRouteLoading(true);
    setRouteError(null);
    try {
      let res = await fetch(`/api/onemap/route?start=${encodeURIComponent(startCoord.trim())}&end=${encodeURIComponent(endCoord.trim())}&routeType=${routeType}`);
      if (!res.ok) {
        res = await fetch(`/api/public/routingsvc/route?start=${encodeURIComponent(startCoord.trim())}&end=${encodeURIComponent(endCoord.trim())}&routeType=${routeType}`);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setRouteError(errJson.error || `OneMap routing failed with status ${res.status}`);
        setRouteResult(null);
      } else {
        const json: OneMapRouteResponse = await res.json();
        setRouteResult(json);
      }
    } catch (err: unknown) {
      setRouteError(err instanceof Error ? err.message : 'Failed to reach OneMap service');
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e7eeff] flex flex-col gap-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0f3ff] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00687a] text-[20px]">map</span>
            <h3 className="text-[14px] font-bold text-[#091c35]">
              Singapore OneMap Geospatial Services
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#82f9be]/40 text-[#004e32]">
              SLA OneMap API
            </span>
          </div>
          <p className="text-[12px] text-[#737685] mt-0.5">
            Official Singapore SLA Geocoding, Reverse Geocoding & Multi-Modal Routing
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center gap-1 bg-[#f0f3ff] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              activeTab === 'search'
                ? 'bg-white text-[#003d9b] shadow-2xs'
                : 'text-[#434654] hover:text-[#091c35]'
            }`}
          >
            Search / Geocode
          </button>
          <button
            onClick={() => setActiveTab('revgeocode')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              activeTab === 'revgeocode'
                ? 'bg-white text-[#003d9b] shadow-2xs'
                : 'text-[#434654] hover:text-[#091c35]'
            }`}
          >
            Reverse Geocode
          </button>
          <button
            onClick={() => setActiveTab('route')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              activeTab === 'route'
                ? 'bg-white text-[#003d9b] shadow-2xs'
                : 'text-[#434654] hover:text-[#091c35]'
            }`}
          >
            Route / ETA
          </button>
        </div>
      </div>

      {/* Tab 1: Address Search & Geocode */}
      {activeTab === 'search' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#737685] uppercase tracking-wider">
              Quick Searches:
            </span>
            {['raffles place', 'tampines hub', 'bishan junction 8', 'punggol waterway'].map((sample) => (
              <button
                key={sample}
                onClick={() => {
                  setSearchVal(sample);
                  handleSearch(sample);
                }}
                className="px-2 py-0.5 rounded-full text-[11px] bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff] transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search building, street, or postal code (e.g. raffles place)..."
                className="w-full bg-[#f9f9ff] text-[#091c35] text-[13px] px-3 py-2 rounded-lg border border-[#dfe8ff] focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={searchLoading}
              className="px-4 py-2 bg-[#003d9b] hover:bg-[#002f78] text-white rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${searchLoading ? 'animate-spin' : ''}`}>
                {searchLoading ? 'progress_activity' : 'search'}
              </span>
              Search
            </button>
          </div>

          {searchError && (
            <div className="p-3 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg text-[#93000a] text-[12px] flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
              <div>
                <p className="font-semibold">{searchError}</p>
                {searchError.includes('credentials not configured') && (
                  <p className="text-[11px] text-[#434654] mt-1">
                    Configure <code>ONEMAP_TOKEN</code> or <code>ONEMAP_EMAIL</code> & <code>ONEMAP_PASSWORD</code> in your environment to use Singapore SLA OneMap live endpoints.
                  </p>
                )}
              </div>
            </div>
          )}

          {searchResult && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between text-[11px] text-[#737685]">
                <span>Found {searchResult.found} result{searchResult.found === 1 ? '' : 's'} (Page {searchResult.pageNum} of {searchResult.totalNumPages})</span>
              </div>

              {searchResult.results?.length === 0 ? (
                <div className="p-4 text-center text-[#737685] text-[12px] bg-[#f9f9ff] rounded-lg">
                  No matching locations found for &ldquo;{searchVal}&rdquo;.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {searchResult.results?.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e7eeff] flex items-center justify-between hover:bg-[#f0f3ff] transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[13px] text-[#091c35]">{res.BUILDING !== 'NIL' ? res.BUILDING : res.ADDRESS}</span>
                        <span className="text-[11px] text-[#434654]">{res.ADDRESS} • Postal {res.POSTAL || 'N/A'}</span>
                        <span className="text-[10px] font-mono text-[#737685]">Lat: {parseFloat(res.LATITUDE).toFixed(5)}, Lng: {parseFloat(res.LONGITUDE).toFixed(5)}</span>
                      </div>

                      <button
                        onClick={() => {
                          setStartCoord(`${parseFloat(res.LATITUDE).toFixed(6)},${parseFloat(res.LONGITUDE).toFixed(6)}`);
                          setActiveTab('route');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#003d9b] bg-white border border-[#dfe8ff] rounded-md hover:bg-[#dfe8ff] transition-colors"
                        title="Use as Route Start"
                      >
                        Route from here
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reverse Geocode */}
      {activeTab === 'revgeocode' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#737685] uppercase tracking-wider">
              Sample Coordinates:
            </span>
            <button
              onClick={() => {
                setRevLocation('1.3,103.8');
                setRevBuffer('40');
              }}
              className="px-2 py-0.5 rounded-full text-[11px] bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff] transition-colors"
            >
              1.3, 103.8 (City)
            </button>
            <button
              onClick={() => {
                setRevLocation('1.3521,103.9452');
                setRevBuffer('50');
              }}
              className="px-2 py-0.5 rounded-full text-[11px] bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff] transition-colors"
            >
              1.3521, 103.9452 (Tampines)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#737685] uppercase tracking-wider block mb-1">
                Coordinates (Latitude,Longitude)
              </label>
              <input
                type="text"
                value={revLocation}
                onChange={(e) => setRevLocation(e.target.value)}
                placeholder="1.3,103.8"
                className="w-full bg-[#f9f9ff] text-[#091c35] text-[13px] px-3 py-2 rounded-lg border border-[#dfe8ff] focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#737685] uppercase tracking-wider block mb-1">
                Buffer (Meters)
              </label>
              <input
                type="number"
                value={revBuffer}
                onChange={(e) => setRevBuffer(e.target.value)}
                placeholder="40"
                className="w-full bg-[#f9f9ff] text-[#091c35] text-[13px] px-3 py-2 rounded-lg border border-[#dfe8ff] focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
              />
            </div>
          </div>

          <button
            onClick={handleRevGeocode}
            disabled={revLoading}
            className="w-full py-2 bg-[#00687a] hover:bg-[#004e5d] text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${revLoading ? 'animate-spin' : ''}`}>
              {revLoading ? 'progress_activity' : 'location_on'}
            </span>
            Reverse Geocode Location
          </button>

          {revError && (
            <div className="p-3 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg text-[#93000a] text-[12px] flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
              <div>
                <p className="font-semibold">{revError}</p>
              </div>
            </div>
          )}

          {revResult?.GeocodeInfo && (
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[11px] text-[#737685]">
                Resolved {revResult.GeocodeInfo.length} address object{revResult.GeocodeInfo.length === 1 ? '' : 's'}
              </span>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {revResult.GeocodeInfo.map((geo, idx) => (
                  <div key={idx} className="p-2.5 bg-[#f9f9ff] rounded-lg border border-[#e7eeff] text-[12px]">
                    <div className="font-bold text-[#091c35]">{geo.BUILDINGNAME || 'Unnamed Building'}</div>
                    <div className="text-[#434654]">{geo.BLOCK ? `Blk ${geo.BLOCK}, ` : ''}{geo.ROAD} • Postal {geo.POSTALCODE || 'N/A'}</div>
                    <div className="text-[10px] font-mono text-[#737685] mt-0.5">Lat: {geo.LATITUDE}, Lng: {geo.LONGITUDE}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Multi-modal Routing */}
      {activeTab === 'route' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#737685] uppercase tracking-wider">
              Travel Mode:
            </span>
            {(['walk', 'drive', 'cycle', 'pt'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setRouteType(m)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold capitalize transition-colors ${
                  routeType === m
                    ? 'bg-[#003d9b] text-white'
                    : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff]'
                }`}
              >
                {m === 'pt' ? 'Public Transit' : m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[#737685] uppercase tracking-wider block mb-1">
                Start (Lat, Lng)
              </label>
              <input
                type="text"
                value={startCoord}
                onChange={(e) => setStartCoord(e.target.value)}
                placeholder="1.320981,103.844150"
                className="w-full bg-[#f9f9ff] text-[#091c35] text-[12px] px-3 py-2 rounded-lg border border-[#dfe8ff] focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#737685] uppercase tracking-wider block mb-1">
                End (Lat, Lng)
              </label>
              <input
                type="text"
                value={endCoord}
                onChange={(e) => setEndCoord(e.target.value)}
                placeholder="1.326762,103.8559"
                className="w-full bg-[#f9f9ff] text-[#091c35] text-[12px] px-3 py-2 rounded-lg border border-[#dfe8ff] focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
              />
            </div>
          </div>

          <button
            onClick={handleRoute}
            disabled={routeLoading}
            className="w-full py-2 bg-[#003d9b] hover:bg-[#002f78] text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${routeLoading ? 'animate-spin' : ''}`}>
              {routeLoading ? 'progress_activity' : 'directions'}
            </span>
            Calculate {routeType.toUpperCase()} Route
          </button>

          {routeError && (
            <div className="p-3 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg text-[#93000a] text-[12px] flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
              <div>
                <p className="font-semibold">{routeError}</p>
              </div>
            </div>
          )}

          {routeResult && (
            <div className="bg-[#f9f9ff] rounded-lg p-3 border border-[#e7eeff] flex flex-col gap-2 text-[12px]">
              {routeResult.route_summary ? (
                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-md border border-[#e7eeff]">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#737685] block">Distance</span>
                    <span className="text-[14px] font-bold text-[#003d9b]">
                      {(routeResult.route_summary.total_distance / 1000).toFixed(2)} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#737685] block">Est. Time</span>
                    <span className="text-[14px] font-bold text-[#006844]">
                      {Math.ceil(routeResult.route_summary.total_time / 60)} mins
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[#434654]">
                  Route computed for {routeType}.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
