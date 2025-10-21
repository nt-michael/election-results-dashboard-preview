import { useState, useEffect, type ReactNode } from 'react';
import type { GeoJsonObject } from 'geojson';
import type { VotingCenter } from '../types/geo.types';
import { ElectionContext, type ElectionContextType } from './electionContextTypes';

interface ElectionProviderProps {
  children: ReactNode;
}

export function ElectionProvider({ children }: ElectionProviderProps) {
  // Selection state
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedArrondissement, setSelectedArrondissement] = useState<string | null>(null);

  // Data state
  const [regionsData, setRegionsData] = useState<GeoJsonObject | null>(null);
  const [departmentsData, setDepartmentsData] = useState<GeoJsonObject | null>(null);
  const [arrondissementsData, setArrondissementsData] = useState<GeoJsonObject | null>(null);
  const [votingCenters, setVotingCenters] = useState<VotingCenter[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        // Load voting centers (always available)
        const votingCentersModule = await import('../data/voting-centers.json');
        setVotingCenters(votingCentersModule.default as VotingCenter[]);

        // Load GeoJSON files
        try {
          const regionsModule = await import('../data/geoBoundaries-CMR-ADM1_simplified.geojson.json');
          setRegionsData(regionsModule.default as GeoJsonObject);
          console.log('✅ Regions loaded:', regionsModule.default);
        } catch (e) {
          console.warn('⚠️ Regions GeoJSON not found. Map will show limited data.', e);
        }

        try {
          const departmentsModule = await import('../data/geoBoundaries-CMR-ADM2_simplified.geojson.json');
          setDepartmentsData(departmentsModule.default as GeoJsonObject);
          console.log('✅ Departments loaded:', departmentsModule.default);
        } catch (e) {
          console.warn('⚠️ Departments GeoJSON not found. Map will show limited data.', e);
        }

        try {
          const arrondissementsModule = await import('../data/geoBoundaries-CMR-ADM3_simplified.geojson.json');
          setArrondissementsData(arrondissementsModule.default as GeoJsonObject);
          console.log('✅ Arrondissements loaded:', arrondissementsModule.default);
        } catch (e) {
          console.warn('⚠️ Arrondissements GeoJSON not found. Map will show limited data.', e);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load election data. Please check that data files are available.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter voting centers based on selected arrondissement
  const filteredVotingCenters = selectedArrondissement
    ? votingCenters.filter((center) => center.arrondissementId === selectedArrondissement)
    : [];

  const value: ElectionContextType = {
    selectedRegion,
    selectedDepartment,
    selectedArrondissement,
    setSelectedRegion,
    setSelectedDepartment,
    setSelectedArrondissement,
    regionsData,
    departmentsData,
    arrondissementsData,
    votingCenters,
    filteredVotingCenters,
    isLoading,
    error,
  };

  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>;
}
