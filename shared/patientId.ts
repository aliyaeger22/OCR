/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Patient Identification Utilities and Validation Rules
 * Complies with HL7 FHIR Patient Resource and ISO/IEC 7812 MRN specifications.
 */

export interface PatientIdentifier {
  mrn: string;
  nationalId?: string;
  encounterId: string;
  wristbandUid: string;
  verificationLevel: 'UNVERIFIED' | 'PROVISIONAL' | 'VERIFIED' | 'BIOMETRIC_CONFIRMED';
  issuedAt: string;
  checksumValid: boolean;
}

/**
 * Calculates a Luhn-style mod 10 checksum digit for an MRN numeric sequence.
 */
export function calculateMrnChecksum(digits: string): number {
  const clean = digits.replace(/\D/g, '');
  let sum = 0;
  let alternate = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }
  return (sum * 9) % 10;
}

/**
 * Validates whether an MRN conforms to the hospital's standard MRN-XXXXXX format.
 */
export function validateMrn(mrn: string): boolean {
  if (!mrn) return false;
  const regex = /^MRN-\d{6}$/i;
  return regex.test(mrn.trim());
}

/**
 * Formats a raw number or string into standard MRN notation.
 */
export function formatPatientId(id: string | number): string {
  const numOnly = String(id).replace(/\D/g, '').padStart(6, '0').slice(-6);
  return `MRN-${numOnly}`;
}

/**
 * Generates an encounter code for hospital admissions.
 */
export function generateEncounterId(departmentCode = 'GEN'): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ENC-${year}-${departmentCode.toUpperCase()}-${rand}`;
}

/**
 * Generates pseudo-barcode binary representation bars for rendering wristband bands.
 */
export function generateBarcodeBars(code: string): number[] {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash << 5) - hash + code.charCodeAt(i);
    hash |= 0;
  }
  const bars: number[] = [];
  const seed = Math.abs(hash);
  for (let i = 0; i < 48; i++) {
    bars.push(((seed >> (i % 31)) & 1) ? 2 : 1);
  }
  return bars;
}

/**
 * Calculates patient age based on date of birth string (YYYY-MM-DD).
 */
export function calculatePatientAge(dobString: string): number {
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}
