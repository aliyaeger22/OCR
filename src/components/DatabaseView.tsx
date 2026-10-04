/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Activity,
  Heart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Grid,
  List,
  Download,
  X
} from 'lucide-react';
import { PatientRecord } from '../types';
import { redactPhi } from '../utils/phi';
import { formatPatientId } from '../../shared/patientId';

interface DatabaseViewProps {
  patients: PatientRecord[];
  activePatient: PatientRecord;
  onSelectPatient: (patient: PatientRecord) => void;
  onOpenChartModal: (patient: PatientRecord) => void;
  onAddNewPatient: (patient: PatientRecord) => void;
  onLogAudit: (action: string, details: string) => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  onOpenChartModal,
  onAddNewPatient,
  onLogAudit
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAdmitModal, setShowAdmitModal] = useState(false);

  // New Patient Form
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('1985-05-15');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newBlood, setNewBlood] = useState('O+');
  const [newDept, setNewDept] = useState<PatientRecord['department']>('Emergency');
  const [newRoom, setNewRoom] = useState('ED-Bay 05');
  const [newDiagnosis, setNewDiagnosis] = useState('Acute Bronchitis');

  const departments = [
    'All',
    'Intensive Care Unit (ICU)',
    'Emergency',
    'Cardiology',
    'Neurology',
    'Surgical Stepdown'
  ];

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnoses.some((d) => d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.attendingPhysician.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMrn = formatPatientId(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const birthDate = new Date(newDob);
    let age = now.getFullYear() - birthDate.getFullYear();

    const newPt: PatientRecord = {
      id: `pt-${Date.now()}`,
      mrn: newMrn,
      fullName: newName,
      dob: newDob,
      age: Math.max(18, age),
      gender: newGender,
      bloodType: newBlood,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      department: newDept,
      roomBed: newRoom,
      attendingPhysician: 'Dr. Sarah Lin, MD (Attending)',
      admissionDate: now.toISOString().replace('T', ' ').substring(0, 16),
      status: 'Observation',
      triageScore: 3,
      codeStatus: 'Full Code',
      allergies: [],
      medications: [],
      diagnoses: [
        {
          code: 'R05.9',
          description: newDiagnosis,
          type: 'Primary',
          dateAdded: now.toISOString().split('T')[0]
        }
      ],
      vitals: {
        heartRate: 78,
        bloodPressure: '120/80',
        respiratoryRate: 16,
        temperature: 37.0,
        spO2: 98,
        painScore: 1,
        timestamp: 'Just now',
        history: [
          { time: 'Triage', hr: 78, bpSys: 120, bpDia: 80, spo2: 98, rr: 16, temp: 37.0 }
        ]
      },
      labResults: [],
      clinicalNotes: [
        {
          id: `note-adm-${Date.now()}`,
          author: 'Dr. Sarah Lin, MD',
          role: 'Attending Physician',
          type: 'Progress Note',
          content: `Initial clinical encounter for admission to ${newDept}. Triage assessment complete.`,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 16)
        }
      ],
      idVerification: {
        status: 'VERIFIED',
        method: 'Wristband Barcode Scan',
        verifiedBy: 'Admissions Desk',
        verifiedAt: now.toISOString().replace('T', ' ').substring(0, 16),
        wristbandUid: `ECHO-WB-${newMrn.replace('MRN-', '')}-ADM`
      }
    };

    onAddNewPatient(newPt);
    onLogAudit('VIEW_CHART', `Admitted new patient ${newPt.fullName} (${newPt.mrn}) to ${newPt.department}`);
    setShowAdmitModal(false);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, MRN, diagnosis, or attending..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Acuities</option>
            <option value="Critical">Critical</option>
            <option value="Observation">Observation</option>
            <option value="Stable">Stable</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Admit New Patient Button */}
          <button
            onClick={() => setShowAdmitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Admit Patient</span>
          </button>
        </div>
      </div>

      {/* Patients Display */}
      {filteredPatients.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-2">
          <p className="text-sm font-bold text-slate-300">No Patient Records Found</p>
          <p className="text-xs text-slate-500">
            No patients match query "{searchQuery}" in department "{selectedDept}".
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((p) => {
            const isCurrent = p.id === activePatient.id;
            return (
              <div
                key={p.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-slate-900 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top card row: photo, name, MRN */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                      />
                      <div>
                        <h3 className="text-sm font-black text-slate-100">{p.fullName}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs font-bold text-cyan-400">
                            {p.mrn}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {p.age}y {p.gender}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : p.status === 'Observation'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Location & Attending */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium text-cyan-300">{p.roomBed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-medium text-slate-200">{p.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Attending:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[150px]">{p.attendingPhysician}</span>
                    </div>
                  </div>

                  {/* Primary Diagnosis */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Primary Diagnosis:
                    </span>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1 mt-0.5">
                      {p.diagnoses[0]?.description || 'Under evaluation'}
                    </p>
                  </div>

                  {/* Mini Vitals Strip */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">HR</span>
                      <span className="text-xs font-bold text-rose-400">{p.vitals.heartRate}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">BP</span>
                      <span className="text-xs font-bold text-cyan-300">{p.vitals.bloodPressure}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">SpO2</span>
                      <span className="text-xs font-bold text-teal-400">{p.vitals.spO2}%</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => onSelectPatient(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isCurrent ? 'Active Chart' : 'Select'}
                  </button>

                  <button
                    onClick={() => onOpenChartModal(p)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                    title="View Full Chart Modal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">MRN</th>
                <th className="py-3 px-4">Department & Bed</th>
                <th className="py-3 px-4">Acuity Status</th>
                <th className="py-3 px-4">Primary Diagnosis</th>
                <th className="py-3 px-4">Vitals</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.map((p) => {
                const isCurrent = p.id === activePatient.id;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2.5">
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <span>{p.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{p.mrn}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{p.department}</div>
                      <div className="text-[10px] text-slate-500">{p.roomBed}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'Critical'
                            ? 'bg-rose-950 text-rose-300'
                            : p.status === 'Observation'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 max-w-xs truncate">
                      {p.diagnoses[0]?.description || 'Under evaluation'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      HR {p.vitals.heartRate} • {p.vitals.bloodPressure}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectPatient(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isCurrent
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isCurrent ? 'Active' : 'Select'}
                        </button>
                        <button
                          onClick={() => onOpenChartModal(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admit New Patient Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAdmitModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Admit New Patient to Echo EHR</h3>
                <p className="text-xs text-slate-400">Generate electronic record & wristband token</p>
              </div>
            </div>

            <form onSubmit={handleAdmitSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Blood Type</label>
                  <select
                    value={newBlood}
                    onChange={(e) => setNewBlood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Intensive Care Unit (ICU)">ICU</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Surgical Stepdown">Surgical Stepdown</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Room / Bed</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. ED-Bay 04"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Primary Admission Reason</label>
                <input
                  type="text"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="e.g. Acute exacerbation, observation..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-600/20"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
