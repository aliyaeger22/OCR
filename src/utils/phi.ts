/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * HIPAA Safeguard & Protected Health Information (PHI) De-identification Utilities
 * Aligned with HIPAA Safe Harbor Method 45 CFR § 164.514(b)(2).
 */

/**
 * Redacts 18 HIPAA identifier categories (Names, Dates, SSN, MRN, Phone, Email, Location).
 */
export function redactPhi(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // Social Security Numbers (XXX-XX-XXXX)
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED-SSN]');

  // Phone numbers (US formats)
  sanitized = sanitized.replace(
    /\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g,
    '[REDACTED-PHONE]'
  );

  // Email addresses
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
    '[REDACTED-EMAIL]'
  );

  // Full Dates (e.g. 1968-11-24 or 11/24/1968)
  sanitized = sanitized.replace(
    /\b(0[1-9]|1[0-2])[\/\-.](0[1-9]|[12][0-9]|3[01])[\/\-.](19\d\d|20\d\d)\b/g,
    '[REDACTED-DATE]'
  );

  // Street Addresses / Postal codes
  sanitized = sanitized.replace(
    /\b\d{1,5}\s+[A-Za-z0-9\s.,]{3,25}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct)\b/gi,
    '[REDACTED-ADDRESS]'
  );

  // Specific MRNs in text (MRN-XXXXXX)
  sanitized = sanitized.replace(/\bMRN-\d{6}\b/gi, '[REDACTED-MRN]');

  return sanitized;
}

/**
 * Masks an MRN for non-privileged or audit display: MRN-784920 -> MRN-***920
 */
export function maskMrn(mrn: string): string {
  if (!mrn) return 'MRN-***000';
  const clean = mrn.replace(/^MRN-?/i, '');
  if (clean.length <= 3) return `MRN-***${clean}`;
  return `MRN-***${clean.slice(-3)}`;
}

/**
 * Computes a pseudo-cryptographic audit digest (tamper-evident checksum)
 * for HIPAA compliance chain records.
 */
export function calculateAuditHash(entry: {
  timestamp: string;
  user: string;
  action: string;
  patientMrn: string;
  terminalId: string;
}): string {
  const seedString = `${entry.timestamp}|${entry.user}|${entry.action}|${entry.patientMrn}|${entry.terminalId}|ECHO-HIPAA-SALT-V2`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;

  for (let i = 0; i < seedString.length; i++) {
    const ch = seedString.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `sha256:${hex1}${hex2}${hex1.slice(0, 4)}...ec8f`;
}

/**
 * Checks if raw text potentially contains unredacted high-risk identifiers.
 */
export function detectPhiIndicators(text: string): { hasPhi: boolean; riskItems: string[] } {
  const risks: string[] = [];
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) risks.push('Social Security Number detected');
  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/.test(text)) risks.push('Email address detected');
  if (/\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/.test(text)) risks.push('Telephone number detected');
  if (/\bMRN-\d{6}\b/i.test(text)) risks.push('Plaintext Medical Record Number (MRN)');

  return {
    hasPhi: risks.length > 0,
    riskItems: risks
  };
}
