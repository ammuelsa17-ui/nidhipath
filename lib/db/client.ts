import { Pool } from 'pg';
import {
  Scheme,
  ChannelPartner,
  SchemeRuleDefinition,
  SocialCategory,
  Gender,
  ProjectCategory,
  EducationLevel,
  SchemeDocument,
  SchemeSource,
  RuleVersion,
  DecisionLogTrace,
  DBEligibilityRule
} from '../../types';

/**
 * PURE CLOUD POSTGRESQL DATA ACCESS LAYER
 * Sole Authoritative Source of Truth: PostgreSQL/Supabase.
 * ZERO STATIC IN-MEMORY FALLBACK IN RUNTIME ENGINE CALLS.
 * If DATABASE_URL is missing or fails to connect, throws explicit DatabaseConnectionError.
 */

export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

function cleanConnectionString(raw?: string): string {
  if (!raw) return '';
  let str = raw.trim();
  if (str.startsWith('DATABASE_URL=')) str = str.substring('DATABASE_URL='.length).trim();
  if (str.startsWith('POSTGRES_URL=')) str = str.substring('POSTGRES_URL='.length).trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  str = str.replace(/^\[+|\]+$/g, '').trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  if (!str.startsWith('postgres://') && !str.startsWith('postgresql://')) {
    str = 'postgresql://' + str.replace(/^[a-zA-Z0-9_-]+:\/\//, '');
  }

  try {
    new URL(str);
    return str;
  } catch (e) {
    try {
      const match = str.match(/^(postgresql:\/\/|postgres:\/\/)([^:]+):(.*)@([^/]+)(.*)$/);
      if (match) {
        const [, proto, user, pass, hostPort, rest] = match;
        const safePass = encodeURIComponent(decodeURIComponent(pass));
        const repaired = `${proto}${user}:${safePass}@${hostPort}${rest}`;
        new URL(repaired);
        return repaired;
      }
    } catch (e2) {
      // Return str best effort
    }
  }
  return str;
}

function getMaskedUrl(urlStr: string): string {
  if (!urlStr) return 'EMPTY';
  try {
    return urlStr.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***MASKED***@');
  } catch (e) {
    return urlStr.substring(0, 15) + '...';
  }
}

async function getPgPool() {
  const rawUrl = typeof process !== 'undefined' ? (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || process.env.NEXT_PUBLIC_DATABASE_URL) : undefined;
  
  if (rawUrl && (rawUrl.includes('YOUR-PASSWORD') || rawUrl.includes('YOUR_PASSWORD') || rawUrl.includes('<password>') || rawUrl.includes('[password]'))) {
    throw new DatabaseConnectionError(`DATABASE_URL contains unreplaced placeholder '[YOUR-PASSWORD]'. Please replace '[YOUR-PASSWORD]' in Vercel Environment Settings with your actual Supabase database password.`);
  }

  const dbUrl = cleanConnectionString(rawUrl);
  if (!dbUrl) {
    throw new DatabaseConnectionError(`DATABASE_URL environment variable is missing or empty. PostgreSQL database connection required.`);
  }

  try {
    return new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
  } catch (err: any) {
    throw new DatabaseConnectionError(`Failed to initialize PostgreSQL pool (maskedUrl="${getMaskedUrl(dbUrl)}"): ${err?.message || err}`);
  }
}

/**
 * Reconstructs SchemeRuleDefinition object from database eligibility rules rows
 */

function reconstructSchemeRules(
  schemeId: string,
  ruleRows?: any[]
): SchemeRuleDefinition {
  if (!ruleRows || ruleRows.length === 0) {
    return {};
  }

  const dbRules: SchemeRuleDefinition = {};

  for (const r of ruleRows) {
    const rawField = String(r.field || '').trim();
    const rawOp = String(r.operator || '').trim();
    const rawVal = String(r.value || '').trim();

    if (!rawField || !rawOp) continue;

    if (rawField === 'age') {
      const numVal = Number(rawVal);
      if (!isNaN(numVal) && isFinite(numVal)) {
        if (rawOp === '>=' || rawOp === '>') dbRules.minAge = numVal;
        else if (rawOp === '<=' || rawOp === '<') dbRules.maxAge = numVal;
      }
    } else if (rawField === 'annualIncome' || rawField === 'maxIncome') {
      const numVal = Number(rawVal);
      if (!isNaN(numVal) && isFinite(numVal)) {
        dbRules.maxIncome = numVal;
      }
    } else if (rawField === 'estimatedCost' || rawField === 'projectCost') {
      const numVal = Number(rawVal);
      if (!isNaN(numVal) && isFinite(numVal)) {
        if (rawOp === '>=' || rawOp === '>') dbRules.minProjectCost = numVal;
        else if (rawOp === '<=' || rawOp === '<') dbRules.maxProjectCost = numVal;
      }
    } else if (rawField === 'socialCategory' || rawField === 'allowedCategories') {
      const cats = rawVal.split(',').map(s => s.trim()).filter(Boolean);
      if (cats.length > 0) dbRules.allowedCategories = cats as SocialCategory[];
    } else if (rawField === 'allowedGenders' || rawField === 'gender') {
      const genders = rawVal.split(',').map(s => s.trim()).filter(Boolean);
      if (genders.length > 0) dbRules.allowedGenders = genders as Gender[];
    } else if (rawField === 'category_or_gender') {
      const items = rawVal.split(',').map(s => s.trim()).filter(Boolean);
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
      if (ptypes.length > 0) dbRules.allowedProjectTypes = ptypes as ProjectCategory[];
    } else if (rawField === 'minEducation' || rawField === 'education') {
      dbRules.minEducation = rawVal as EducationLevel;
    } else if (rawField === 'locationRestriction') {
      dbRules.locationRestriction = rawVal as 'urban' | 'rural' | 'both';
    } else if (rawField === 'requiresFirstGeneration') {
      dbRules.requiresFirstGeneration = (rawVal.toLowerCase() === 'true');
    }
  }

  return dbRules;
}

export async function fetchSchemesFromCloudDB(): Promise<Scheme[]> {
  const pool = await getPgPool();
  try {
    const schemesRes = await pool.query(`
      SELECT s.*, src.source_name, src.source_url, src.source_effective_date, src.last_verified_at
      FROM schemes s
      LEFT JOIN sources src ON s.source_id = src.id
      WHERE s.active = TRUE
      ORDER BY s.id
    `);

    const rulesRes = await pool.query(`
      SELECT * FROM scheme_eligibility_rules WHERE active = TRUE ORDER BY scheme_id, priority ASC
    `);

    const docsRes = await pool.query(`
      SELECT * FROM documents WHERE active = TRUE ORDER BY scheme_id
    `);

    const rulesBySchemeId: Record<string, any[]> = {};
    for (const rRow of rulesRes.rows) {
      if (!rulesBySchemeId[rRow.scheme_id]) rulesBySchemeId[rRow.scheme_id] = [];
      rulesBySchemeId[rRow.scheme_id].push(rRow);
    }

    const docsBySchemeId: Record<string, SchemeDocument[]> = {};
    for (const dRow of docsRes.rows) {
      if (!docsBySchemeId[dRow.scheme_id]) docsBySchemeId[dRow.scheme_id] = [];
      docsBySchemeId[dRow.scheme_id].push({
        id: dRow.id,
        schemeId: dRow.scheme_id,
        documentName: dRow.document_name,
        mandatory: Boolean(dRow.mandatory),
        description: dRow.description,
        sourceId: dRow.source_id,
        active: Boolean(dRow.active)
      });
    }

    return schemesRes.rows.map((row: any) => ({
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
      active: Boolean(row.active),
      applicationUrl: row.application_url || 'https://nsfdc.nic.in/faqs',
      isVerifiedApplicationPortal: Boolean(row.is_verified_application_portal) || ['PMEGP', 'STANDUP_INDIA', 'PMSVANIDHI', 'PM_VISHWAKARMA'].includes(row.code),
      sourceId: row.source_id,
      ruleVersion: row.rule_version || 'v2.6',
      rules: reconstructSchemeRules(row.id, rulesBySchemeId[row.id]),
      dbRules: (rulesBySchemeId[row.id] || []).map((r: any) => ({
        id: r.id,
        schemeId: r.scheme_id,
        field: r.field,
        operator: r.operator,
        value: r.value,
        ruleGroup: r.rule_group,
        priority: r.priority,
        explanation: r.explanation,
        sourceId: r.source_id,
        ruleVersion: r.rule_version,
        active: Boolean(r.active)
      })),
      documents: docsBySchemeId[row.id] || [],
      isNsfdcScheme: row.is_nsfdc_scheme ?? row.id.startsWith('nsfdc_'),
      categoryTag: row.category_tag || (row.id.startsWith('nsfdc_') ? 'NSFDC Primary Scheme' : 'General Credit Scheme'),
      officialSourceUrl: row.source_url || row.application_url || 'https://nsfdc.nic.in/faqs',
      sourceName: row.source_name || 'NSFDC Official FAQ',
      sourceEffectiveDate: row.source_effective_date || '2026-01-07',
      lastVerifiedDate: row.last_verified_at || '2026-03-01'
    }));
  } catch (err: any) {
    if (err instanceof DatabaseConnectionError) throw err;
    const rawUrl = typeof process !== 'undefined' ? (process.env.DATABASE_URL || process.env.POSTGRES_URL || '') : '';
    throw new DatabaseConnectionError(`PostgreSQL Query Failure (maskedUrl="${getMaskedUrl(rawUrl)}"): ${err?.message || err}`);
  } finally {
    await pool.end();
  }
}

export async function fetchSchemeByIdFromCloudDB(id: string): Promise<Scheme | null> {
  const schemes = await fetchSchemesFromCloudDB();
  return schemes.find(s => s.id === id || s.code === id) || null;
}

export async function fetchDocumentsFromCloudDB(schemeId: string): Promise<SchemeDocument[]> {
  const pool = await getPgPool();
  try {
    const res = await pool.query('SELECT * FROM documents WHERE scheme_id = $1 AND active = TRUE ORDER BY mandatory DESC', [schemeId]);
    return res.rows.map((row: any) => ({
      id: row.id,
      schemeId: row.scheme_id,
      documentName: row.document_name,
      mandatory: Boolean(row.mandatory),
      description: row.description,
      sourceId: row.source_id,
      active: Boolean(row.active)
    }));
  } finally {
    await pool.end();
  }
}

export async function fetchPartnersFromCloudDB(selectedSchemeId?: string): Promise<ChannelPartner[]> {
  const pool = await getPgPool();
  try {
    const partnersRes = await pool.query('SELECT * FROM channel_partners WHERE active = TRUE ORDER BY id');
    const mappingsRes = await pool.query('SELECT * FROM partner_schemes WHERE active = TRUE');

    const mappingsByPartnerId: Record<string, string[]> = {};
    for (const m of mappingsRes.rows) {
      if (!mappingsByPartnerId[m.partner_id]) mappingsByPartnerId[m.partner_id] = [];
      mappingsByPartnerId[m.partner_id].push(m.scheme_id);
    }

    return partnersRes.rows.map((row: any) => ({
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
      supportedSchemeIds: mappingsByPartnerId[row.id] || [],
      authorizationStatus: row.authorization_status || 'AUTHORIZED_NODAL',
      active: Boolean(row.active)
    }));
  } finally {
    await pool.end();
  }
}

export async function fetchSourcesFromCloudDB(): Promise<SchemeSource[]> {
  const pool = await getPgPool();
  try {
    const res = await pool.query('SELECT * FROM sources ORDER BY id');
    return res.rows.map((r: any) => ({
      id: r.id,
      sourceName: r.source_name,
      sourceUrl: r.source_url,
      sourceType: r.source_type,
      sourceEffectiveDate: r.source_effective_date,
      lastVerifiedAt: r.last_verified_at,
      verificationStatus: r.verification_status,
      notes: r.notes
    }));
  } finally {
    await pool.end();
  }
}

export async function fetchRuleVersionsFromCloudDB(): Promise<RuleVersion[]> {
  const pool = await getPgPool();
  try {
    const res = await pool.query('SELECT * FROM rule_versions ORDER BY id DESC');
    return res.rows.map((r: any) => ({
      id: r.id,
      schemeId: r.scheme_id,
      version: r.version,
      effectiveFrom: r.effective_from,
      effectiveTo: r.effective_to,
      changeSummary: r.change_summary,
      publishedBy: r.published_by,
      status: r.status
    }));
  } finally {
    await pool.end();
  }
}

export async function logDecisionTraceToDB(trace: DecisionLogTrace): Promise<void> {
  const pool = await getPgPool();
  try {
    await pool.query(
      `INSERT INTO decision_logs (id, session_id, beneficiary_profile, evaluated_schemes, selected_scheme, score_breakdown, rules_triggered, source_versions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        trace.id,
        trace.sessionId,
        JSON.stringify(trace.beneficiaryProfile),
        JSON.stringify(trace.evaluatedSchemes),
        trace.selectedScheme || null,
        JSON.stringify(trace.scoreBreakdown || {}),
        JSON.stringify(trace.rulesTriggered),
        JSON.stringify(trace.sourceVersions)
      ]
    );
  } finally {
    await pool.end();
  }
}

export async function fetchDecisionTraceFromDB(id: string): Promise<DecisionLogTrace | null> {
  const pool = await getPgPool();
  try {
    const res = await pool.query('SELECT * FROM decision_logs WHERE id = $1 OR session_id = $1 LIMIT 1', [id]);
    if (!res.rows || res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      sessionId: r.session_id,
      beneficiaryProfile: r.beneficiary_profile,
      evaluatedSchemes: r.evaluated_schemes,
      selectedScheme: r.selected_scheme,
      scoreBreakdown: r.score_breakdown,
      rulesTriggered: r.rules_triggered,
      sourceVersions: r.source_versions,
      createdAt: String(r.created_at)
    };
  } finally {
    await pool.end();
  }
}

// ADMIN MUTATION APIS
export async function upsertSchemeInDB(scheme: Partial<Scheme>): Promise<void> {
  const pool = await getPgPool();
  try {
    await pool.query(
      `INSERT INTO schemes (id, code, name, short_name, ministry, description, target_audience, maximum_loan_amount, max_subsidy_percent, interest_rate, maximum_tenure, moratorium, collateral_required, active, application_url, rule_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         short_name = EXCLUDED.short_name,
         maximum_loan_amount = EXCLUDED.maximum_loan_amount,
         max_subsidy_percent = EXCLUDED.max_subsidy_percent,
         interest_rate = EXCLUDED.interest_rate,
         active = EXCLUDED.active,
         rule_version = EXCLUDED.rule_version,
         updated_at = CURRENT_TIMESTAMP`,
      [
        scheme.id,
        scheme.code,
        scheme.name,
        scheme.shortName || scheme.name,
        scheme.ministry,
        scheme.description,
        scheme.targetAudience || 'General Target',
        scheme.maxLoanAmount,
        scheme.maxSubsidyPercent || 0,
        scheme.interestRate,
        scheme.maxTenureYears || 5,
        scheme.moratoriumMonths || 3,
        scheme.collateralRequired ?? false,
        scheme.active ?? true,
        scheme.applicationUrl || 'https://nsfdc.nic.in/faqs',
        scheme.ruleVersion || 'v2.6'
      ]
    );
  } finally {
    await pool.end();
  }
}

export async function upsertRuleInDB(rule: Partial<DBEligibilityRule>): Promise<void> {
  const pool = await getPgPool();
  try {
    if (rule.id) {
      await pool.query(
        `UPDATE scheme_eligibility_rules SET field = $1, operator = $2, value = $3, explanation = $4, active = $5 WHERE id = $6`,
        [rule.field, rule.operator, rule.value, rule.explanation, rule.active ?? true, rule.id]
      );
    } else {
      await pool.query(
        `INSERT INTO scheme_eligibility_rules (scheme_id, field, operator, value, explanation, active) VALUES ($1, $2, $3, $4, $5, $6)`,
        [rule.schemeId, rule.field, rule.operator, rule.value, rule.explanation, rule.active ?? true]
      );
    }
  } finally {
    await pool.end();
  }
}

export async function upsertPartnerInDB(partner: Partial<ChannelPartner>): Promise<void> {
  const pool = await getPgPool();
  try {
    await pool.query(
      `INSERT INTO channel_partners (id, name, partner_type, branch_name, address, district, state, pincode, latitude, longitude, contact_phone, contact_email, authorization_status, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         branch_name = EXCLUDED.branch_name,
         authorization_status = EXCLUDED.authorization_status,
         active = EXCLUDED.active,
         updated_at = CURRENT_TIMESTAMP`,
      [
        partner.id,
        partner.name,
        partner.type,
        partner.branchName,
        partner.address,
        partner.city,
        partner.state,
        partner.pinCode,
        partner.latitude,
        partner.longitude,
        partner.contactPhone,
        partner.contactEmail,
        partner.authorizationStatus || 'AUTHORIZED_NODAL',
        partner.active ?? true
      ]
    );
  } finally {
    await pool.end();
  }
}
