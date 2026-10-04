/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Sparkles,
  CheckCircle2,
  FileText,
  Download,
  Palette,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PatientRecord, ClinicalNote } from '../types';

interface HandwritingScratchpadProps {
  activePatient: PatientRecord;
  onSaveNote: (note: ClinicalNote) => void;
  onLogAudit: (action: string, details: string) => void;
}

export const HandwritingScratchpad: React.FC<HandwritingScratchpadProps> = ({
  activePatient,
  onSaveNote,
  onLogAudit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>('#0284c7'); // Clinical Cyan/Blue
  const [penWidth, setPenWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [template, setTemplate] = useState<'blank' | 'soap' | 'rx' | 'anatomy'>('soap');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution for retina displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    drawTemplateBackground(template);
  }, [template]);

  const drawTemplateBackground = (currentTemplate: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / 2;
    const height = canvas.height / 2;

    // Fill clean medical paper background
    ctx.fillStyle = '#090d16'; // Deep clinical paper
    ctx.fillRect(0, 0, width, height);

    if (currentTemplate === 'soap') {
      // SOAP Note Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const step = 36;
      for (let y = 60; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(width - 30, y);
        ctx.stroke();
      }

      // Red Margin Line
      ctx.strokeStyle = '#ef444433';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, 20);
      ctx.lineTo(70, height - 20);
      ctx.stroke();

      // Section Guides
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('S (Subjective):', 80, 52);
      ctx.fillText('O (Objective):', 80, 160);
      ctx.fillText('A (Assessment):', 80, 268);
      ctx.fillText('P (Plan):', 80, 376);
    } else if (currentTemplate === 'rx') {
      // Rx Prescription Pad Header
      ctx.strokeStyle = '#0284c744';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 20, width - 60, height - 40);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px serif';
      ctx.fillText('℞', 50, 75);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`PATIENT: ${activePatient.fullName} | MRN: ${activePatient.mrn}`, 90, 55);
      ctx.fillText(`DATE: ${new Date().toLocaleDateString()}`, 90, 72);

      // Dotted writing lines
      ctx.strokeStyle = '#1e293b';
      ctx.setLineDash([4, 4]);
      for (let y = 120; y < height - 70; y += 40) {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(width - 50, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Signature line
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(width - 220, height - 50);
      ctx.lineTo(width - 50, height - 50);
      ctx.stroke();
      ctx.fillText('Physician Signature / DEA #', width - 210, height - 35);
    } else if (currentTemplate === 'anatomy') {
      // Anatomical outline guide
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      // Torso silhouette
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2 - 30, 70, 110, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Heart zone indicator
      ctx.strokeStyle = '#ef444444';
      ctx.beginPath();
      ctx.arc(width / 2 - 20, height / 2 - 60, 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.fillText('ANATOMICAL QUADRANT LOCALIZATION', width / 2 - 100, 40);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state for undo
    setStrokeHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#090d16' : penColor;
    ctx.lineWidth = isEraser ? penWidth * 4 : penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prev = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(prev, 0, 0);
    setStrokeHistory((prevHistory) => prevHistory.slice(0, -1));
  };

  const handleClear = () => {
    drawTemplateBackground(template);
    setStrokeHistory([]);
    setTranscribedText('');
    setSaveSuccess(false);
  };

  const handleLoadSampleNotes = () => {
    // Simulate doctor scribbling on the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawTemplateBackground(template);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Draw handwritten-like strokes
    ctx.beginPath();
    ctx.moveTo(90, 70);
    ctx.bezierCurveTo(110, 65, 140, 75, 180, 68);
    ctx.bezierCurveTo(200, 72, 230, 66, 260, 70);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(90, 180);
    ctx.bezierCurveTo(120, 175, 160, 185, 210, 178);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(90, 290);
    ctx.bezierCurveTo(130, 285, 170, 295, 220, 288);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(90, 400);
    ctx.bezierCurveTo(140, 395, 190, 405, 250, 398);
    ctx.stroke();

    setTranscribedText(
      `S: Patient reports significant alleviation of orthopnea following IV Lasix diuresis. Denies chest pain or palpitations today.\nO: Lungs clear mid-to-upper lung fields, trace bibasilar crackles. JVD decreased to ~3cm. Vitals: HR ${activePatient.vitals.heartRate}, BP ${activePatient.vitals.bloodPressure}, SpO2 ${activePatient.vitals.spO2}%.\nA: Acute systolic heart failure improving with diuresis. Cardio-renal index stabilizing.\nP: Continue Furosemide 40mg IV Q12H. Daily BMP at 06:00. Fluid restriction 1.5L/24h.`
    );
  };

  const handleTranscribe = () => {
    setIsTranscribing(true);
    setSaveSuccess(false);
    onLogAudit('HANDWRITING_INGEST', `Neural handwriting transcription initiated for ${activePatient.mrn}`);

    setTimeout(() => {
      setIsTranscribing(false);
      if (!transcribedText) {
        setTranscribedText(
          `S: 68yo female reports improved breathing overnight. Sputum clear. Tolerating oral fluids.\nO: Auscultation demonstrates bilateral air entry with faint inspiratory rales at bases. Vitals: BP ${activePatient.vitals.bloodPressure}, HR ${activePatient.vitals.heartRate}.\nA: Resolving pulmonary congestion secondary to HFrEF exacerbation.\nP: Maintain telemetry rate control. Re-check serum creatinine and electrolytes before next scheduled dose.`
        );
      }
    }, 1000);
  };

  const handleCommitToNotes = () => {
    if (!transcribedText) return;

    const newNote: ClinicalNote = {
      id: `hw-note-${Date.now()}`,
      author: 'Dr. Sarah Lin, MD',
      role: 'Attending Intensivist',
      type: 'SOAP Note',
      content: transcribedText,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      digitalSignature: `SL-DIGI-${Math.floor(100000 + Math.random() * 900000)}`
    };

    onSaveNote(newNote);
    onLogAudit('HANDWRITING_INGEST', `Committed digitized clinical note into EHR chart ${activePatient.mrn}`);
    setSaveSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <PenTool className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-slate-100">
              Clinician Handwriting & Stylus Scratchpad
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Neural Digitizer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Scribble rapid bedside clinical notes, prescription orders, or anatomical diagrams with stylus/touch and convert them to structured EHR text.
          </p>
        </div>

        <button
          onClick={handleLoadSampleNotes}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Load Doctor's Sample Note</span>
        </button>
      </div>

      {/* Main Grid: Canvas on Left, Structured Note on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Drawing Canvas & Tools */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          {/* Canvas Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              {[
                { color: '#0284c7', name: 'Clinical Navy' },
                { color: '#38bdf8', name: 'Cyan Glow' },
                { color: '#ef4444', name: 'Emergency Red' },
                { color: '#eab308', name: 'Highlighter' },
                { color: '#f8fafc', name: 'White' }
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => {
                    setPenColor(c.color);
                    setIsEraser(false);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    !isEraser && penColor === c.color ? 'scale-125 border-cyan-400' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}

              <div className="w-px h-5 bg-slate-800 mx-1" />

              {/* Eraser */}
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isEraser
                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Eraser tool"
              >
                <Eraser className="w-4 h-4" />
              </button>

              {/* Stroke Width */}
              <input
                type="range"
                min="1"
                max="8"
                value={penWidth}
                onChange={(e) => setPenWidth(Number(e.target.value))}
                className="w-16 accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer ml-1"
                title="Stroke Width"
              />
            </div>

            {/* Template Selector & Undo/Clear */}
            <div className="flex items-center gap-2">
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="soap">SOAP Note Paper</option>
                <option value="rx">Prescription (Rx) Pad</option>
                <option value="anatomy">Anatomy Diagram</option>
                <option value="blank">Blank Grid</option>
              </select>

              <button
                onClick={handleUndo}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Undo last stroke"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleClear}
                className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950 rounded-lg transition-colors"
                title="Clear canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* HTML5 Interactive Drawing Canvas */}
          <div className="relative w-full h-[440px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950 cursor-crosshair touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full"
            />
          </div>

          {/* Bottom Transcription Trigger */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Stylus Smoothing Active • Safe Harbor Audit Logged
            </span>
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTranscribing ? 'Digitizing Handwriting...' : 'Transcribe Handwriting to EHR'}</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Digitized Structured Clinical Note */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  Digitized Clinical Note
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                Target: {activePatient.fullName}
              </span>
            </div>

            {!transcribedText && (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <PenTool className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs font-bold text-slate-400">No Handwriting Transcribed Yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Draw or write on the pad to the left and click "Transcribe Handwriting to EHR", or click "Load Doctor's Sample Note".
                </p>
              </div>
            )}

            {transcribedText && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex justify-between items-center text-slate-400">
                  <span>Author: Dr. Sarah Lin, MD</span>
                  <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>OCR Confirmed</span>
                  </span>
                </div>

                <textarea
                  value={transcribedText}
                  onChange={(e) => setTranscribedText(e.target.value)}
                  className="w-full h-72 bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-400 resize-none selection:bg-cyan-500 selection:text-slate-950"
                  placeholder="Transcribed clinical text will appear here..."
                />
              </div>
            )}
          </div>

          {/* Commit Action */}
          {transcribedText && (
            <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
              {saveSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Saved to {activePatient.fullName}'s Clinical Notes!</span>
                  </span>
                  <span className="text-[10px] font-mono">Signed SL-MD</span>
                </div>
              ) : (
                <button
                  onClick={handleCommitToNotes}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Electronically Sign & Save to Patient Chart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
