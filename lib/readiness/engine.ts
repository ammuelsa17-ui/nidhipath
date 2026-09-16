import { Scheme, SchemeDocument, ReadinessResult, BeneficiaryProfile } from '../../types';

/**
 * APPLICATION READINESS ENGINE
 * Computes document readiness score (Ready / Partially Ready / Not Ready)
 * and pinpoints Next Best Actions based on DB statutory document requirements.
 */

export function evaluateApplicationReadiness(
  scheme: Scheme,
  profile: BeneficiaryProfile,
  providedDocumentIds: string[] = []
): ReadinessResult {
  const documents = scheme.documents || [];
  const mandatoryDocs = documents.filter(d => d.mandatory && d.active);

  if (mandatoryDocs.length === 0) {
    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      readinessScore: 100,
      status: 'READY',
      mandatoryDocuments: [],
      missingDocuments: [],
      nextBestAction: `Proceed to submit application directly via official portal (${scheme.applicationUrl}) or authorized channel partner.`
    };
  }

  const missingDocs = mandatoryDocs.filter(d => !providedDocumentIds.includes(d.id));
  const providedMandatoryCount = mandatoryDocs.length - missingDocs.length;

  const score = Math.round((providedMandatoryCount / mandatoryDocs.length) * 100);

  let status: 'READY' | 'PARTIALLY_READY' | 'NOT_READY' = 'NOT_READY';
  if (score === 100) {
    status = 'READY';
  } else if (score >= 50) {
    status = 'PARTIALLY_READY';
  }

  let nextBestAction = '';
  if (status === 'READY') {
    nextBestAction = `All mandatory statutory documents uploaded. Proceed to submit your application online at ${scheme.applicationUrl}.`;
  } else if (missingDocs.length > 0) {
    nextBestAction = `Obtain and upload: ${missingDocs.map(d => d.documentName).join(', ')}.`;
  } else {
    nextBestAction = 'Complete required document verification with Tahsildar / Revenue Authority.';
  }

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    readinessScore: score,
    status,
    mandatoryDocuments: mandatoryDocs,
    missingDocuments: missingDocs,
    nextBestAction
  };
}
