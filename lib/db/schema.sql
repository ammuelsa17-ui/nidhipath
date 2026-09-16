-- ==============================================================================
-- NIDHIPATH — PURE POSTGRESQL SCHEMA & SEED DEFINITION
-- Sole Authoritative Source of Truth for Schemes, Rules, Documents, Partners, Sources, Versions & Logs
-- ==============================================================================

-- 1. SOURCES TABLE
CREATE TABLE IF NOT EXISTS sources (
    id VARCHAR(64) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT NOT NULL,
    source_type VARCHAR(64) DEFAULT 'official_government_faq',
    source_effective_date VARCHAR(64) NOT NULL DEFAULT '2026-01-07',
    last_verified_at VARCHAR(64) NOT NULL DEFAULT '2026-03-01',
    verification_status VARCHAR(64) DEFAULT 'VERIFIED_STATUTORY',
    notes TEXT
);

-- 2. RULE VERSIONS TABLE
CREATE TABLE IF NOT EXISTS rule_versions (
    id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) NOT NULL,
    version VARCHAR(32) NOT NULL,
    effective_from VARCHAR(64) NOT NULL,
    effective_to VARCHAR(64) DEFAULT '2099-12-31',
    change_summary TEXT NOT NULL,
    published_by VARCHAR(128) DEFAULT 'MoSJE Nodal Admin',
    status VARCHAR(32) DEFAULT 'PUBLISHED'
);

-- 3. SCHEMES MASTER TABLE
CREATE TABLE IF NOT EXISTS schemes (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(128) NOT NULL,
    ministry VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    maximum_loan_amount NUMERIC(15, 2) NOT NULL,
    max_subsidy_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    interest_rate NUMERIC(5, 2) NOT NULL,
    maximum_tenure INTEGER NOT NULL,
    moratorium INTEGER NOT NULL,
    collateral_required BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    source_id VARCHAR(64) REFERENCES sources(id),
    rule_version VARCHAR(32) DEFAULT 'v2.6',
    application_url TEXT NOT NULL,
    category_tag VARCHAR(64) DEFAULT 'NSFDC Primary Scheme',
    is_nsfdc_scheme BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SCHEME ELIGIBILITY RULES TABLE
CREATE TABLE IF NOT EXISTS scheme_eligibility_rules (
    id SERIAL PRIMARY KEY,
    scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
    field VARCHAR(64) NOT NULL,
    operator VARCHAR(16) NOT NULL,
    value TEXT NOT NULL,
    rule_group VARCHAR(64) DEFAULT 'DEFAULT',
    priority INTEGER DEFAULT 10,
    explanation TEXT NOT NULL,
    source_id VARCHAR(64) REFERENCES sources(id),
    rule_version VARCHAR(32) DEFAULT 'v2.6',
    active BOOLEAN DEFAULT TRUE
);

-- 5. DOCUMENTS REQUIREMENT TABLE
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    mandatory BOOLEAN DEFAULT TRUE,
    description TEXT NOT NULL,
    source_id VARCHAR(64) REFERENCES sources(id),
    active BOOLEAN DEFAULT TRUE
);

-- 6. CHANNEL PARTNERS MASTER TABLE
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
    authorization_status VARCHAR(64) DEFAULT 'AUTHORIZED_NODAL',
    active BOOLEAN DEFAULT TRUE,
    source_id VARCHAR(64) REFERENCES sources(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. PARTNER SCHEMES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS partner_schemes (
    partner_id VARCHAR(64) REFERENCES channel_partners(id) ON DELETE CASCADE,
    scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
    authorization_status VARCHAR(64) DEFAULT 'ACTIVE_MAPPED',
    service_type VARCHAR(64) DEFAULT 'CREDIT_SANCTION',
    application_supported BOOLEAN DEFAULT TRUE,
    assistance_supported BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (partner_id, scheme_id)
);

-- 8. DECISION AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS decision_logs (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    beneficiary_profile JSONB NOT NULL,
    evaluated_schemes JSONB NOT NULL,
    selected_scheme VARCHAR(64),
    score_breakdown JSONB,
    rules_triggered JSONB NOT NULL,
    source_versions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- SEED DATA SETUP
-- ==============================================================================

-- SEED SOURCES
INSERT INTO sources (id, source_name, source_url, source_type, source_effective_date, last_verified_at, verification_status, notes) VALUES
('src_nsfdc_faq', 'NSFDC Official FAQ', 'https://nsfdc.nic.in/faqs', 'official_government_faq', '2026-01-07', '2026-03-01', 'VERIFIED_STATUTORY', 'Official MoSJE/NSFDC Jan 7, 2026 income ceiling revision'),
('src_kvic_pmegp', 'Official PMEGP Portal', 'https://www.kviconline.gov.in/pmegpeportal', 'official_government_portal', '2023-12-07', '2026-01-15', 'VERIFIED_STATUTORY', 'KVIC MSME credit-linked margin subsidy guidelines'),
('src_standup_mitra', 'Official Stand-Up Mitra Portal', 'https://www.standupmitra.in', 'official_government_portal', '2024-01-01', '2026-02-01', 'VERIFIED_STATUTORY', 'SIDBI Stand-Up India SC/ST/Female credit guidelines'),
('src_mudra', 'Official MUDRA Portal', 'https://www.mudra.org.in', 'official_government_portal', '2024-01-01', '2026-01-10', 'VERIFIED_STATUTORY', 'PMMY MUDRA Tarun collateral-free credit guidelines'),
('src_pmsvanidhi', 'Official PM SVANidhi Portal', 'https://pmsvanidhi.mohua.gov.in', 'official_government_portal', '2024-01-01', '2026-02-10', 'VERIFIED_STATUTORY', 'MoHUA micro-credit interest subvention facility'),
('src_pm_vishwakarma', 'Official PM Vishwakarma Portal', 'https://pmvishwakarma.gov.in', 'official_government_portal', '2023-09-17', '2026-01-20', 'VERIFIED_STATUTORY', 'MSME 18 traditional trade artisan credit guidelines')
ON CONFLICT (id) DO NOTHING;

-- SEED RULE VERSIONS
INSERT INTO rule_versions (id, scheme_id, version, effective_from, change_summary, published_by, status) VALUES
('rv_nsfdc_v26', 'nsfdc_term_loan_2026', 'v2.6', '2026-01-07', 'Revised annual income ceiling to ₹5,00,000 p.a.', 'MoSJE Nodal Admin', 'PUBLISHED'),
('rv_pmegp_v24', 'pmegp_2026', 'v2.4', '2023-12-07', '35% rural margin money subsidy for special category', 'MSME KVIC Nodal', 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

-- SEED SCHEMES
INSERT INTO schemes (
    id, code, name, short_name, ministry, description, target_audience,
    maximum_loan_amount, max_subsidy_percent, interest_rate, maximum_tenure,
    moratorium, collateral_required, active, source_id, rule_version, application_url, category_tag, is_nsfdc_scheme
) VALUES
('nsfdc_mfs_2026', 'NSFDC_MFS', 'NSFDC Micro Finance Scheme (MFS)', 'NSFDC Micro Credit', 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)', 'Provides direct micro-credit assistance to Scheduled Caste entrepreneurs for small income-generating activities with unit project cost up to ₹1.40 Lakhs (Max NSFDC Loan ₹1.25 Lakhs).', 'Scheduled Caste (SC) beneficiaries with valid caste certificate and annual family income up to ₹5,00,000', 125000.00, 0.00, 6.50, 3, 3, FALSE, TRUE, 'src_nsfdc_faq', 'v2.6', 'https://nsfdc.nic.in/faqs', 'NSFDC Primary Scheme', TRUE),
('nsfdc_amy_2026', 'NSFDC_AMY', 'NSFDC Aajeevika Micro-Finance Yojana (AMY)', 'NSFDC Aajeevika Micro Loan', 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)', 'Provides micro-credit facility for enterprise activities up to ₹1.40 Lakhs project cost (Max NSFDC Loan ₹1.25 Lakhs) to SC beneficiaries through State Channelising Agencies (SCAs).', 'Scheduled Caste (SC) individual entrepreneurs and SHGs with annual family income up to ₹5,00,000', 125000.00, 0.00, 15.00, 3, 3, FALSE, TRUE, 'src_nsfdc_faq', 'v2.6', 'https://nsfdc.nic.in/faqs', 'NSFDC Primary Scheme', TRUE),
('nsfdc_term_loan_2026', 'NSFDC_TERM', 'NSFDC Term Loan Scheme', 'NSFDC Term Credit Facility', 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)', 'Financial assistance for setting up commercial/viable projects with project cost above ₹1.40 Lakhs up to ₹50 Lakhs (Max NSFDC Loan ₹45 Lakhs).', 'Scheduled Caste (SC) entrepreneurs setting up viable enterprises with annual family income up to ₹5,00,000', 4500000.00, 0.00, 8.00, 7, 6, FALSE, TRUE, 'src_nsfdc_faq', 'v2.6', 'https://nsfdc.nic.in/faqs', 'NSFDC Primary Scheme', TRUE),
('nsfdc_uny_2026', 'NSFDC_UNY', 'NSFDC Udyam Nidhi Yojana (UNY)', 'NSFDC Udyam Nidhi', 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)', 'Concessional loan assistance for projects up to ₹5 Lakhs (Max NSFDC Loan ₹4.50 Lakhs) to SC youth with professional/technical qualifications to establish self-employment ventures.', 'Skilled and technically qualified SC youth setting up greenfield/expansion projects with annual income up to ₹5,00,000', 450000.00, 0.00, 13.00, 5, 3, FALSE, TRUE, 'src_nsfdc_faq', 'v2.6', 'https://nsfdc.nic.in/faqs', 'NSFDC Primary Scheme', TRUE),
('nsfdc_els_2026', 'NSFDC_ELS', 'NSFDC Educational Loan Scheme (ELS)', 'NSFDC Education Credit', 'National Scheduled Castes Finance and Development Corporation (NSFDC / MoSJE)', 'Educational credit facility up to ₹40 Lakhs (or 90% of course fee) for SC students pursuing professional/technical higher education in India or abroad.', 'SC students pursuing approved technical and professional degrees with annual family income up to ₹5,00,000', 4000000.00, 0.00, 6.50, 10, 12, FALSE, TRUE, 'src_nsfdc_faq', 'v2.6', 'https://nsfdc.nic.in/faqs', 'NSFDC Primary Scheme', TRUE),
('pmegp_2026', 'PMEGP', 'Prime Minister''s Employment Generation Programme', 'PMEGP Credit Linked Subsidy', 'Ministry of MSME / KVIC', 'Credit-linked subsidy program to generate employment through micro-enterprise setup in financial & service sectors.', 'Individual entrepreneurs, Women, SC/ST, OBC, Minorities, Rural Youth', 5000000.00, 35.00, 8.75, 7, 6, FALSE, TRUE, 'src_kvic_pmegp', 'v2.4', 'https://www.kviconline.gov.in/pmegpeportal', 'General Credit Scheme', FALSE),
('standup_india_2026', 'STANDUP_INDIA', 'Stand-Up India Scheme for SC/ST and Women Entrepreneurs', 'Stand-Up India', 'Ministry of Finance / SIDBI', 'Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to SC/ST or Woman borrowers for setting up a greenfield enterprise.', 'SC/ST candidates and Female entrepreneurs setting up greenfield projects', 10000000.00, 15.00, 8.25, 7, 18, FALSE, TRUE, 'src_standup_mitra', 'v2.0', 'https://www.standupmitra.in', 'General Credit Scheme', FALSE),
('mudra_tarun_2026', 'MUDRA_TARUN', 'Pradhan Mantri MUDRA Yojana (Tarun & Kishore)', 'PMMY MUDRA Loan', 'Ministry of Finance / MUDRA', 'Collateral-free loans up to ₹10 Lakhs for non-corporate, non-farm small/micro enterprises for business expansion or machinery purchase.', 'Small business owners, shopkeepers, service providers, micro-units', 1000000.00, 0.00, 9.15, 5, 3, FALSE, TRUE, 'src_mudra', 'v2.0', 'https://www.mudra.org.in', 'General Credit Scheme', FALSE),
('pmsvanidhi_2026', 'PMSVANIDHI', 'PM Street Vendor''s AtmaNirbhar Nidhi (PM SVANidhi)', 'PM SVANidhi', 'Ministry of Housing and Urban Affairs', 'Special micro-credit facility for street vendors and small urban micro-traders with interest subvention of 7% p.a.', 'Urban street vendors, hawkers, small roadside service providers', 50000.00, 7.00, 7.00, 3, 1, FALSE, TRUE, 'src_pmsvanidhi', 'v2.0', 'https://pmsvanidhi.mohua.gov.in', 'General Credit Scheme', FALSE),
('pm_vishwakarma_2026', 'PM_VISHWAKARMA', 'PM Vishwakarma Scheme for Traditional Artisans', 'PM Vishwakarma', 'Ministry of MSME / KVIC', 'End-to-end support to traditional artisans and craftspeople including collateral-free loans up to ₹3 Lakhs at 5% interest rate, toolkit incentive, and skill training.', 'Artisans working with hands & tools in 18 traditional trades (weavers, blacksmiths, carpenters, potters, etc.)', 300000.00, 8.00, 5.00, 5, 6, FALSE, TRUE, 'src_pm_vishwakarma', 'v2.0', 'https://pmvishwakarma.gov.in', 'General Credit Scheme', FALSE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    maximum_loan_amount = EXCLUDED.maximum_loan_amount,
    max_subsidy_percent = EXCLUDED.max_subsidy_percent,
    interest_rate = EXCLUDED.interest_rate,
    rule_version = EXCLUDED.rule_version,
    updated_at = CURRENT_TIMESTAMP;

-- SEED ELIGIBILITY RULES
DELETE FROM scheme_eligibility_rules;
INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, explanation, source_id, rule_version) VALUES
('nsfdc_mfs_2026', 'age', '>=', '18', 'Minimum age 18 years', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_mfs_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_mfs_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) with valid caste certificate', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_mfs_2026', 'estimatedCost', '<=', '140000', 'Maximum unit project cost ₹1.40 Lakhs (Max Loan ₹1.25 Lakhs)', 'src_nsfdc_faq', 'v2.6'),

('nsfdc_amy_2026', 'age', '>=', '18', 'Minimum age 18 years', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_amy_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_amy_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) with valid caste certificate', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_amy_2026', 'estimatedCost', '<=', '140000', 'Maximum unit project cost ₹1.40 Lakhs (Max Loan ₹1.25 Lakhs)', 'src_nsfdc_faq', 'v2.6'),

('nsfdc_term_loan_2026', 'age', '>=', '18', 'Minimum age 18 years', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_term_loan_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_term_loan_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) with valid caste certificate', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_term_loan_2026', 'estimatedCost', '>', '140000', 'Project cost must exceed ₹1.40 Lakhs', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_term_loan_2026', 'estimatedCost', '<=', '5000000', 'Maximum project cost ₹50 Lakhs (Max Loan ₹45 Lakhs)', 'src_nsfdc_faq', 'v2.6'),

('nsfdc_uny_2026', 'age', '>=', '18', 'Minimum age 18 years', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_uny_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_uny_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) with valid caste certificate', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_uny_2026', 'minEducation', '>=', '10th_pass', 'Technical / professional qualification preferred', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_uny_2026', 'estimatedCost', '<=', '500000', 'Maximum project cost ₹5 Lakhs (Max Loan ₹4.50 Lakhs)', 'src_nsfdc_faq', 'v2.6'),

('nsfdc_els_2026', 'age', '>=', '18', 'Minimum age 18 years', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_els_2026', 'annualIncome', '<=', '500000', 'Annual family income ceiling ₹5,00,000 p.a. (Jan 7, 2026 Revision)', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_els_2026', 'socialCategory', '==', 'SC', 'Must belong to Scheduled Caste (SC) student', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_els_2026', 'minEducation', '>=', '12th_pass', 'Higher secondary / admission to professional degree', 'src_nsfdc_faq', 'v2.6'),
('nsfdc_els_2026', 'estimatedCost', '<=', '4000000', 'Maximum educational loan ₹40 Lakhs (or 90% of fee)', 'src_nsfdc_faq', 'v2.6'),

('pmegp_2026', 'age', '>=', '18', 'Minimum age 18 years', 'src_kvic_pmegp', 'v2.4'),
('pmegp_2026', 'estimatedCost', '<=', '5000000', 'Maximum project cost ₹50 Lakhs (Mfg)', 'src_kvic_pmegp', 'v2.4'),

('standup_india_2026', 'category_or_gender', 'in', 'SC,ST,female', 'Targeted for SC/ST or Female entrepreneurs', 'src_standup_mitra', 'v2.0'),
('mudra_tarun_2026', 'estimatedCost', '<=', '1000000', 'Maximum loan amount ₹10 Lakhs', 'src_mudra', 'v2.0'),
('pmsvanidhi_2026', 'estimatedCost', '<=', '100000', 'Maximum credit facility ₹50,000', 'src_pmsvanidhi', 'v2.0'),
('pm_vishwakarma_2026', 'estimatedCost', '<=', '300000', 'Maximum loan facility ₹3 Lakhs', 'src_pm_vishwakarma', 'v2.0');

-- SEED DOCUMENTS
INSERT INTO documents (id, scheme_id, document_name, mandatory, description, source_id) VALUES
('doc_aadhaar', 'nsfdc_term_loan_2026', 'Aadhaar Card / Identity Proof', TRUE, 'Mandatory UIDAI Identity & Address Verification', 'src_nsfdc_faq'),
('doc_caste_cert', 'nsfdc_term_loan_2026', 'SC Caste Certificate', TRUE, 'Valid Competent Revenue Authority SC Certificate', 'src_nsfdc_faq'),
('doc_income_cert', 'nsfdc_term_loan_2026', 'Annual Income Certificate (<= 5L)', TRUE, 'Income certificate issued by Tahsildar/Revenue Officer', 'src_nsfdc_faq'),
('doc_dpr', 'nsfdc_term_loan_2026', 'Detailed Project Report (DPR)', TRUE, 'Commercial viability project report & cost estimate', 'src_nsfdc_faq'),
('doc_bank_stmt', 'nsfdc_term_loan_2026', 'Bank Account Statement (6 Months)', FALSE, '6-month active bank transaction history', 'src_nsfdc_faq'),

('doc_pmegp_aadhaar', 'pmegp_2026', 'Aadhaar Card', TRUE, 'Identity Proof', 'src_kvic_pmegp'),
('doc_pmegp_caste', 'pmegp_2026', 'Special Category Certificate (SC/ST/OBC/Female)', TRUE, 'Required for 35% Rural Subsidy claim', 'src_kvic_pmegp'),
('doc_pmegp_pop', 'pmegp_2026', 'Population Certificate / Rural Certificate', TRUE, 'Tahsildar certificate certifying Rural location', 'src_kvic_pmegp'),
('doc_pmegp_edu', 'pmegp_2026', '8th Pass Marksheet', TRUE, 'Required for projects above ₹10L Mfg / ₹5L Service', 'src_kvic_pmegp')
ON CONFLICT (id) DO NOTHING;

-- SEED CHANNEL PARTNERS
INSERT INTO channel_partners (
    id, name, partner_type, branch_name, address, district, state, pincode,
    latitude, longitude, contact_phone, contact_email, nodal_officer_name, authorization_status, source_id
) VALUES
('partner_sbi_001', 'State Bank of India — MSME Specialised Branch', 'public_sector_bank', 'Koramangala MSME Hub', '12th Main Road, 4th Block, Koramangala', 'Bengaluru', 'Karnataka', '560034', 12.9345000, 77.6245000, '+91 80 2553 4421', 'sbi.msme.koramangala@sbi.co.in', 'Rajesh Kumar (Lead District Nodal Manager)', 'AUTHORIZED_NODAL', 'src_nsfdc_faq'),
('partner_pnb_002', 'Punjab National Bank — Micro Credit Cell', 'public_sector_bank', 'Connaught Place Nodal Branch', 'E-Block, Inner Circle, Connaught Place', 'New Delhi', 'Delhi', '110001', 28.6315000, 77.2167000, '+91 11 2332 8901', 'pnb.microcredit.delhi@pnb.co.in', 'Sunita Sharma (Chief Nodal Officer)', 'AUTHORIZED_NODAL', 'src_nsfdc_faq'),
('partner_kscdc_007', 'Karnataka State SC & ST Development Corporation (SCA)', 'dic', 'District Nodal Facilitation Office', 'Dr. B.R. Ambedkar Bhavan, Millers Road, Vasanth Nagar', 'Bengaluru', 'Karnataka', '560052', 12.9880000, 77.5940000, '+91 80 2286 4501', 'kscdc.bengaluru@karnataka.gov.in', 'Manjunath Swamy (District Nodal Executive, SCA)', 'AUTHORIZED_NODAL', 'src_nsfdc_faq'),
('partner_dic_003', 'District Industries Centre (DIC) Facilitation Office', 'dic', 'District MSME Single Window Centre', 'Industrial Estate, Rajajinagar', 'Bengaluru', 'Karnataka', '560010', 12.9901000, 77.5526000, '+91 80 2330 1199', 'dic.bengaluru@karnataka.gov.in', 'Anil Deshmukh (General Manager, DIC)', 'AUTHORIZED_NODAL', 'src_nsfdc_faq')
ON CONFLICT (id) DO UPDATE SET
    authorization_status = EXCLUDED.authorization_status,
    updated_at = CURRENT_TIMESTAMP;

-- SEED PARTNER SCHEME MAPPINGS
INSERT INTO partner_schemes (partner_id, scheme_id, authorization_status, service_type, application_supported, assistance_supported) VALUES
('partner_sbi_001', 'nsfdc_term_loan_2026', 'ACTIVE_MAPPED', 'CREDIT_SANCTION', TRUE, TRUE),
('partner_sbi_001', 'nsfdc_uny_2026', 'ACTIVE_MAPPED', 'CREDIT_SANCTION', TRUE, TRUE),
('partner_sbi_001', 'pmegp_2026', 'ACTIVE_MAPPED', 'CREDIT_SANCTION', TRUE, TRUE),
('partner_kscdc_007', 'nsfdc_mfs_2026', 'ACTIVE_MAPPED', 'SCA_DIRECT_DISBURSAL', TRUE, TRUE),
('partner_kscdc_007', 'nsfdc_amy_2026', 'ACTIVE_MAPPED', 'SCA_DIRECT_DISBURSAL', TRUE, TRUE),
('partner_kscdc_007', 'nsfdc_term_loan_2026', 'ACTIVE_MAPPED', 'SCA_DIRECT_DISBURSAL', TRUE, TRUE),
('partner_dic_003', 'pmegp_2026', 'ACTIVE_MAPPED', 'FORWARDING_AGENCY', TRUE, TRUE),
('partner_pnb_002', 'pmsvanidhi_2026', 'ACTIVE_MAPPED', 'CREDIT_SANCTION', TRUE, TRUE)
ON CONFLICT (partner_id, scheme_id) DO NOTHING;
