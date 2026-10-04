/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  User,
  Heart,
  Pill,
  FlaskConical,
  FileText,
  ShieldCheck,
  Plus,
  AlertTriangle,
  Download,
  Activity,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  FileDown,
  Lock
} from 'lucide-react';
import { PatientRecord, Medication, ClinicalNote, LabResult } from '../types';
import { redactPhi, maskMrn } from '../utils/phi';
import { EchoLogo } from './EchoLogo';

interface RecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord;
  onUpdatePatient: (updated: PatientRecord) => void;
  onLogAudit: (action: string, details: string) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  onUpdatePatient,
  onLogAudit
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'vitals' | 'meds' | 'labs' | 'notes' | 'export'>('summary');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);

  // New Note Form State
  const [noteType, setNoteType] = useState<ClinicalNote['type']>('Progress Note');
  const [noteSubjective, setNoteSubjective] = useState('');
  const [noteObjective, setNoteObjective] = useState('');
  const [noteAssessment, setNoteAssessment] = useState('');
  const [notePlan, setNotePlan] = useState('');

  // New Medication Form State
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily');
  const [medRoute, setMedRoute] = useState('Oral');
  const [medIndication, setMedIndication] = useState('');
  const [medWarning, setMedWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      author: 'Dr. Sarah Lin, MD',
      role: 'Attending Intensivist',
      type: noteType,
      subjective: noteSubjective,
      objective: noteObjective,
      assessment: noteAssessment,
      plan: notePlan,
      content: `${noteSubjective}\n${noteObjective}\n${noteAssessment}\n${notePlan}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      digitalSignature: `SL-MD-${Math.floor(100000 + Math.random() * 900000)}`
    };

    const updated = {
      ...patient,
      clinicalNotes: [newNote, ...patient.clinicalNotes]
    };
    onUpdatePatient(updated);
    onLogAudit('VIEW_CHART', `Added new ${noteType} to patient chart ${patient.mrn}`);
    setShowAddNote(false);
    setNoteSubjective('');
    setNoteObjective('');
    setNoteAssessment('');
    setNotePlan('');
  };

  const checkMedicationAllergy = (name: string) => {
    const lower = name.toLowerCase();
    for (const allergy of patient.allergies) {
      if (lower.includes(allergy.allergen.toLowerCase().split(' ')[0])) {
        return `ALLERGY WARNING: Patient has documented ${allergy.severity} reaction to ${allergy.allergen} (${allergy.reaction})!`;
      }
    }
    return null;
  };

  const handleMedNameChange = (name: string) => {
    setMedName(name);
    setMedWarning(checkMedicationAllergy(name));
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: medName,
      dosage: medDose,
      frequency: medFreq,
      route: medRoute,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      prescribedBy: 'Dr. Sarah Lin, MD',
      indications: medIndication
    };

    const updated = {
      ...patient,
      medications: [newMed, ...patient.medications]
    };
    onUpdatePatient(updated);
    onLogAudit('ADD_MEDICATION', `Prescribed ${newMed.name} ${newMed.dosage} for ${patient.mrn}`);
    setShowAddMed(false);
    setMedName('');
    setMedDose('');
    setMedIndication('');
    setMedWarning(null);
  };

  const getRedactedSummary = () => {
    const raw = `================================================================================
ECHO HEALTHCARE SYSTEM • E+ CLINICAL INTELLIGENCE PLATFORM
STRICTLY CONFIDENTIAL & PRIVILEGED MEDICAL FILE • SAFE HARBOR DE-IDENTIFIED
NOTICE: RESTRICTED ACCESS UNDER HIPAA PRIVACY RULE 45 CFR § 164.514
================================================================================

PATIENT CLINICAL SUMMARY RECORD
Name: ${patient.fullName} | MRN: ${patient.mrn} | DOB: ${patient.dob} (${patient.age}y)
Location: ${patient.department} - ${patient.roomBed}
Attending: ${patient.attendingPhysician}
Primary Diagnoses: ${patient.diagnoses.map((d) => `${d.code} - ${d.description}`).join('; ')}
Active Medications: ${patient.medications.map((m) => `${m.name} ${m.dosage} (${m.frequency})`).join('; ')}
Recent Labs: ${patient.labResults.map((l) => `${l.testName}: ${l.value} ${l.unit} [${l.flag}]`).join('; ')}
Vitals: BP ${patient.vitals.bloodPressure}, HR ${patient.vitals.heartRate} bpm, SpO2 ${patient.vitals.spO2}%, Temp ${patient.vitals.temperature}°C

================================================================================
VERIFICATION CERTIFICATE: ECHO-ID-CONFIDENTIAL-HASH-9981A
ELECTRONIC AUDIT LOG ENTRY FILED: ICU-WS-04
================================================================================`;

    return redactPhi(raw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <EchoLogo size="md" showSubtitle={false} showConfidentialBadge={true} />
            <div className="w-px h-8 bg-slate-800 hidden sm:block" />
            <img
              src={patient.avatarUrl}
              alt={patient.fullName}
              className="w-11 h-11 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">{patient.fullName}</h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  {patient.mrn}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {patient.department}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {patient.age} y/o {patient.gender} • Blood: {patient.bloodType} • Room: {patient.roomBed} • Attending: {patient.attendingPhysician}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-700/50 text-rose-300 text-[10px] font-mono font-bold tracking-wider uppercase">
              <Lock className="w-3 h-3 text-rose-400" />
              <span>STRICTLY CONFIDENTIAL</span>
            </span>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Confidentiality Notice Bar */}
        <div className="px-4 py-1 bg-rose-950/30 border-b border-rose-900/30 flex items-center justify-between text-[10px] font-mono text-rose-300/90 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-2.5 h-2.5 text-rose-400" />
            <span>CONFIDENTIAL MEDICAL RECORD • HIPAA PRIVACY SAFEGUARD (45 CFR § 164.530)</span>
          </div>
          <span className="text-slate-500">AUDIT TRAIL LOGGED: ICU-WS-04</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 border-b border-slate-800 bg-slate-900/90 overflow-x-auto shrink-0">
          {[
            { id: 'summary', label: 'Summary', icon: User },
            { id: 'vitals', label: 'Vitals & Trends', icon: Activity },
            { id: 'meds', label: `Medications (${patient.medications.length})`, icon: Pill },
            { id: 'labs', label: `Labs (${patient.labResults.length})`, icon: FlaskConical },
            { id: 'notes', label: `Clinical Notes (${patient.clinicalNotes.length})`, icon: FileText },
            { id: 'export', label: 'HIPAA Export', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-5">
              {/* Problem List / Diagnoses */}
              <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Active Problem List & ICD-10 Diagnoses</span>
                  <span className="text-cyan-400 font-mono text-[11px]">{patient.diagnoses.length} Diagnoses</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {patient.diagnoses.map((diag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                            {diag.code}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            diag.type === 'Primary' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {diag.type}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 mt-1">{diag.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{diag.dateAdded}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies & Code Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Documented Allergies
                  </h3>
                  {patient.allergies.length === 0 ? (
                    <p className="text-xs text-emerald-400 font-semibold">No Known Drug Allergies (NKDA)</p>
                  ) : (
                    <div className="space-y-2">
                      {patient.allergies.map((all, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-800/40 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-rose-300">{all.allergen}</span>
                            <p className="text-[11px] text-slate-400">{all.reaction}</p>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/60">
                            {all.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-2.5 text-xs text-slate-300">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Encounter & Resuscitation Directives
                  </h3>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Code Status:</span>
                    <span className="font-bold text-slate-100">{patient.codeStatus}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Admission Date:</span>
                    <span className="font-mono text-slate-200">{patient.admissionDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Attending Physician:</span>
                    <span className="font-medium text-slate-200">{patient.attendingPhysician}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">ID Verification:</span>
                    <span className="text-emerald-400 font-semibold">{patient.idVerification.method}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VITALS & TRENDS */}
          {activeTab === 'vitals' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Heart Rate</span>
                  <div className="text-2xl font-black font-mono text-rose-400 mt-1">{patient.vitals.heartRate} <span className="text-xs font-normal text-slate-400">bpm</span></div>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Blood Pressure</span>
                  <div className="text-2xl font-black font-mono text-cyan-300 mt-1">{patient.vitals.bloodPressure}</div>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Oxygen Sat (SpO2)</span>
                  <div className="text-2xl font-black font-mono text-teal-400 mt-1">{patient.vitals.spO2}%</div>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Respirations</span>
                  <div className="text-2xl font-black font-mono text-slate-200 mt-1">{patient.vitals.respiratoryRate} <span className="text-xs font-normal text-slate-400">/min</span></div>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Temperature</span>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-1">{patient.vitals.temperature}°C</div>
                </div>
              </div>

              {/* Vitals Trend Table */}
              <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Telemetry & Flowsheet Timeline
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 px-3 font-semibold">Time</th>
                        <th className="py-2 px-3 font-semibold">Heart Rate</th>
                        <th className="py-2 px-3 font-semibold">Blood Pressure</th>
                        <th className="py-2 px-3 font-semibold">SpO2</th>
                        <th className="py-2 px-3 font-semibold">Resp Rate</th>
                        <th className="py-2 px-3 font-semibold">Temp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {patient.vitals.history.map((pt, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="py-2.5 px-3 text-slate-300 font-bold">{pt.time}</td>
                          <td className="py-2.5 px-3 text-rose-400">{pt.hr} bpm</td>
                          <td className="py-2.5 px-3 text-cyan-300">{pt.bpSys}/{pt.bpDia}</td>
                          <td className="py-2.5 px-3 text-teal-400">{pt.spo2}%</td>
                          <td className="py-2.5 px-3 text-slate-300">{pt.rr} /min</td>
                          <td className="py-2.5 px-3 text-amber-400">{pt.temp}°C</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEDICATIONS */}
          {activeTab === 'meds' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Medication Administration Record (MAR)
                </h3>
                <button
                  onClick={() => setShowAddMed(!showAddMed)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Order Medication</span>
                </button>
              </div>

              {/* Add Med Inline Form */}
              {showAddMed && (
                <form onSubmit={handleAddMedication} className="p-4 rounded-2xl bg-slate-950 border border-cyan-800/60 space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-bold text-cyan-300">New Medication Order</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Drug Name</label>
                      <input
                        type="text"
                        value={medName}
                        onChange={(e) => handleMedNameChange(e.target.value)}
                        placeholder="e.g. Furosemide, Lisinopril..."
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Dosage</label>
                      <input
                        type="text"
                        value={medDose}
                        onChange={(e) => setMedDose(e.target.value)}
                        placeholder="e.g. 40 mg IV"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Frequency</label>
                      <input
                        type="text"
                        value={medFreq}
                        onChange={(e) => setMedFreq(e.target.value)}
                        placeholder="e.g. Twice daily, Q8H"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Route</label>
                      <select
                        value={medRoute}
                        onChange={(e) => setMedRoute(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                      >
                        <option value="Oral">Oral</option>
                        <option value="Intravenous">Intravenous (IV)</option>
                        <option value="Subcutaneous">Subcutaneous (SubQ)</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Topical">Topical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Clinical Indication</label>
                    <input
                      type="text"
                      value={medIndication}
                      onChange={(e) => setMedIndication(e.target.value)}
                      placeholder="e.g. Fluid retention, rate control..."
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {medWarning && (
                    <div className="p-2.5 rounded-lg bg-rose-950 border border-rose-700 text-rose-300 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{medWarning}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMed(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Sign & Prescribe
                    </button>
                  </div>
                </form>
              )}

              {/* Medications List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patient.medications.map((med) => (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-100">{med.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            med.status === 'Active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : med.status === 'Held'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {med.status}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-cyan-400 mt-1">
                        {med.dosage} • {med.frequency} • {med.route}
                      </div>
                      {med.indications && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          Indication: {med.indications}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between text-[10px] text-slate-500">
                      <span>Ordered by: {med.prescribedBy}</span>
                      <span>Started: {med.startDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LABS */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hospital Pathology & Diagnostics Panels
              </h3>
              <div className="overflow-x-auto bg-slate-950/60 rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-4 font-semibold">Test Name</th>
                      <th className="py-2.5 px-4 font-semibold">Category</th>
                      <th className="py-2.5 px-4 font-semibold">Result Value</th>
                      <th className="py-2.5 px-4 font-semibold">Ref Range</th>
                      <th className="py-2.5 px-4 font-semibold">Status / Flag</th>
                      <th className="py-2.5 px-4 font-semibold font-mono">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {patient.labResults.map((lab) => (
                      <tr key={lab.id} className="hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-bold text-slate-200">{lab.testName}</td>
                        <td className="py-3 px-4 text-slate-400">{lab.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-100">
                          {lab.value} <span className="text-[11px] font-normal text-slate-400">{lab.unit}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{lab.referenceRange}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lab.flag === 'Critical'
                                ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
                                : lab.flag === 'High'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : lab.flag === 'Low'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            }`}
                          >
                            {lab.flag}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{lab.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Physician & Nursing Clinical Documentation
                </h3>
                <button
                  onClick={() => setShowAddNote(!showAddNote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Clinical Note</span>
                </button>
              </div>

              {/* Add Note Modal/Form */}
              {showAddNote && (
                <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-slate-950 border border-cyan-800/60 space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-cyan-300">Compose SOAP Clinical Note</h4>
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100"
                    >
                      <option value="SOAP Note">SOAP Note</option>
                      <option value="Progress Note">Progress Note</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Operative Note">Operative Note</option>
                      <option value="Nursing Handoff">Nursing Handoff</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={noteSubjective}
                      onChange={(e) => setNoteSubjective(e.target.value)}
                      placeholder="Subjective: Patient symptoms, reports, pain levels..."
                      className="w-full h-16 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                    <textarea
                      value={noteObjective}
                      onChange={(e) => setNoteObjective(e.target.value)}
                      placeholder="Objective: Physical exam findings, telemetry, fluid balance..."
                      className="w-full h-16 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                    <textarea
                      value={noteAssessment}
                      onChange={(e) => setNoteAssessment(e.target.value)}
                      placeholder="Assessment: Clinical reasoning, response to therapy..."
                      className="w-full h-16 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                    <textarea
                      value={notePlan}
                      onChange={(e) => setNotePlan(e.target.value)}
                      placeholder="Plan: Medication adjustments, diagnostic orders, discharge criteria..."
                      className="w-full h-16 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddNote(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Electronically Sign & Save
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              <div className="space-y-4">
                {patient.clinicalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-300">{note.type}</span>
                        <span className="text-[11px] text-slate-400">• {note.author} ({note.role})</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">{note.timestamp}</span>
                    </div>

                    {note.subjective && (
                      <div className="text-xs">
                        <span className="font-bold text-slate-300">S: </span>
                        <span className="text-slate-300">{note.subjective}</span>
                      </div>
                    )}
                    {note.objective && (
                      <div className="text-xs">
                        <span className="font-bold text-slate-300">O: </span>
                        <span className="text-slate-300">{note.objective}</span>
                      </div>
                    )}
                    {note.assessment && (
                      <div className="text-xs">
                        <span className="font-bold text-slate-300">A: </span>
                        <span className="text-slate-300">{note.assessment}</span>
                      </div>
                    )}
                    {note.plan && (
                      <div className="text-xs">
                        <span className="font-bold text-slate-300">P: </span>
                        <span className="text-slate-300">{note.plan}</span>
                      </div>
                    )}
                    {!note.subjective && (
                      <p className="text-xs text-slate-300 whitespace-pre-wrap">{note.content}</p>
                    )}

                    {note.digitalSignature && (
                      <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Electronically Signed: {note.digitalSignature}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EXPORT & PHI DE-IDENTIFICATION */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>HIPAA Safe Harbor De-Identification (45 CFR § 164.514)</span>
                  </div>
                  <p className="text-[11px] text-cyan-300/80">
                    All 18 HIPAA identifiers (Names, dates, MRN, contact info, geographical markers) are programmatically redacted prior to external export or research handoff.
                  </p>
                </div>
                <div className="shrink-0 p-2 rounded-xl bg-slate-950/80 border border-cyan-900/60 flex items-center gap-2">
                  <EchoLogo size="sm" showSubtitle={false} showConfidentialBadge={true} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Confidential Redacted Document Preview:</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getRedactedSummary());
                      onLogAudit('EXPORT_PHI', `Exported redacted summary for ${patient.mrn}`);
                      alert('Redacted clinical summary copied to clipboard.');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Copy Redacted Text</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap border border-slate-800 h-64 overflow-y-auto selection:bg-cyan-500 selection:text-slate-950">
                  {getRedactedSummary()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
