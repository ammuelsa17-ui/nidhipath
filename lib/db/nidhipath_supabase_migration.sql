-- ==============================================================================
-- NIDHIPATH — SUPABASE POSTGRESQL DATABASE MIGRATION & SEED SCRIPT
-- Focus: NSFDC Financial Assistance Schemes (MoSJE / SIH26092)
-- Official Income Limit: ₹5,00,000 p.a. (Revised Jan 7, 2026 MoSJE Guideline)
-- Primary Official Source: https://nsfdc.nic.in/
-- Note: Run this script directly inside the Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMAS & TABLES CREATION (Idempotent: IF NOT EXISTS)
-- ------------------------------------------------------------------------------
-- Master Table for Credit-Linked Government Schemes
CREATE TABLE IF NOT EXISTS schemes (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(128) NOT NULL,
    ministry VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    maximum_loan_amount NUMERIC(15, 2) NOT NULL,
    max_subsidy_percent NUMERIC(5, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    maximum_tenure INTEGER NOT NULL,
    moratorium INTEGER NOT NULL,
    collateral_required BOOLEAN DEFAULT FALSE,
    source_name VARCHAR(128) DEFAULT 'NSFDC Official FAQ',
    source_url TEXT NOT NULL,
    source_effective_date VARCHAR(64) DEFAULT '2026-01-07',
    verification_date VARCHAR(64) NOT NULL,
    data_status VARCHAR(64) DEFAULT 'Prototype Dataset • Based on Official Sources'
);

-- Table for Rule Engine Deterministic Parameters
CREATE TABLE IF NOT EXISTS scheme_eligibility_rules (
    id SERIAL PRIMARY KEY,
    scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
    field VARCHAR(64) NOT NULL,
    operator VARCHAR(16) NOT NULL,
    value TEXT NOT NULL,
    description TEXT NOT NULL
);

-- Master Table for Implementation Channel Partners
CREATE TABLE IF NOT EXISTS channel_partners (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(64) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    contact_email VARCHAR(128) NOT NULL,
    nodal_officer_name VARCHAR(128),
    source_url TEXT NOT NULL,
    verification_date VARCHAR(64) NOT NULL,
    data_status VARCHAR(64) DEFAULT 'Prototype Partner Data'
);

-- Junction Table: Partner - Scheme Mapping
CREATE TABLE IF NOT EXISTS partner_schemes (
    partner_id VARCHAR(64) REFERENCES channel_partners(id) ON DELETE CASCADE,
    scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
    PRIMARY KEY (partner_id, scheme_id)
);


-- ------------------------------------------------------------------------------
-- 2. SEED PRIMARY NSFDC SCHEMES & SECONDARY GENERAL SCHEMES
-- ------------------------------------------------------------------------------

INSERT INTO schemes (
    id, code, name, short_name, ministry, description, target_audience,
    maximum_loan_amount, max_subsidy_percent, interest_rate, maximum_tenure,
    moratorium, collateral_required, source_name, source_url, source_effective_date, verification_date, data_status
) VALUES
-- PRIMARY NSFDC SCHEMES (https://nsfdc.nic.in/faqs - Official NSFDC FAQ)
(
    'nsfdc_mfs_2026',
    'NSFDC_MFS',
    'NSFDC Micro Finance Scheme (MFS)',
    'NSFDC Micro Credit',
    'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    'Provides direct micro-credit assistance to Scheduled Caste entrepreneurs for small income-generating activities with unit project cost up to ₹1.40 Lakhs (Max NSFDC Loan ₹1.25 Lakhs).',
    'Scheduled Caste (SC) beneficiaries with valid caste certificate and annual family income up to ₹5,00,000',
    125000.00,
    0.00,
    6.50,
    3,
    3,
    FALSE,
    'NSFDC Official FAQ',
    'https://nsfdc.nic.in/faqs',
    '2026-01-07',
    '2026-03-01 (Verified against Official NSFDC FAQ)',
    'Prototype Dataset • Based on Official Sources'
),
(
    'nsfdc_amy_2026',
    'NSFDC_AMY',
    'NSFDC Aajeevika Micro-Finance Yojana (AMY)',
    'NSFDC Aajeevika Micro Loan',
    'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    'Provides micro-credit facility for enterprise activities up to ₹1.40 Lakhs project cost (Max NSFDC Loan ₹1.25 Lakhs) to SC beneficiaries through State Channelising Agencies (SCAs).',
    'Scheduled Caste (SC) individual entrepreneurs and SHGs with annual family income up to ₹5,00,000',
    125000.00,
    0.00,
    15.00,
    3,
    3,
    FALSE,
    'NSFDC Official FAQ',
    'https://nsfdc.nic.in/faqs',
    '2026-01-07',
    '2026-03-01 (Verified against Official NSFDC FAQ)',
    'Prototype Dataset • Based on Official Sources'
),
(
    'nsfdc_term_loan_2026',
    'NSFDC_TERM',
    'NSFDC Term Loan Scheme',
    'NSFDC Term Credit Facility',
    'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    'Financial assistance for setting up commercial/viable projects with project cost above ₹1.40 Lakhs up to ₹50 Lakhs (Max NSFDC Loan ₹45 Lakhs).',
    'Scheduled Caste (SC) entrepreneurs setting up viable enterprises with annual family income up to ₹5,00,000',
    4500000.00,
    0.00,
    8.00,
    7,
    6,
    FALSE,
    'NSFDC Official FAQ',
    'https://nsfdc.nic.in/faqs',
    '2026-01-07',
    '2026-03-01 (Verified against Official NSFDC FAQ)',
    'Prototype Dataset • Based on Official Sources'
),
(
    'nsfdc_uny_2026',
    'NSFDC_UNY',
    'NSFDC Udyam Nidhi Yojana (UNY)',
    'NSFDC Udyam Nidhi',
    'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    'Concessional loan assistance for projects up to ₹5 Lakhs (Max NSFDC Loan ₹4.50 Lakhs) to SC youth with professional/technical qualifications to establish self-employment ventures.',
    'Skilled and technically qualified SC youth setting up greenfield/expansion projects with annual income up to ₹5,00,000',
    450000.00,
    0.00,
    13.00,
    5,
    3,
    FALSE,
    'NSFDC Official FAQ',
    'https://nsfdc.nic.in/faqs',
    '2026-01-07',
    '2026-03-01 (Verified against Official NSFDC FAQ)',
    'Prototype Dataset • Based on Official Sources'
),
(
    'nsfdc_els_2026',
    'NSFDC_ELS',
    'NSFDC Educational Loan Scheme (ELS)',
    'NSFDC Education Credit',
    'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)',
    'Educational credit facility up to ₹40 Lakhs (or 90% of course fee) for SC students pursuing professional/technical higher education in India or abroad.',
    'SC students pursuing approved technical and professional degrees with annual family income up to ₹5,00,000',
    4000000.00,
    0.00,
    6.50,
    10,
    12,
    FALSE,
    'NSFDC Official FAQ',
    'https://nsfdc.nic.in/faqs',
    '2026-01-07',
    '2026-03-01 (Verified against Official NSFDC FAQ)',
    'Prototype Dataset • Based on Official Sources'
),

-- SECONDARY GENERAL SCHEMES
(
    'pmegp_2026',
    'PMEGP',
    'Prime Minister''s Employment Generation Programme',
    'PMEGP Credit Linked Subsidy',
    'Ministry of MSME / KVIC',
    'Credit-linked subsidy program to generate employment through micro-enterprise setup in financial & service sectors.',
    'Individual entrepreneurs, Women, SC/ST, OBC, Minorities, Rural Youth',
    5000000.00,
    35.00,
    8.75,
    7,
    6,
    FALSE,
    'Official PMEGP Portal',
    'https://www.kviconline.gov.in/pmegpeportal',
    '2023-12-07',
    '2026-01-15 (Verified Official Portal Data)',
    'Prototype Dataset • Based on Official Sources'
),
(
    'standup_india_2026',
    'STANDUP_INDIA',
    'Stand-Up India Scheme for SC/ST and Women Entrepreneurs',
    'Stand-Up India',
    'Ministry of Finance / SIDBI',
    'Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to SC/ST or Woman borrowers for setting up a greenfield enterprise.',
    'SC/ST candidates and Female entrepreneurs setting up greenfield projects',
    10000000.00,
    15.00,
    8.25,
    7,
    18,
    FALSE,
    'Official Stand-Up Mitra Portal',
    'https://www.standupmitra.in',
    '2024-01-01',
    '2026-02-01 (Verified Official Guidelines)',
    'Prototype Dataset • Based on Official Sources'
),
(
    'mudra_tarun_2026',
    'MUDRA_TARUN',
    'Pradhan Mantri MUDRA Yojana (Tarun & Kishore)',
    'PMMY MUDRA Loan',
    'Ministry of Finance / MUDRA',
    'Collateral-free loans up to ₹10 Lakhs for non-corporate, non-farm small/micro enterprises for business expansion or machinery purchase.',
    'Small business owners, shopkeepers, service providers, micro-units',
    1000000.00,
    0.00,
    9.15,
    5,
    3,
    FALSE,
    'Official MUDRA Portal',
    'https://www.mudra.org.in',
    '2024-01-01',
    '2026-01-10 (Verified Official Portal Data)',
    'Prototype Dataset • Based on Official Sources'
),
(
    'pmsvanidhi_2026',
    'PMSVANIDHI',
    'PM Street Vendor''s AtmaNirbhar Nidhi (PM SVANidhi)',
    'PM SVANidhi',
    'Ministry of Housing and Urban Affairs',
    'Special micro-credit facility for street vendors and small urban micro-traders with interest subvention of 7% p.a.',
    'Urban street vendors, hawkers, small roadside service providers',
    50000.00,
    7.00,
    7.00,
    3,
    1,
    FALSE,
    'Official PM SVANidhi Portal',
    'https://pmsvanidhi.mohua.gov.in',
    '2024-01-01',
    '2026-02-10 (Verified Official Portal Data)',
    'Prototype Dataset • Based on Official Sources'
),
(
    'pm_vishwakarma_2026',
    'PM_VISHWAKARMA',
    'PM Vishwakarma Scheme for Traditional Artisans',
    'PM Vishwakarma',
    'Ministry of MSME / KVIC',
    'End-to-end support to traditional artisans and craftspeople including collateral-free loans up to ₹3 Lakhs at 5% interest rate, toolkit incentive, and skill training.',
    'Artisans working with hands & tools in 18 traditional trades (weavers, blacksmiths, carpenters, potters, etc.)',
    300000.00,
    8.00,
    5.00,
    5,
    6,
    FALSE,
    'Official PM Vishwakarma Portal',
    'https://pmvishwakarma.gov.in',
    '2023-09-17',
    '2026-01-20 (Verified Official Portal Data)',
    'Prototype Dataset • Based on Official Sources'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    ministry = EXCLUDED.ministry,
    description = EXCLUDED.description,
    maximum_loan_amount = EXCLUDED.maximum_loan_amount,
    max_subsidy_percent = EXCLUDED.max_subsidy_percent,
    interest_rate = EXCLUDED.interest_rate,
    source_name = EXCLUDED.source_name,
    source_url = EXCLUDED.source_url,
    source_effective_date = EXCLUDED.source_effective_date,
    verification_date = EXCLUDED.verification_date,
    data_status = EXCLUDED.data_status;


-- ------------------------------------------------------------------------------
-- 3. SEED SCHEME ELIGIBILITY RULES
-- ------------------------------------------------------------------------------

DELETE FROM scheme_eligibility_rules;

-- NSFDC Micro Finance Scheme (MFS) Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('nsfdc_mfs_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('nsfdc_mfs_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)'),
('nsfdc_mfs_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) with valid caste certificate'),
('nsfdc_mfs_2026', 'estimatedCost', '<=', '140000', 'Maximum unit project cost ₹1.40 Lakhs (Max Loan ₹1.25 Lakhs)');

-- NSFDC Aajeevika Micro-Finance Yojana (AMY) Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('nsfdc_amy_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('nsfdc_amy_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)'),
('nsfdc_amy_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) with valid caste certificate'),
('nsfdc_amy_2026', 'estimatedCost', '<=', '140000', 'Maximum unit project cost ₹1.40 Lakhs (Max Loan ₹1.25 Lakhs)');

-- NSFDC Term Loan Scheme Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('nsfdc_term_loan_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('nsfdc_term_loan_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)'),
('nsfdc_term_loan_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) with valid caste certificate'),
('nsfdc_term_loan_2026', 'estimatedCost', '>', '140000', 'Project cost must exceed ₹1.40 Lakhs'),
('nsfdc_term_loan_2026', 'estimatedCost', '<=', '5000000', 'Maximum project cost ₹50 Lakhs (Max Loan ₹45 Lakhs)');

-- NSFDC Udyam Nidhi Yojana (UNY) Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('nsfdc_uny_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('nsfdc_uny_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)'),
('nsfdc_uny_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) with valid caste certificate'),
('nsfdc_uny_2026', 'minEducation', '>=', '10th_pass', 'Technical / professional qualification preferred'),
('nsfdc_uny_2026', 'estimatedCost', '<=', '500000', 'Maximum project cost ₹5 Lakhs (Max Loan ₹4.50 Lakhs)');

-- NSFDC Educational Loan Scheme (ELS) Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('nsfdc_els_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('nsfdc_els_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)'),
('nsfdc_els_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) student'),
('nsfdc_els_2026', 'minEducation', '>=', '12th_pass', 'Higher secondary / admission to professional degree'),
('nsfdc_els_2026', 'estimatedCost', '<=', '4000000', 'Maximum educational loan ₹40 Lakhs (or 90% of fee)');edCost', '<=', '2000000', 'Maximum educational credit ₹20 Lakhs (India)');

-- General Secondary Schemes Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('pmegp_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('pmegp_2026', 'estimatedCost', '<=', '5000000', 'Maximum project cost ₹50 Lakhs (Mfg)'),
('standup_india_2026', 'category_or_gender', 'in', 'SC,ST,female', 'Targeted for SC/ST or Female entrepreneurs'),
('mudra_tarun_2026', 'estimatedCost', '<=', '1000000', 'Maximum loan amount ₹10 Lakhs'),
('pmsvanidhi_2026', 'estimatedCost', '<=', '100000', 'Maximum credit facility ₹50,000'),
('pm_vishwakarma_2026', 'estimatedCost', '<=', '300000', 'Maximum loan facility ₹3 Lakhs');


-- ------------------------------------------------------------------------------
-- 4. SEED CHANNEL PARTNER DATA (Prototype Partner Data)
-- ------------------------------------------------------------------------------

INSERT INTO channel_partners (
    id, name, partner_type, branch_name, address, district, state, pincode,
    latitude, longitude, contact_phone, contact_email, nodal_officer_name,
    source_url, verification_date, data_status
) VALUES
(
    'partner_sbi_001',
    'State Bank of India — MSME Specialised Branch',
    'public_sector_bank',
    'Koramangala MSME Hub',
    '12th Main Road, 4th Block, Koramangala',
    'Bengaluru',
    'Karnataka',
    '560034',
    12.9345000,
    77.6245000,
    '+91 80 2553 4421',
    'sbi.msme.koramangala@sbi.co.in',
    'Rajesh Kumar (Lead District Nodal Manager)',
    'https://sbi.co.in',
    '2026-03-01',
    'Prototype Partner Data'
),
(
    'partner_pnb_002',
    'Punjab National Bank — Micro Credit Cell',
    'public_sector_bank',
    'Connaught Place Nodal Branch',
    'E-Block, Inner Circle, Connaught Place',
    'New Delhi',
    'Delhi',
    '110001',
    28.6315000,
    77.2167000,
    '+91 11 2332 8901',
    'pnb.microcredit.delhi@pnb.co.in',
    'Sunita Sharma (Chief Nodal Officer)',
    'https://pnbindia.in',
    '2026-03-01',
    'Prototype Partner Data'
),
(
    'partner_kscdc_007',
    'Karnataka State SC & ST Development Corporation (SCA)',
    'dic',
    'District Nodal Facilitation Office',
    'Dr. B.R. Ambedkar Bhavan, Millers Road, Vasanth Nagar',
    'Bengaluru',
    'Karnataka',
    '560052',
    12.9880000,
    77.5940000,
    '+91 80 2286 4501',
    'kscdc.bengaluru@karnataka.gov.in',
    'Manjunath Swamy (District Nodal Executive, SCA)',
    'https://nsfdc.nic.in/',
    '2026-03-01',
    'Prototype Partner Data'
),
(
    'partner_dic_003',
    'District Industries Centre (DIC) Facilitation Office',
    'dic',
    'District MSME Single Window Centre',
    'Industrial Estate, Rajajinagar',
    'Bengaluru',
    'Karnataka',
    '560010',
    12.9901000,
    77.5526000,
    '+91 80 2330 1199',
    'dic.bengaluru@karnataka.gov.in',
    'Anil Deshmukh (General Manager, DIC)',
    'https://karnataka.gov.in',
    '2026-03-01',
    'Prototype Partner Data'
),
(
    'partner_csc_004',
    'CSC Digital Seva Kendra & Entrepreneur Support',
    'csc',
    'Jan Seva Kendra Centre #402',
    'Main Market Road, Near Bus Stand',
    'Patna',
    'Bihar',
    '800001',
    25.6093000,
    85.1235000,
    '+91 612 220 5410',
    'csc.patna.central@digitalseva.gov.in',
    'Priya Verma (VLE Centre Manager)',
    'https://digitalseva.csc.gov.in',
    '2026-03-01',
    'Prototype Partner Data'
),
(
    'partner_rrb_005',
    'Karnataka Vikas Grameena Bank (Regional Rural Bank)',
    'regional_rural_bank',
    'Dharwad Main Branch',
    'Station Road, Malmaddi',
    'Dharwad',
    'Karnataka',
    '580007',
    15.4589000,
    75.0078000,
    '+91 836 244 8700',
    'kvgb.dharwad@kvgbank.com',
    'Venkatesh Rao (Branch Manager)',
    'https://kvgbank.com',
    '2026-03-01',
    'Prototype Partner Data'
),
(
    'partner_canara_006',
    'Canara Bank RSETI (Rural Self Employment Training Institute)',
    'public_sector_bank',
    'RSETI Entrepreneur Facilitation Cell',
    'Harohalli Industrial Area, Kanakapura Road',
    'Ramanagara',
    'Karnataka',
    '562112',
    12.6340000,
    77.4260000,
    '+91 80 2727 3400',
    'canara.rseti.ram@canarabank.com',
    'Ramesh Babu (Director RSETI)',
    'https://canarabank.com',
    '2026-03-01',
    'Prototype Partner Data'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    branch_name = EXCLUDED.branch_name,
    address = EXCLUDED.address,
    contact_phone = EXCLUDED.contact_phone,
    contact_email = EXCLUDED.contact_email,
    nodal_officer_name = EXCLUDED.nodal_officer_name,
    data_status = EXCLUDED.data_status;


-- ------------------------------------------------------------------------------
-- 5. SEED PARTNER-SCHEME MAPPINGS
-- ------------------------------------------------------------------------------

INSERT INTO partner_schemes (partner_id, scheme_id) VALUES
-- SBI Koramangala (9 mappings)
('partner_sbi_001', 'nsfdc_mfs_2026'),
('partner_sbi_001', 'nsfdc_amy_2026'),
('partner_sbi_001', 'nsfdc_term_loan_2026'),
('partner_sbi_001', 'nsfdc_uny_2026'),
('partner_sbi_001', 'nsfdc_els_2026'),
('partner_sbi_001', 'pmegp_2026'),
('partner_sbi_001', 'standup_india_2026'),
('partner_sbi_001', 'mudra_tarun_2026'),
('partner_sbi_001', 'pm_vishwakarma_2026'),

-- PNB Connaught Place (8 mappings)
('partner_pnb_002', 'nsfdc_mfs_2026'),
('partner_pnb_002', 'nsfdc_amy_2026'),
('partner_pnb_002', 'nsfdc_term_loan_2026'),
('partner_pnb_002', 'nsfdc_uny_2026'),
('partner_pnb_002', 'pmegp_2026'),
('partner_pnb_002', 'standup_india_2026'),
('partner_pnb_002', 'mudra_tarun_2026'),
('partner_pnb_002', 'pmsvanidhi_2026'),

-- KSCDC SCA Bengaluru (5 mappings)
('partner_kscdc_007', 'nsfdc_mfs_2026'),
('partner_kscdc_007', 'nsfdc_amy_2026'),
('partner_kscdc_007', 'nsfdc_term_loan_2026'),
('partner_kscdc_007', 'nsfdc_uny_2026'),
('partner_kscdc_007', 'nsfdc_els_2026'),

-- DIC Bengaluru (6 mappings)
('partner_dic_003', 'nsfdc_mfs_2026'),
('partner_dic_003', 'nsfdc_term_loan_2026'),
('partner_dic_003', 'nsfdc_uny_2026'),
('partner_dic_003', 'pmegp_2026'),
('partner_dic_003', 'pm_vishwakarma_2026'),
('partner_dic_003', 'standup_india_2026'),

-- CSC Patna (5 mappings)
('partner_csc_004', 'nsfdc_mfs_2026'),
('partner_csc_004', 'nsfdc_amy_2026'),
('partner_csc_004', 'pmsvanidhi_2026'),
('partner_csc_004', 'mudra_tarun_2026'),
('partner_csc_004', 'pm_vishwakarma_2026'),

-- KVGB Dharwad (6 mappings)
('partner_rrb_005', 'nsfdc_mfs_2026'),
('partner_rrb_005', 'nsfdc_amy_2026'),
('partner_rrb_005', 'nsfdc_term_loan_2026'),
('partner_rrb_005', 'pmegp_2026'),
('partner_rrb_005', 'mudra_tarun_2026'),
('partner_rrb_005', 'pm_vishwakarma_2026'),

-- Canara RSETI Ramanagara (8 mappings)
('partner_canara_006', 'nsfdc_mfs_2026'),
('partner_canara_006', 'nsfdc_amy_2026'),
('partner_canara_006', 'nsfdc_term_loan_2026'),
('partner_canara_006', 'nsfdc_uny_2026'),
('partner_canara_006', 'nsfdc_els_2026'),
('partner_canara_006', 'pmegp_2026'),
('partner_canara_006', 'pm_vishwakarma_2026'),
('partner_canara_006', 'standup_india_2026')
ON CONFLICT (partner_id, scheme_id) DO NOTHING;
