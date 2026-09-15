import { EMIBreakdown, Scheme } from '../../types';

/**
 * FINANCIAL CALCULATOR MODULE
 * Uses deterministic mathematical formulas for EMI and loan amortization.
 * NO AI IS USED FOR FINANCIAL CALCULATIONS.
 */

export function calculateEMI(
  loanAmount: number,
  annualInterestRate: number,
  tenureYears: number,
  subsidyPercent: number = 0
): EMIBreakdown {
  const tenureMonths = tenureYears * 12;
  const monthlyRate = annualInterestRate / (12 * 100);

  let monthlyEMI = 0;
  if (monthlyRate === 0) {
    monthlyEMI = loanAmount / tenureMonths;
  } else {
    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    monthlyEMI = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  monthlyEMI = Math.round(monthlyEMI);
  const totalRepayment = monthlyEMI * tenureMonths;
  const totalInterest = totalRepayment - loanAmount;

  const estimatedSubsidyAmount = Math.round((loanAmount * subsidyPercent) / 100);
  const netLoanAfterSubsidy = Math.max(0, loanAmount - estimatedSubsidyAmount);

  // Generate 12-month amortization schedule summary
  const monthlyBreakdownFirstYear = [];
  let balance = loanAmount;
  for (let m = 1; m <= Math.min(12, tenureMonths); m++) {
    const interestPayment = Math.round(balance * monthlyRate);
    const principalPayment = Math.min(balance, monthlyEMI - interestPayment);
    balance = Math.max(0, balance - principalPayment);

    monthlyBreakdownFirstYear.push({
      month: m,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: balance
    });
  }

  return {
    loanAmount,
    interestRate: annualInterestRate,
    tenureMonths,
    monthlyEMI,
    totalInterest,
    totalRepayment,
    estimatedSubsidyAmount,
    netLoanAfterSubsidy,
    monthlyBreakdownFirstYear
  };
}

export function calculateSchemeEMI(
  requestedCost: number,
  scheme: Scheme,
  subsidyPercent: number = 0,
  customTenureYears?: number
): EMIBreakdown {
  const actualLoanAmount = Math.min(requestedCost, scheme.maxLoanAmount);
  const tenure = customTenureYears ?? scheme.maxTenureYears;
  return calculateEMI(actualLoanAmount, scheme.interestRate, tenure, subsidyPercent);
}
