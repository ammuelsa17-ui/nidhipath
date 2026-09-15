import { Scheme } from '../types';

export const DEMO_SCHEMES: Scheme[] = [
  // =========================================================================
  // PRIMARY SCHEMES: NSFDC FINANCIAL ASSISTANCE SCHEMES (MoSJE / SIH26092 Focus)
  // Official Income Ceiling: ₹5,00,000 p.a. (Effective Jan 7, 2026 Revision)
  // Source: https://nsfdc.nic.in/
  // =========================================================================
  {
    id: 'nsfdc_mfs_2026',
    code: 'NSFDC_MFS',
    name: 'NSFDC Micro Finance Scheme (MFS)',
    shortName: 'NSFDC Micro Credit',
    ministry: 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    description: 'Provides direct micro-credit assistance to Scheduled Caste entrepreneurs for small income-generating activities with unit project cost up to ₹1.40 Lakhs (Max NSFDC Loan ₹1.25 Lakhs).',
    targetAudience: 'Scheduled Caste (SC) beneficiaries with valid caste certificate and annual family income up to ₹5,00,000',
    maxLoanAmount: 125000, // Max loan ₹1.25 Lakhs (or 90% of project cost)
    maxSubsidyPercent: 0, // Direct concessional interest loan
    interestRate: 6.50, // 6.5% p.a. (Official NSFDC FAQ)
    maxTenureYears: 3, // Repayment within 3 years
    moratoriumMonths: 3, // 3 months moratorium
    collateralRequired: false, // SCA / State Channelising Agency guarantee
    isNsfdcScheme: true,
    categoryTag: 'NSFDC Primary Scheme',
    rules: {
      minAge: 18,
      maxAge: 65,
      maxIncome: 500000, // Revised Jan 7, 2026 MoSJE guidelines
      minProjectCost: 10000,
      maxProjectCost: 140000,
      allowedCategories: ['SC'],
      allowedProjectTypes: ['manufacturing', 'services', 'trading', 'agro_processing', 'street_vending', 'handicraft_artisan']
    },
    sourceName: 'NSFDC Official FAQ',
    officialSourceUrl: 'https://nsfdc.nic.in/faqs',
    sourceEffectiveDate: '2026-01-07',
    lastVerifiedDate: '2026-03-01 (Verified against Official NSFDC FAQ)',
    isPrototypeData: true
  },
  {
    id: 'nsfdc_amy_2026',
    code: 'NSFDC_AMY',
    name: 'NSFDC Aajeevika Micro-Finance Yojana (AMY)',
    shortName: 'NSFDC Aajeevika Micro Loan',
    ministry: 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    description: 'Provides micro-credit facility for enterprise activities up to ₹1.40 Lakhs project cost (Max NSFDC Loan ₹1.25 Lakhs) to SC beneficiaries through State Channelising Agencies (SCAs).',
    targetAudience: 'Scheduled Caste (SC) individual entrepreneurs and SHGs with annual family income up to ₹5,00,000',
    maxLoanAmount: 125000, // Max loan ₹1.25 Lakhs
    maxSubsidyPercent: 0,
    interestRate: 15.00, // 15% p.a. (Official NSFDC FAQ)
    maxTenureYears: 3, // Repayment within 3 years
    moratoriumMonths: 3, // 3 months moratorium
    collateralRequired: false,
    isNsfdcScheme: true,
    categoryTag: 'NSFDC Primary Scheme',
    rules: {
      minAge: 18,
      maxAge: 65,
      maxIncome: 500000, // Revised Jan 7, 2026 MoSJE guidelines
      minProjectCost: 10000,
      maxProjectCost: 140000,
      allowedCategories: ['SC'],
      allowedProjectTypes: ['manufacturing', 'services', 'trading', 'agro_processing', 'street_vending', 'handicraft_artisan']
    },
    sourceName: 'NSFDC Official FAQ',
    officialSourceUrl: 'https://nsfdc.nic.in/faqs',
    sourceEffectiveDate: '2026-01-07',
    lastVerifiedDate: '2026-03-01 (Verified against Official NSFDC FAQ)',
    isPrototypeData: true
  },
  {
    id: 'nsfdc_term_loan_2026',
    code: 'NSFDC_TERM',
    name: 'NSFDC Term Loan Scheme',
    shortName: 'NSFDC Term Credit Facility',
    ministry: 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    description: 'Financial assistance for setting up commercial/viable projects with project cost above ₹1.40 Lakhs up to ₹50 Lakhs (Max NSFDC Loan ₹45 Lakhs).',
    targetAudience: 'Scheduled Caste (SC) entrepreneurs setting up viable enterprises with annual family income up to ₹5,00,000',
    maxLoanAmount: 4500000, // Max loan ₹45 Lakhs (up to 90% of project cost)
    maxSubsidyPercent: 0,
    interestRate: 8.00, // 8.0% p.a. (Official NSFDC FAQ)
    maxTenureYears: 7, // Repayment within 7 years
    moratoriumMonths: 6, // 6 months moratorium (up to 12 months for plantation/construction)
    collateralRequired: false,
    isNsfdcScheme: true,
    categoryTag: 'NSFDC Primary Scheme',
    rules: {
      minAge: 18,
      maxAge: 65,
      maxIncome: 500000, // Revised Jan 7, 2026 MoSJE guidelines
      minProjectCost: 140001,
      maxProjectCost: 5000000,
      allowedCategories: ['SC'],
      allowedProjectTypes: ['manufacturing', 'services', 'trading', 'agro_processing', 'handicraft_artisan']
    },
    sourceName: 'NSFDC Official FAQ',
    officialSourceUrl: 'https://nsfdc.nic.in/faqs',
    sourceEffectiveDate: '2026-01-07',
    lastVerifiedDate: '2026-03-01 (Verified against Official NSFDC FAQ)',
    isPrototypeData: true
  },
  {
    id: 'nsfdc_uny_2026',
    code: 'NSFDC_UNY',
    name: 'NSFDC Udyam Nidhi Yojana (UNY)',
    shortName: 'NSFDC Udyam Nidhi',
    ministry: 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    description: 'Concessional loan assistance for projects up to ₹5 Lakhs (Max NSFDC Loan ₹4.50 Lakhs) to SC youth with professional/technical qualifications to establish self-employment ventures.',
    targetAudience: 'Skilled and technically qualified SC youth setting up greenfield/expansion projects with annual income up to ₹5,00,000',
    maxLoanAmount: 450000, // Max loan ₹4.50 Lakhs (up to 90% of project cost)
    maxSubsidyPercent: 0,
    interestRate: 13.00, // 13.0% p.a. through Cooperative Societies/Banks (15% through SFBs - Official NSFDC FAQ)
    maxTenureYears: 5, // Repayment within 5 years
    moratoriumMonths: 3, // 3 months moratorium
    collateralRequired: false,
    isNsfdcScheme: true,
    categoryTag: 'NSFDC Primary Scheme',
    rules: {
      minAge: 18,
      maxAge: 50,
      maxIncome: 500000, // Revised Jan 7, 2026 MoSJE guidelines
      minProjectCost: 50000,
      maxProjectCost: 500000,
      allowedCategories: ['SC'],
      allowedProjectTypes: ['manufacturing', 'services', 'trading', 'agro_processing', 'handicraft_artisan'],
      minEducation: '10th_pass'
    },
    sourceName: 'NSFDC Official FAQ',
    officialSourceUrl: 'https://nsfdc.nic.in/faqs',
    sourceEffectiveDate: '2026-01-07',
    lastVerifiedDate: '2026-03-01 (Verified against Official NSFDC FAQ)',
    isPrototypeData: true
  },
  {
    id: 'nsfdc_els_2026',
    code: 'NSFDC_ELS',
    name: 'NSFDC Educational Loan Scheme (ELS)',
    shortName: 'NSFDC Education Credit',
    ministry: 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    description: 'Educational credit facility up to ₹40 Lakhs (or 90% of course fee) for SC students pursuing professional/technical higher education in India or abroad.',
    targetAudience: 'SC students pursuing approved technical and professional degrees with annual family income up to ₹5,00,000',
    maxLoanAmount: 4000000, // Max loan ₹40 Lakhs (or 90% of course fee)
    maxSubsidyPercent: 0,
    interestRate: 6.50, // 6.5% p.a. (Official NSFDC FAQ)
    maxTenureYears: 10, // Repayment up to 10–12 years
    moratoriumMonths: 12, // Course duration + 1 year moratorium
    collateralRequired: false,
    isNsfdcScheme: true,
    categoryTag: 'NSFDC Primary Scheme',
    rules: {
      minAge: 18,
      maxIncome: 500000, // Revised Jan 7, 2026 MoSJE guidelines
      minProjectCost: 50000,
      maxProjectCost: 4000000,
      allowedCategories: ['SC'],
      allowedProjectTypes: ['services'],
      minEducation: '12th_pass'
    },
    sourceName: 'NSFDC Official FAQ',
    officialSourceUrl: 'https://nsfdc.nic.in/faqs',
    sourceEffectiveDate: '2026-01-07',
    lastVerifiedDate: '2026-03-01 (Verified against Official NSFDC FAQ)',
    isPrototypeData: true
  },

  // =========================================================================
  // SECONDARY SCHEMES: GENERAL CENTRAL CREDIT & SUBSIDY PROGRAMMES
  // =========================================================================
  {
    id: 'pmegp_2026',
    code: 'PMEGP',
    name: "Prime Minister's Employment Generation Programme",
    shortName: 'PMEGP Credit Linked Subsidy',
    ministry: 'Ministry of MSME / KVIC',
    description: 'Credit-linked subsidy program to generate employment through micro-enterprise setup in financial & service sectors.',
    targetAudience: 'Individual entrepreneurs, Women, SC/ST, OBC, Minorities, Rural Youth',
    maxLoanAmount: 5000000, // Project cost ceiling ₹50 Lakhs for Mfg, ₹20L for Service
    maxSubsidyPercent: 35, // Up to 35% for Special Category in Rural areas
    interestRate: 8.75, // % per annum
    maxTenureYears: 7,
    moratoriumMonths: 6,
    collateralRequired: false,
    isNsfdcScheme: false,
    categoryTag: 'General Credit Scheme',
    rules: {
      minAge: 18,
      maxAge: 65,
      minProjectCost: 50000,
      maxProjectCost: 5000000,
      allowedProjectTypes: ['manufacturing', 'services', 'agro_processing', 'handicraft_artisan'],
      requiresFirstGeneration: true,
      minEducation: 'below_8th'
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
    collateralRequired: false,
    isNsfdcScheme: false,
    categoryTag: 'General Credit Scheme',
    rules: {
      minAge: 18,
      minProjectCost: 1000000,
      maxProjectCost: 10000000,
      allowedCategories: ['SC', 'ST'],
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
    maxSubsidyPercent: 0,
    interestRate: 9.15,
    maxTenureYears: 5,
    moratoriumMonths: 3,
    collateralRequired: false,
    isNsfdcScheme: false,
    categoryTag: 'General Credit Scheme',
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
    interestRate: 7.00,
    maxTenureYears: 3,
    moratoriumMonths: 1,
    collateralRequired: false,
    isNsfdcScheme: false,
    categoryTag: 'General Credit Scheme',
    rules: {
      minAge: 18,
      maxAge: 60,
      maxIncome: 300000,
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
    maxSubsidyPercent: 8, // Concessional interest subvention
    interestRate: 5.00, // Concessional 5% rate
    maxTenureYears: 5,
    moratoriumMonths: 6,
    collateralRequired: false,
    isNsfdcScheme: false,
    categoryTag: 'General Credit Scheme',
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
