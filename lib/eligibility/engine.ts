import { BeneficiaryProfile, Scheme, ConditionEvaluation, SchemeEligibilityResult } from '../../types';
import { DEMO_SCHEMES } from '../../data/schemes';

/**
 * DETERMINISTIC ELIGIBILITY EVALUATION ENGINE
 * IMPORTANT: NO LLM OR AI IS USED IN THIS MODULE.
 * RULES DECIDE. AI EXPLAINS.
 */

export function evaluateEligibility(
  profile: BeneficiaryProfile,
  schemes: Scheme[] = DEMO_SCHEMES
): SchemeEligibilityResult[] {
  return schemes.map(scheme => evaluateSingleScheme(profile, scheme));
}

export function evaluateSingleScheme(
  profile: BeneficiaryProfile,
  scheme: Scheme
): SchemeEligibilityResult {
  const passedConditions: ConditionEvaluation[] = [];
  const failedConditions: ConditionEvaluation[] = [];
  const highlights: string[] = [];

  const r = scheme.rules;

  // 1. AGE CHECK
  if (r.minAge !== undefined || r.maxAge !== undefined) {
    const minAge = r.minAge ?? 18;
    const maxAge = r.maxAge ?? 70;
    const agePassed = profile.age >= minAge && profile.age <= maxAge;
    
    const cond: ConditionEvaluation = {
      conditionName: 'Age Criteria',
      passed: agePassed,
      requirement: `Age between ${minAge} and ${maxAge} years`,
      actual: `${profile.age} years old`,
      message: agePassed 
        ? `✓ Age (${profile.age} yrs) satisfies requirement (${minAge}-${maxAge} yrs)`
        : `✗ Age (${profile.age} yrs) is outside permitted range (${minAge}-${maxAge} yrs)`
    };
    if (agePassed) passedConditions.push(cond);
    else failedConditions.push(cond);
  }

  // 2. PROJECT COST CHECK
  if (r.minProjectCost !== undefined || r.maxProjectCost !== undefined) {
    const minCost = r.minProjectCost ?? 0;
    const maxCost = r.maxProjectCost ?? Infinity;
    const costPassed = profile.estimatedCost >= minCost && profile.estimatedCost <= maxCost;
    
    const cond: ConditionEvaluation = {
      conditionName: 'Project Cost Limits',
      passed: costPassed,
      requirement: `Project cost between ₹${minCost.toLocaleString('en-IN')} and ₹${maxCost === Infinity ? 'Unlimited' : maxCost.toLocaleString('en-IN')}`,
      actual: `₹${profile.estimatedCost.toLocaleString('en-IN')}`,
      message: costPassed
        ? `✓ Estimated project cost (₹${profile.estimatedCost.toLocaleString('en-IN')}) is within loan limit (Max ₹${maxCost.toLocaleString('en-IN')})`
        : `✗ Project cost (₹${profile.estimatedCost.toLocaleString('en-IN')}) exceeds maximum limit (₹${maxCost.toLocaleString('en-IN')})`
    };
    if (costPassed) passedConditions.push(cond);
    else failedConditions.push(cond);
  }

  // 3. ANNUAL INCOME CHECK
  if (r.maxIncome !== undefined) {
    const incomePassed = profile.annualIncome <= r.maxIncome;
    const cond: ConditionEvaluation = {
      conditionName: 'Annual Income Ceiling',
      passed: incomePassed,
      requirement: `Annual income must be ≤ ₹${r.maxIncome.toLocaleString('en-IN')}`,
      actual: `₹${profile.annualIncome.toLocaleString('en-IN')}`,
      message: incomePassed
        ? `✓ Annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) is within limit`
        : `✗ Annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) exceeds threshold ₹${r.maxIncome.toLocaleString('en-IN')}`
    };
    if (incomePassed) passedConditions.push(cond);
    else failedConditions.push(cond);
  }

  // 4. PROJECT CATEGORY / TYPE CHECK
  if (r.allowedProjectTypes && r.allowedProjectTypes.length > 0) {
    const categoryPassed = r.allowedProjectTypes.includes(profile.projectType);
    const readableTypes = r.allowedProjectTypes.map(t => t.replace('_', ' ')).join(', ');
    const cond: ConditionEvaluation = {
      conditionName: 'Supported Project Activity',
      passed: categoryPassed,
      requirement: `Activity must be one of: ${readableTypes}`,
      actual: profile.projectType.replace('_', ' '),
      message: categoryPassed
        ? `✓ Project activity (${profile.projectType.replace('_', ' ')}) is explicitly supported`
        : `✗ Project activity (${profile.projectType.replace('_', ' ')}) is not covered under this scheme`
    };
    if (categoryPassed) passedConditions.push(cond);
    else failedConditions.push(cond);
  }

  // 5. DEMOGRAPHIC / TARGET GROUP CHECK (STAND-UP INDIA SPECIAL RULES VS GENERAL)
  if (scheme.code === 'STANDUP_INDIA') {
    const isSCorST = profile.socialCategory === 'SC' || profile.socialCategory === 'ST';
    const isFemale = profile.gender === 'female';
    const demoPassed = isSCorST || isFemale;

    const cond: ConditionEvaluation = {
      conditionName: 'Target Demographic (SC/ST/Woman)',
      passed: demoPassed,
      requirement: 'Applicant must be SC, ST or Female entrepreneur',
      actual: `Category: ${profile.socialCategory}, Gender: ${profile.gender}`,
      message: demoPassed
        ? `✓ Qualified target demographic (${isFemale ? 'Female Entrepreneur' : ''}${isFemale && isSCorST ? ' & ' : ''}${isSCorST ? profile.socialCategory + ' Category' : ''})`
        : `✗ Stand-Up India specifically targets SC, ST or Woman entrepreneurs`
    };
    if (demoPassed) passedConditions.push(cond);
    else failedConditions.push(cond);
  } else {
    // General category / gender check if specified
    if (r.allowedCategories && r.allowedCategories.length > 0) {
      const catPassed = r.allowedCategories.includes(profile.socialCategory);
      const cond: ConditionEvaluation = {
        conditionName: 'Social Category Target',
        passed: catPassed,
        requirement: `Category in: ${r.allowedCategories.join(', ')}`,
        actual: profile.socialCategory,
        message: catPassed 
          ? `✓ Social category (${profile.socialCategory}) is eligible` 
          : `✗ Scheme targets specific categories: ${r.allowedCategories.join(', ')}`
      };
      if (catPassed) passedConditions.push(cond);
      else failedConditions.push(cond);
    }
  }

  // 6. EDUCATION REQUIREMENT CHECK
  if (scheme.code === 'PMEGP') {
    const costHigh = (profile.projectType === 'manufacturing' && profile.estimatedCost > 1000000) ||
                     (profile.projectType === 'services' && profile.estimatedCost > 500000);
    if (costHigh) {
      const isEduSufficient = profile.education !== 'illiterate' && profile.education !== 'below_8th';
      const cond: ConditionEvaluation = {
        conditionName: 'Minimum Education Requirement (PMEGP)',
        passed: isEduSufficient,
        requirement: 'Minimum 8th Pass required for project > ₹10L Mfg or > ₹5L Service',
        actual: profile.education.replace('_', ' '),
        message: isEduSufficient
          ? `✓ Education level (${profile.education.replace('_', ' ')}) meets the 8th Pass requirement`
          : `✗ PMEGP requires at least 8th Pass for project cost above ₹5L/10L`
      };
      if (isEduSufficient) passedConditions.push(cond);
      else failedConditions.push(cond);
    }
  }

  const isEligible = failedConditions.length === 0;

  // SUBSIDY ESTIMATION LOGIC (DETERMINISTIC)
  let subsidyPercent = 0;
  if (scheme.code === 'PMEGP') {
    const isSpecialCategory = ['SC', 'ST', 'OBC', 'MINORITY', 'EX_SERVICEMAN'].includes(profile.socialCategory) ||
                             profile.gender === 'female' ||
                             profile.isDifferentlyAbled;
    if (profile.locationType === 'rural') {
      subsidyPercent = isSpecialCategory ? 35 : 25;
      highlights.push(`Rural location qualifies for maximum ${subsidyPercent}% Government Subsidy (Margin Money)`);
    } else {
      subsidyPercent = isSpecialCategory ? 25 : 15;
      highlights.push(`Urban location qualifies for ${subsidyPercent}% Government Subsidy`);
    }
  } else if (scheme.code === 'STANDUP_INDIA') {
    subsidyPercent = 15;
    highlights.push('Qualifies for up to 15% margin subsidy assistance');
  } else if (scheme.code === 'PMSVANIDHI') {
    subsidyPercent = 7;
    highlights.push('Includes 7% p.a. direct interest subvention credited quarterly');
  } else if (scheme.code === 'PM_VISHWAKARMA') {
    subsidyPercent = 8;
    highlights.push('Concessional loan at effective 5% interest rate + ₹15,000 e-voucher toolkit incentive');
  }

  const maxEligibleLoan = Math.min(profile.estimatedCost, scheme.maxLoanAmount);
  const maxSubsidyAmountEstimated = Math.round((maxEligibleLoan * subsidyPercent) / 100);

  if (isEligible) {
    if (scheme.collateralRequired === false) {
      highlights.push('100% Collateral-Free Loan under Credit Guarantee Cover');
    }
    if (scheme.moratoriumMonths > 0) {
      highlights.push(`${scheme.moratoriumMonths} months initial repayment moratorium period`);
    }
  }

  return {
    scheme,
    isEligible,
    score: 0, // Will be calculated by matching ranker
    passedConditions,
    failedConditions,
    subsidyPercentageEstimated: subsidyPercent,
    maxSubsidyAmountEstimated,
    maxEligibleLoan,
    matchingHighlights: highlights
  };
}
