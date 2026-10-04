/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  Heart,
  Activity,
  Wind,
  Thermometer,
  QrCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  Barcode,
  X,
  UserCheck,
  Lock
} from 'lucide-react';
import { PatientRecord } from '../types';
import { generateBarcodeBars } from '../../shared/patientId';
import { EchoLogo } from './EchoLogo';

interface PatientIdPanelProps {
  patient: PatientRecord;
  onOpenChartModal: () => void;
  onVerifyId?: () => void;
}

export const PatientIdPanel: React.FC<PatientIdPanelProps> = ({
  patient,
  onOpenChartModal,
  onVerifyId
}) => {
  const [showWristbandModal, setShowWristbandModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const barcodeBars = generateBarcodeBars(patient.mrn);

  const copyMrn = () => {
    navigator.clipboard.writeText(patient.mrn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCriticalAcuity = patient.triageScore <= 2;

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-cyan-500/5 via-teal-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Left: Patient Photo & Demographic Details */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={patient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                alt={patient.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-md ring-2 ring-slate-800"
              />
              <span
                className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isCriticalAcuity
                    ? 'bg-rose-950 text-rose-300 border-rose-600'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                }`}
              >
                ESI {patient.triageScore}
              </span>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight truncate">
                  {patient.fullName}
                </h1>

                {/* MRN badge with copy */}
                <button
                  onClick={copyMrn}
                  title="Click to copy MRN"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-mono text-xs font-bold transition-colors"
                >
                  <span>{patient.mrn}</span>
                  {copied ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-70" />
                  )}
                </button>

                {/* ID Verification Pill */}
                <button
                  onClick={() => setShowWristbandModal(true)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/60 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ID Verified</span>
                </button>

                {/* Confidential Indicator */}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-600/60 text-rose-300 text-[10px] font-mono font-bold tracking-wider uppercase">
                  <Lock className="w-2.5 h-2.5" />
                  <span>CONFIDENTIAL</span>
                </span>
              </div>

              {/* Subtitle demographics */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span>
                  <strong className="text-slate-200">{patient.age} y/o</strong> {patient.gender}
                </span>
                <span>•</span>
                <span>
                  DOB: <span className="font-mono text-slate-300">{patient.dob}</span>
                </span>
                <span>•</span>
                <span>
                  Blood: <strong className="text-slate-200">{patient.bloodType}</strong>
                </span>
                <span>•</span>
                <span className="text-cyan-400 font-medium">
                  {patient.roomBed}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-medium">
                  {patient.department}
                </span>
              </div>

              {/* Allergies Flags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Allergies:
                </span>
                {patient.allergies.length === 0 ? (
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                    No Known Drug Allergies (NKDA)
                  </span>
                ) : (
                  patient.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                        allergy.severity === 'Anaphylactic'
                          ? 'bg-rose-950/90 text-rose-200 border-rose-600 animate-pulse'
                          : 'bg-amber-950/80 text-amber-200 border-amber-600/70'
                      }`}
                      title={`${allergy.severity} reaction: ${allergy.reaction}`}
                    >
                      <AlertOctagon className="w-3 h-3 text-rose-400" />
                      <span>{allergy.allergen}</span>
                      <span className="text-[9px] opacity-75 font-normal uppercase">
                        ({allergy.severity})
                      </span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Real-Time Vitals Ribbon & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Vitals quick strip */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              {/* Heart Rate */}
              <div className="flex flex-col items-center justify-center px-2 py-1 bg-slate-900/60 rounded-lg">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Heart className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>HR</span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className={`text-sm font-black font-mono ${patient.vitals.heartRate > 100 || patient.vitals.heartRate < 60 ? 'text-amber-400' : 'text-slate-100'}`}>
                    {patient.vitals.heartRate}
                  </span>
                  <span className="text-[9px] text-slate-500">bpm</span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="flex flex-col items-center justify-center px-2 py-1 bg-slate-900/60 rounded-lg">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>BP</span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="text-sm font-black font-mono text-slate-100">
                    {patient.vitals.bloodPressure}
                  </span>
                </div>
              </div>

              {/* SpO2 */}
              <div className="flex flex-col items-center justify-center px-2 py-1 bg-slate-900/60 rounded-lg">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Wind className="w-3 h-3 text-teal-400" />
                  <span>SpO2</span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className={`text-sm font-black font-mono ${patient.vitals.spO2 < 95 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {patient.vitals.spO2}%
                  </span>
                </div>
              </div>

              {/* Temp */}
              <div className="flex flex-col items-center justify-center px-2 py-1 bg-slate-900/60 rounded-lg">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  <span>Temp</span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className={`text-sm font-black font-mono ${patient.vitals.temperature >= 38.0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {patient.vitals.temperature}°C
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Full Chart & Wristband ID */}
            <div className="flex sm:flex-col gap-2">
              <button
                onClick={onOpenChartModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/30 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Full Chart</span>
              </button>

              <button
                onClick={() => setShowWristbandModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Barcode className="w-3.5 h-3.5 text-cyan-400" />
                <span>ID Band</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Wristband & Barcode Modal */}
      {showWristbandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowWristbandModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Barcode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Hospital Wristband & Digital ID
                </h3>
                <p className="text-xs text-slate-400">
                  HL7 Compliant 2-Factor Patient Verification
                </p>
              </div>
            </div>

            {/* Simulated Hospital Physical Wristband */}
            <div className="p-4 bg-white text-slate-950 rounded-xl shadow-inner border border-slate-300 font-sans space-y-3">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2.5">
                  <EchoLogo size="sm" showSubtitle={false} />
                  <div>
                    <div className="text-[10px] tracking-widest uppercase font-bold text-slate-600 flex items-center gap-1.5">
                      <span>ECHO HEALTH SYSTEM</span>
                      <span className="text-[8px] font-mono font-bold bg-rose-100 text-rose-700 px-1 rounded">CONFIDENTIAL</span>
                    </div>
                    <div className="text-base font-black tracking-tight text-slate-900">
                      {patient.fullName}
                    </div>
                    <div className="text-xs text-slate-700 font-mono">
                      DOB: {patient.dob} ({patient.age}y) • {patient.gender}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-800">
                    {patient.mrn}
                  </div>
                  <div className="text-[10px] font-bold text-rose-700">
                    BLOOD: {patient.bloodType}
                  </div>
                </div>
              </div>

              {/* Barcode graphic visualization */}
              <div className="py-2 flex flex-col items-center justify-center bg-slate-50 rounded p-2">
                <div className="flex items-center justify-center gap-0.5 h-12 w-full overflow-hidden">
                  {barcodeBars.map((width, idx) => (
                    <div
                      key={idx}
                      className="bg-black h-full"
                      style={{ width: `${width * 2}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs font-semibold tracking-widest text-slate-800 mt-1">
                  *{patient.mrn}*
                </span>
              </div>

              {/* Verification Stamp */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600">
                <span>UID: {patient.idVerification.wristbandUid}</span>
                <span className="font-bold text-emerald-700">● RFID VERIFIED</span>
              </div>
            </div>

            {/* Verification Metadata Details */}
            <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {patient.idVerification.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="font-medium text-slate-200">{patient.idVerification.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified By:</span>
                <span className="font-medium text-slate-200">{patient.idVerification.verifiedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-300">{patient.idVerification.verifiedAt}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  onVerifyId?.();
                  setShowWristbandModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-600/20"
              >
                <UserCheck className="w-4 h-4" />
                <span>Re-Scan / Confirm Wristband</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
