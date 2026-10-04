/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Allergy {
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Anaphylactic';
  reaction: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  status: 'Active' | 'Held' | 'Discontinued';
  prescribedBy: string;
  indications?: string;
}

export interface Diagnosis {
  code: string; // ICD-10 e.g. "I50.9"
  description: string;
  type: 'Primary' | 'Secondary' | 'Chronic';
  dateAdded: string;
}

export interface VitalSignPoint {
  time: string;
  hr: number;
  bpSys: number;
  bpDia: number;
  spo2: number;
  rr: number;
  temp: number;
}

export interface Vitals {
  heartRate: number;
  bloodPressure: string; // "128/82"
  respiratoryRate: number;
  temperature: number; // Celsius (e.g. 37.2)
  spO2: number;
  painScore: number; // 0-10
  timestamp: string;
  history: VitalSignPoint[];
}

export interface LabResult {
  id: string;
  testName: string;
  category: 'Hematology' | 'Chemistry' | 'Coagulation' | 'Cardiac' | 'Microbiology';
  value: string | number;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'High' | 'Low' | 'Critical';
  date: string;
}

export interface ClinicalNote {
  id: string;
  author: string;
  role: string;
  type: 'SOAP Note' | 'Progress Note' | 'Consultation' | 'Operative Note' | 'Nursing Handoff' | 'OCR Ingested';
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  content: string;
  timestamp: string;
  digitalSignature?: string;
}

export interface PatientRecord {
  id: string;
  mrn: string;
  fullName: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  avatarUrl?: string;
  department: 'Emergency' | 'Intensive Care Unit (ICU)' | 'Cardiology' | 'Neurology' | 'Oncology' | 'Surgical Stepdown';
  roomBed: string;
  attendingPhysician: string;
  admissionDate: string;
  status: 'Critical' | 'Observation' | 'Stable' | 'Discharge Pending' | 'Discharged';
  triageScore: 1 | 2 | 3 | 4 | 5; // Emergency Severity Index (1 is most acute)
  codeStatus: 'Full Code' | 'DNR/DNI' | 'DNR' | 'Comfort Measures Only';
  allergies: Allergy[];
  medications: Medication[];
  diagnoses: Diagnosis[];
  vitals: Vitals;
  labResults: LabResult[];
  clinicalNotes: ClinicalNote[];
  idVerification: {
    status: 'VERIFIED' | 'PENDING' | 'MANUAL_OVERRIDE';
    method: 'Wristband Barcode Scan' | 'Government ID + Photo' | 'Biometric Fingerprint' | 'Verbal Emergency Protocol';
    verifiedBy: string;
    verifiedAt: string;
    wristbandUid: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action:
    | 'VIEW_CHART'
    | 'EXPORT_PHI'
    | 'ADD_MEDICATION'
    | 'CHANGE_MEDICATION'
    | 'OCR_DOCUMENT_SCAN'
    | 'HANDWRITING_INGEST'
    | 'DIAGNOSTIC_QUERY'
    | 'TERMINAL_LOCK'
    | 'TERMINAL_UNLOCK'
    | 'PATIENT_ID_VERIFIED';
  patientMrn: string;
  patientName: string;
  terminalId: string;
  ipAddress: string;
  details: string;
  hash: string;
  verificationStatus: 'SECURE' | 'FLAGGED';
}

export interface OcrScanResult {
  id: string;
  documentType: 'Lab Report' | 'Prescription' | 'Clinical Progress Note' | 'Discharge Summary';
  confidence: number;
  extractedText: string;
  extractedDate: string;
  structuredFields: {
    patientName?: string;
    mrn?: string;
    encounterDate?: string;
    findings: string[];
    medications?: Array<{ name: string; dose: string; freq: string }>;
    diagnoses?: string[];
    vitals?: Partial<{ bp: string; hr: string; spo2: string; temp: string; rr: string }>;
    labItems?: Array<{ name: string; value: string; unit: string; flag?: string }>;
  };
}

export interface ClinicalAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'Drug Interaction' | 'Deterioration Risk' | 'Guideline Recommendation' | 'Lab Anomaly';
  title: string;
  description: string;
  recommendation: string;
  evidence: string;
  timestamp: string;
  acknowledged?: boolean;
}

export type ViewTab = 'clinical' | 'database' | 'ocr' | 'handwriting' | 'hipaa';
