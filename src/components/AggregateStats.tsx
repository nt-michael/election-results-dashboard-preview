import type { AggregateStats } from '../utils/statisticsHelpers';
import { formatNumber } from '../utils/statsHelpers';
import CandidateProgressBar from './CandidateProgressBar';

interface AggregateStatsProps {
  stats: AggregateStats;
  title: string;
  subtitle?: string;
}

export default function AggregateStatsDisplay({
  stats,
  title,
  subtitle,
}: AggregateStatsProps) {
  // const winner = stats.candidates.length > 0 ? stats.candidates[0] : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4! sm:p-6!">
      {/* Header */}
      <div className="mb-4! sm:mb-6!">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1!">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* Aggregate Statistics - Three columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4! sm:gap-4! mb-6! sm:mb-6!">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg sm:rounded-xl p-4! sm:p-5! border border-blue-200 dark:border-blue-800">
          <div className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-2!">
            Total Voting Centers
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatNumber(stats.totalVotingCenters)}
          </div>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg sm:rounded-xl p-4! sm:p-5! border border-green-200 dark:border-green-800">
          <div className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 mb-2!">
            Total Votes Cast
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400">
            {formatNumber(stats.totalVotes)}
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg sm:rounded-xl p-4! sm:p-5! border border-purple-200 dark:border-purple-800">
          <div className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300 mb-2!">
            Average per Center
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {formatNumber(Math.round(stats.averageVotesPerCenter))}
          </div>
        </div>
      </div>

      {/* Candidate Results */}
      {stats.candidates.length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4! sm:mb-4!">
            Candidate Results
          </h3>
          <div className="space-y-4!">
            {stats.candidates.map((candidate, idx) => (
              <CandidateProgressBar
                key={candidate.name}
                name={candidate.name}
                party={candidate.party}
                votes={candidate.votes}
                percentage={candidate.percentage}
                color={
                  idx === 0
                    ? 'bg-green-500'
                    : idx === 1
                    ? 'bg-blue-500'
                    : idx === 2
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }
                isWinner={idx === 0}
                showVotes={true}
              />
            ))}
          </div>
        </div>
      )}

      {stats.candidates.length === 0 && (
        <div className="text-center py-8! text-gray-500 dark:text-gray-400">
          No voting data available
        </div>
      )}
    </div>
  );
}
