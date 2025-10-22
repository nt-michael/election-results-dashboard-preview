import { formatNumber, formatPercentage } from '../utils/statsHelpers';

interface CandidateProgressBarProps {
  name: string;
  party: string;
  votes: number;
  percentage: number;
  color: string;
  isWinner?: boolean;
  showVotes?: boolean;
}

export default function CandidateProgressBar({
  name,
  party,
  votes,
  percentage,
  color,
  isWinner = false,
  showVotes = true,
}: CandidateProgressBarProps) {
  return (
    <div className="!space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center !gap-2 min-w-0 flex-1">
          <span className={`font-medium text-gray-900 dark:text-gray-100 truncate ${isWinner ? 'font-bold' : ''}`}>
            {name}
          </span>
          {isWinner && (
            <span className="flex-shrink-0 inline-flex items-center !px-2 !py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              <svg className="w-3 h-3 !mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Winner
            </span>
          )}
        </div>
        <div className="flex items-center !gap-3 flex-shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {party}
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[60px] text-right">
            {formatPercentage(percentage)}
          </span>
        </div>
      </div>

      <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out flex items-center justify-end !pr-3`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        >
          {percentage > 15 && showVotes && (
            <span className="text-xs font-medium text-white">
              {formatNumber(votes)}
            </span>
          )}
        </div>
        {percentage <= 15 && showVotes && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 dark:text-gray-400">
            {formatNumber(votes)}
          </span>
        )}
      </div>
    </div>
  );
}
