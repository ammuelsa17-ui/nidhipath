import { Scheme, ChannelPartner, SchemeRuleDefinition, SocialCategory, Gender, ProjectCategory, EducationLevel } from '../../types';
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

    // Create scheme_eligibility_rules table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scheme_eligibility_rules (
        id SERIAL PRIMARY KEY,
        scheme_id VARCHAR(64) REFERENCES schemes(id) ON DELETE CASCADE,
        field VARCHAR(64) NOT NULL,
        operator VARCHAR(16) NOT NULL,
        value TEXT NOT NULL,
        description TEXT NOT NULL
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

    // Seed scheme_eligibility_rules if empty
    const rulesCheck = await pool.query('SELECT COUNT(*) FROM scheme_eligibility_rules');
    if (parseInt(rulesCheck.rows[0].count, 10) === 0) {
      for (const s of DEMO_SCHEMES) {
        if (!s.rules) continue;
        const r = s.rules;
        if (r.minAge !== undefined) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'age', '>=', String(r.minAge), `Minimum age ${r.minAge} years`]
          );
        }
        if (r.maxAge !== undefined) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'age', '<=', String(r.maxAge), `Maximum age ${r.maxAge} years`]
          );
        }
        if (r.maxIncome !== undefined) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'annualIncome', '<=', String(r.maxIncome), `Annual family income ceiling ₹${r.maxIncome}`]
          );
        }
        if (r.minProjectCost !== undefined) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'estimatedCost', '>=', String(r.minProjectCost), `Minimum project cost ₹${r.minProjectCost}`]
          );
        }
        if (r.maxProjectCost !== undefined) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'estimatedCost', '<=', String(r.maxProjectCost), `Maximum project cost ₹${r.maxProjectCost}`]
          );
        }
        if (r.allowedCategories && r.allowedCategories.length > 0) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'socialCategory', 'in', r.allowedCategories.join(','), `Allowed social categories: ${r.allowedCategories.join(', ')}`]
          );
        }
        if (r.allowedGenders && r.allowedGenders.length > 0) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'allowedGenders', 'in', r.allowedGenders.join(','), `Allowed genders: ${r.allowedGenders.join(', ')}`]
          );
        }
        if (r.allowedProjectTypes && r.allowedProjectTypes.length > 0) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'allowedProjectTypes', 'in', r.allowedProjectTypes.join(','), `Allowed project types: ${r.allowedProjectTypes.join(', ')}`]
          );
        }
        if (r.minEducation) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'minEducation', '>=', r.minEducation, `Minimum education: ${r.minEducation}`]
          );
        }
        if (r.requiresFirstGeneration !== undefined) {
          await pool.query(
            `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, description) VALUES ($1, $2, $3, $4, $5)`,
            [s.id, 'requiresFirstGeneration', '==', String(r.requiresFirstGeneration), `First generation entrepreneur required: ${r.requiresFirstGeneration}`]
          );
        }
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

function reconstructSchemeRules(
  schemeId: string,
  ruleRows?: any[]
): SchemeRuleDefinition {
  const staticFallback = DEMO_SCHEMES.find(s => s.id === schemeId)?.rules || {};

  // If there are zero DB rule rows for this scheme, use complete static fallback
  if (!ruleRows || ruleRows.length === 0) {
    return staticFallback;
  }

  const dbRules: SchemeRuleDefinition = {};
  const seenFieldValues: Record<string, string> = {};
  let isDbValid = true;
  let validationError = '';

  for (const r of ruleRows) {
    const rawField = String(r.field || '').trim();
    const rawOp = String(r.operator || '').trim();
    const rawVal = String(r.value || '').trim();

    if (!rawField || !rawOp) continue;

    // Determine logical key for duplicate checking
    let logicalKey = rawField;
    if (rawField === 'age') {
      logicalKey = (rawOp === '>=' || rawOp === '>') ? 'minAge' : 'maxAge';
    } else if (rawField === 'estimatedCost' || rawField === 'projectCost') {
      logicalKey = (rawOp === '>=' || rawOp === '>') ? 'minProjectCost' : 'maxProjectCost';
    } else if (rawField === 'annualIncome' || rawField === 'maxIncome') {
      logicalKey = 'maxIncome';
    }

    // Check duplicate logical key
    if (seenFieldValues[logicalKey] !== undefined) {
      if (seenFieldValues[logicalKey] !== rawVal) {
        isDbValid = false;
        validationError = `Conflicting duplicate rule for field '${logicalKey}': '${seenFieldValues[logicalKey]}' vs '${rawVal}'`;
        break;
      }
      // Identical duplicate row, safe to skip duplicate assignment
      continue;
    }
    seenFieldValues[logicalKey] = rawVal;

    // Parse and validate field values
    if (rawField === 'age') {
      const numVal = Number(rawVal);
      if (rawVal === '' || isNaN(numVal) || !isFinite(numVal) || numVal < 0) {
        isDbValid = false;
        validationError = `Invalid numeric value '${rawVal}' for age rule`;
        break;
      }
      if (rawOp === '>=' || rawOp === '>') dbRules.minAge = numVal;
      else if (rawOp === '<=' || rawOp === '<') dbRules.maxAge = numVal;
    } else if (rawField === 'annualIncome' || rawField === 'maxIncome') {
      const numVal = Number(rawVal);
      if (rawVal === '' || isNaN(numVal) || !isFinite(numVal) || numVal <= 0) {
        isDbValid = false;
        validationError = `Invalid numeric value '${rawVal}' for annualIncome rule`;
        break;
      }
      dbRules.maxIncome = numVal;
    } else if (rawField === 'estimatedCost' || rawField === 'projectCost') {
      const numVal = Number(rawVal);
      if (rawVal === '' || isNaN(numVal) || !isFinite(numVal) || numVal <= 0) {
        isDbValid = false;
        validationError = `Invalid numeric value '${rawVal}' for estimatedCost rule`;
        break;
      }
      if (rawOp === '>=' || rawOp === '>') dbRules.minProjectCost = numVal;
      else if (rawOp === '<=' || rawOp === '<') dbRules.maxProjectCost = numVal;
    } else if (rawField === 'socialCategory' || rawField === 'allowedCategories') {
      const cats = rawVal.split(',').map(s => s.trim()).filter(Boolean);
      if (cats.length === 0) {
        isDbValid = false;
        validationError = `Empty category array for socialCategory rule`;
        break;
      }
      dbRules.allowedCategories = cats as SocialCategory[];
    } else if (rawField === 'allowedGenders' || rawField === 'gender') {
      const genders = rawVal.split(',').map(s => s.trim()).filter(Boolean);
      if (genders.length === 0) {
        isDbValid = false;
        validationError = `Empty gender array for allowedGenders rule`;
        break;
      }
      dbRules.allowedGenders = genders as Gender[];
    } else if (rawField === 'category_or_gender') {
      const items = rawVal.split(',').map(s => s.trim()).filter(Boolean);
      if (items.length === 0) {
        isDbValid = false;
        validationError = `Empty array for category_or_gender rule`;
        break;
      }
      const cats: SocialCategory[] = [];
      const genders: Gender[] = [];
      for (const item of items) {
        if (['SC', 'ST', 'OBC', 'GENERAL', 'MINORITY', 'EX_SERVICEMAN'].includes(item)) {
          cats.push(item as SocialCategory);
        } else if (['female', 'male', 'transgender', 'any'].includes(item)) {
          genders.push(item as Gender);
        }
      }
      if (cats.length > 0) dbRules.allowedCategories = cats;
      if (genders.length > 0) dbRules.allowedGenders = genders;
    } else if (rawField === 'allowedProjectTypes' || rawField === 'projectType') {
      const ptypes = rawVal.split(',').map(s => s.trim()).filter(Boolean);
      if (ptypes.length === 0) {
        isDbValid = false;
        validationError = `Empty project types array for allowedProjectTypes rule`;
        break;
      }
      dbRules.allowedProjectTypes = ptypes as ProjectCategory[];
    } else if (rawField === 'minEducation' || rawField === 'education') {
      const validEduLevels = ['illiterate', 'below_8th', '8th_pass', '10th_pass', '12th_pass', 'diploma', 'graduate', 'post_graduate'];
      if (!validEduLevels.includes(rawVal)) {
        isDbValid = false;
        validationError = `Invalid education level '${rawVal}' for minEducation rule`;
        break;
      }
      dbRules.minEducation = rawVal as EducationLevel;
    } else if (rawField === 'locationRestriction') {
      if (!['urban', 'rural', 'both'].includes(rawVal)) {
        isDbValid = false;
        validationError = `Invalid location restriction '${rawVal}'`;
        break;
      }
      dbRules.locationRestriction = rawVal as 'urban' | 'rural' | 'both';
    } else if (rawField === 'requiresFirstGeneration') {
      const lower = rawVal.toLowerCase();
      if (lower !== 'true' && lower !== 'false') {
        isDbValid = false;
        validationError = `Invalid boolean string '${rawVal}' for requiresFirstGeneration rule`;
        break;
      }
      dbRules.requiresFirstGeneration = (lower === 'true');
    }
  }

  if (!isDbValid) {
    console.warn(`[NidhiPath DB Safety] DB rules for scheme '${schemeId}' invalid (${validationError}). Falling back to complete DEMO_SCHEMES rules.`);
    return staticFallback;
  }

  // Pure DB rules object - NO MERGE with staticFallback!
  return dbRules;
}

export async function fetchSchemesFromCloudDB(): Promise<Scheme[]> {
  const dbUrl = typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined;

  if (dbUrl) {
    try {
      const pool = await getPgPool(dbUrl);
      if (!pool) return DEMO_SCHEMES;

      await ensureTablesAndSeed(pool);

      const schemesRes = await pool.query('SELECT * FROM schemes ORDER BY id');
      let rulesRes: any = null;
      try {
        rulesRes = await pool.query('SELECT * FROM scheme_eligibility_rules ORDER BY id ASC');
      } catch (e) {
        console.warn('Could not query scheme_eligibility_rules, using default rules fallback:', e);
      }
      await pool.end();

      const rulesBySchemeId: Record<string, any[]> = {};
      if (rulesRes && rulesRes.rows) {
        for (const rRow of rulesRes.rows) {
          if (!rulesBySchemeId[rRow.scheme_id]) {
            rulesBySchemeId[rRow.scheme_id] = [];
          }
          rulesBySchemeId[rRow.scheme_id].push(rRow);
        }
      }

      if (schemesRes.rows && schemesRes.rows.length > 0) {
        return schemesRes.rows.map((row: any) => {
          const demoRef = DEMO_SCHEMES.find(s => s.id === row.id);
          return {
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
            rules: reconstructSchemeRules(row.id, rulesBySchemeId[row.id]),
            isNsfdcScheme: demoRef?.isNsfdcScheme ?? row.id.startsWith('nsfdc_'),
            categoryTag: demoRef?.categoryTag ?? (row.id.startsWith('nsfdc_') ? 'NSFDC Primary Scheme' : 'General Credit Scheme'),
            officialSourceUrl: row.source_url,
            sourceName: row.source_name || demoRef?.sourceName || 'NSFDC Official FAQ',
            sourceEffectiveDate: row.source_effective_date || demoRef?.sourceEffectiveDate || '2026-01-07',
            lastVerifiedDate: row.verification_date,
            isPrototypeData: true
          };
        });
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


