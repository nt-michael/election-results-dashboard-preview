/**
 * Type definitions for geographic and election data
 */

export interface Selection {
  region: string | null;
  department: string | null;
  arrondissement: string | null;
}

export interface Candidate {
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

export interface VotingCenterStats {
  totalVotes: number;
  candidates: Candidate[];
}

export interface VotingCenter {
  arrondissementId: string;
  centerId: string;
  name: string;
  coords: [number, number]; // [latitude, longitude]
  stats: VotingCenterStats;
}

/**
 * GeoJSON Feature Properties for administrative boundaries
 */
export interface RegionProperties {
  shapeName: string;
  shapeID: string;
  shapeGroup?: string;
  shapeType?: string;
}

export interface DepartmentProperties extends RegionProperties {
  regionId?: string;
}

export interface ArrondissementProperties extends RegionProperties {
  departmentId?: string;
  regionId?: string;
}

/**
 * Map style configuration
 */
export interface MapStyle {
  color: string;
  weight: number;
  opacity: number;
  fillColor: string;
  fillOpacity: number;
}

export const DEFAULT_STYLE: MapStyle = {
  color: '#3388ff',
  weight: 2,
  opacity: 1,
  fillColor: '#3388ff',
  fillOpacity: 0.2,
};

export const HIGHLIGHTED_STYLE: MapStyle = {
  color: '#ff7800',
  weight: 3,
  opacity: 1,
  fillColor: '#ff7800',
  fillOpacity: 0.4,
};

export const HOVER_STYLE: MapStyle = {
  color: '#666',
  weight: 3,
  opacity: 1,
  fillColor: '#666',
  fillOpacity: 0.3,
};
