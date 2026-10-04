/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatientRecord, AuditLogEntry, ClinicalAlert } from '../types';

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pt-001',
    mrn: 'MRN-784920',
    fullName: 'Eleanor Vance',
    dob: '1958-04-12',
    age: 68,
    gender: 'Female',
    bloodType: 'A+',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    department: 'Intensive Care Unit (ICU)',
    roomBed: 'ICU-Pod B, Bed 04',
    attendingPhysician: 'Dr. Sarah Lin, MD (Critical Care / Cardiology)',
    admissionDate: '2026-10-02 08:42',
    status: 'Critical',
    triageScore: 2,
    codeStatus: 'Full Code',
    allergies: [
      { allergen: 'Penicillin VK', severity: 'Anaphylactic', reaction: 'Bronchospasm, facial angioedema' },
      { allergen: 'Sulfa Drugs', severity: 'Moderate', reaction: 'Maculopapular rash, pruritus' }
    ],
    medications: [
      {
        id: 'med-101',
        name: 'Furosemide (Lasix)',
        dosage: '40 mg IV Push',
        frequency: 'Every 12 hours',
        route: 'Intravenous',
        startDate: '2026-10-02',
        status: 'Active',
        prescribedBy: 'Dr. Sarah Lin, MD',
        indications: 'Diuresis for pulmonary congestion'
      },
      {
        id: 'med-102',
        name: 'Apixaban (Eliquis)',
        dosage: '5 mg Oral',
        frequency: 'Twice daily',
        route: 'Oral',
        startDate: '2026-09-15',
        status: 'Active',
        prescribedBy: 'Dr. James Thorne, MD',
        indications: 'Stroke prevention in Atrial Fibrillation'
      },
      {
        id: 'med-103',
        name: 'Metoprolol Succinate',
        dosage: '50 mg Oral',
        frequency: 'Once daily morning',
        route: 'Oral',
        startDate: '2026-10-03',
        status: 'Active',
        prescribedBy: 'Dr. Sarah Lin, MD',
        indications: 'Rate control for Afib with RVR'
      },
      {
        id: 'med-104',
        name: 'Lisinopril',
        dosage: '10 mg Oral',
        frequency: 'Once daily',
        route: 'Oral',
        startDate: '2026-10-01',
        status: 'Held',
        prescribedBy: 'Dr. Sarah Lin, MD',
        indications: 'Held due to transient acute kidney injury (Cr 2.1)'
      }
    ],
    diagnoses: [
      { code: 'I50.23', description: 'Acute on chronic systolic heart failure (HFrEF, EF 30%)', type: 'Primary', dateAdded: '2026-10-02' },
      { code: 'I48.91', description: 'Unspecified atrial fibrillation with rapid ventricular response', type: 'Secondary', dateAdded: '2026-10-02' },
      { code: 'N17.9', description: 'Acute kidney injury, unspecified', type: 'Secondary', dateAdded: '2026-10-03' },
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', type: 'Chronic', dateAdded: '2024-03-11' }
    ],
    vitals: {
      heartRate: 98,
      bloodPressure: '144/88',
      respiratoryRate: 22,
      temperature: 37.1,
      spO2: 94,
      painScore: 2,
      timestamp: '10 min ago',
      history: [
        { time: '04:00', hr: 115, bpSys: 156, bpDia: 96, spo2: 91, rr: 26, temp: 37.2 },
        { time: '06:00', hr: 108, bpSys: 150, bpDia: 92, spo2: 93, rr: 24, temp: 37.1 },
        { time: '08:00', hr: 102, bpSys: 148, bpDia: 90, spo2: 93, rr: 23, temp: 37.0 },
        { time: '10:00', hr: 98, bpSys: 144, bpDia: 88, spo2: 94, rr: 22, temp: 37.1 }
      ]
    },
    labResults: [
      { id: 'lab-1', testName: 'BNP (B-Type Natriuretic Peptide)', category: 'Cardiac', value: 1420, unit: 'pg/mL', referenceRange: '< 100', flag: 'Critical', date: '2026-10-03 06:15' },
      { id: 'lab-2', testName: 'High-Sensitivity Troponin I', category: 'Cardiac', value: 28, unit: 'ng/L', referenceRange: '< 14', flag: 'High', date: '2026-10-03 06:15' },
      { id: 'lab-3', testName: 'Serum Creatinine', category: 'Chemistry', value: 2.1, unit: 'mg/dL', referenceRange: '0.6 - 1.2', flag: 'High', date: '2026-10-03 06:15' },
      { id: 'lab-4', testName: 'Potassium (Serum)', category: 'Chemistry', value: 4.8, unit: 'mEq/L', referenceRange: '3.5 - 5.0', flag: 'Normal', date: '2026-10-03 06:15' },
      { id: 'lab-5', testName: 'Hemoglobin', category: 'Hematology', value: 11.2, unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'Low', date: '2026-10-03 06:15' }
    ],
    clinicalNotes: [
      {
        id: 'note-1',
        author: 'Dr. Sarah Lin, MD',
        role: 'Attending Intensivist',
        type: 'SOAP Note',
        subjective: '68yo female reports improved orthopnea since initiating IV Lasix boluses. Denies chest pain or palpitations today.',
        objective: 'JVD visible at 30 degrees ~4cm above sternal notch. Bilateral fine bibasilar crackles, improved from yesterday. Trace 1+ bilateral lower extremity edema. Lungs clear mid-to-upper zones.',
        assessment: 'Improving acute decompensated heart failure with cardio-renal syndrome component. Creatinine stabilizing after aggressive afterload optimization.',
        plan: 'Continue Furosemide 40mg IV q12h. Daily BMP and fluid restriction to 1.5L/day. Telemetry monitoring for Afib rate control.',
        content: 'Patient responding well to loop diuretics with net negative 1400mL over last 24h. Electrolytes closely monitored.',
        timestamp: '2026-10-04 07:30',
        digitalSignature: 'SL-MD-981244'
      }
    ],
    idVerification: {
      status: 'VERIFIED',
      method: 'Wristband Barcode Scan',
      verifiedBy: 'Nurse R. Gallagher, BSN, RN',
      verifiedAt: '2026-10-02 08:45',
      wristbandUid: 'ECHO-WB-784920-A1'
    }
  },
  {
    id: 'pt-002',
    mrn: 'MRN-391845',
    fullName: 'Marcus Chen',
    dob: '1984-09-22',
    age: 42,
    gender: 'Male',
    bloodType: 'O-',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    department: 'Emergency',
    roomBed: 'ED-Trauma Bay 02',
    attendingPhysician: 'Dr. Carlos Mendoza, MD (Emergency Medicine)',
    admissionDate: '2026-10-04 09:12',
    status: 'Critical',
    triageScore: 2,
    codeStatus: 'Full Code',
    allergies: [
      { allergen: 'Aspirin', severity: 'Severe', reaction: 'Urticaria, bronchospasm' }
    ],
    medications: [
      {
        id: 'med-201',
        name: 'Ceftriaxone',
        dosage: '1 g IVPB',
        frequency: 'Daily',
        route: 'Intravenous',
        startDate: '2026-10-04',
        status: 'Active',
        prescribedBy: 'Dr. Carlos Mendoza, MD',
        indications: 'Severe community-acquired pneumonia'
      },
      {
        id: 'med-202',
        name: 'Azithromycin',
        dosage: '500 mg IV',
        frequency: 'Daily',
        route: 'Intravenous',
        startDate: '2026-10-04',
        status: 'Active',
        prescribedBy: 'Dr. Carlos Mendoza, MD',
        indications: 'Atypical coverage for CAP'
      },
      {
        id: 'med-203',
        name: 'Normal Saline 0.9%',
        dosage: '1000 mL bolus',
        frequency: 'Once stat',
        route: 'Intravenous',
        startDate: '2026-10-04',
        status: 'Active',
        prescribedBy: 'Dr. Carlos Mendoza, MD',
        indications: 'Fluid resuscitation for sepsis watch'
      }
    ],
    diagnoses: [
      { code: 'J18.9', description: 'Pneumonia, unspecified organism', type: 'Primary', dateAdded: '2026-10-04' },
      { code: 'R65.20', description: 'Systemic inflammatory response syndrome (SIRS) of infectious origin', type: 'Secondary', dateAdded: '2026-10-04' },
      { code: 'R50.9', description: 'Fever, unspecified (T-max 38.9°C)', type: 'Secondary', dateAdded: '2026-10-04' }
    ],
    vitals: {
      heartRate: 112,
      bloodPressure: '102/64',
      respiratoryRate: 24,
      temperature: 38.9,
      spO2: 92,
      painScore: 4,
      timestamp: '5 min ago',
      history: [
        { time: '09:15', hr: 118, bpSys: 98, bpDia: 60, spo2: 91, rr: 26, temp: 39.0 },
        { time: '09:45', hr: 116, bpSys: 100, bpDia: 62, spo2: 92, rr: 25, temp: 38.9 },
        { time: '10:30', hr: 112, bpSys: 102, bpDia: 64, spo2: 92, rr: 24, temp: 38.9 }
      ]
    },
    labResults: [
      { id: 'lab-201', testName: 'WBC (White Blood Cells)', category: 'Hematology', value: 18.4, unit: 'k/uL', referenceRange: '4.5 - 11.0', flag: 'Critical', date: '2026-10-04 09:30' },
      { id: 'lab-202', testName: 'Lactate (Venous)', category: 'Chemistry', value: 2.8, unit: 'mmol/L', referenceRange: '0.5 - 2.0', flag: 'High', date: '2026-10-04 09:30' },
      { id: 'lab-203', testName: 'Procalcitonin', category: 'Chemistry', value: 3.2, unit: 'ng/mL', referenceRange: '< 0.1', flag: 'Critical', date: '2026-10-04 09:30' }
    ],
    clinicalNotes: [
      {
        id: 'note-201',
        author: 'Dr. Carlos Mendoza, MD',
        role: 'Attending Emergency Physician',
        type: 'Progress Note',
        subjective: '42yo male presents with 4-day history of productive cough with rust-colored sputum, shaking chills, and pleuritic right-sided chest discomfort.',
        objective: 'Febrile (38.9 C), tachypneic (RR 24), HR 112 bpm. Auscultation demonstrates bronchial breath sounds and inspiratory crackles in right lower lobe.',
        assessment: 'Right lower lobe lobar pneumonia with severe SIRS / early sepsis criteria (qSOFA score = 2). Lactate elevated at 2.8.',
        plan: 'Blood cultures x2 before broad-spectrum IV antibiotics. Repeat lactate in 3 hours. Admitting to Inpatient Telemetry/Stepdown.',
        content: 'Immediate resuscitation protocol initiated with IV Ceftriaxone + Azithromycin and 30cc/kg crystalloid infusion.',
        timestamp: '2026-10-04 10:15',
        digitalSignature: 'CM-MD-440192'
      }
    ],
    idVerification: {
      status: 'VERIFIED',
      method: 'Government ID + Photo',
      verifiedBy: 'Triage Specialist J. Davis',
      verifiedAt: '2026-10-04 09:14',
      wristbandUid: 'ECHO-WB-391845-ED'
    }
  },
  {
    id: 'pt-003',
    mrn: 'MRN-912384',
    fullName: 'Sophia Rodriguez',
    dob: '1997-12-08',
    age: 29,
    gender: 'Female',
    bloodType: 'B+',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    department: 'Intensive Care Unit (ICU)',
    roomBed: 'Stepdown Bed 11',
    attendingPhysician: 'Dr. Angela Rossi, MD (Endocrinology / Hospitalist)',
    admissionDate: '2026-10-03 14:19',
    status: 'Observation',
    triageScore: 3,
    codeStatus: 'Full Code',
    allergies: [
      { allergen: 'Latex', severity: 'Mild', reaction: 'Contact dermatitis' }
    ],
    medications: [
      {
        id: 'med-301',
        name: 'Insulin Glargine (Lantus)',
        dosage: '18 Units SubQ',
        frequency: 'Every evening at 21:00',
        route: 'Subcutaneous',
        startDate: '2026-10-03',
        status: 'Active',
        prescribedBy: 'Dr. Angela Rossi, MD',
        indications: 'Basal control post-DKA resolution'
      },
      {
        id: 'med-302',
        name: 'Insulin Lispro (Humalog)',
        dosage: 'Sliding Scale with meals',
        frequency: 'TID with meals',
        route: 'Subcutaneous',
        startDate: '2026-10-03',
        status: 'Active',
        prescribedBy: 'Dr. Angela Rossi, MD',
        indications: 'Prandial glucose correction'
      }
    ],
    diagnoses: [
      { code: 'E10.10', description: 'Type 1 diabetes mellitus with ketoacidosis, without coma (Resolved)', type: 'Primary', dateAdded: '2026-10-03' },
      { code: 'E87.6', description: 'Hypokalemia, corrected', type: 'Secondary', dateAdded: '2026-10-03' }
    ],
    vitals: {
      heartRate: 76,
      bloodPressure: '118/76',
      respiratoryRate: 16,
      temperature: 36.8,
      spO2: 99,
      painScore: 0,
      timestamp: '20 min ago',
      history: [
        { time: '02:00', hr: 92, bpSys: 122, bpDia: 78, spo2: 98, rr: 18, temp: 36.9 },
        { time: '06:00', hr: 84, bpSys: 120, bpDia: 76, spo2: 99, rr: 16, temp: 36.8 },
        { time: '10:00', hr: 76, bpSys: 118, bpDia: 76, spo2: 99, rr: 16, temp: 36.8 }
      ]
    },
    labResults: [
      { id: 'lab-301', testName: 'Blood Glucose (Point of Care)', category: 'Chemistry', value: 142, unit: 'mg/dL', referenceRange: '70 - 99', flag: 'High', date: '2026-10-04 07:00' },
      { id: 'lab-302', testName: 'Anion Gap', category: 'Chemistry', value: 9, unit: 'mEq/L', referenceRange: '3 - 11', flag: 'Normal', date: '2026-10-04 06:00' },
      { id: 'lab-303', testName: 'Serum Bicarbonate (CO2)', category: 'Chemistry', value: 24, unit: 'mEq/L', referenceRange: '22 - 29', flag: 'Normal', date: '2026-10-04 06:00' }
    ],
    clinicalNotes: [
      {
        id: 'note-301',
        author: 'Dr. Angela Rossi, MD',
        role: 'Attending Hospitalist',
        type: 'Progress Note',
        subjective: 'Patient feeling energetic, appetite returned. Tolerating full diabetic oral diet. Nausea completely resolved.',
        objective: 'Anion gap closed at 9. Venous pH 7.39. Electrolytes in balance with K 4.2.',
        assessment: 'DKA successfully resolved. Smooth transition from IV regular insulin to subcutaneous basal-bolus regimen.',
        plan: 'Discharge readiness education with Certified Diabetes Care and Education Specialist (CDCES). Target discharge tomorrow morning.',
        content: 'Transition to subcutaneous Lantus + Humalog confirmed stable overnight with POC glucoses 130-155.',
        timestamp: '2026-10-04 08:30',
        digitalSignature: 'AR-MD-210948'
      }
    ],
    idVerification: {
      status: 'VERIFIED',
      method: 'Wristband Barcode Scan',
      verifiedBy: 'RN M. Higgins',
      verifiedAt: '2026-10-03 14:22',
      wristbandUid: 'ECHO-WB-912384-B3'
    }
  },
  {
    id: 'pt-004',
    mrn: 'MRN-184729',
    fullName: 'Arthur Pendelton',
    dob: '1952-01-19',
    age: 74,
    gender: 'Male',
    bloodType: 'O+',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    department: 'Surgical Stepdown',
    roomBed: 'Surg-Floor 4, Rm 412',
    attendingPhysician: 'Dr. Robert Sterling, MD, FACS (Surgical Oncology)',
    admissionDate: '2026-10-01 06:30',
    status: 'Stable',
    triageScore: 4,
    codeStatus: 'Full Code',
    allergies: [
      { allergen: 'Morphine Sulfate', severity: 'Moderate', reaction: 'Severe nausea, pruritus without rash' }
    ],
    medications: [
      {
        id: 'med-401',
        name: 'Hydromorphone (Dilaudid)',
        dosage: '0.5 mg IV PRN',
        frequency: 'Every 3 hours for breakthrough pain',
        route: 'Intravenous',
        startDate: '2026-10-02',
        status: 'Active',
        prescribedBy: 'Dr. Robert Sterling, MD',
        indications: 'Post-operative pain management (POD #2)'
      },
      {
        id: 'med-402',
        name: 'Enoxaparin (Lovenox)',
        dosage: '40 mg SubQ',
        frequency: 'Daily at 18:00',
        route: 'Subcutaneous',
        startDate: '2026-10-02',
        status: 'Active',
        prescribedBy: 'Dr. Robert Sterling, MD',
        indications: 'Post-surgical VTE / DVT prophylaxis'
      },
      {
        id: 'med-403',
        name: 'Cefazolin (Ancef)',
        dosage: '2 g IV',
        frequency: 'Every 8 hours',
        route: 'Intravenous',
        startDate: '2026-10-01',
        status: 'Discontinued',
        prescribedBy: 'Dr. Robert Sterling, MD',
        indications: 'Surgical site infection prophylaxis discontinued after 24h per SCIP'
      }
    ],
    diagnoses: [
      { code: 'C18.2', description: 'Malignant neoplasm of ascending colon (Status post laparoscopic right hemicolectomy)', type: 'Primary', dateAdded: '2026-10-01' },
      { code: 'I10', description: 'Essential (primary) hypertension', type: 'Chronic', dateAdded: '2019-08-04' }
    ],
    vitals: {
      heartRate: 72,
      bloodPressure: '126/80',
      respiratoryRate: 15,
      temperature: 36.9,
      spO2: 97,
      painScore: 3,
      timestamp: '15 min ago',
      history: [
        { time: '04:00', hr: 78, bpSys: 130, bpDia: 82, spo2: 96, rr: 16, temp: 37.0 },
        { time: '08:00', hr: 74, bpSys: 128, bpDia: 80, spo2: 97, rr: 15, temp: 36.9 },
        { time: '11:00', hr: 72, bpSys: 126, bpDia: 80, spo2: 97, rr: 15, temp: 36.9 }
      ]
    },
    labResults: [
      { id: 'lab-401', testName: 'Hemoglobin', category: 'Hematology', value: 10.4, unit: 'g/dL', referenceRange: '13.5 - 17.5', flag: 'Low', date: '2026-10-04 05:30' },
      { id: 'lab-402', testName: 'Platelet Count', category: 'Hematology', value: 245, unit: 'k/uL', referenceRange: '150 - 450', flag: 'Normal', date: '2026-10-04 05:30' }
    ],
    clinicalNotes: [
      {
        id: 'note-401',
        author: 'Dr. Robert Sterling, MD',
        role: 'Surgical Attending',
        type: 'Operative Note',
        subjective: 'POD #2 s/p robotic-assisted right hemicolectomy. Ambulated hallway twice with physical therapy. Passing flatus.',
        objective: 'Abdomen soft, non-distended, appropriately tender at trocar and extraction sites. Dressings clean, dry, and intact. Foley catheter removed.',
        assessment: 'Uncomplicated post-operative recovery course.',
        plan: 'Advance diet to clear liquids. Continue ambulation goals. Step down IV analgesia to oral Acetaminophen with PRN Oxycodone.',
        content: 'Post-op recovery progressing well. Surgical incisions healing primarily.',
        timestamp: '2026-10-04 09:00',
        digitalSignature: 'RS-MD-771890'
      }
    ],
    idVerification: {
      status: 'VERIFIED',
      method: 'Wristband Barcode Scan',
      verifiedBy: 'RN K. O’Connor',
      verifiedAt: '2026-10-01 06:45',
      wristbandUid: 'ECHO-WB-184729-S2'
    }
  },
  {
    id: 'pt-005',
    mrn: 'MRN-602941',
    fullName: 'Amina Al-Mansoor',
    dob: '1991-03-14',
    age: 35,
    gender: 'Female',
    bloodType: 'AB+',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    department: 'Neurology',
    roomBed: 'Neuro Observation Rm 302',
    attendingPhysician: 'Dr. Farhan Qureshi, MD (Neurology)',
    admissionDate: '2026-10-03 21:40',
    status: 'Observation',
    triageScore: 3,
    codeStatus: 'Full Code',
    allergies: [],
    medications: [
      {
        id: 'med-501',
        name: 'Sumatriptan (Imitrex)',
        dosage: '6 mg SubQ',
        frequency: 'PRN at onset',
        route: 'Subcutaneous',
        startDate: '2026-10-03',
        status: 'Active',
        prescribedBy: 'Dr. Farhan Qureshi, MD',
        indications: 'Acute migraine abortive therapy'
      },
      {
        id: 'med-502',
        name: 'Propranolol',
        dosage: '40 mg Oral',
        frequency: 'Twice daily',
        route: 'Oral',
        startDate: '2026-10-04',
        status: 'Active',
        prescribedBy: 'Dr. Farhan Qureshi, MD',
        indications: 'Migraine prophylaxis'
      }
    ],
    diagnoses: [
      { code: 'G43.109', description: 'Migraine with aura, not intractable, without status migrainosus', type: 'Primary', dateAdded: '2026-10-03' },
      { code: 'H53.141', description: 'Visual discomfort (photophobia)', type: 'Secondary', dateAdded: '2026-10-03' }
    ],
    vitals: {
      heartRate: 68,
      bloodPressure: '114/72',
      respiratoryRate: 14,
      temperature: 36.6,
      spO2: 100,
      painScore: 2,
      timestamp: '35 min ago',
      history: [
        { time: '02:00', hr: 82, bpSys: 128, bpDia: 80, spo2: 99, rr: 16, temp: 36.7 },
        { time: '06:00', hr: 72, bpSys: 118, bpDia: 74, spo2: 100, rr: 14, temp: 36.6 },
        { time: '10:00', hr: 68, bpSys: 114, bpDia: 72, spo2: 100, rr: 14, temp: 36.6 }
      ]
    },
    labResults: [
      { id: 'lab-501', testName: 'ESR (Erythrocyte Sedimentation Rate)', category: 'Hematology', value: 12, unit: 'mm/hr', referenceRange: '0 - 20', flag: 'Normal', date: '2026-10-04 01:00' },
      { id: 'lab-502', testName: 'C-Reactive Protein (CRP)', category: 'Chemistry', value: 0.8, unit: 'mg/L', referenceRange: '< 3.0', flag: 'Normal', date: '2026-10-04 01:00' }
    ],
    clinicalNotes: [
      {
        id: 'note-501',
        author: 'Dr. Farhan Qureshi, MD',
        role: 'Attending Neurologist',
        type: 'Consultation',
        subjective: 'Patient reports scintillation scotoma and throbbing left hemicranial headache improving markedly after IV hydration and Sumatriptan.',
        objective: 'Non-focal cranial nerve exam II-XII intact. Visual fields full to confrontation. Fundoscopic exam negative for papilledema.',
        assessment: 'Typical migraine with visual aura. Low clinical suspicion for secondary headache etiologies or intracranial hemorrhage.',
        plan: 'Non-contrast brain MRI pending. Discharge with outpatient neurology follow-up if MRI unremarkable.',
        content: 'Neurological examination fully benign. Headache severity reduced from 9/10 to 2/10.',
        timestamp: '2026-10-04 08:00',
        digitalSignature: 'FQ-MD-382910'
      }
    ],
    idVerification: {
      status: 'VERIFIED',
      method: 'Wristband Barcode Scan',
      verifiedBy: 'RN S. Patel',
      verifiedAt: '2026-10-03 21:45',
      wristbandUid: 'ECHO-WB-602941-N1'
    }
  },
  {
    id: 'pt-006',
    mrn: 'MRN-847219',
    fullName: 'David K. Miller',
    dob: '1968-07-30',
    age: 58,
    gender: 'Male',
    bloodType: 'A-',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    department: 'Cardiology',
    roomBed: 'Cardio Telemetry Rm 218',
    attendingPhysician: 'Dr. Jennifer Thorne, MD (Interventional Cardiology)',
    admissionDate: '2026-10-03 18:22',
    status: 'Stable',
    triageScore: 2,
    codeStatus: 'Full Code',
    allergies: [
      { allergen: 'Iodinated Radiocontrast', severity: 'Moderate', reaction: 'Diffuse hives, pre-medicate with Solu-Medrol + Benadryl' }
    ],
    medications: [
      {
        id: 'med-601',
        name: 'Clopidogrel (Plavix)',
        dosage: '75 mg Oral',
        frequency: 'Daily',
        route: 'Oral',
        startDate: '2026-10-03',
        status: 'Active',
        prescribedBy: 'Dr. Jennifer Thorne, MD',
        indications: 'Dual antiplatelet therapy for acute coronary syndrome'
      },
      {
        id: 'med-602',
        name: 'Atorvastatin',
        dosage: '80 mg Oral',
        frequency: 'Nightly',
        route: 'Oral',
        startDate: '2026-10-03',
        status: 'Active',
        prescribedBy: 'Dr. Jennifer Thorne, MD',
        indications: 'High-intensity statin therapy'
      },
      {
        id: 'med-603',
        name: 'Nitroglycerin 0.4mg SL',
        dosage: '1 tablet sublingual',
        frequency: 'Every 5 min PRN chest pain (max 3 doses)',
        route: 'Sublingual',
        startDate: '2026-10-03',
        status: 'Active',
        prescribedBy: 'Dr. Jennifer Thorne, MD',
        indications: 'Angina pectoris PRN'
      }
    ],
    diagnoses: [
      { code: 'I20.0', description: 'Unstable angina', type: 'Primary', dateAdded: '2026-10-03' },
      { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery', type: 'Secondary', dateAdded: '2026-10-03' },
      { code: 'E78.5', description: 'Hyperlipidemia, unspecified', type: 'Chronic', dateAdded: '2022-04-18' }
    ],
    vitals: {
      heartRate: 70,
      bloodPressure: '128/82',
      respiratoryRate: 16,
      temperature: 36.8,
      spO2: 98,
      painScore: 0,
      timestamp: '25 min ago',
      history: [
        { time: '00:00', hr: 84, bpSys: 142, bpDia: 88, spo2: 97, rr: 18, temp: 36.9 },
        { time: '04:00', hr: 76, bpSys: 134, bpDia: 84, spo2: 98, rr: 16, temp: 36.8 },
        { time: '08:00', hr: 70, bpSys: 128, bpDia: 82, spo2: 98, rr: 16, temp: 36.8 }
      ]
    },
    labResults: [
      { id: 'lab-601', testName: 'Troponin I (High-Sensitivity)', category: 'Cardiac', value: 11, unit: 'ng/L', referenceRange: '< 14', flag: 'Normal', date: '2026-10-04 06:00' },
      { id: 'lab-602', testName: 'Total Cholesterol', category: 'Chemistry', value: 242, unit: 'mg/dL', referenceRange: '< 200', flag: 'High', date: '2026-10-03 19:00' },
      { id: 'lab-603', testName: 'LDL Cholesterol (Calculated)', category: 'Chemistry', value: 162, unit: 'mg/dL', referenceRange: '< 100', flag: 'High', date: '2026-10-03 19:00' }
    ],
    clinicalNotes: [
      {
        id: 'note-601',
        author: 'Dr. Jennifer Thorne, MD',
        role: 'Interventional Cardiologist',
        type: 'Progress Note',
        subjective: 'Chest tightness completely resolved with rest and medical therapy. Denies orthopnea, palpitations, or lightheadedness.',
        objective: 'Cardiovascular: Normal S1/S2 without murmurs, rubs, or gallops. Radial pulses 2+ bilaterally. Telemetry: Normal sinus rhythm without ST deviations.',
        assessment: 'Unstable angina, TIMI risk score 2 (intermediate). Serial troponins remain flat and negative.',
        plan: 'Schedule diagnostic cardiac catheterization tomorrow with allergy premedication protocol (Steroid + Antihistamine) due to contrast allergy.',
        content: 'Diagnostic coronary angiography planned with IV dye premedication.',
        timestamp: '2026-10-04 08:45',
        digitalSignature: 'JT-MD-591024'
      }
    ],
    idVerification: {
      status: 'VERIFIED',
      method: 'Wristband Barcode Scan',
      verifiedBy: 'RN T. Briggs',
      verifiedAt: '2026-10-03 18:25',
      wristbandUid: 'ECHO-WB-847219-C4'
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-04 11:32:14',
    user: 'Dr. Sarah Lin, MD',
    role: 'Attending Intensivist',
    action: 'VIEW_CHART',
    patientMrn: 'MRN-784920',
    patientName: 'Eleanor Vance',
    terminalId: 'ICU-WS-04',
    ipAddress: '10.142.12.84',
    details: 'Opened full chart, reviewed 24h vitals and cardiac biomarker trends',
    hash: 'sha256:7f8a91b2c3d4e5f6...ec8f',
    verificationStatus: 'SECURE'
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-04 11:28:40',
    user: 'Dr. Carlos Mendoza, MD',
    role: 'Attending Emergency Physician',
    action: 'OCR_DOCUMENT_SCAN',
    patientMrn: 'MRN-391845',
    patientName: 'Marcus Chen',
    terminalId: 'ED-WS-BAY02',
    ipAddress: '10.142.10.19',
    details: 'Ingested emergency transfer sheet via OCR Scanner, auto-parsed SIRS criteria',
    hash: 'sha256:3e4d5c6b7a8f9012...89a1',
    verificationStatus: 'SECURE'
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-04 11:15:02',
    user: 'Nurse R. Gallagher, RN',
    role: 'Staff Nurse',
    action: 'PATIENT_ID_VERIFIED',
    patientMrn: 'MRN-784920',
    patientName: 'Eleanor Vance',
    terminalId: 'ICU-MOB-02',
    ipAddress: '10.142.12.91',
    details: 'Scanned 2D barcode wristband ECHO-WB-784920-A1 prior to IV Lasix administration',
    hash: 'sha256:90a1b2c3d4e5f678...45ef',
    verificationStatus: 'SECURE'
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-04 10:50:33',
    user: 'Dr. Sarah Lin, MD',
    role: 'Attending Intensivist',
    action: 'DIAGNOSTIC_QUERY',
    patientMrn: 'MRN-784920',
    patientName: 'Eleanor Vance',
    terminalId: 'ICU-WS-04',
    ipAddress: '10.142.12.84',
    details: 'Ran Echo Decision Support query on Apixaban + cardio-renal interaction profile',
    hash: 'sha256:1a2b3c4d5e6f7a8b...12cd',
    verificationStatus: 'SECURE'
  },
  {
    id: 'aud-005',
    timestamp: '2026-10-04 10:30:19',
    user: 'Dr. Robert Sterling, MD',
    role: 'Surgical Attending',
    action: 'HANDWRITING_INGEST',
    patientMrn: 'MRN-184729',
    patientName: 'Arthur Pendelton',
    terminalId: 'SURG-TAB-01',
    ipAddress: '10.142.18.23',
    details: 'Converted handwritten POD#2 surgical scratchpad diagram to structured clinical order',
    hash: 'sha256:8899aabbccddeeff...9988',
    verificationStatus: 'SECURE'
  },
  {
    id: 'aud-006',
    timestamp: '2026-10-04 09:44:11',
    user: 'System Monitor',
    role: 'Automated Security Service',
    action: 'TERMINAL_LOCK',
    patientMrn: 'N/A',
    patientName: 'System-wide',
    terminalId: 'ED-WS-BAY02',
    ipAddress: '10.142.10.19',
    details: 'Triggered auto-inactivity lock after 5 minutes of unattended terminal session',
    hash: 'sha256:445566778899aabb...6677',
    verificationStatus: 'SECURE'
  }
];

export const CLINICAL_ALERTS_MAP: Record<string, ClinicalAlert[]> = {
  'MRN-784920': [
    {
      id: 'alt-1',
      severity: 'critical',
      category: 'Drug Interaction',
      title: 'Anticoagulant & Renal Elimination Alert',
      description: 'Apixaban clearance is partially renal (27%). Serum Creatinine increased to 2.1 mg/dL.',
      recommendation: 'Evaluate dose adjustment to 2.5 mg BID if serum Cr remains ≥ 1.5 with age ≥ 80 or body weight ≤ 60kg.',
      evidence: 'FDA Package Insert Apixaban Section 2.2 / KDIGO 2024 Guidelines for Cardio-Renal Syndrome',
      timestamp: 'Today at 08:15'
    },
    {
      id: 'alt-2',
      severity: 'warning',
      category: 'Deterioration Risk',
      title: 'Elevated BNP with Persistent Crackles',
      description: 'BNP 1420 pg/mL indicates severe ventricular myocardial wall stress.',
      recommendation: 'Monitor strict fluid balance, maintain Foley catheter recording, check daily electrolytes before next diuretic dose.',
      evidence: 'AHA/ACC 2022 Heart Failure Management Guidelines Class I Recommendation',
      timestamp: 'Today at 07:45'
    },
    {
      id: 'alt-3',
      severity: 'info',
      category: 'Guideline Recommendation',
      title: 'Held ACE Inhibitor Review',
      description: 'Lisinopril is currently Held. Re-evaluate reintroduction once AKI resolves and eGFR stabilizes.',
      recommendation: 'Target re-initiation prior to hospital discharge if renal function returns to baseline.',
      evidence: 'GDMT (Guideline-Directed Medical Therapy) optimization protocol',
      timestamp: 'Today at 06:30'
    }
  ],
  'MRN-391845': [
    {
      id: 'alt-4',
      severity: 'critical',
      category: 'Deterioration Risk',
      title: 'SIRS / Sepsis Alert (qSOFA = 2)',
      description: 'Patient meets systemic inflammatory response criteria: HR 112, RR 24, Temp 38.9°C with Lactate 2.8 mmol/L.',
      recommendation: 'Complete 3-hour Sepsis Bundle: Blood cultures before antibiotics, IV crystalloids 30mL/kg, serial lactate monitoring.',
      evidence: 'Surviving Sepsis Campaign 2021 International Guidelines',
      timestamp: 'Today at 09:35'
    },
    {
      id: 'alt-5',
      severity: 'warning',
      category: 'Drug Interaction',
      title: 'Severe Aspirin Allergy Cross-Reactivity',
      description: 'Patient has documented severe Aspirin anaphylactoid reaction (Urticaria, bronchospasm).',
      recommendation: 'Avoid all NSAIDs (Ketorolac, Ibuprofen, Naproxen). Use IV Acetaminophen for antipyretic control.',
      evidence: 'EAACI Aspirin-Exacerbated Respiratory Disease & NSAID Hypersensitivity Registry',
      timestamp: 'Today at 09:15'
    }
  ],
  'MRN-912384': [
    {
      id: 'alt-6',
      severity: 'info',
      category: 'Guideline Recommendation',
      title: 'DKA Resolution Protocol Completed',
      description: 'Anion gap 9, Bicarbonate 24, tolerating oral intake.',
      recommendation: 'Ensure outpatient follow-up scheduled within 7 days with endocrinology. Refill CGM sensors and ketone test strips.',
      evidence: 'ADA Standards of Care in Diabetes 2026',
      timestamp: 'Today at 08:35'
    }
  ]
};

export const SAMPLE_OCR_DOCUMENTS = [
  {
    id: 'doc-001',
    name: 'Emergency Department Transfer Record (St. Jude Medical)',
    type: 'Clinical Progress Note',
    date: '2026-10-04',
    previewUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    rawText: `ST. JUDE EMERGENCY MEDICINE TRANSFER SUMMARY
Date: 2026-10-04 | Time: 09:00 EST
PATIENT: Marcus Chen | DOB: 1984-09-22 | MRN-391845
Triage Priority: Level 2 Emergency (SIRS)
Vitals: BP 102/64 mmHg, HR 114 bpm, RR 25 bpm, SpO2 91% on room air, Temp 38.9 C (102.0 F)
Primary Diagnosis: Severe Right Lower Lobe Pneumonia (J18.9)
Labs: WBC 18.4 k/uL, Venous Lactate 2.8 mmol/L, Procalcitonin 3.2 ng/mL
Active Meds Administered: Ceftriaxone 1g IV, Azithromycin 500mg IV, Normal Saline 1000mL IV
Allergies: Aspirin (Severe - Urticaria, Bronchospasm)
Attending Note: Patient transferred to Echo Regional Medical Center for intensive pulmonary care and telemetry admission.`,
    structured: {
      patientName: 'Marcus Chen',
      mrn: 'MRN-391845',
      encounterDate: '2026-10-04',
      findings: [
        'Right lower lobe lobar consolidation with fever and tachypnea',
        'qSOFA score = 2 (HR 114, RR 25, BP 102/64)',
        'Lactate elevated at 2.8 mmol/L indicating hypoperfusion watch'
      ],
      medications: [
        { name: 'Ceftriaxone', dose: '1 g IV', freq: 'Daily' },
        { name: 'Azithromycin', dose: '500 mg IV', freq: 'Daily' },
        { name: 'Normal Saline', dose: '1000 mL IV', freq: 'Stat' }
      ],
      diagnoses: ['Pneumonia, unspecified organism (J18.9)', 'SIRS of infectious origin (R65.20)'],
      vitals: { bp: '102/64', hr: '114', spo2: '91%', temp: '38.9°C', rr: '25' },
      labItems: [
        { name: 'WBC', value: '18.4', unit: 'k/uL', flag: 'High' },
        { name: 'Lactate', value: '2.8', unit: 'mmol/L', flag: 'High' },
        { name: 'Procalcitonin', value: '3.2', unit: 'ng/mL', flag: 'Critical' }
      ]
    }
  },
  {
    id: 'doc-002',
    name: 'Outpatient Prescription Order (Cardiology Clinic)',
    type: 'Prescription',
    date: '2026-10-03',
    previewUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    rawText: `METROPOLITAN CARDIOLOGY ASSOCIATES
Rx Ref: RX-2026-88192 | Date: 2026-10-03
PATIENT: Eleanor Vance | MRN: MRN-784920 | DOB: 1958-04-12
Allergies: Penicillin (Anaphylactic)

Rx 1: Furosemide 40mg Oral Tablet
Sig: Take 1 tablet by mouth twice daily for fluid overload. Disp: #60. Refills: 2.

Rx 2: Apixaban (Eliquis) 5mg Oral Tablet
Sig: Take 1 tablet by mouth every 12 hours for stroke prevention in nonvalvular atrial fibrillation. Disp: #60. Refills: 3.

Rx 3: Metoprolol Succinate ER 50mg Oral Tablet
Sig: Take 1 tablet by mouth once daily every morning. Disp: #30. Refills: 5.

Physician Signature: Dr. James Thorne, MD (Lic # MD-849102)`,
    structured: {
      patientName: 'Eleanor Vance',
      mrn: 'MRN-784920',
      encounterDate: '2026-10-03',
      findings: [
        'Outpatient prescription refill protocol for congestive heart failure and atrial fibrillation',
        'No NSAIDs or conflicting anticoagulants prescribed'
      ],
      medications: [
        { name: 'Furosemide', dose: '40 mg Oral', freq: 'Twice daily' },
        { name: 'Apixaban', dose: '5 mg Oral', freq: 'Every 12 hours' },
        { name: 'Metoprolol Succinate ER', dose: '50 mg Oral', freq: 'Once daily' }
      ],
      diagnoses: ['Congestive Heart Failure', 'Atrial Fibrillation'],
      vitals: {}
    }
  },
  {
    id: 'doc-003',
    name: 'Stat Comprehensive Chemistry & Cardiac Enzyme Panel',
    type: 'Lab Report',
    date: '2026-10-04',
    previewUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600',
    rawText: `CORE HOSPITAL PATHOLOGY & LAB SERVICES
Specimen ID: LAB-2026-77810 | Collected: 2026-10-04 06:15 EST
PATIENT: Eleanor Vance | MRN: MRN-784920 | Room: ICU-Bed 04
Flag Reference: [H] High, [L] Low, [!] Critical

BNP (B-Type Natriuretic): 1,420 pg/mL [!] (Normal: < 100 pg/mL)
Troponin I High-Sensitivity: 28 ng/L [H] (Normal: < 14 ng/L)
Serum Creatinine: 2.1 mg/dL [H] (Normal: 0.6 - 1.2 mg/dL)
Blood Urea Nitrogen (BUN): 38 mg/dL [H] (Normal: 7 - 20 mg/dL)
Sodium (Serum): 138 mEq/L (Normal: 135 - 145 mEq/L)
Potassium (Serum): 4.8 mEq/L (Normal: 3.5 - 5.0 mEq/L)
Chloride: 101 mEq/L (Normal: 96 - 106 mEq/L)
CO2 (Bicarbonate): 23 mEq/L (Normal: 22 - 29 mEq/L)
eGFR: 26 mL/min/1.73m2 [L] (Stage 4 CKD equivalent / acute decline)

Pathologist Note: Critical BNP result phoned to ICU Charge Nurse at 06:40.`,
    structured: {
      patientName: 'Eleanor Vance',
      mrn: 'MRN-784920',
      encounterDate: '2026-10-04',
      findings: [
        'Significantly elevated BNP (1420 pg/mL) consistent with acute heart failure exacerbation',
        'Troponin I mildly elevated (28 ng/L), possible demand ischemia secondary to tachycardia',
        'Creatinine elevated at 2.1 mg/dL with acute drop in eGFR to 26 mL/min'
      ],
      labItems: [
        { name: 'BNP', value: '1420', unit: 'pg/mL', flag: 'Critical' },
        { name: 'Troponin I', value: '28', unit: 'ng/L', flag: 'High' },
        { name: 'Creatinine', value: '2.1', unit: 'mg/dL', flag: 'High' },
        { name: 'BUN', value: '38', unit: 'mg/dL', flag: 'High' },
        { name: 'Potassium', value: '4.8', unit: 'mEq/L', flag: 'Normal' },
        { name: 'eGFR', value: '26', unit: 'mL/min', flag: 'Low' }
      ]
    }
  }
];
