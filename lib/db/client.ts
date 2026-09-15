import { Scheme, ChannelPartner } from '../../types';
import { DEMO_SCHEMES } from '../../data/schemes';
import { DEMO_PARTNERS } from '../../data/partners';

/**
 * CLOUD POSTGRESQL (SUPABASE) DATA ACCESS LAYER
 * Connects to process.env.DATABASE_URL in production server environments.
 * Credentials are NEVER exposed to the frontend/browser.
 */

// Helper to get pg Pool with SSL configuration for Supabase / Cloud Postgres
async function getPgPool(dbUrl: string) {
  try {
    const mod = 'pg';
    const { Pool } = await import(mod);
    return new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
  } catch (err) {
    console.warn('pg module import notice:', err);
    return null;
  }
}

// Ensures Supabase PostgreSQL tables exist and are seeded with initial records if empty
async function ensureTablesAndSeed(pool: any) {
  try {
    // Create schemes table
    await pool.query(`
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
    `);

    // Create channel_partners table
    await pool.query(`
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
    `);

    // Seed schemes if empty
    const schemeCheck = await pool.query('SELECT COUNT(*) FROM schemes');
    if (parseInt(schemeCheck.rows[0].count, 10) === 0) {
      for (const s of DEMO_SCHEMES) {
        await pool.query(
          `INSERT INTO schemes (id, code, name, short_name, ministry, description, target_audience, maximum_loan_amount, max_subsidy_percent, interest_rate, maximum_tenure, moratorium, collateral_required, source_url, verification_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [
            s.id,
            s.code,
            s.name,
            s.shortName,
            s.ministry,
            s.description,
            s.targetAudience,
            s.maxLoanAmount,
            s.maxSubsidyPercent,
            s.interestRate,
            s.maxTenureYears,
            s.moratoriumMonths,
            s.collateralRequired,
            s.officialSourceUrl,
            s.lastVerifiedDate || '2026-03-01'
          ]
        );
      }
    }

    // Seed partners if empty
    const partnerCheck = await pool.query('SELECT COUNT(*) FROM channel_partners');
    if (parseInt(partnerCheck.rows[0].count, 10) === 0) {
      for (const p of DEMO_PARTNERS) {
        await pool.query(
          `INSERT INTO channel_partners (id, name, partner_type, branch_name, address, district, state, pincode, latitude, longitude, contact_phone, contact_email, nodal_officer_name, source_url, verification_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.name,
            p.type,
            p.branchName,
            p.address,
            p.city,
            p.state,
            p.pinCode,
            p.latitude,
            p.longitude,
            p.contactPhone,
            p.contactEmail,
            p.nodalOfficerName || null,
            'https://dge.gov.in',
            '2026-03-01'
          ]
        );
      }
    }
  } catch (err) {
    console.warn('Supabase DB auto-schema/seed check warning:', err);
  }
}

export async function fetchSchemesFromCloudDB(): Promise<Scheme[]> {
  const dbUrl = typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined;

  if (dbUrl) {
    try {
      const pool = await getPgPool(dbUrl);
      if (!pool) return DEMO_SCHEMES;

      await ensureTablesAndSeed(pool);
      const res = await pool.query('SELECT * FROM schemes ORDER BY id');
      await pool.end();

      if (res.rows && res.rows.length > 0) {
        return res.rows.map((row: any) => ({
          id: row.id,
          code: row.code,
          name: row.name,
          shortName: row.short_name,
          ministry: row.ministry,
          description: row.description,
          targetAudience: row.target_audience,
          maxLoanAmount: Number(row.maximum_loan_amount),
          maxSubsidyPercent: Number(row.max_subsidy_percent),
          interestRate: Number(row.interest_rate),
          maxTenureYears: Number(row.maximum_tenure),
          moratoriumMonths: Number(row.moratorium),
          collateralRequired: Boolean(row.collateral_required),
          rules: DEMO_SCHEMES.find(s => s.id === row.id)?.rules || {},
          officialSourceUrl: row.source_url,
          lastVerifiedDate: row.verification_date,
          isPrototypeData: true
        }));
      }
    } catch (err) {
      console.warn('Supabase PostgreSQL fetch error, falling back to verified dataset:', err);
    }
  }

  // Fallback to verified structured dataset
  return DEMO_SCHEMES;
}

export async function fetchPartnersFromCloudDB(): Promise<ChannelPartner[]> {
  const dbUrl = typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined;

  if (dbUrl) {
    try {
      const pool = await getPgPool(dbUrl);
      if (!pool) return DEMO_PARTNERS;

      await ensureTablesAndSeed(pool);
      const res = await pool.query('SELECT * FROM channel_partners ORDER BY id');
      await pool.end();

      if (res.rows && res.rows.length > 0) {
        return res.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          type: row.partner_type,
          branchName: row.branch_name,
          address: row.address,
          city: row.district,
          state: row.state,
          pinCode: row.pincode,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          contactPhone: row.contact_phone,
          contactEmail: row.contact_email,
          nodalOfficerName: row.nodal_officer_name,
          supportedSchemeIds: DEMO_PARTNERS.find(p => p.id === row.id)?.supportedSchemeIds || [],
          isDemoData: true
        }));
      }
    } catch (err) {
      console.warn('Supabase PostgreSQL partner fetch error, falling back to verified dataset:', err);
    }
  }

  return DEMO_PARTNERS;
}

