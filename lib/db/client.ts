import { Scheme, ChannelPartner } from '../../types';
import { DEMO_SCHEMES } from '../../data/schemes';
import { DEMO_PARTNERS } from '../../data/partners';

/**
 * CLOUD POSTGRESQL DATA ACCESS LAYER
 * Connects to process.env.DATABASE_URL in production server environments.
 * Credentials are NEVER exposed to the frontend.
 */

export async function fetchSchemesFromCloudDB(): Promise<Scheme[]> {
  const dbUrl = typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined;

  if (dbUrl) {
    try {
      // In production with DATABASE_URL, query PostgreSQL instance
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
      const res = await pool.query('SELECT * FROM schemes ORDER BY id');
      await pool.end();
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(row => ({
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
      console.warn('PostgreSQL fetch error, falling back to verified dataset:', err);
    }
  }

  // Pure fallback to verified structured dataset
  return DEMO_SCHEMES;
}

export async function fetchPartnersFromCloudDB(): Promise<ChannelPartner[]> {
  const dbUrl = typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined;

  if (dbUrl) {
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
      const res = await pool.query('SELECT * FROM channel_partners ORDER BY id');
      await pool.end();
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(row => ({
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
      console.warn('PostgreSQL partner fetch error, falling back to verified dataset:', err);
    }
  }

  return DEMO_PARTNERS;
}
