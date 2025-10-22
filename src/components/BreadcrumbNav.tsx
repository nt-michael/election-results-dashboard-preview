interface BreadcrumbNavProps {
  selectedRegion: string | null;
  selectedDepartment: string | null;
  selectedArrondissement: string | null;
  onRegionClick: () => void;
  onDepartmentClick: () => void;
  onHomeClick: () => void;
}

export default function BreadcrumbNav({
  selectedRegion,
  selectedDepartment,
  selectedArrondissement,
  onRegionClick,
  onDepartmentClick,
  onHomeClick,
}: BreadcrumbNavProps) {
  const hasAnySelection = selectedRegion || selectedDepartment || selectedArrondissement;

  if (!hasAnySelection) {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 !px-4 sm:!px-4 !py-2 sm:!py-2">
      <ol className="flex items-center flex-wrap !space-x-2 text-xs sm:text-sm">
        {/* Home */}
        <li>
          <button
            onClick={onHomeClick}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Cameroon
          </button>
        </li>

        {/* Region */}
        {selectedRegion && (
          <>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li>
              {selectedDepartment || selectedArrondissement ? (
                <button
                  onClick={onRegionClick}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {selectedRegion}
                </button>
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                  {selectedRegion}
                </span>
              )}
            </li>
          </>
        )}

        {/* Department */}
        {selectedDepartment && (
          <>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li>
              {selectedArrondissement ? (
                <button
                  onClick={onDepartmentClick}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {selectedDepartment}
                </button>
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                  {selectedDepartment}
                </span>
              )}
            </li>
          </>
        )}

        {/* Arrondissement */}
        {selectedArrondissement && (
          <>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {selectedArrondissement}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
