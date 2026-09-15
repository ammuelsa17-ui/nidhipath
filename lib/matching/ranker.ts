import { SchemeEligibilityResult, BeneficiaryProfile } from '../../types';

/**
 * SCHEME RANKING & MATCHING ENGINE
 * Multi-factor, rule-driven & weighted scoring approach.
 * RULES DECIDE. AI EXPLAINS.
 */

export function rankSchemes(
  evaluations: SchemeEligibilityResult[],
  profile: BeneficiaryProfile
): SchemeEligibilityResult[] {
  const scored = evaluations.map(ev => {
    let score = 0;
    const highlights: string[] = [];

    if (!ev.isEligible) {
      // Ineligible schemes get 0-15 base score based on partial passes
      const passRatio = ev.passedConditions.length / (ev.passedConditions.length + ev.failedConditions.length || 1);
      score = Math.round(passRatio * 15);
      return { ...ev, score };
    }

    // Base score for any eligible scheme
    let totalScore = 20;

    // 1. TARGET DEMOGRAPHIC & MANDATE ALIGNMENT (Max 30 points)
    // A scheme specifically targeted for SC/ST/Corporation (like NSFDC schemes for SC applicants) gets strong mandate bonus
    let targetScore = 0;
    if (ev.scheme.isNsfdcScheme && profile.socialCategory === 'SC') {
      targetScore += 20;
      highlights.push('SC-focused targeted Corporation financing');
    } else if (ev.scheme.rules.allowedCategories && ev.scheme.rules.allowedCategories.length === 1 && ev.scheme.rules.allowedCategories.includes(profile.socialCategory)) {
      targetScore += 20;
      highlights.push(`Specifically targeted scheme for ${profile.socialCategory} Category`);
    } else if (ev.scheme.code === 'STANDUP_INDIA' && (profile.socialCategory === 'SC' || profile.socialCategory === 'ST' || profile.gender === 'female')) {
      targetScore += 15;
      highlights.push('SC/ST & Female Entrepreneur Targeted Credit Facility');
    } else if (ev.scheme.code === 'PMEGP' && profile.locationType === 'rural') {
      targetScore += 15;
      highlights.push('PMEGP Rural Entrepreneur Subvention Alignment');
    } else if (ev.scheme.code === 'PMSVANIDHI' && profile.projectType === 'street_vending') {
      targetScore += 20;
      highlights.push('Dedicated PM SVANidhi Street Vending Facility');
    } else {
      targetScore += 5;
    }

    if (profile.isFirstGeneration && (ev.scheme.rules.requiresFirstGeneration || ev.scheme.isNsfdcScheme || ev.scheme.code === 'PMEGP' || ev.scheme.code === 'STANDUP_INDIA')) {
      targetScore += 5;
      highlights.push('Greenfield / First Generation Entrepreneur Alignment');
    }

    if (ev.scheme.rules.allowedProjectTypes && ev.scheme.rules.allowedProjectTypes.includes(profile.projectType)) {
      targetScore += 5;
      highlights.push(`Purpose/project-type compatibility (${profile.projectType.replace('_', ' ')})`);
    }

    // 2. PROJECT COST FIT & COVERAGE (Max 25 points)
    let costScore = 0;
    const coverageRatio = Math.min(1.0, ev.scheme.maxLoanAmount / profile.estimatedCost);
    costScore += Math.round(coverageRatio * 20);

    const minCost = ev.scheme.rules.minProjectCost ?? 0;
    const maxCost = ev.scheme.rules.maxProjectCost ?? Infinity;
    if (profile.estimatedCost >= minCost && profile.estimatedCost <= maxCost) {
      costScore += 5;
      highlights.push(`Project cost (₹${profile.estimatedCost.toLocaleString('en-IN')}) fits scheme project range`);
    }

    // 3. FINANCIAL CONCESSION (INTEREST + SUBSIDY) (Max 15 points)
    let financeScore = 0;
    const maxBaseRate = 15.0;
    const interestDiff = Math.max(0, maxBaseRate - ev.scheme.interestRate);
    const interestScore = Math.round((interestDiff / maxBaseRate) * 10);
    financeScore += interestScore;
    highlights.push(`Concessional ${ev.scheme.interestRate}% p.a. beneficiary interest rate`);

    const subsidyScore = Math.round((ev.subsidyPercentageEstimated / 35) * 5);
    financeScore += subsidyScore;
    if (ev.subsidyPercentageEstimated > 0) {
      highlights.push(`Includes estimated ${ev.subsidyPercentageEstimated}% margin money subsidy`);
    }

    // 4. TENURE & GUARANTEE FLEXIBILITY (Max 10 points)
    let flexibilityScore = 0;
    if (ev.scheme.maxTenureYears >= 5) {
      flexibilityScore += 5;
      highlights.push(`Repayment period up to ${ev.scheme.maxTenureYears} years`);
    }
    if (!ev.scheme.collateralRequired) {
      flexibilityScore += 5;
      highlights.push('Collateral-free credit guarantee cover');
    }

    score = Math.min(100, totalScore + targetScore + costScore + financeScore + flexibilityScore);

    return {
      ...ev,
      score,
      matchingHighlights: Array.from(new Set([...highlights, ...(ev.matchingHighlights || [])]))
    };
  });

  // Sort descending by score (eligible first, highest score top)
  return scored.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.score - a.score;
  });
}
