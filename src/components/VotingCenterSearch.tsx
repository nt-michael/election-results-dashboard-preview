import { useState, useRef, useEffect } from 'react';
import type { VotingCenter } from '../types/geo.types';

interface VotingCenterSearchProps {
  votingCenters: VotingCenter[];
  onSelectCenter: (center: VotingCenter) => void;
}

export default function VotingCenterSearch({
  votingCenters,
  onSelectCenter,
}: VotingCenterSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter voting centers based on search term
  const filteredCenters = votingCenters.filter((center) =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.arrondissementId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.centerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectCenter = (center: VotingCenter) => {
    onSelectCenter(center);
    setSearchTerm(center.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4! sm:p-6!" ref={containerRef}>
      <div className="flex items-center gap-3! mb-4! sm:mb-4!">
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Search Voting Centers
        </h3>
      </div>

      <div className="relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search by name, municipality, or ID..."
            className="w-full h-12 px-4! pr-10! text-sm border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     rounded-lg transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isOpen && searchTerm && (
          <div className="absolute z-50 w-full mt-2! bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-80 overflow-hidden">
            <div className="overflow-y-auto max-h-80">
              {filteredCenters.length === 0 ? (
                <div className="px-4! py-8! text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-2!">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    No voting centers found
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1!">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <ul className="py-2!">
                  {filteredCenters.slice(0, 50).map((center) => (
                    <li key={center.centerId}>
                      <button
                        type="button"
                        onClick={() => handleSelectCenter(center)}
                        className="w-full px-4! py-3! text-left hover:bg-gray-100 dark:hover:bg-gray-700
                                 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="flex items-start justify-between gap-3!">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                              {center.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1!">
                              {center.arrondissementId}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <span className="inline-flex items-center px-2! py-1! rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                              {center.stats.totalVotes.toLocaleString()} votes
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                  {filteredCenters.length > 50 && (
                    <li className="px-4! py-3! text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750">
                      Showing first 50 of {filteredCenters.length} results
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {searchTerm && !isOpen && (
        <p className="mt-2! text-xs text-gray-500 dark:text-gray-400">
          Press Enter or click to search again
        </p>
      )}
    </div>
  );
}
