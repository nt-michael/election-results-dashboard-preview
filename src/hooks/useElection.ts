import { useContext } from 'react';
import { ElectionContext, type ElectionContextType } from '../context/electionContextTypes';

/**
 * Custom hook to use the election context
 * @throws {Error} if used outside of ElectionProvider
 */
export function useElection(): ElectionContextType {
  const context = useContext(ElectionContext);
  if (context === undefined) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
}
