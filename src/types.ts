export type FlatType = '3-Room' | '4-Room' | '5-Room' | 'Executive';

export interface PriceTrendData {
  room3: number;
  room4: number;
  room5: number;
  executive?: number;
  yoyChange: number; // e.g. +2.4%
  medianPsf: number;
  quarter: string;
}

export interface AmenityInfo {
  hawkerCentres: {
    count: number;
    names: string[];
    distanceKm?: number;
  };
  schools: {
    count: number;
    names: string[];
  };
  transport: {
    mrtStation: string;
    distanceKm: number;
    lines: string[];
    summary: string;
  };
  carparks: {
    status: 'High' | 'Medium' | 'Low';
    lots: number;
    location: string;
    carparkCode?: string;
  };
}

export interface ResaleTransaction {
  id: string;
  month: string;
  town: string;
  flatType: FlatType;
  block: string;
  streetName: string;
  storeyRange: string;
  floorAreaSqm: number;
  resalePrice: number;
  remainingLease: string;
}

export interface HdbArea {
  id: string;
  name: string;
  region: 'East' | 'Central' | 'North' | 'North-East' | 'West';
  description: string;
  priceTrends: PriceTrendData;
  amenities: AmenityInfo;
  quarterlyTrends: {
    quarter: string;
    room3: number;
    room4: number;
    room5: number;
  }[];
  recentTransactions: ResaleTransaction[];
  totalUnits?: number;
  averageAge?: number;
  popularEstates?: string[];
}

export type ActiveTab = 'search' | 'favorites' | 'profile';
