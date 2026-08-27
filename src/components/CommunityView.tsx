import React, { useState } from 'react';
import { DisqusComments } from './DisqusComments';
import { HDB_AREAS } from '../data/hdbData';

interface ChannelTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
}

const FORUM_CHANNELS: ChannelTopic[] = [
  {
    id: 'hdb-general-discussion',
    title: 'Singapore HDB General Discussion',
    category: 'General',
    description: 'General housing queries, policy updates, grants, and neighborhood lifestyle discussions.',
    icon: 'forum',
  },
  {
    id: 'hdb-bto-launch-discussion',
    title: 'BTO Launches & SBF Application Tips',
    category: 'BTO & New Flats',
    description: 'Upcoming launch locations, ballot chances, priority schemes, and key collection timelines.',
    icon: 'domain',
  },
  {
    id: 'hdb-resale-market-insights',
    title: 'HDB Resale Prices & Negotiation',
    category: 'Resale Market',
    description: 'Valuation, COV trends, price negotiation, seller concessionary terms, and agent advice.',
    icon: 'trending_up',
  },
  {
    id: 'hdb-renovation-interior',
    title: 'Renovation & Interior Design Showcase',
    category: 'Home Improvement',
    description: 'Contractor reviews, renovation budgets, HDB permits, smart home setups, and before/after photos.',
    icon: 'architecture',
  },
];

export const CommunityView: React.FC = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('hdb-general-discussion');
  const [estateFilter, setEstateFilter] = useState<string>('all');

  const selectedChannel =
    FORUM_CHANNELS.find((c) => c.id === selectedChannelId) ||
    (estateFilter !== 'all'
      ? {
          id: `hdb-estate-${estateFilter}`,
          title: `${HDB_AREAS.find((a) => a.id === estateFilter)?.name || estateFilter} Community & Reviews`,
          category: 'Estate Channel',
          description: `Resident reviews, nearby amenities, food recommendations, and neighborhood updates for ${HDB_AREAS.find((a) => a.id === estateFilter)?.name || estateFilter}.`,
          icon: 'location_on',
        }
      : FORUM_CHANNELS[0]);

  const handleSelectTopic = (channelId: string) => {
    setSelectedChannelId(channelId);
    setEstateFilter('all');
  };

  const handleSelectEstate = (estateId: string) => {
    setEstateFilter(estateId);
    setSelectedChannelId(`hdb-estate-${estateId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-[34px] font-bold text-[#091c35] tracking-tight">
          Community Forum
        </h1>
        <p className="text-[14px] leading-[20px] text-[#434654]">
          Connect with fellow Singapore homeowners, ask questions, and share estate reviews
        </p>
      </div>

      {/* Topics / Channels Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e7eeff] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-[#003d9b] uppercase tracking-wider">
            Discussion Channels
          </h2>
          <span className="text-[11px] text-[#737685]">Select a topic below</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {FORUM_CHANNELS.map((ch) => {
            const isSelected = selectedChannelId === ch.id && estateFilter === 'all';
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectTopic(ch.id)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#f0f3ff] border-[#003d9b] shadow-xs ring-1 ring-[#003d9b]/20'
                    : 'bg-[#f9f9ff] border-[#e7eeff] hover:bg-[#f0f3ff] hover:border-[#cadbfc]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#003d9b] text-white' : 'bg-[#dfe8ff] text-[#003d9b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{ch.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#091c35] truncate">{ch.title}</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white text-[#737685] border border-[#e7eeff]">
                      {ch.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#434654] line-clamp-1 mt-0.5">{ch.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Town-Specific Filter */}
        <div className="pt-3 border-t border-[#e7eeff] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#434654]">
              Or discuss a specific HDB Town:
            </span>
            {estateFilter !== 'all' && (
              <button
                onClick={() => handleSelectTopic('hdb-general-discussion')}
                className="text-[11px] text-[#003d9b] font-medium hover:underline"
              >
                Reset to General
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {HDB_AREAS.map((area) => {
              const isSelected = estateFilter === area.id;
              return (
                <button
                  key={area.id}
                  onClick={() => handleSelectEstate(area.id)}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                    isSelected
                      ? 'bg-[#003d9b] text-white shadow-2xs'
                      : 'bg-[#f0f3ff] text-[#434654] hover:bg-[#dfe8ff] hover:text-[#091c35]'
                  }`}
                >
                  {area.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Thread Banner */}
      <div className="bg-[#dfe8ff]/60 border border-[#cadbfc] p-3.5 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-[#003d9b] text-[20px] shrink-0">
            {selectedChannel.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#091c35] truncate">{selectedChannel.title}</p>
            <p className="text-[11px] text-[#434654] truncate">{selectedChannel.description}</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#003d9b] bg-white px-2 py-0.5 rounded border border-[#cadbfc] shrink-0">
          #{selectedChannel.id}
        </span>
      </div>

      {/* Disqus Comments Integration */}
      <DisqusComments
        identifier={selectedChannel.id}
        title={selectedChannel.title}
        categoryName={selectedChannel.category}
      />
    </div>
  );
};
