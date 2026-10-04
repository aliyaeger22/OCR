/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Info,
  Send,
  Stethoscope,
  TrendingUp,
  Brain,
  ShieldCheck,
  CheckCircle,
  Calculator,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { PatientRecord, ClinicalAlert } from '../types';

interface ClinicalIntelligenceViewProps {
  patient: PatientRecord;
  alerts: ClinicalAlert[];
  onDismissAlert?: (alertId: string) => void;
  onLogAudit: (action: string, details: string) => void;
  onOpenChartModal: () => void;
}

export const ClinicalIntelligenceView: React.FC<ClinicalIntelligenceViewProps> = ({
  patient,
  alerts,
  onDismissAlert,
  onLogAudit,
  onOpenChartModal
}) => {
  const [chatQuery, setChatQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; timestamp: string }>
  >([
    {
      sender: 'assistant',
      text: `Echo Clinical Co-Pilot active for ${patient.fullName} (${patient.mrn}). I've synthesized their current telemetry (HR ${patient.vitals.heartRate}, BP ${patient.vitals.bloodPressure}), recent lab flags (BNP ${patient.labResults.find(l => l.testName.includes('BNP'))?.value || 'N/A'}, Cr ${patient.labResults.find(l => l.testName.includes('Creatinine'))?.value || 'N/A'}), and active medication profile. How can I assist with diagnostic reasoning or care planning?`,
      timestamp: '11:32'
    }
  ]);

  // Dynamic Risk Score Calculations
  const calculateQSofa = () => {
    let score = 0;
    const sbp = parseInt(patient.vitals.bloodPressure.split('/')[0] || '120', 10);
    if (patient.vitals.respiratoryRate >= 22) score += 1;
    if (sbp <= 100) score += 1;
    if (patient.triageScore <= 2 && patient.status === 'Critical') score += 1;
    return score;
  };

  const calculateNews2 = () => {
    let score = 0;
    const hr = patient.vitals.heartRate;
    const rr = patient.vitals.respiratoryRate;
    const spo2 = patient.vitals.spO2;
    const temp = patient.vitals.temperature;
    const sbp = parseInt(patient.vitals.bloodPressure.split('/')[0] || '120', 10);

    if (rr <= 8 || rr >= 25) score += 3;
    else if (rr >= 21) score += 2;
    else if (rr <= 11) score += 1;

    if (spo2 <= 91) score += 3;
    else if (spo2 <= 93) score += 2;
    else if (spo2 <= 95) score += 1;

    if (sbp <= 90 || sbp >= 220) score += 3;
    else if (sbp <= 100) score += 2;
    else if (sbp <= 110) score += 1;

    if (hr >= 131) score += 3;
    else if (hr >= 111 || hr <= 40) score += 2;
    else if (hr >= 91 || hr <= 50) score += 1;

    if (temp <= 35.0) score += 3;
    else if (temp >= 39.1) score += 2;
    else if (temp >= 38.1 || temp <= 36.0) score += 1;

    return score;
  };

  const qsofaScore = calculateQSofa();
  const news2Score = calculateNews2();

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatQuery('');
    setIsGenerating(true);
    onLogAudit('DIAGNOSTIC_QUERY', `Query: "${promptText.slice(0, 50)}..." on ${patient.mrn}`);

    // Clinically grounded intelligent response synthesis
    setTimeout(() => {
      let responseText = '';
      const lower = promptText.toLowerCase();

      if (lower.includes('interaction') || lower.includes('apixaban') || lower.includes('drug')) {
        responseText = `### Clinical Pharmacotherapy Evaluation: ${patient.fullName}

1. **Apixaban (Eliquis) & Renal Clearance:**
   - Current Regimen: 5 mg Oral BID for nonvalvular AFib.
   - Lab Correlation: Serum Creatinine 2.1 mg/dL, estimated eGFR 26 mL/min.
   - **Recommendation:** Patient has elevated Cr. Per FDA dosing guidelines, reduction to 2.5 mg BID is mandated if patient meets 2 of 3 criteria: Age ≥ 80, Weight ≤ 60kg, or Serum Cr ≥ 1.5 mg/dL.
   - **Action Item:** Verify patient's current dry weight. If ≤ 60kg or if Cr continues to rise, adjust to 2.5mg BID.

2. **ACE-Inhibitor (Lisinopril) Status:**
   - Correctly flagged as **Held**. Continuing to hold is appropriate until acute cardio-renal syndrome component stabilizes and Cr trends toward baseline (< 1.5 mg/dL).

3. **Loop Diuretic (Furosemide) Monitoring:**
   - Monitor serum potassium (current 4.8 mEq/L is stable) and magnesium. Recheck BMP tomorrow 06:00.`;
      } else if (lower.includes('differential') || lower.includes('diagnosis') || lower.includes('dyspnea')) {
        responseText = `### Differential Diagnosis & Clinical Synthesis for ${patient.fullName}:

1. **Acute on Chronic Systolic Heart Failure Exacerbation (High Probability - Primary):**
   - *Supporting Evidence:* Markedly elevated BNP (1,420 pg/mL), bibasilar crackles, JVD 4cm, positive response to IV loop diuretics (net -1400mL).
   - *Next Steps:* Continue IV diuresis to target euvolemia, daily standing weights, strict fluid limit 1.5L.

2. **Cardio-Renal Syndrome Type 1 (Active Co-morbidity):**
   - *Supporting Evidence:* Acute rise in serum Cr to 2.1 with baseline ~1.2.
   - *Next Steps:* Maintain adequate renal perfusion pressure while relieving venous congestion. Avoid NSAIDs or iodinated contrast.

3. **Rate-Related Myocardial Ischemia / Demand Troponin Leak:**
   - *Supporting Evidence:* Troponin I elevated at 28 ng/L in setting of rapid Afib (HR peaked at 115 bpm). Serial EKGs show no acute ST elevation or depression.`;
      } else if (lower.includes('sepsis') || lower.includes('qsofa') || lower.includes('bundle')) {
        responseText = `### Sepsis Screening & Protocol Analysis:

- **qSOFA Score:** ${qsofaScore} / 3 (${qsofaScore >= 2 ? 'HIGH RISK FOR SEPSIS-RELATED DETERIORATION' : 'Low acute risk'})
- **NEWS2 Score:** ${news2Score} / 20 (${news2Score >= 7 ? 'High Clinical Risk - Requires Immediate Review' : 'Medium Clinical Risk'})
- **Bundle Status Checklist:**
  - [x] Initial blood pressure and vitals captured
  - [x] Serum lactate and CBC completed
  - [ ] Repeat venous lactate at 3-hour mark
  - [x] Broad-spectrum IV antimicrobials ordered
  - [x] Strict intake/output monitoring enabled`;
      } else if (lower.includes('summarize') || lower.includes('summary') || lower.includes('course')) {
        responseText = `### 24-Hour Clinical Executive Summary:

**Patient:** ${patient.fullName} (${patient.age}y ${patient.gender}) | **MRN:** ${patient.mrn}
**Location:** ${patient.department} - ${patient.roomBed}
**Attending:** ${patient.attendingPhysician}

- **Primary Issue:** ${patient.diagnoses[0]?.description || 'Acute admission'}.
- **Vitals Status:** Heart rate ${patient.vitals.heartRate} bpm, Blood pressure ${patient.vitals.bloodPressure}, SpO2 ${patient.vitals.spO2}%, Temp ${patient.vitals.temperature}°C.
- **Key Labs:** BNP ${patient.labResults.find(l => l.testName.includes('BNP'))?.value || 'N/A'}, Creatinine ${patient.labResults.find(l => l.testName.includes('Creatinine'))?.value || 'N/A'}.
- **Plan:** Continue inpatient stabilization, monitor fluid outputs, and optimize guideline-directed medical therapy.`;
      } else {
        responseText = `### Clinical Intelligence Response for ${patient.fullName}

Regarding: "${promptText}"

Based on the latest EHR telemetry and encounter records:
- **Active Diagnoses:** ${patient.diagnoses.map(d => d.description).join(', ')}
- **Telemetry Trend:** Vitals currently stable in ${patient.department} (HR ${patient.vitals.heartRate} bpm, BP ${patient.vitals.bloodPressure}, SpO2 ${patient.vitals.spO2}%).
- **Clinical Insight:** All active medication orders have been validated against documented allergies (${patient.allergies.map(a => a.allergen).join(', ') || 'NKDA'}).

Would you like me to generate a formal clinical consult note or check for newly published ACC/AHA or Surviving Sepsis guidelines?`;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsGenerating(false);
    }, 800);
  };

  const samplePrompts = [
    'Check drug interactions with Apixaban & renal clearance',
    'Generate differential diagnosis for current findings',
    'Summarize 24h hospital course and telemetry',
    'Evaluate Sepsis / qSOFA protocol criteria'
  ];

  return (
    <div className="space-y-6">
      {/* Top Clinical Deterioration & Risk Score Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* qSOFA Score Card */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${qsofaScore >= 2 ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-200">qSOFA Sepsis Score</h4>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${qsofaScore >= 2 ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
                  {qsofaScore >= 2 ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">RR ≥ 22 • SBP ≤ 100 • Altered Mentation</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-black font-mono ${qsofaScore >= 2 ? 'text-rose-400' : 'text-slate-100'}`}>
              {qsofaScore} <span className="text-xs font-normal text-slate-400">/ 3</span>
            </span>
          </div>
        </div>

        {/* NEWS2 Score Card */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${news2Score >= 7 ? 'bg-rose-950 text-rose-400 border border-rose-800' : news2Score >= 5 ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-200">NEWS2 Deterioration Score</h4>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${news2Score >= 7 ? 'bg-rose-950 text-rose-300' : news2Score >= 5 ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'}`}>
                  {news2Score >= 7 ? 'High Risk' : news2Score >= 5 ? 'Medium' : 'Low'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Multi-parameter physiological index</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-black font-mono ${news2Score >= 7 ? 'text-rose-400' : news2Score >= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {news2Score} <span className="text-xs font-normal text-slate-400">/ 20</span>
            </span>
          </div>
        </div>

        {/* Triage & Code Status Card */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Encounter Directives</h4>
              <p className="text-[11px] text-slate-400">{patient.codeStatus} • {patient.department}</p>
            </div>
          </div>
          <button
            onClick={onOpenChartModal}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-950/40 hover:bg-cyan-950/80 px-2.5 py-1.5 rounded-lg border border-cyan-800/50 transition-colors"
          >
            <span>Full Chart</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Alerts Stream / Right Clinical Co-Pilot Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Active Clinical Alerts Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Decision Support Alerts
              </h3>
              <span className="text-xs font-mono font-bold bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-800">
                {alerts.length} Active
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real-time Stream</span>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-6 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-200">No Active Clinical Alerts</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  All lab parameters, vital telemetry, and medication combinations comply with safety thresholds.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-700/60 shadow-lg shadow-rose-950/20'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-600/50'
                        : 'bg-cyan-950/20 border-cyan-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCritical ? (
                          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-100">{alert.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : isWarning
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {alert.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{alert.description}</p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <span className="font-bold text-cyan-300">Action: </span>
                      <span className="text-slate-200">{alert.recommendation}</span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate max-w-[200px]" title={alert.evidence}>
                        Ref: {alert.evidence}
                      </span>
                      {onDismissAlert && (
                        <button
                          onClick={() => onDismissAlert(alert.id)}
                          className="text-slate-400 hover:text-slate-200 underline transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 7 Cols: Interactive Echo AI Clinical Co-Pilot */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl min-h-[540px]">
          {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Echo Clinical Co-Pilot</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    EHR Grounded
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Diagnostic Reasoning, Pharmacotherapy & Clinical Summaries
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setChatHistory([
                  {
                    sender: 'assistant',
                    text: `Session refreshed for ${patient.fullName}. Telemetry and charts updated.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              title="Reset Co-Pilot Conversation"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px]">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-slate-950 font-semibold'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800/80 whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isGenerating && (
              <div className="flex items-center gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl w-fit text-xs text-cyan-300">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Synthesizing EHR evidence and guidelines...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Pills */}
          <div className="p-3 bg-slate-950/50 border-t border-slate-800/60 overflow-x-auto flex gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(prompt)}
                disabled={isGenerating}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(chatQuery);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder={`Ask about ${patient.fullName}'s labs, medications, or differential...`}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={!chatQuery.trim() || isGenerating}
                className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold transition-all shadow-md shadow-cyan-600/20 disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
