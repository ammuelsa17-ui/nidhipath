-- NidhiPath Cloud PostgreSQL Schema Definition

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

CREATE TABLE IF NOT EXISTS scheme_eligibility_rules (
    id SERIAL PRIMARY KEY,
    scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
    field VARCHAR(64) NOT NULL,
    operator VARCHAR(16) NOT NULL,
    value TEXT NOT NULL,
    description TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS partner_schemes (
    partner_id VARCHAR(64) REFERENCES channel_partners(id) ON DELETE CASCADE,
    scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
    PRIMARY KEY (partner_id, scheme_id)
);
