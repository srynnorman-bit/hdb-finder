import React, { useState, useEffect, useCallback } from 'react';
import { DataGovSearchResult, DataGovResaleRecord, DataGovDatasetMetadata } from '../types';

interface LiveResaleDataSectionProps {
  defaultTown?: string;
  defaultFlatType?: string;
}

export const LiveResaleDataSection: React.FC<LiveResaleDataSectionProps> = ({
  defaultTown = 'TAMPINES',
  defaultFlatType = '4 ROOM',
}) => {
  const [town, setTown] = useState<string>(defaultTown.toUpperCase());
  const [flatType, setFlatType] = useState<string>(defaultFlatType);
  const [limit, setLimit] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DataGovSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Synchronize when defaultTown prop updates from modal / parent
  useEffect(() => {
    if (defaultTown) {
      setTown(defaultTown.toUpperCase());
    }
  }, [defaultTown]);

  // Metadata state
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<DataGovDatasetMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (town && town !== 'ALL') {
        params.set('town', town);
      }
      if (flatType && flatType !== 'ALL') {
        params.set('flat_type', flatType);
      }
      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim());
      }

      // Try primary backend endpoint first
      let res = await fetch(`/api/hdb-resale/transactions?${params.toString()}`);
      
      // If 404 or failed, try backend alias endpoint
      if (!res.ok) {
        res = await fetch(`/api/action/datastore_search?resource_id=d_8b84c4ee58e3cfc0ece0d773c8ca6abc&${params.toString()}`);
      }

      // If still not ok, try direct data.gov.sg datastore search as browser fallback
      if (!res.ok) {
        const directParams = new URLSearchParams();
        directParams.set('resource_id', 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc');
        directParams.set('limit', String(limit));
        if (town && town !== 'ALL') {
          directParams.set('filters', JSON.stringify({ town: town.toUpperCase() }));
        }
        if (searchQuery.trim()) {
          directParams.set('q', searchQuery.trim());
        }
        res = await fetch(`https://data.gov.sg/api/action/datastore_search?${directParams.toString()}`);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Data service returned status ${res.status}`);
      }
      const json: DataGovSearchResult = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch transactions from data.gov.sg';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [town, flatType, limit, searchQuery]);

  const fetchMetadata = async () => {
    if (metadata) {
      setShowMetadata(!showMetadata);
      return;
    }

    setMetadataLoading(true);
    setMetadataError(null);
    try {
      let res = await fetch('/api/hdb-resale/metadata');
      if (!res.ok) {
        res = await fetch('/api/datasets/metadata');
      }
      if (!res.ok) {
        res = await fetch('https://api-production.data.gov.sg/v2/public/api/datasets/d_8b84c4ee58e3cfc0ece0d773c8ca6abc/metadata');
      }
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Metadata service returned status ${res.status}`);
      }
      const json: DataGovDatasetMetadata = await res.json();
      setMetadata(json);
      setShowMetadata(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dataset metadata';
      setMetadataError(msg);
      setShowMetadata(true);
    } finally {
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e7eeff] flex flex-col gap-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0f3ff] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003d9b] text-[20px]">database</span>
            <h3 className="text-[14px] font-bold text-[#091c35]">
              Live data.gov.sg HDB Resale Transactions
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#82f9be]/40 text-[#004e32]">
              Live API
            </span>
          </div>
          <p className="text-[12px] text-[#737685] mt-0.5">
            Dataset: HDB Resale Prices (Jan 2017 onwards) via Singapore DataStore
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetadata}
            disabled={metadataLoading}
            className="px-3 py-1.5 rounded-lg border border-[#c3c6d7] text-[#434654] hover:bg-[#f0f3ff] text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="View dataset fields and metadata schema"
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            {metadataLoading ? 'Loading Meta...' : showMetadata ? 'Hide Schema' : 'View Schema'}
          </button>

          <button
            onClick={() => fetchTransactions()}
            disabled={loading}
            className="p-1.5 rounded-lg bg-[#f0f3ff] hover:bg-[#dfe8ff] text-[#003d9b] transition-colors disabled:opacity-50"
            title="Refresh transactions"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Preset Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-[#737685] uppercase tracking-wider">
          Presets:
        </span>
        <button
          onClick={() => {
            setTown('ALL');
            setFlatType('ALL');
            setLimit(5);
            setSearchQuery('');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
            town === 'ALL' && flatType === 'ALL' && limit === 5
              ? 'bg-[#003d9b] text-white'
              : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff]'
          }`}
        >
          First 5 Resale (All)
        </button>

        <button
          onClick={() => {
            setTown('TAMPINES');
            setFlatType('4 ROOM');
            setLimit(5);
            setSearchQuery('');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
            town === 'TAMPINES' && flatType === '4 ROOM' && limit === 5
              ? 'bg-[#003d9b] text-white'
              : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff]'
          }`}
        >
          4-Room in Tampines
        </button>

        <button
          onClick={() => {
            setTown(defaultTown.toUpperCase());
            setFlatType('4 ROOM');
            setLimit(10);
            setSearchQuery('');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
            town === defaultTown.toUpperCase() && flatType === '4 ROOM' && limit === 10
              ? 'bg-[#003d9b] text-white'
              : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff]'
          }`}
        >
          Top 10 in {defaultTown}
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-[#f9f9ff] p-3 rounded-lg border border-[#e7eeff]">
        <div>
          <label className="text-[10px] font-bold text-[#737685] uppercase tracking-wider block mb-1">
            Town
          </label>
          <select
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="w-full bg-white border border-[#dfe8ff] text-[#091c35] text-[12px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
          >
            <option value="ALL">All Towns (SG)</option>
            <option value="ANG MO KIO">Ang Mo Kio</option>
            <option value="BEDOK">Bedok</option>
            <option value="BISHAN">Bishan</option>
            <option value="BUKIT BATOK">Bukit Batok</option>
            <option value="BUKIT MERAH">Bukit Merah</option>
            <option value="BUKIT PANJANG">Bukit Panjang</option>
            <option value="BUKIT TIMAH">Bukit Timah</option>
            <option value="CENTRAL AREA">Central Area</option>
            <option value="CHOA CHU KANG">Choa Chu Kang</option>
            <option value="CLEMENTI">Clementi</option>
            <option value="GEYLANG">Geylang</option>
            <option value="HOUGANG">Hougang</option>
            <option value="JURONG EAST">Jurong East</option>
            <option value="JURONG WEST">Jurong West</option>
            <option value="KALLANG/WHAMPOA">Kallang/Whampoa</option>
            <option value="MARINE PARADE">Marine Parade</option>
            <option value="PASIR RIS">Pasir Ris</option>
            <option value="PUNGGOL">Punggol</option>
            <option value="QUEENSTOWN">Queenstown</option>
            <option value="SEMBAWANG">Sembawang</option>
            <option value="SENGKANG">Sengkang</option>
            <option value="SERANGOON">Serangoon</option>
            <option value="TAMPINES">Tampines</option>
            <option value="TOA PAYOH">Toa Payoh</option>
            <option value="WOODLANDS">Woodlands</option>
            <option value="YISHUN">Yishun</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-[#737685] uppercase tracking-wider block mb-1">
            Flat Type
          </label>
          <select
            value={flatType}
            onChange={(e) => setFlatType(e.target.value)}
            className="w-full bg-white border border-[#dfe8ff] text-[#091c35] text-[12px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
          >
            <option value="ALL">All Flat Types</option>
            <option value="3 ROOM">3-Room</option>
            <option value="4 ROOM">4-Room</option>
            <option value="5 ROOM">5-Room</option>
            <option value="EXECUTIVE">Executive</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-[#737685] uppercase tracking-wider block mb-1">
            Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full bg-white border border-[#dfe8ff] text-[#091c35] text-[12px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
          >
            <option value={5}>5 records</option>
            <option value={10}>10 records</option>
            <option value={20}>20 records</option>
            <option value={50}>50 records</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-[#737685] uppercase tracking-wider block mb-1">
            Keyword / Street
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Ave 7 or St 13"
            className="w-full bg-white border border-[#dfe8ff] text-[#091c35] text-[12px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003d9b]"
          />
        </div>
      </div>

      {/* Dataset Metadata Drawer */}
      {showMetadata && (
        <div className="bg-[#f0f3ff] rounded-lg p-4 border border-[#dfe8ff] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[12px] font-bold text-[#003d9b] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">schema</span>
              Dataset Metadata & Schema
            </h4>
            <span className="text-[11px] text-[#737685]">API: /v2/public/api/datasets/.../metadata</span>
          </div>

          {metadataError && (
            <p className="text-[12px] text-[#ba1a1a]">{metadataError}</p>
          )}

          {metadata?.data && (
            <div className="flex flex-col gap-2 text-[12px] text-[#434654]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded-md border border-[#e7eeff]">
                <div><strong className="text-[#091c35]">Name:</strong> {metadata.data.name || 'HDB Resale Prices'}</div>
                <div><strong className="text-[#091c35]">Agency:</strong> {metadata.data.managedByAgencyName || 'HDB'}</div>
                <div><strong className="text-[#091c35]">Dataset ID:</strong> {metadata.data.datasetId || 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc'}</div>
                <div><strong className="text-[#091c35]">Last Updated:</strong> {metadata.data.lastUpdatedAt ? new Date(metadata.data.lastUpdatedAt).toLocaleDateString() : 'Recent'}</div>
              </div>

              {metadata.data.schema?.fields && metadata.data.schema.fields.length > 0 && (
                <div>
                  <span className="font-semibold text-[#091c35] block mb-1 text-[11px] uppercase tracking-wider">
                    Fields & Data Types ({metadata.data.schema.fields.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {metadata.data.schema.fields.map((f) => (
                      <div key={f.name} className="bg-white px-2 py-1 rounded border border-[#e7eeff] text-[11px]">
                        <span className="font-mono text-[#003d9b] font-medium">{f.name}</span>
                        <span className="text-[#737685] ml-1">({f.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-lg text-[#93000a] text-[12px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#737685]">
          <span className="material-symbols-outlined text-[28px] animate-spin text-[#003d9b]">
            progress_activity
          </span>
          <span className="text-[12px]">Fetching live resale records from data.gov.sg...</span>
        </div>
      )}

      {/* Table of Records */}
      {!loading && data?.result?.records && (
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] text-[#737685] mb-2">
            <span>
              Showing {data.result.records.length} of {data.result.total?.toLocaleString() || data.result.records.length} records
            </span>
            <span className="font-mono">resource_id: d_8b84c4ee...</span>
          </div>

          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#f0f3ff] text-[#434654] border-b border-[#dfe8ff]">
                <th className="py-2 px-3 font-semibold rounded-l-md">Month</th>
                <th className="py-2 px-3 font-semibold">Town</th>
                <th className="py-2 px-3 font-semibold">Flat Type</th>
                <th className="py-2 px-3 font-semibold">Block / Street</th>
                <th className="py-2 px-3 font-semibold">Storey</th>
                <th className="py-2 px-3 font-semibold">Area</th>
                <th className="py-2 px-3 font-semibold">Remaining Lease</th>
                <th className="py-2 px-3 font-semibold text-right rounded-r-md">Resale Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3ff]">
              {data.result.records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[#737685]">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                data.result.records.map((rec: DataGovResaleRecord) => (
                  <tr key={rec._id} className="hover:bg-[#f9f9ff] transition-colors">
                    <td className="py-2 px-3 font-mono text-[#434654]">{rec.month}</td>
                    <td className="py-2 px-3 font-medium text-[#091c35]">{rec.town}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#dfe8ff] text-[#003d9b] font-medium text-[11px]">
                        {rec.flat_type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#091c35]">
                      Blk {rec.block} {rec.street_name}
                    </td>
                    <td className="py-2 px-3 text-[#737685]">{rec.storey_range}</td>
                    <td className="py-2 px-3 text-[#737685]">{rec.floor_area_sqm} sqm</td>
                    <td className="py-2 px-3 text-[#737685]">{rec.remaining_lease}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#006844] tabular-nums">
                      {formatCurrency(rec.resale_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
