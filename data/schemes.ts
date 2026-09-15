import { Scheme } from '../types';

export const DEMO_SCHEMES: Scheme[] = [
  {
    id: 'pmegp_2026',
    code: 'PMEGP',
    name: "Prime Minister's Employment Generation Programme",
    shortName: 'PMEGP Credit Linked Subsidy',
    ministry: 'Ministry of MSME / KVIC',
    description: 'Credit-linked subsidy program to generate employment through micro-enterprise setup in financial & service sectors.',
    targetAudience: 'Individual entrepreneurs, Women, SC/ST, OBC, Minorities, Rural Youth',
    maxLoanAmount: 5000000, // 50 Lakhs for Manufacturing, 20L for Service
    maxSubsidyPercent: 35, // Up to 35% for Special Category in Rural areas
    interestRate: 8.75, // % per annum
    maxTenureYears: 7,
    moratoriumMonths: 6,
    collateralRequired: false, // Up to 10L collateral free / CGTMSE covered
    rules: {
      minAge: 18,
      maxAge: 65,
      minProjectCost: 50000,
      maxProjectCost: 5000000,
      allowedProjectTypes: ['manufacturing', 'services', 'agro_processing', 'handicraft_artisan'],
      requiresFirstGeneration: true,
      minEducation: 'below_8th' // 8th pass required if project cost > 10L Mfg or > 5L Service
    },
    officialSourceUrl: 'https://www.kviconline.gov.in/pmegpeportal',
    lastVerifiedDate: '2026-01-15 (Verified Official Portal Data)',
    isPrototypeData: true
  },
  {
    id: 'standup_india_2026',
    code: 'STANDUP_INDIA',
    name: 'Stand-Up India Scheme for SC/ST and Women Entrepreneurs',
    shortName: 'Stand-Up India',
    ministry: 'Ministry of Finance / SIDBI',
    description: 'Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to SC/ST or Woman borrowers for setting up a greenfield enterprise.',
    targetAudience: 'SC/ST candidates and Female entrepreneurs setting up greenfield projects',
    maxLoanAmount: 10000000, // ₹1 Crore
    maxSubsidyPercent: 15, // Margin money assistance up to 15%
    interestRate: 8.25, // Base rate + tenure premium
    maxTenureYears: 7,
    moratoriumMonths: 18,
    collateralRequired: false, // Covered under Credit Guarantee Scheme (CGFSI)
    rules: {
      minAge: 18,
      minProjectCost: 1000000,
      maxProjectCost: 10000000,
      allowedCategories: ['SC', 'ST'], // Also applies if gender is female
      allowedGenders: ['female'],
      allowedProjectTypes: ['manufacturing', 'services', 'trading', 'agro_processing'],
      requiresFirstGeneration: true
    },
    officialSourceUrl: 'https://www.standupmitra.in',
    lastVerifiedDate: '2026-02-01 (Verified Official Guidelines)',
    isPrototypeData: true
  },
  {
    id: 'mudra_tarun_2026',
    code: 'MUDRA_TARUN',
    name: 'Pradhan Mantri MUDRA Yojana (Tarun & Kishore)',
    shortName: 'PMMY MUDRA Loan',
    ministry: 'Ministry of Finance / MUDRA',
    description: 'Collateral-free loans up to ₹10 Lakhs for non-corporate, non-farm small/micro enterprises for business expansion or machinery purchase.',
    targetAudience: 'Small business owners, shopkeepers, service providers, micro-units',
    maxLoanAmount: 1000000, // ₹10 Lakhs
    maxSubsidyPercent: 0, // Interest subvention as per special schemes
    interestRate: 9.15,
    maxTenureYears: 5,
    moratoriumMonths: 3,
    collateralRequired: false, // Collateral-free under CGFMU
    rules: {
      minAge: 18,
      maxAge: 65,
      minProjectCost: 50000,
      maxProjectCost: 1000000,
      allowedProjectTypes: ['manufacturing', 'services', 'trading', 'agro_processing', 'street_vending', 'handicraft_artisan']
    },
    officialSourceUrl: 'https://www.mudra.org.in',
    lastVerifiedDate: '2026-01-10 (Verified Official Portal Data)',
    isPrototypeData: true
  },
  {
    id: 'pmsvanidhi_2026',
    code: 'PMSVANIDHI',
    name: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    shortName: 'PM SVANidhi',
    ministry: 'Ministry of Housing and Urban Affairs',
    description: 'Special micro-credit facility for street vendors and small urban micro-traders with interest subvention of 7% p.a.',
    targetAudience: 'Urban street vendors, hawkers, small roadside service providers',
    maxLoanAmount: 50000, // ₹50,000 (Tranche 1-3)
    maxSubsidyPercent: 7, // 7% interest subvention
    interestRate: 7.00, // Effective interest after subvention ~ 0-4%
    maxTenureYears: 3,
    moratoriumMonths: 1,
    collateralRequired: false,
    rules: {
      minAge: 18,
      maxAge: 60,
      maxIncome: 300000, // Max annual income criteria
      minProjectCost: 10000,
      maxProjectCost: 100000,
      allowedProjectTypes: ['street_vending', 'trading', 'handicraft_artisan', 'services']
    },
    officialSourceUrl: 'https://pmsvanidhi.mohua.gov.in',
    lastVerifiedDate: '2026-02-10 (Verified Official Portal Data)',
    isPrototypeData: true
  },
  {
    id: 'pm_vishwakarma_2026',
    code: 'PM_VISHWAKARMA',
    name: 'PM Vishwakarma Scheme for Traditional Artisans',
    shortName: 'PM Vishwakarma',
    ministry: 'Ministry of MSME / KVIC',
    description: 'End-to-end support to traditional artisans and craftspeople including collateral-free loans up to ₹3 Lakhs at 5% interest rate, toolkit incentive, and skill training.',
    targetAudience: 'Artisans working with hands & tools in 18 traditional trades (weavers, blacksmiths, carpenters, potters, etc.)',
    maxLoanAmount: 300000, // ₹3 Lakhs
    maxSubsidyPercent: 8, // Concessional interest subvention (capped at 5% effective interest)
    interestRate: 5.00, // Concessional 5% rate
    maxTenureYears: 5,
    moratoriumMonths: 6,
    collateralRequired: false,
    rules: {
      minAge: 18,
      maxProjectCost: 300000,
      allowedProjectTypes: ['handicraft_artisan', 'manufacturing', 'services']
    },
    officialSourceUrl: 'https://pmvishwakarma.gov.in',
    lastVerifiedDate: '2026-01-20 (Verified Official Portal Data)',
    isPrototypeData: true
  }
];
