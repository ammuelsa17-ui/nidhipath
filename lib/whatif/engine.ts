import { BeneficiaryProfile, Scheme, WhatIfRequest, WhatIfResponse, SchemeEligibilityResult } from '../../types';
import { evaluateEligibility } from '../eligibility/engine';
import { rankSchemes } from '../matching/ranker';

/**
 * REAL-TIME WHAT-IF SCENARIO ENGINE
 * Compares baseline beneficiary profile vs. modified scenario inputs.
 * Evaluates ranking shifts, score deltas, and suitability changes in real time.
 */

export function runWhatIfSimulation(
  schemes: Scheme[],
  request: WhatIfRequest
): WhatIfResponse {
  const { profile, modifiedCost, modifiedIncome, modifiedCategory, modifiedLocation, modifiedActivity, modifiedContribution } = request;

  // 1. Evaluate Original Baseline Profile
  const originalEvals = evaluateEligibility(profile, schemes);
  const originalResults = rankSchemes(originalEvals, profile);
  const originalBestFit = originalResults.find(r => r.isEligible)?.scheme.name || 'None (Ineligible)';

  // 2. Construct Modified Profile
  const modifiedProfile: BeneficiaryProfile = {
    ...profile,
    estimatedCost: modifiedCost !== undefined ? modifiedCost : profile.estimatedCost,
    annualIncome: modifiedIncome !== undefined ? modifiedIncome : profile.annualIncome,
    socialCategory: modifiedCategory !== undefined ? modifiedCategory : profile.socialCategory,
    locationType: modifiedLocation !== undefined ? modifiedLocation : profile.locationType,
    projectType: modifiedActivity !== undefined ? modifiedActivity : profile.projectType,
    ownContribution: modifiedContribution !== undefined ? modifiedContribution : profile.ownContribution
  };

  // 3. Evaluate Modified Profile
  const newEvals = evaluateEligibility(modifiedProfile, schemes);
  const newResults = rankSchemes(newEvals, modifiedProfile);
  const newBestFit = newResults.find(r => r.isEligible)?.scheme.name || 'None (Ineligible)';

  // 4. Determine Comparative Shifts & Rationale
  const hasChanged = originalBestFit !== newBestFit;
  const reasonsForChange: string[] = [];

  if (hasChanged) {
    if (modifiedCost !== undefined && modifiedCost !== profile.estimatedCost) {
      reasonsForChange.push(`Project cost shifted from ₹${profile.estimatedCost.toLocaleString('en-IN')} to ₹${modifiedCost.toLocaleString('en-IN')}, crossing scheme project cost limits.`);
    }
    if (modifiedIncome !== undefined && modifiedIncome !== profile.annualIncome) {
      reasonsForChange.push(`Annual income changed from ₹${profile.annualIncome.toLocaleString('en-IN')} to ₹${modifiedIncome.toLocaleString('en-IN')}, affecting statutory income ceiling eligibility.`);
    }
    if (modifiedCategory !== undefined && modifiedCategory !== profile.socialCategory) {
      reasonsForChange.push(`Social category changed from ${profile.socialCategory} to ${modifiedCategory}, shifting target mandate alignment.`);
    }
    if (modifiedLocation !== undefined && modifiedLocation !== profile.locationType) {
      reasonsForChange.push(`Location shifted to ${modifiedLocation}, altering government margin money subsidy rates.`);
    }
  } else {
    reasonsForChange.push('Scheme ranking order remains consistent under the modified parameters.');
  }

  return {
    originalBestFit,
    newBestFit,
    hasChanged,
    reasonsForChange,
    originalResults,
    newResults
  };
}
