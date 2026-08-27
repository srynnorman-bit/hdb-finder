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

export interface BusNextInfo {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival?: string;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: 'SEA' | 'SDA' | 'LSD' | string; // Seats Available, Standing Available, Limited Standing
  Feature?: 'WAB' | string; // Wheelchair Accessible
  Type?: 'SD' | 'DD' | 'BD' | string; // Single Deck, Double Deck, Bendy
}

export interface BusServiceArrival {
  ServiceNo: string;
  Operator: string;
  NextBus: BusNextInfo;
  NextBus2?: BusNextInfo;
  NextBus3?: BusNextInfo;
}

export interface BusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: BusServiceArrival[];
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
    nearbyBusStops?: {
      code: string;
      description: string;
      popularServices?: string[];
    }[];
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
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type ActiveTab = 'search' | 'favorites' | 'profile';

// Data.gov.sg Resale Types
export interface DataGovResaleRecord {
  _id: number;
  month: string;
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: string;
  flat_model: string;
  lease_commence_date: string;
  remaining_lease: string;
  resale_price: string;
}

export interface DataGovSearchResult {
  help?: string;
  success: boolean;
  result?: {
    resource_id: string;
    fields: { type: string; id: string }[];
    records: DataGovResaleRecord[];
    _links?: { start: string; next: string };
    limit?: number;
    total?: number;
  };
}

export interface DataGovMetadataField {
  name: string;
  type: string;
  description?: string;
}

export interface DataGovDatasetMetadata {
  code?: number;
  data?: {
    datasetId?: string;
    name?: string;
    description?: string;
    lastUpdatedAt?: string;
    createdAt?: string;
    coverageStart?: string;
    coverageEnd?: string;
    managedByAgencyName?: string;
    schema?: {
      fields?: DataGovMetadataField[];
    };
  };
  errorMsg?: string;
}

// OneMap SG Types
export interface OneMapSearchResultItem {
  SEARCHVAL: string;
  BLK_NO: string;
  ROAD_NAME: string;
  BUILDING: string;
  ADDRESS: string;
  POSTAL: string;
  X: string;
  Y: string;
  LATITUDE: string;
  LONGITUDE: string;
}

export interface OneMapSearchResponse {
  found: number;
  totalNumPages: number;
  pageNum: number;
  results: OneMapSearchResultItem[];
}

export interface OneMapRevGeocodeItem {
  BUILDINGNAME: string;
  BLOCK: string;
  ROAD: string;
  POSTALCODE: string;
  XCOORD: string;
  YCOORD: string;
  LATITUDE: string;
  LONGITUDE: string;
}

export interface OneMapRevGeocodeResponse {
  GeocodeInfo: OneMapRevGeocodeItem[];
}

export interface OneMapRouteInstruction {
  instruction: string;
  distance: number;
  duration: number;
  name: string;
}

export interface OneMapRouteResponse {
  route_summary?: {
    total_distance: number;
    total_time: number;
    start_point: string;
    end_point: string;
  };
  route_instructions?: OneMapRouteInstruction[] | string[][];
  route_geometry?: string;
  status_message?: string;
  status?: number;
  error?: string;
}
