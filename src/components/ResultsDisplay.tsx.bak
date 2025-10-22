import { useState, useMemo } from 'react';
import type { VotingCenter } from '../types/geo.types';
import CandidateProgressBar from './CandidateProgressBar';
import {
  calculateAggregateStats,
  formatNumber,
  formatPercentage,
  getCandidateColor,
  sortVotingCenters,
  getWinner,
} from '../utils/statsHelpers';

interface ResultsDisplayProps {
  votingCenters: VotingCenter[];
  selectedArrondissement?: string | null;
  className?: string;
}

type SortOption = 'name' | 'totalVotes' | 'winner';

export default function ResultsDisplay({
  votingCenters,
  selectedArrondissement,
  className = '',
}: ResultsDisplayProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [expandedCenters, setExpandedCenters] = useState<Set<string>>(new Set());

  // Calculate aggregate statistics
  const aggregateStats = useMemo(
    () => calculateAggregateStats(votingCenters),
    [votingCenters]
  );

  // Sort voting centers
  const sortedCenters = useMemo(
    () => sortVotingCenters(votingCenters, sortBy),
    [votingCenters, sortBy]
  );

  // Toggle expanded state for a voting center
  const toggleExpanded = (centerId: string) => {
    setExpandedCenters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(centerId)) {
        newSet.delete(centerId);
      } else {
        newSet.add(centerId);
      }
      return newSet;
    });
  };

  // Expand all centers
  const expandAll = () => {
    setExpandedCenters(new Set(votingCenters.map((c) => c.centerId)));
  };

  // Collapse all centers
  const collapseAll = () => {
    setExpandedCenters(new Set());
  };

  // Empty state
  if (votingCenters.length === 0) {
    return (
      <div className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 !p-4 ${className}`}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No voting centers to display
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md">
              {selectedArrondissement
                ? `No voting center data available for ${selectedArrondissement}.`
                : 'Select an arrondissement from the navigation panel to view voting centers and election results.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="!space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 !pb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Election Results
          </h2>
          {selectedArrondissement && (
            <p className="!mt-1 text-sm text-gray-600 dark:text-gray-400">
              Results for <span className="font-semibold">{selectedArrondissement}</span>
            </p>
          )}
        </div>

        {/* Aggregate Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 !p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 !mb-4">
            Aggregate Statistics
          </h3>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 !mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium !mb-1">
                Total Voting Centers
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {aggregateStats.totalCenters}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="text-sm text-green-700 dark:text-green-300 font-medium !mb-1">
                Total Votes Cast
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {formatNumber(aggregateStats.totalVotes)}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="text-sm text-purple-700 dark:text-purple-300 font-medium !mb-1">
                Average per Center
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {formatNumber(Math.round(aggregateStats.averageVotesPerCenter))}
              </div>
            </div>
          </div>

          {/* Candidate Results */}
          <div className="!space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Overall Results by Candidate
            </h4>
            {aggregateStats.candidateStats.map((candidate, index) => (
              <div key={candidate.name} className="!space-y-1">
                <CandidateProgressBar
                  name={candidate.name}
                  party={candidate.party}
                  votes={candidate.totalVotes}
                  percentage={candidate.percentage}
                  color={getCandidateColor(index)}
                  isWinner={index === 0}
                  showVotes={true}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                  Won {candidate.centersWon} of {aggregateStats.totalCenters} centers
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 !p-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="totalVotes">Total Votes</option>
              <option value="winner">Winner</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="!px-3 !py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                       rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       transition-colors duration-200"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="!px-3 !py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                       rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       transition-colors duration-200"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Voting Centers List */}
        <div className="!space-y-3">
          {sortedCenters.map((center) => {
            const isExpanded = expandedCenters.has(center.centerId);
            const winner = getWinner(center);

            return (
              <div
                key={center.centerId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Center Header */}
                <button
                  onClick={() => toggleExpanded(center.centerId)}
                  className="w-full !px-6 !py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {center.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Winner: <span className="font-medium">{winner.name}</span> ({winner.party}) -{' '}
                        {formatPercentage(winner.percentage)}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Votes
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatNumber(center.stats.totalVotes)}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="!px-6 !pb-6 !pt-2 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 !mb-3 uppercase tracking-wide">
                      Results by Candidate
                    </h4>
                    <div className="!space-y-3">
                      {center.stats.candidates.map((candidate, index) => (
                        <CandidateProgressBar
                          key={candidate.name}
                          name={candidate.name}
                          party={candidate.party}
                          votes={candidate.votes}
                          percentage={candidate.percentage}
                          color={getCandidateColor(index)}
                          isWinner={candidate.name === winner.name}
                          showVotes={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
