import { useMemo } from 'react';
import type { GeoJsonObject } from 'geojson';
import SearchableSelect from './SearchableSelect';
import {
  extractRegionsFromGeoJSON,
  extractDepartmentsFromGeoJSON,
  extractArrondissementsFromGeoJSON,
  countAdministrativeUnits,
} from '../utils/geoDataHelpers';

interface SelectorPanelProps {
  // Current selections
  selectedRegion: string | null;
  selectedDepartment: string | null;
  selectedArrondissement: string | null;

  // GeoJSON data sources
  regionsData?: GeoJsonObject;
  departmentsData?: GeoJsonObject;
  arrondissementsData?: GeoJsonObject;

  // Callbacks for selection changes
  onRegionChange: (region: string | null) => void;
  onDepartmentChange: (department: string | null) => void;
  onArrondissementChange: (arrondissement: string | null) => void;

  // Optional loading state
  isLoading?: boolean;

  // Optional custom styling
  className?: string;
}

export default function SelectorPanel({
  selectedRegion,
  selectedDepartment,
  selectedArrondissement,
  regionsData,
  departmentsData,
  arrondissementsData,
  onRegionChange,
  onDepartmentChange,
  onArrondissementChange,
  isLoading = false,
  className = '',
}: SelectorPanelProps) {
  // Extract options from GeoJSON data
  const regionOptions = useMemo(
    () => extractRegionsFromGeoJSON(regionsData),
    [regionsData]
  );

  const departmentOptions = useMemo(
    () => extractDepartmentsFromGeoJSON(departmentsData, selectedRegion, regionsData),
    [departmentsData, selectedRegion, regionsData]
  );

  const arrondissementOptions = useMemo(
    () => extractArrondissementsFromGeoJSON(arrondissementsData, selectedDepartment, departmentsData),
    [arrondissementsData, selectedDepartment, departmentsData]
  );

  // Count statistics
  const stats = useMemo(
    () => ({
      regions: countAdministrativeUnits(regionsData),
      departments: countAdministrativeUnits(departmentsData),
      arrondissements: countAdministrativeUnits(arrondissementsData),
      filteredDepartments: departmentOptions.length,
      filteredArrondissements: arrondissementOptions.length,
    }),
    [regionsData, departmentsData, arrondissementsData, departmentOptions, arrondissementOptions]
  );

  // Handle region change - reset downstream selections
  const handleRegionChange = (region: string | null) => {
    onRegionChange(region);
    if (selectedDepartment) onDepartmentChange(null);
    if (selectedArrondissement) onArrondissementChange(null);
  };

  // Handle department change - reset arrondissement
  const handleDepartmentChange = (department: string | null) => {
    onDepartmentChange(department);
    if (selectedArrondissement) onArrondissementChange(null);
  };

  // Reset all selections
  const handleResetAll = () => {
    onRegionChange(null);
    onDepartmentChange(null);
    onArrondissementChange(null);
  };

  const hasAnySelection = selectedRegion || selectedDepartment || selectedArrondissement;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-6!">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Navigation
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Select administrative level to view election results
              </p>
            </div>
            {hasAnySelection && (
              <button
                onClick={handleResetAll}
                className="px-5 py-2.5 text-sm font-medium text-white
                         bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                         rounded-xl shadow-md hover:shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                         transition-all duration-200 transform hover:scale-105"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">Loading data...</span>
            </div>
          </div>
        )}

        {/* Statistics Card */}
        {!isLoading && stats.regions > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4! mb-4! overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 relative">
              Cameroon Administrative Data
            </h3>
            <div className="grid grid-cols-3 gap-6 relative">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                  {stats.regions}
                </div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-2">
                  Regions
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                  {selectedRegion ? stats.filteredDepartments : stats.departments}
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300 mt-2">
                  Departments{selectedRegion && <span className="block text-xs opacity-75 mt-0.5">in {selectedRegion}</span>}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {selectedDepartment ? stats.filteredArrondissements : stats.arrondissements}
                </div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-2">
                  Arrondissements{selectedDepartment && <span className="block text-xs opacity-75 mt-0.5">in {selectedDepartment}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selection Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6! relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-linear-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-3 mb-6 relative">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Select Location
            </h3>
          </div>

          <div className="space-y-5 relative">
            {/* Region Selector */}
            <SearchableSelect
              label="Region"
              options={regionOptions}
              value={selectedRegion}
              onChange={handleRegionChange}
              placeholder="Select a region..."
              disabled={isLoading || regionOptions.length === 0}
              clearable={true}
            />

            {/* Department Selector */}
            <SearchableSelect
              label="Department"
              options={departmentOptions}
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              placeholder={
                selectedRegion
                  ? 'Select a department...'
                  : 'Select a region first'
              }
              disabled={!selectedRegion || isLoading || departmentOptions.length === 0}
              clearable={true}
            />

            {/* Arrondissement Selector */}
            <SearchableSelect
              label="Arrondissement"
              options={arrondissementOptions}
              value={selectedArrondissement}
              onChange={onArrondissementChange}
              placeholder={
                selectedDepartment
                  ? 'Select an arrondissement...'
                  : 'Select a department first'
              }
              disabled={!selectedDepartment || isLoading || arrondissementOptions.length === 0}
              clearable={true}
            />
          </div>

          {/* Help Text */}
          <div className="mt-6! p-4! bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-xl">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5! shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1!">
                  How to navigate
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  Select a region, then a department, then an arrondissement to view voting centers on the map.
                  Use the search feature in each dropdown to quickly find locations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Selection Summary */}
        {hasAnySelection && (
          <div className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6! mt-6!">
            <div className="flex items-center gap-3 mb-4!">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Current Selection
              </h3>
            </div>
            <div className="space-y-3!">
              {selectedRegion && (
                <div className="flex items-center gap-3 p-3! bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Region:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-sm">
                    {selectedRegion}
                  </span>
                </div>
              )}
              {selectedDepartment && (
                <div className="flex items-center gap-3 p-3! bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Department:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-sm">
                    {selectedDepartment}
                  </span>
                </div>
              )}
              {selectedArrondissement && (
                <div className="flex items-center gap-3 p-3! bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Arrondissement:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-sm">
                    {selectedArrondissement}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Data Warning */}
        {!isLoading && regionOptions.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 rounded-r-xl p-5! shadow-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-base font-bold text-yellow-900 dark:text-yellow-200 mb-1!">
                  No GeoJSON data loaded
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
                  Please ensure GeoJSON files are placed in the src/data/ directory.
                  See the documentation for details.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
