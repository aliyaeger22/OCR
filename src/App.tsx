/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ViewTab, PatientRecord, AuditLogEntry, OcrScanResult, ClinicalNote } from './types';
import { INITIAL_PATIENTS, INITIAL_AUDIT_LOGS, CLINICAL_ALERTS_MAP } from './data/sampleCharts';
import { calculateAuditHash } from './utils/phi';
import { Navbar } from './components/Navbar';
import { PatientIdPanel } from './components/PatientIdPanel';
import { ClinicalIntelligenceView } from './components/ClinicalIntelligenceView';
import { DatabaseView } from './components/DatabaseView';
import { OcrScanner } from './components/OcrScanner';
import { HandwritingScratchpad } from './components/HandwritingScratchpad';
import { HipaaAuditView } from './components/HipaaAuditView';
import { RecordDetailModal } from './components/RecordDetailModal';
import { TerminalLockModal } from './components/TerminalLockModal';
import { EchoLogo } from './components/EchoLogo';
import { Lock } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>('pt-001');
  const [activeTab, setActiveTab] = useState<ViewTab>('clinical');
  const [alertsMap, setAlertsMap] = useState(CLINICAL_ALERTS_MAP);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Terminal Lock & Inactivity State (HIPAA § 164.312(a)(2)(iii))
  const [isTerminalLocked, setIsTerminalLocked] = useState<boolean>(false);
  const [inactivitySec, setInactivitySec] = useState<number>(300); // 5 min auto-lock

  // Record Detail Modal
  const [modalPatient, setModalPatient] = useState<PatientRecord | null>(null);

  const activePatient =
    patients.find((p) => p.id === activePatientId) || patients[0];

  // Helper to append secure audit logs
  const logAudit = useCallback((action: string, details: string) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const targetMrn = activePatient ? activePatient.mrn : 'N/A';
    const targetName = activePatient ? activePatient.fullName : 'System-wide';

    const hash = calculateAuditHash({
      timestamp,
      user: 'Dr. Sarah Lin, MD',
      action,
      patientMrn: targetMrn,
      terminalId: 'ICU-WS-04'
    });

    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      user: 'Dr. Sarah Lin, MD',
      role: 'Attending Intensivist',
      action: action as any,
      patientMrn: targetMrn,
      patientName: targetName,
      terminalId: 'ICU-WS-04',
      ipAddress: '10.142.12.84',
      details,
      hash,
      verificationStatus: 'SECURE'
    };

    setAuditLogs((prev) => [newEntry, ...prev]);
  }, [activePatient]);

  // Inactivity auto-lock countdown timer
  useEffect(() => {
    if (isTerminalLocked) return;

    const interval = setInterval(() => {
      setInactivitySec((prev) => {
        if (prev <= 1) {
          setIsTerminalLocked(true);
          logAudit('TERMINAL_LOCK', 'Automated timeout lock engaged after 5 min inactivity');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTerminalLocked, logAudit]);

  // Reset inactivity timer on user interaction
  useEffect(() => {
    const handleUserActivity = () => {
      if (!isTerminalLocked) {
        setInactivitySec(300);
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [isTerminalLocked]);

  const handleSelectPatient = (patient: PatientRecord) => {
    setActivePatientId(patient.id);
    logAudit('VIEW_CHART', `Switched active clinical workspace to ${patient.fullName} (${patient.mrn})`);
  };

  const handleLockTerminal = () => {
    setIsTerminalLocked(true);
    logAudit('TERMINAL_LOCK', 'Manual workstation screen lock activated by clinician');
  };

  const handleUnlockTerminal = () => {
    setIsTerminalLocked(false);
    setInactivitySec(300);
    logAudit('TERMINAL_UNLOCK', 'Workstation successfully unlocked via authenticated PIN / Biometric');
  };

  const handleUpdatePatient = (updated: PatientRecord) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (modalPatient && modalPatient.id === updated.id) {
      setModalPatient(updated);
    }
  };

  const handleAddNewPatient = (newPt: PatientRecord) => {
    setPatients((prev) => [newPt, ...prev]);
    setActivePatientId(newPt.id);
  };

  const handleCommitOcrData = (scan: OcrScanResult, targetPatientId: string) => {
    setPatients((prev) =>
      prev.map((pt) => {
        if (pt.id !== targetPatientId) return pt;

        const updatedNotes: ClinicalNote[] = [
          {
            id: `note-ocr-${Date.now()}`,
            author: 'Echo OCR Vision System',
            role: 'Clinical Document Ingestion',
            type: 'OCR Ingested',
            content: `Document Type: ${scan.documentType}\nConfidence: ${scan.confidence}%\n\nRaw Text:\n${scan.extractedText}\n\nStructured Findings:\n${scan.structuredFields.findings.join('\n')}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            digitalSignature: `OCR-HASH-${Date.now().toString(16)}`
          },
          ...pt.clinicalNotes
        ];

        // Also add any extracted medications if present
        let updatedMeds = [...pt.medications];
        if (scan.structuredFields.medications) {
          scan.structuredFields.medications.forEach((m, i) => {
            if (!updatedMeds.some((x) => x.name.toLowerCase().includes(m.name.toLowerCase()))) {
              updatedMeds.push({
                id: `med-ocr-${Date.now()}-${i}`,
                name: m.name,
                dosage: m.dose,
                frequency: m.freq,
                route: 'Oral / IV per order',
                startDate: new Date().toISOString().split('T')[0],
                status: 'Active',
                prescribedBy: 'External Transfer Record (OCR)'
              });
            }
          });
        }

        return {
          ...pt,
          clinicalNotes: updatedNotes,
          medications: updatedMeds
        };
      })
    );
  };

  const handleSaveHandwritingNote = (newNote: ClinicalNote) => {
    setPatients((prev) =>
      prev.map((pt) => {
        if (pt.id !== activePatient.id) return pt;
        return {
          ...pt,
          clinicalNotes: [newNote, ...pt.clinicalNotes]
        };
      })
    );
  };

  const handleDismissAlert = (alertId: string) => {
    if (!activePatient) return;
    setAlertsMap((prev) => {
      const currentList = prev[activePatient.mrn] || [];
      return {
        ...prev,
        [activePatient.mrn]: currentList.filter((a) => a.id !== alertId)
      };
    });
    logAudit('DIAGNOSTIC_QUERY', `Clinician acknowledged clinical decision alert ${alertId}`);
  };

  const currentAlerts = alertsMap[activePatient.mrn] || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top System Confidentiality Bar */}
      <div className="bg-slate-900/95 border-b border-cyan-900/50 text-[10px] sm:text-[11px] font-mono text-cyan-300/90 py-1 px-3 sm:px-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-slate-200">ECHO HEALTHCARE SYSTEM (E+)</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">RESTRICTED CLINICAL WORKSTATION</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/70 text-[9px] uppercase tracking-wider">
              <Lock className="w-2.5 h-2.5 text-rose-400" />
              <span>STRICTLY CONFIDENTIAL • 45 CFR § 164.530</span>
            </span>
          </div>
        </div>
      </div>

      {/* Hospital Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePatient={activePatient}
        allPatients={patients}
        onSelectPatient={handleSelectPatient}
        onLockTerminal={handleLockTerminal}
        inactivityRemainingSec={inactivitySec}
      />

      {/* Main Clinical Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-6">
        {/* Active Patient ID Bar */}
        <PatientIdPanel
          patient={activePatient}
          onOpenChartModal={() => setModalPatient(activePatient)}
          onVerifyId={() => {
            logAudit('PATIENT_ID_VERIFIED', `Confirmed 2-Factor Barcode identification on wristband ${activePatient.idVerification.wristbandUid}`);
            alert(`2-Factor Wristband Verification Re-Confirmed for ${activePatient.fullName} (${activePatient.mrn}). Logged to HIPAA Audit Trail.`);
          }}
        />

        {/* View Routing */}
        {activeTab === 'clinical' && (
          <ClinicalIntelligenceView
            patient={activePatient}
            alerts={currentAlerts}
            onDismissAlert={handleDismissAlert}
            onLogAudit={logAudit}
            onOpenChartModal={() => setModalPatient(activePatient)}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseView
            patients={patients}
            activePatient={activePatient}
            onSelectPatient={handleSelectPatient}
            onOpenChartModal={(p) => setModalPatient(p)}
            onAddNewPatient={handleAddNewPatient}
            onLogAudit={logAudit}
          />
        )}

        {activeTab === 'ocr' && (
          <OcrScanner
            activePatient={activePatient}
            onCommitOcrData={handleCommitOcrData}
            onLogAudit={logAudit}
          />
        )}

        {activeTab === 'handwriting' && (
          <HandwritingScratchpad
            activePatient={activePatient}
            onSaveNote={handleSaveHandwritingNote}
            onLogAudit={logAudit}
          />
        )}

        {activeTab === 'hipaa' && (
          <HipaaAuditView logs={auditLogs} onLogAudit={logAudit} />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-3 px-4 text-center text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <EchoLogo size="sm" showSubtitle={false} />
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>HL7 FHIR R4 COMPLIANT • E+ CLINICAL SYSTEM</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 text-[9px] uppercase">
            PRIVILEGED PHI
          </span>
          <span>HIPAA SECURITY RULE § 164.312 • 256-BIT ENCRYPTION</span>
        </div>
      </footer>

      {/* Full Patient Chart Modal */}
      {modalPatient && (
        <RecordDetailModal
          isOpen={!!modalPatient}
          onClose={() => setModalPatient(null)}
          patient={modalPatient}
          onUpdatePatient={handleUpdatePatient}
          onLogAudit={logAudit}
        />
      )}

      {/* Terminal Lock Security Screen */}
      <TerminalLockModal
        isOpen={isTerminalLocked}
        onUnlock={handleUnlockTerminal}
      />
    </div>
  );
}
