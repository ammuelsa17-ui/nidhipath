import { SchemeEligibilityResult, BeneficiaryProfile } from '../../types';

/**
 * SCHEME RANKING & MATCHING ENGINE
 * Transparent rule & weighted scoring approach.
 */

export function rankSchemes(
  evaluations: SchemeEligibilityResult[],
  profile: BeneficiaryProfile
): SchemeEligibilityResult[] {
  const scored = evaluations.map(ev => {
    let score = 0;

    if (!ev.isEligible) {
      // Ineligible schemes get 0-15 base score based on partial passes
      const passRatio = ev.passedConditions.length / (ev.passedConditions.length + ev.failedConditions.length || 1);
      score = Math.round(passRatio * 15);
      return { ...ev, score };
    }

    // 1. COST COVERAGE SCORE (Max 40 points)
    // If scheme loan limit covers 100% of project cost, full 40 points.
    const coverageRatio = Math.min(1.0, ev.scheme.maxLoanAmount / profile.estimatedCost);
    const coverageScore = Math.round(coverageRatio * 40);

    // 2. INTEREST RATE FAVORABILITY (Max 25 points)
    // Baseline 12% max rate. Lower interest rate = higher points.
    const maxBaseRate = 12.0;
    const interestDiff = Math.max(0, maxBaseRate - ev.scheme.interestRate);
    const interestScore = Math.round((interestDiff / maxBaseRate) * 25);

    // 3. SUBSIDY BENEFIT SCORE (Max 20 points)
    // 35% subsidy gets 20 points.
    const subsidyScore = Math.round((ev.subsidyPercentageEstimated / 35) * 20);

    // 4. TENURE & COLLATERAL FLEXIBILITY (Max 15 points)
    let flexibilityScore = Math.min(10, Math.round((ev.scheme.maxTenureYears / 7) * 10));
    if (!ev.scheme.collateralRequired) {
      flexibilityScore += 5; // +5 bonus for collateral free
    }

    score = Math.min(100, coverageScore + interestScore + subsidyScore + flexibilityScore);

    return { ...ev, score };
  });

  // Sort descending by score (eligible first, highest score top)
  return scored.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.score - a.score;
  });
}
