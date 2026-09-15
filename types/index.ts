export type ProjectCategory = 
  | 'manufacturing'
  | 'services'
  | 'trading'
  | 'agro_processing'
  | 'street_vending'
  | 'handicraft_artisan';

export type SocialCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'MINORITY' | 'EX_SERVICEMAN';

export type Gender = 'female' | 'male' | 'transgender' | 'any';

export type EducationLevel = 'illiterate' | 'below_8th' | '8th_pass' | '10th_pass' | '12th_pass' | 'graduate_plus';

export interface BeneficiaryProfile {
  applicantName?: string;
  age: number;
  gender: Gender;
  socialCategory: SocialCategory;
  isDifferentlyAbled: boolean;
  education: EducationLevel;
  annualIncome: number; // in INR
  state: string;
  pinCode: string;
  locationType: 'urban' | 'rural';
  
  // Project Details
  projectType: ProjectCategory;
  projectDescription?: string;
  estimatedCost: number; // in INR
  ownContribution: number; // in INR
  isFirstGeneration: boolean;
}

export interface EligibilityCondition {
  id: string;
  name: string;
  description: string;
  evaluate: (profile: BeneficiaryProfile) => { passed: boolean; message: string; requirement: string; actual: string };
}

export interface SchemeRuleDefinition {
  minAge?: number;
  maxAge?: number;
  maxIncome?: number; // Maximum allowed annual income
  minProjectCost?: number;
  maxProjectCost?: number;
  allowedCategories?: SocialCategory[];
  allowedGenders?: Gender[];
  allowedProjectTypes?: ProjectCategory[];
  minEducation?: EducationLevel;
  locationRestriction?: 'urban' | 'rural' | 'both';
  requiresFirstGeneration?: boolean;
}

export interface Scheme {
  id: string;
  code: string; // e.g. "PMEGP"
  name: string;
  shortName: string;
  ministry: string;
  description: string;
  targetAudience: string;
  
  // Financial parameters
  maxLoanAmount: number; // INR
  maxSubsidyPercent: number; // % (e.g. 35 for rural special category)
  interestRate: number; // % per annum (e.g. 8.5)
  maxTenureYears: number; // e.g. 7
  moratoriumMonths: number; // e.g. 6
  collateralRequired: boolean;
  
  // Deterministic Rules
  rules: SchemeRuleDefinition;
  
  // Scheme categorization & NSFDC alignment
  isNsfdcScheme?: boolean;
  categoryTag?: string; // 'NSFDC Primary Scheme' | 'General Credit Scheme'

  // Verification details
  officialSourceUrl: string;
  lastVerifiedDate: string;
  isPrototypeData: boolean;
}

export interface ConditionEvaluation {
  conditionName: string;
  passed: boolean;
  requirement: string;
  actual: string;
  message: string;
}

export interface SchemeEligibilityResult {
  scheme: Scheme;
  isEligible: boolean;
  score: number; // 0 - 100 weighted score
  passedConditions: ConditionEvaluation[];
  failedConditions: ConditionEvaluation[];
  subsidyPercentageEstimated: number;
  maxSubsidyAmountEstimated: number;
  maxEligibleLoan: number;
  matchingHighlights: string[];
}

export interface EMIBreakdown {
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
  estimatedSubsidyAmount: number;
  netLoanAfterSubsidy: number;
  monthlyBreakdownFirstYear: {
    month: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }[];
}

export interface ChannelPartner {
  id: string;
  name: string;
  type: 'public_sector_bank' | 'regional_rural_bank' | 'dic' | 'csc' | 'nbfc_mfi';
  branchName: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  supportedSchemeIds: string[];
  nodalOfficerName?: string;
  isDemoData: boolean;
}

export interface PartnerMatchResult {
  partner: ChannelPartner;
  distanceKm: number;
  supportsSelectedScheme: boolean;
  matchScore: number;
  matchingReason: string;
}

export interface AIExplanationRequest {
  profile: BeneficiaryProfile;
  selectedSchemeResult: SchemeEligibilityResult;
  financialDetails?: EMIBreakdown;
  nearbyPartners?: PartnerMatchResult[];
  language?: 'en' | 'hi' | 'ta' | 'te' | 'mr';
  userQuestion?: string;
}

export interface AIExplanationResponse {
  summary: string;
  whyRecommended: string[];
  eligibilityExplanation: string;
  nextSteps: string[];
  multilingualNote?: string;
  source: 'gemini_api' | 'mock_fallback';
}
