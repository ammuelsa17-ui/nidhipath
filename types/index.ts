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

export interface SchemeSource {
  id: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  sourceEffectiveDate: string;
  lastVerifiedAt: string;
  verificationStatus: string;
  notes?: string;
}

export interface RuleVersion {
  id: string;
  schemeId: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  changeSummary: string;
  publishedBy?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface SchemeDocument {
  id: string;
  schemeId: string;
  documentName: string;
  mandatory: boolean;
  description: string;
  sourceId?: string;
  active: boolean;
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

export interface DBEligibilityRule {
  id: number;
  schemeId: string;
  field: string;
  operator: string;
  value: string;
  ruleGroup: string;
  priority: number;
  explanation: string;
  sourceId?: string;
  ruleVersion: string;
  active: boolean;
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
  active?: boolean;

  // Application URL & Source Versioning
  applicationUrl?: string;
  sourceId?: string;
  ruleVersion?: string;
  sourceName?: string;
  officialSourceUrl?: string;
  sourceEffectiveDate?: string;
  lastVerifiedDate?: string;

  // Deterministic Rules & Documents
  rules: SchemeRuleDefinition;
  dbRules?: DBEligibilityRule[];
  documents?: SchemeDocument[];

  // Scheme categorization & NSFDC alignment
  isNsfdcScheme?: boolean;
  categoryTag?: string; // 'NSFDC Primary Scheme' | 'General Credit Scheme'
  isPrototypeData?: boolean;
  isVerifiedApplicationPortal?: boolean;
}

export interface ConditionEvaluation {
  conditionName: string;
  passed: boolean;
  requirement: string;
  actual: string;
  message: string;
  ruleVersion?: string;
  sourceUrl?: string;
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
  scoreBreakdown?: {
    totalScore: number;
    targetScore: number;
    costScore: number;
    financeScore: number;
    flexibilityScore: number;
  };
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
  authorizationStatus?: 'AUTHORIZED_NODAL' | 'PENDING_VERIFICATION' | 'REVOKED';
  active?: boolean;
  isDemoData?: boolean;
}

export interface PartnerMatchResult {
  partner: ChannelPartner;
  distanceKm: number;
  supportsSelectedScheme: boolean;
  matchScore: number;
  matchingReason: string;
  authorizationStatus: string;
}

export interface WhatIfRequest {
  profile: BeneficiaryProfile;
  modifiedCost?: number;
  modifiedIncome?: number;
  modifiedCategory?: SocialCategory;
  modifiedLocation?: 'urban' | 'rural';
  modifiedActivity?: ProjectCategory;
  modifiedContribution?: number;
}

export interface WhatIfResponse {
  originalBestFit: string;
  newBestFit: string;
  hasChanged: boolean;
  reasonsForChange: string[];
  originalResults: SchemeEligibilityResult[];
  newResults: SchemeEligibilityResult[];
}

export interface ReadinessResult {
  schemeId: string;
  schemeName: string;
  readinessScore: number; // 0 - 100
  status: 'READY' | 'PARTIALLY_READY' | 'NOT_READY';
  mandatoryDocuments: SchemeDocument[];
  missingDocuments: SchemeDocument[];
  nextBestAction: string;
}

export interface DecisionLogTrace {
  id: string;
  sessionId: string;
  beneficiaryProfile: BeneficiaryProfile;
  evaluatedSchemes: { schemeId: string; score: number; isEligible: boolean }[];
  selectedScheme?: string;
  scoreBreakdown?: any;
  rulesTriggered: ConditionEvaluation[];
  sourceVersions: { schemeId: string; version: string; sourceUrl: string }[];
  createdAt: string;
}

export interface AIExplanationRequest {
  profile: BeneficiaryProfile;
  selectedSchemeResult: SchemeEligibilityResult;
  financialDetails?: EMIBreakdown;
  selectedPartner?: ChannelPartner;
  nearbyPartners?: PartnerMatchResult[];
  language?: 'en' | 'hi' | 'ta' | 'te' | 'mr';
  userQuestion?: string;
  messageHistory?: Array<{
    role: 'user' | 'assistant';
    text: string;
  }>;
  contextId?: string;
}

export interface AIExplanationResponse {
  summary: string;
  whyRecommended: string[];
  eligibilityExplanation: string;
  nextSteps: string[];
  multilingualNote?: string;
  source: 'gemini_api' | 'mock_fallback';
}
