import { createContext } from 'react';
import type { GeoJsonObject } from 'geojson';
import type { VotingCenter } from '../types/geo.types';

export interface ElectionContextType {
  // Selection state
  selectedRegion: string | null;
  selectedDepartment: string | null;
  selectedArrondissement: string | null;
  setSelectedRegion: (region: string | null) => void;
  setSelectedDepartment: (department: string | null) => void;
  setSelectedArrondissement: (arrondissement: string | null) => void;

  // GeoJSON data
  regionsData: GeoJsonObject | null;
  departmentsData: GeoJsonObject | null;
  arrondissementsData: GeoJsonObject | null;

  // Voting center data
  votingCenters: VotingCenter[];
  filteredVotingCenters: VotingCenter[];

  // Loading state
  isLoading: boolean;
  error: string | null;
}

export const ElectionContext = createContext<ElectionContextType | undefined>(undefined);
