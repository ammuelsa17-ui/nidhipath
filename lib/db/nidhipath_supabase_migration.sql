-- ==============================================================================
-- NIDHIPATH — SUPABASE POSTGRESQL DATABASE MIGRATION & SEED SCRIPT
-- Project: NidhiPath (Right Scheme. Right Channel. Right Guidance.)
-- Date: 2026-03-15
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
    source_url TEXT NOT NULL,
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
-- 2. SEED SCHEME DATA (Prototype Dataset • Based on Official Sources)
-- ------------------------------------------------------------------------------

INSERT INTO schemes (
    id, code, name, short_name, ministry, description, target_audience,
    maximum_loan_amount, max_subsidy_percent, interest_rate, maximum_tenure,
    moratorium, collateral_required, source_url, verification_date, data_status
) VALUES
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
    'https://www.kviconline.gov.in/pmegpeportal',
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
    'https://www.standupmitra.in',
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
    'https://www.mudra.org.in',
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
    'https://pmsvanidhi.mohua.gov.in',
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
    'https://pmvishwakarma.gov.in',
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
    source_url = EXCLUDED.source_url,
    verification_date = EXCLUDED.verification_date,
    data_status = EXCLUDED.data_status;


-- ------------------------------------------------------------------------------
-- 3. SEED SCHEME ELIGIBILITY RULES (Idempotent: Clears and resets rule list)
-- ------------------------------------------------------------------------------

DELETE FROM scheme_eligibility_rules;

-- PMEGP Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('pmegp_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('pmegp_2026', 'age', '<=', '65', 'Maximum age 65 years'),
('pmegp_2026', 'estimatedCost', '>=', '50000', 'Minimum project cost ₹50,000'),
('pmegp_2026', 'estimatedCost', '<=', '5000000', 'Maximum project cost ₹50 Lakhs (Mfg) / ₹20 Lakhs (Service)'),
('pmegp_2026', 'isFirstGeneration', '==', 'true', 'Must be greenfield / first-generation project');

-- Stand-Up India Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('standup_india_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('standup_india_2026', 'estimatedCost', '>=', '1000000', 'Minimum project cost ₹10 Lakhs'),
('standup_india_2026', 'estimatedCost', '<=', '10000000', 'Maximum project cost ₹1 Crore'),
('standup_india_2026', 'isFirstGeneration', '==', 'true', 'Must be greenfield project'),
('standup_india_2026', 'category_or_gender', 'in', 'SC,ST,female', 'Targeted for SC/ST or Female entrepreneurs');

-- PM MUDRA Tarun Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('mudra_tarun_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('mudra_tarun_2026', 'estimatedCost', '<=', '1000000', 'Maximum loan amount ₹10 Lakhs');

-- PM SVANidhi Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('pmsvanidhi_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('pmsvanidhi_2026', 'annualIncome', '<=', '300000', 'Annual family income under ₹3 Lakhs'),
('pmsvanidhi_2026', 'estimatedCost', '<=', '100000', 'Maximum credit facility ₹50,000');

-- PM Vishwakarma Rules
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES
('pm_vishwakarma_2026', 'age', '>=', '18', 'Minimum age 18 years'),
('pm_vishwakarma_2026', 'estimatedCost', '<=', '300000', 'Maximum loan facility ₹3 Lakhs'),
('pm_vishwakarma_2026', 'projectType', 'in', 'handicraft_artisan,manufacturing,services', 'Traditional artisan / craft trades');


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
-- SBI Koramangala
('partner_sbi_001', 'pmegp_2026'),
('partner_sbi_001', 'standup_india_2026'),
('partner_sbi_001', 'mudra_tarun_2026'),
('partner_sbi_001', 'pm_vishwakarma_2026'),

-- PNB Connaught Place
('partner_pnb_002', 'pmegp_2026'),
('partner_pnb_002', 'standup_india_2026'),
('partner_pnb_002', 'mudra_tarun_2026'),
('partner_pnb_002', 'pmsvanidhi_2026'),

-- DIC Bengaluru
('partner_dic_003', 'pmegp_2026'),
('partner_dic_003', 'pm_vishwakarma_2026'),
('partner_dic_003', 'standup_india_2026'),

-- CSC Patna
('partner_csc_004', 'pmsvanidhi_2026'),
('partner_csc_004', 'mudra_tarun_2026'),
('partner_csc_004', 'pm_vishwakarma_2026'),

-- KVGB Dharwad
('partner_rrb_005', 'pmegp_2026'),
('partner_rrb_005', 'mudra_tarun_2026'),
('partner_rrb_005', 'pm_vishwakarma_2026'),

-- Canara RSETI Ramanagara
('partner_canara_006', 'pmegp_2026'),
('partner_canara_006', 'pm_vishwakarma_2026'),
('partner_canara_006', 'standup_india_2026')
ON CONFLICT (partner_id, scheme_id) DO NOTHING;
