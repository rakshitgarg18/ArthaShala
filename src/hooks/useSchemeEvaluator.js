import { useMemo } from 'react';
import schemesData from '../data/schemes.json';

/**
 * useSchemeEvaluator
 * Evaluates the current game state against the data-driven schemes database.
 * 
 * @param {Object} gameState - { walletBalance, currentMonth, activeEvent, userProfile }
 * @param {Array} claimedIds - List of IDs already claimed by the user
 */
export const useSchemeEvaluator = (gameState, claimedIds = []) => {
  const { walletBalance, currentMonth, activeEvent, userProfile } = gameState;

  const eligibleSchemes = useMemo(() => {
    return schemesData.filter(scheme => {
      // 1. Check if already claimed
      if (claimedIds.includes(scheme.id)) return false;

      const { triggerConditions: cond } = scheme;

      // 2. Check Wallet Condition
      if (walletBalance > cond.maxWallet) return false;

      // 3. Check Month Condition
      if (!cond.activeMonths.includes(currentMonth)) return false;

      // 4. Check Event Condition (if required)
      if (cond.requiredEvent && activeEvent !== cond.requiredEvent) return false;

      // 5. Check Profile Condition (Phase 7: Dynamic Profiling)
      if (cond.requiredProfile) {
        if (!userProfile) return false;
        
        // Exact match for keys specified in requiredProfile
        for (const [key, expectedValue] of Object.entries(cond.requiredProfile)) {
          if (userProfile[key] !== expectedValue) return false;
        }
      }

      return true;
    });
  }, [walletBalance, currentMonth, activeEvent, userProfile, claimedIds]);

  return eligibleSchemes;
};
 
 
