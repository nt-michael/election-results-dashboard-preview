import type { VotingCenter, Candidate } from '../types/geo.types';

/**
 * Aggregate statistics for voting centers
 */
export interface AggregateStats {
  totalCenters: number;
  totalVotes: number;
  averageVotesPerCenter: number;
  candidateStats: CandidateAggregateStats[];
}

export interface CandidateAggregateStats {
  name: string;
  party: string;
  totalVotes: number;
  percentage: number;
  centersWon: number;
}

/**
 * Calculate aggregate statistics from voting centers
 */
export function calculateAggregateStats(
  votingCenters: VotingCenter[]
): AggregateStats {
  if (votingCenters.length === 0) {
    return {
      totalCenters: 0,
      totalVotes: 0,
      averageVotesPerCenter: 0,
      candidateStats: [],
    };
  }

  const totalCenters = votingCenters.length;
  const totalVotes = votingCenters.reduce(
    (sum, center) => sum + center.stats.totalVotes,
    0
  );
  const averageVotesPerCenter = totalVotes / totalCenters;

  // Aggregate candidate votes across all centers
  const candidateVotesMap = new Map<string, { party: string; votes: number; wins: number }>();

  votingCenters.forEach((center) => {
    // Find winner for this center
    let maxVotes = 0;
    let winner = '';

    center.stats.candidates.forEach((candidate) => {
      // Aggregate votes
      const key = candidate.name;
      const existing = candidateVotesMap.get(key) || {
        party: candidate.party,
        votes: 0,
        wins: 0,
      };

      existing.votes += candidate.votes;
      candidateVotesMap.set(key, existing);

      // Track winner
      if (candidate.votes > maxVotes) {
        maxVotes = candidate.votes;
        winner = candidate.name;
      }
    });

    // Increment win count for winner
    if (winner) {
      const winnerData = candidateVotesMap.get(winner);
      if (winnerData) {
        winnerData.wins += 1;
      }
    }
  });

  // Convert to array and calculate percentages
  const candidateStats: CandidateAggregateStats[] = Array.from(
    candidateVotesMap.entries()
  )
    .map(([name, data]) => ({
      name,
      party: data.party,
      totalVotes: data.votes,
      percentage: (data.votes / totalVotes) * 100,
      centersWon: data.wins,
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes); // Sort by votes descending

  return {
    totalCenters,
    totalVotes,
    averageVotesPerCenter,
    candidateStats,
  };
}

/**
 * Format number with locale-specific separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return num.toFixed(decimals) + '%';
}

/**
 * Get color class for candidate based on their position
 */
export function getCandidateColor(index: number): string {
  const colors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-teal-600',
    'bg-red-600',
  ];
  return colors[index % colors.length];
}

/**
 * Get lighter color class for backgrounds
 */
export function getCandidateBackgroundColor(index: number): string {
  const colors = [
    'bg-blue-50 dark:bg-blue-900/20',
    'bg-green-50 dark:bg-green-900/20',
    'bg-purple-50 dark:bg-purple-900/20',
    'bg-orange-50 dark:bg-orange-900/20',
    'bg-pink-50 dark:bg-pink-900/20',
    'bg-indigo-50 dark:bg-indigo-900/20',
    'bg-teal-50 dark:bg-teal-900/20',
    'bg-red-50 dark:bg-red-900/20',
  ];
  return colors[index % colors.length];
}

/**
 * Sort voting centers by various criteria
 */
export function sortVotingCenters(
  centers: VotingCenter[],
  sortBy: 'name' | 'totalVotes' | 'winner'
): VotingCenter[] {
  const sorted = [...centers];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case 'totalVotes':
      return sorted.sort((a, b) => b.stats.totalVotes - a.stats.totalVotes);

    case 'winner':
      return sorted.sort((a, b) => {
        const aWinner = a.stats.candidates.reduce((prev, curr) =>
          curr.votes > prev.votes ? curr : prev
        );
        const bWinner = b.stats.candidates.reduce((prev, curr) =>
          curr.votes > prev.votes ? curr : prev
        );
        return aWinner.name.localeCompare(bWinner.name);
      });

    default:
      return sorted;
  }
}

/**
 * Get the winning candidate for a voting center
 */
export function getWinner(center: VotingCenter): Candidate {
  return center.stats.candidates.reduce((prev, curr) =>
    curr.votes > prev.votes ? curr : prev
  );
}
