import { useElection } from './hooks/useElection';
import MapView from './components/MapView';
import SelectorPanel from './components/SelectorPanel';
import ResultsDisplay from './components/ResultsDisplay';
import BreadcrumbNav from './components/BreadcrumbNav';
import { findParentRegion, findParentDepartment } from './utils/spatialHelpers';

function App() {
  const {
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
  } = useElection();

  // Handle breadcrumb navigation
  const handleHomeClick = () => {
    setSelectedRegion(null);
    setSelectedDepartment(null);
    setSelectedArrondissement(null);
  };

  const handleBreadcrumbRegionClick = () => {
    setSelectedDepartment(null);
    setSelectedArrondissement(null);
  };

  const handleBreadcrumbDepartmentClick = () => {
    setSelectedArrondissement(null);
  };

  // Handle map clicks - ensure parent selections are maintained
  const handleMapRegionClick = (regionName: string) => {
    setSelectedRegion(regionName);
    setSelectedDepartment(null);
    setSelectedArrondissement(null);
  };

  const handleMapDepartmentClick = (departmentName: string) => {
    // Find and set parent region first
    const parentRegion = findParentRegion(departmentName, departmentsData ?? undefined, regionsData ?? undefined);
    if (parentRegion) {
      setSelectedRegion(parentRegion);
    }
    setSelectedDepartment(departmentName);
    setSelectedArrondissement(null);
  };

  const handleMapArrondissementClick = (arrondissementName: string) => {
    // Find and set parent department and region
    const parentDepartment = findParentDepartment(arrondissementName, arrondissementsData ?? undefined, departmentsData ?? undefined);
    if (parentDepartment) {
      setSelectedDepartment(parentDepartment);

      // Also find and set parent region
      const parentRegion = findParentRegion(parentDepartment, departmentsData ?? undefined, regionsData ?? undefined);
      if (parentRegion) {
        setSelectedRegion(parentRegion);
      }
    }
    setSelectedArrondissement(arrondissementName);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 mb-4!"></div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4!">
            Loading Election Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we load the map and voting center data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4!">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4!">
            Error Loading Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4!">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4! py-2! bg-blue-600 text-white rounded-lg font-medium
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-colors duration-200"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-x-hidden overflow-y-auto h-screen min-h-screen lg:h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav
        selectedRegion={selectedRegion}
        selectedDepartment={selectedDepartment}
        selectedArrondissement={selectedArrondissement}
        onHomeClick={handleHomeClick}
        onRegionClick={handleBreadcrumbRegionClick}
        onDepartmentClick={handleBreadcrumbDepartmentClick}
      />

      {/* Main Layout - Responsive: Stacked on mobile, Split on desktop */}
      <div className="flex flex-col lg:flex-row lg:flex-1 lg:overflow-hidden">
        {/* Selector and Results Section - First on mobile, right on desktop */}
        <div className="w-full lg:w-1/2 lg:flex-1 overflow-x-hidden lg:overflow-y-auto bg-gray-50 dark:bg-gray-900 lg:order-2">
          <div className="p-4! sm:p-6! pb-12!">
            {/* Selector Panel */}
            <SelectorPanel
              selectedRegion={selectedRegion}
              selectedDepartment={selectedDepartment}
              selectedArrondissement={selectedArrondissement}
              regionsData={regionsData ?? undefined}
              departmentsData={departmentsData ?? undefined}
              arrondissementsData={arrondissementsData ?? undefined}
              onRegionChange={setSelectedRegion}
              onDepartmentChange={setSelectedDepartment}
              onArrondissementChange={setSelectedArrondissement}
              isLoading={false}
            />

            {/* Results Display */}
            {selectedArrondissement && (
              <div className="mt-4! sm:mt-4!">
                <ResultsDisplay
                  votingCenters={filteredVotingCenters}
                  selectedArrondissement={selectedArrondissement}
                />
              </div>
            )}
          </div>
        </div>

        {/* Map Section - Hidden on mobile, visible on desktop (left side) */}
        <div className="hidden lg:block w-full lg:w-1/2 shrink-0 lg:h-full lg:order-1">
          <MapView
            selectedRegion={selectedRegion}
            selectedDepartment={selectedDepartment}
            selectedArrondissement={selectedArrondissement}
            votingCenters={votingCenters}
            regionsData={regionsData ?? undefined}
            departmentsData={departmentsData ?? undefined}
            arrondissementsData={arrondissementsData ?? undefined}
            onRegionClick={handleMapRegionClick}
            onDepartmentClick={handleMapDepartmentClick}
            onArrondissementClick={handleMapArrondissementClick}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
