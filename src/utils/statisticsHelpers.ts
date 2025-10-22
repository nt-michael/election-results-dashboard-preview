import type { VotingCenter, Candidate } from '../types/geo.types';

export interface AggregateStats {
  totalVotingCenters: number;
  totalVotes: number;
  averageVotesPerCenter: number;
  candidates: Candidate[];
}

/**
 * Calculate aggregate statistics for a list of voting centers
 */
export function calculateAggregateStats(votingCenters: VotingCenter[]): AggregateStats {
  if (votingCenters.length === 0) {
    return {
      totalVotingCenters: 0,
      totalVotes: 0,
      averageVotesPerCenter: 0,
      candidates: [],
    };
  }

  // Calculate total votes
  const totalVotes = votingCenters.reduce(
    (sum, center) => sum + center.stats.totalVotes,
    0
  );

  // Aggregate candidate votes
  const candidateVotesMap = new Map<string, { name: string; party: string; votes: number }>();

  votingCenters.forEach((center) => {
    center.stats.candidates.forEach((candidate) => {
      const existing = candidateVotesMap.get(candidate.name);
      if (existing) {
        existing.votes += candidate.votes;
      } else {
        candidateVotesMap.set(candidate.name, {
          name: candidate.name,
          party: candidate.party,
          votes: candidate.votes,
        });
      }
    });
  });

  // Convert to array and calculate percentages
  const candidates: Candidate[] = Array.from(candidateVotesMap.values())
    .map((c) => ({
      ...c,
      percentage: totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0,
    }))
    .sort((a, b) => b.votes - a.votes); // Sort by votes descending

  return {
    totalVotingCenters: votingCenters.length,
    totalVotes,
    averageVotesPerCenter: totalVotes / votingCenters.length,
    candidates,
  };
}

/**
 * Filter voting centers by region using arrondissement mapping
 */
export function getVotingCentersByRegion(
  votingCenters: VotingCenter[],
  arrondissementsInRegion: string[]
): VotingCenter[] {
  return votingCenters.filter((center) =>
    arrondissementsInRegion.includes(center.arrondissementId)
  );
}

/**
 * Filter voting centers by department using arrondissement mapping
 */
export function getVotingCentersByDepartment(
  votingCenters: VotingCenter[],
  arrondissementsInDepartment: string[]
): VotingCenter[] {
  return votingCenters.filter((center) =>
    arrondissementsInDepartment.includes(center.arrondissementId)
  );
}

/**
 * Filter voting centers by arrondissement (municipality)
 */
export function getVotingCentersByArrondissement(
  votingCenters: VotingCenter[],
  arrondissementName: string
): VotingCenter[] {
  return votingCenters.filter(
    (center) => center.arrondissementId === arrondissementName
  );
}
