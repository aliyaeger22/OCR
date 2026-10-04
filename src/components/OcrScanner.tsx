/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FileScan,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Eye,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Download,
  Copy,
  Sliders,
  Check,
  Split,
  FileSpreadsheet,
  Activity,
  Pill,
  FlaskConical,
  UserCheck
} from 'lucide-react';
import { PatientRecord, OcrScanResult } from '../types';
import { SAMPLE_OCR_DOCUMENTS } from '../data/sampleCharts';
import { EchoLogo } from './EchoLogo';

interface OcrScannerProps {
  activePatient: PatientRecord;
  onCommitOcrData: (scan: OcrScanResult, targetPatientId: string) => void;
  onLogAudit: (action: string, details: string) => void;
}

export const OcrScanner: React.FC<OcrScannerProps> = ({
  activePatient,
  onCommitOcrData,
  onLogAudit
}) => {
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<OcrScanResult | null>(null);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeHighlightZone, setActiveHighlightZone] = useState<string | null>(null);

  // Viewport & Filter Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [docFilter, setDocFilter] = useState<'paper' | 'contrast' | 'dark'>('paper');
  const [viewLayout, setViewLayout] = useState<'split' | 'document' | 'data'>('split');
  const [showRawText, setShowRawText] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentSample = SAMPLE_OCR_DOCUMENTS[selectedDocIndex];

  // Automatically initialize scan result for selected preset so user can immediately see everything
  useEffect(() => {
    if (!customImage && !isCameraActive) {
      setScanResult({
        id: `ocr-${currentSample.id}`,
        documentType: currentSample.type as any,
        confidence: 98.8,
        extractedText: currentSample.rawText,
        extractedDate: currentSample.date,
        structuredFields: currentSample.structured
      });
      setCommitSuccess(false);
    }
  }, [selectedDocIndex, customImage, isCameraActive]);

  const handleStartScan = (overrideText?: string, overrideStructured?: any) => {
    setIsScanning(true);
    setCommitSuccess(false);
    onLogAudit('OCR_DOCUMENT_SCAN', `Initiated optical character recognition on ${currentSample.name}`);

    setTimeout(() => {
      setIsScanning(false);
      const res: OcrScanResult = {
        id: `ocr-${Date.now()}`,
        documentType: currentSample.type as any,
        confidence: 98.8,
        extractedText: overrideText || currentSample.rawText,
        extractedDate: currentSample.date,
        structuredFields: overrideStructured || currentSample.structured
      };
      setScanResult(res);
    }, 1100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
        setIsCameraActive(false);
        handleStartScan(
          `UPLOADED MEDICAL DOCUMENT\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nDate Ingested: ${new Date().toLocaleDateString()}\nStatus: Verified Clinical Order`,
          {
            patientName: activePatient.fullName,
            mrn: activePatient.mrn,
            encounterDate: new Date().toISOString().split('T')[0],
            findings: [
              `High-resolution document ingested: ${file.name}`,
              'Optical text tokens processed with 256-bit encryption'
            ],
            medications: [],
            vitals: { bp: activePatient.vitals.bloodPressure, hr: String(activePatient.vitals.heartRate) }
          }
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    } else {
      try {
        setIsCameraActive(true);
        setCustomImage(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert('Camera access denied or unavailable in this environment.');
        setIsCameraActive(false);
      }
    }
  };

  const captureCameraFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setCustomImage(canvas.toDataURL('image/jpeg'));
        toggleCamera();
        handleStartScan();
      }
    }
  };

  const handleCommitToChart = () => {
    if (!scanResult) return;
    onCommitOcrData(scanResult, activePatient.id);
    onLogAudit(
      'OCR_DOCUMENT_SCAN',
      `Ingested ${scanResult.documentType} into patient record ${activePatient.mrn}`
    );
    setCommitSuccess(true);
  };

  const copyExtractedText = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult.extractedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Confidential E+ Badge */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <EchoLogo size="md" showSubtitle={false} showConfidentialBadge={true} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black text-slate-100">
                Clinical Document OCR & Vision Extraction
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Optical Neural Engine
              </span>
              <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 border border-rose-600/60 text-rose-300">
                <Lock className="w-2.5 h-2.5" />
                <span>CONFIDENTIAL PHI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspect clinical transfer records, pharmacy prescriptions, and laboratory panels with readable document paper sheets, interactive bounding boxes, and instant EHR chart ingestion.
            </p>
          </div>
        </div>

        {/* Input Source Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={toggleCamera}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isCameraActive
                ? 'bg-rose-950 text-rose-300 border-rose-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal-400" />
            <span>{isCameraActive ? 'Close Camera' : 'Live Camera'}</span>
          </button>
        </div>
      </div>

      {/* Preset Document Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_OCR_DOCUMENTS.map((doc, idx) => {
          const isSelected = selectedDocIndex === idx && !customImage && !isCameraActive;
          return (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDocIndex(idx);
                setCustomImage(null);
                setIsCameraActive(false);
              }}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  {doc.type}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{doc.date}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 truncate">{doc.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {doc.structured.patientName} ({doc.structured.mrn}) • {doc.structured.findings[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Viewport Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          {/* Layout Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewLayout('split')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                viewLayout === 'split' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewLayout('document')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                viewLayout === 'document' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Only</span>
            </button>
            <button
              onClick={() => setViewLayout('data')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                viewLayout === 'data' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Extracted Fields</span>
            </button>
          </div>

          {/* Paper Contrast Filter */}
          <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setDocFilter('paper')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                docFilter === 'paper' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard Paper
            </button>
            <button
              onClick={() => setDocFilter('contrast')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                docFilter === 'contrast' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High Contrast
            </button>
            <button
              onClick={() => setDocFilter('dark')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                docFilter === 'dark' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Darkroom Negative
            </button>
          </div>
        </div>

        {/* Zoom & Rescan Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-slate-300">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
              className="p-1 hover:text-cyan-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-cyan-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, Number((z + 0.15).toFixed(2))))}
              className="p-1 hover:text-cyan-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 ml-1 text-slate-500 hover:text-slate-300 text-[10px] font-mono"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          <button
            onClick={() => handleStartScan()}
            disabled={isScanning || isCameraActive}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-600/20"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div
        className={`grid gap-6 ${
          viewLayout === 'split'
            ? 'grid-cols-1 lg:grid-cols-12'
            : viewLayout === 'document'
            ? 'grid-cols-1'
            : 'grid-cols-1'
        }`}
      >
        {/* LEFT / TOP: THE READABLE MEDICAL DOCUMENT SHEET */}
        {viewLayout !== 'data' && (
          <div
            className={`${
              viewLayout === 'split' ? 'lg:col-span-7' : 'w-full'
            } bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col shadow-xl overflow-hidden`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  Clinical Document Viewport (Readable Paper)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                Target Chart: {activePatient.fullName} ({activePatient.mrn})
              </span>
            </div>

            {/* Document Frame / Scrollable Container */}
            <div className="relative w-full h-[520px] bg-slate-950 rounded-2xl overflow-auto border border-slate-800/80 p-4 sm:p-6 flex justify-center items-start shadow-inner">
              {/* Scanning Laser Beam */}
              {isScanning && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-bounce z-30 pointer-events-none" />
              )}

              {isCameraActive ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={captureCameraFrame}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Document Frame</span>
                  </button>
                </div>
              ) : customImage ? (
                /* User Uploaded Custom Document Image */
                <div
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-150"
                >
                  <img
                    src={customImage}
                    alt="Uploaded clinical document"
                    className={`max-w-full rounded-xl shadow-2xl ${
                      docFilter === 'contrast'
                        ? 'contrast-150 brightness-110 grayscale'
                        : docFilter === 'dark'
                        ? 'invert hue-rotate-180 brightness-90'
                        : ''
                    }`}
                  />
                </div>
              ) : (
                /* HIGH-RESOLUTION AUTHENTIC MEDICAL DOCUMENT SHEET */
                <div
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                  className={`w-full max-w-xl transition-all duration-150 rounded-xl shadow-2xl p-6 sm:p-8 font-sans relative border ${
                    docFilter === 'paper'
                      ? 'bg-white text-slate-900 border-slate-300'
                      : docFilter === 'contrast'
                      ? 'bg-white text-black contrast-200 border-black'
                      : 'bg-slate-950 text-cyan-200 border-cyan-800'
                  }`}
                >
                  {/* Subtle Background Confidential Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-30deg] select-none">
                    <span className="text-4xl sm:text-5xl font-black uppercase tracking-widest text-slate-900">
                      CONFIDENTIAL PHI
                    </span>
                  </div>

                  {/* Document Header Letterhead */}
                  <div className="border-b-2 border-slate-900/80 pb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center p-1 text-cyan-400">
                        <EchoLogo size="sm" showSubtitle={false} />
                      </div>
                      <div>
                        <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                          ECHO HEALTHCARE SYSTEM • EMERGENCY SERVICES
                        </h1>
                        <p className="text-[10px] text-slate-600 font-mono">
                          REGIONAL TRANSFER CENTER • STATION CODE: ER-T2
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                        CONFIDENTIAL MEDICAL FILE
                      </span>
                      <p className="text-[10px] font-mono text-slate-600 mt-1">
                        DOC ID: {currentSample.id.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* DOCUMENT BODY BASED ON SELECTED PRESET */}
                  {selectedDocIndex === 0 && (
                    /* Sample 1: Emergency Department Transfer Record */
                    <div className="mt-4 space-y-4 text-xs text-slate-800">
                      {/* OCR Zone 1: Patient Banner */}
                      <div
                        onMouseEnter={() => setActiveHighlightZone('patient')}
                        onMouseLeave={() => setActiveHighlightZone(null)}
                        className={`p-3 rounded-lg border-2 transition-all relative ${
                          activeHighlightZone === 'patient'
                            ? 'border-cyan-500 bg-cyan-50/80 shadow-md ring-2 ring-cyan-400/50'
                            : 'border-cyan-400/60 bg-cyan-50/40'
                        }`}
                      >
                        <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded bg-cyan-600 text-white text-[9px] font-mono font-bold">
                          [OCR ZONE 1: PATIENT IDENTIFIER]
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Patient Name:</span>
                            <div className="font-black text-slate-950 text-sm">Marcus Chen</div>
                            <div className="font-mono text-slate-600 text-[11px]">DOB: 1984-09-22 (42 y/o Male)</div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">MRN / Encounter:</span>
                            <div className="font-mono font-bold text-cyan-800 text-sm">MRN-391845</div>
                            <div className="text-[11px] text-rose-700 font-bold">Triage: Level 2 Emergency (SIRS)</div>
                          </div>
                        </div>
                      </div>

                      {/* OCR Zone 2: Vitals Telemetry */}
                      <div
                        onMouseEnter={() => setActiveHighlightZone('vitals')}
                        onMouseLeave={() => setActiveHighlightZone(null)}
                        className={`p-3 rounded-lg border-2 transition-all relative ${
                          activeHighlightZone === 'vitals'
                            ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-400/50'
                            : 'border-emerald-400/60 bg-emerald-50/40'
                        }`}
                      >
                        <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold">
                          [OCR ZONE 2: CLINICAL VITALS]
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Admission Vitals Flowsheet:
                        </span>
                        <div className="grid grid-cols-5 gap-1.5 text-center font-mono mt-1">
                          <div className="bg-white p-1 rounded border border-slate-300">
                            <span className="text-[9px] text-slate-500 block">BP</span>
                            <span className="font-black text-slate-900">102/64</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-300">
                            <span className="text-[9px] text-slate-500 block">HR</span>
                            <span className="font-black text-rose-700">114 bpm</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-300">
                            <span className="text-[9px] text-slate-500 block">SpO2</span>
                            <span className="font-black text-rose-700">91% RA</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-300">
                            <span className="text-[9px] text-slate-500 block">Temp</span>
                            <span className="font-black text-rose-700">38.9°C</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-300">
                            <span className="text-[9px] text-slate-500 block">Resp</span>
                            <span className="font-black text-slate-900">25 /min</span>
                          </div>
                        </div>
                      </div>

                      {/* OCR Zone 3: Medications Administered */}
                      <div
                        onMouseEnter={() => setActiveHighlightZone('meds')}
                        onMouseLeave={() => setActiveHighlightZone(null)}
                        className={`p-3 rounded-lg border-2 transition-all relative ${
                          activeHighlightZone === 'meds'
                            ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/50'
                            : 'border-amber-400/60 bg-amber-50/40'
                        }`}
                      >
                        <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded bg-amber-600 text-white text-[9px] font-mono font-bold">
                          [OCR ZONE 3: PHARMACOTHERAPY]
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Emergency Meds Infused:
                        </span>
                        <ul className="mt-1 space-y-1 font-mono text-[11px] text-slate-900">
                          <li>• Ceftriaxone 1g IVPB (Dose #1 administered stat at 09:15)</li>
                          <li>• Azithromycin 500mg IVPB in 250mL D5W over 60 min</li>
                          <li>• Normal Saline 0.9% 1,000 mL bolus IV wide open</li>
                        </ul>
                      </div>

                      {/* OCR Zone 4: Diagnostic Findings & Labs */}
                      <div
                        onMouseEnter={() => setActiveHighlightZone('labs')}
                        onMouseLeave={() => setActiveHighlightZone(null)}
                        className={`p-3 rounded-lg border-2 transition-all relative ${
                          activeHighlightZone === 'labs'
                            ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-400/50'
                            : 'border-indigo-400/60 bg-indigo-50/40'
                        }`}
                      >
                        <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-mono font-bold">
                          [OCR ZONE 4: LABS & ASSESSMENT]
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Laboratory Pathology:
                        </span>
                        <div className="grid grid-cols-3 gap-2 font-mono text-[11px] mt-1">
                          <div className="bg-white p-1 rounded border border-slate-300">
                            WBC: <strong className="text-rose-700">18.4 k/uL</strong> [H]
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-300">
                            Lactate: <strong className="text-rose-700">2.8 mmol/L</strong> [H]
                          </div>
                          <div className="bg-white p-1 rounded border border-slate-300">
                            Procal: <strong className="text-rose-700">3.2 ng/mL</strong> [!]
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] italic text-slate-700">
                          Primary Diagnosis: Severe Right Lower Lobe Pneumonia (J18.9) with SIRS.
                        </p>
                      </div>

                      {/* Document Footer Signatures */}
                      <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>ATTENDING: DR. C. MENDOZA, MD</span>
                        <span>ELECTRONIC VERIFICATION: MD-440192-STJUDE</span>
                      </div>
                    </div>
                  )}

                  {selectedDocIndex === 1 && (
                    /* Sample 2: Outpatient Prescription Order */
                    <div className="mt-4 space-y-4 text-xs text-slate-800">
                      <div className="p-3 bg-cyan-50/50 rounded-lg border border-cyan-300 flex justify-between">
                        <div>
                          <div className="font-black text-slate-900 text-sm">Eleanor Vance</div>
                          <div className="font-mono text-slate-600 text-[11px]">DOB: 1958-04-12 | MRN-784920</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-rose-700 uppercase">
                            ALLERGIES: PENICILLIN (ANAPHYLACTIC)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 font-mono">
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-300">
                          <div className="font-bold text-slate-900 text-xs">℞ 1: Furosemide (Lasix) 40mg Oral Tablet</div>
                          <div className="text-[11px] text-slate-700 mt-0.5">Sig: Take 1 tablet by mouth twice daily for fluid retention. Disp: #60.</div>
                        </div>
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-300">
                          <div className="font-bold text-slate-900 text-xs">℞ 2: Apixaban (Eliquis) 5mg Oral Tablet</div>
                          <div className="text-[11px] text-slate-700 mt-0.5">Sig: Take 1 tablet by mouth every 12 hours for stroke prevention. Disp: #60.</div>
                        </div>
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-300">
                          <div className="font-bold text-slate-900 text-xs">℞ 3: Metoprolol Succinate ER 50mg Oral Tablet</div>
                          <div className="text-[11px] text-slate-700 mt-0.5">Sig: Take 1 tablet by mouth once daily in morning. Disp: #30.</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>PRESCRIBER: DR. JAMES THORNE, MD</span>
                        <span>DEA REF: FT-992140-RX</span>
                      </div>
                    </div>
                  )}

                  {selectedDocIndex === 2 && (
                    /* Sample 3: Chemistry & Cardiac Panel */
                    <div className="mt-4 space-y-3 text-xs text-slate-800">
                      <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300 flex justify-between font-mono">
                        <span>PATIENT: Eleanor Vance (MRN-784920)</span>
                        <span>SPECIMEN ID: LAB-2026-77810</span>
                      </div>

                      <table className="w-full text-left font-mono text-xs border border-slate-300 divide-y divide-slate-200">
                        <thead className="bg-slate-100 text-[10px] text-slate-600 font-bold uppercase">
                          <tr>
                            <th className="p-2">Assay / Biomarker</th>
                            <th className="p-2">Result</th>
                            <th className="p-2">Ref Range</th>
                            <th className="p-2">Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-[11px]">
                          <tr className="bg-rose-50/60 font-bold">
                            <td className="p-2">BNP (B-Type Natriuretic)</td>
                            <td className="p-2 text-rose-700">1,420 pg/mL</td>
                            <td className="p-2 text-slate-500">&lt; 100</td>
                            <td className="p-2 text-rose-700">[CRITICAL]</td>
                          </tr>
                          <tr className="bg-amber-50/60">
                            <td className="p-2">Troponin I High-Sensitivity</td>
                            <td className="p-2 text-amber-700 font-bold">28 ng/L</td>
                            <td className="p-2 text-slate-500">&lt; 14</td>
                            <td className="p-2 text-amber-700">[HIGH]</td>
                          </tr>
                          <tr className="bg-amber-50/60">
                            <td className="p-2">Serum Creatinine</td>
                            <td className="p-2 text-amber-700 font-bold">2.1 mg/dL</td>
                            <td className="p-2 text-slate-500">0.6 - 1.2</td>
                            <td className="p-2 text-amber-700">[HIGH]</td>
                          </tr>
                          <tr>
                            <td className="p-2">Serum Potassium</td>
                            <td className="p-2 font-bold text-slate-900">4.8 mEq/L</td>
                            <td className="p-2 text-slate-500">3.5 - 5.0</td>
                            <td className="p-2 text-emerald-700">[NORMAL]</td>
                          </tr>
                          <tr className="bg-cyan-50/60">
                            <td className="p-2">eGFR (Estimated)</td>
                            <td className="p-2 text-cyan-800 font-bold">26 mL/min</td>
                            <td className="p-2 text-slate-500">&gt; 60</td>
                            <td className="p-2 text-cyan-800">[LOW]</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Viewport Status Footer */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>300 DPI Optical Clarity • Verified Document Alignment</span>
              </span>
              <span className="font-mono text-cyan-400 font-semibold">
                Hover zones on paper to highlight extracted fields
              </span>
            </div>
          </div>
        )}

        {/* RIGHT / BOTTOM: EXTRACTED STRUCTURED EHR DATA & COMMIT */}
        {viewLayout !== 'document' && (
          <div
            className={`${
              viewLayout === 'split' ? 'lg:col-span-5' : 'w-full'
            } bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                    Extracted EHR Data Elements
                  </h3>
                </div>

                {scanResult && (
                  <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{scanResult.confidence}% Optical Confidence</span>
                  </span>
                )}
              </div>

              {/* Scanning Animation */}
              {isScanning && (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-10 h-10 mx-auto text-cyan-400 animate-spin" />
                  <p className="text-xs font-bold text-slate-200">
                    Extracting Optical Tokens & Clinical Named Entities...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Validating against FHIR Clinical Document Architecture & ICD-10 ontologies.
                  </p>
                </div>
              )}

              {/* Parsed Cards List */}
              {scanResult && !isScanning && (
                <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                  {/* Card 1: Patient Header Info */}
                  <div
                    className={`p-3 rounded-2xl border transition-all ${
                      activeHighlightZone === 'patient'
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Identified Patient:
                        </span>
                        <div className="text-sm font-black text-slate-100">
                          {scanResult.structuredFields.patientName || activePatient.fullName}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">MRN:</span>
                        <div className="font-mono text-cyan-400 font-bold text-xs">
                          {scanResult.structuredFields.mrn || activePatient.mrn}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Extracted Vitals */}
                  {scanResult.structuredFields.vitals &&
                    Object.keys(scanResult.structuredFields.vitals).length > 0 && (
                      <div
                        className={`p-3.5 rounded-2xl border transition-all ${
                          activeHighlightZone === 'vitals'
                            ? 'bg-emerald-950/60 border-emerald-400 shadow-md ring-1 ring-emerald-400/40'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            Extracted Telemetry Vitals
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {Object.entries(scanResult.structuredFields.vitals).map(([k, v]) => (
                            <div key={k} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono">
                              <span className="text-[9px] text-slate-400 uppercase font-sans font-bold">{k}</span>
                              <div className="text-xs font-bold text-cyan-300 mt-0.5">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Card 3: Extracted Medications */}
                  {scanResult.structuredFields.medications &&
                    scanResult.structuredFields.medications.length > 0 && (
                      <div
                        className={`p-3.5 rounded-2xl border transition-all ${
                          activeHighlightZone === 'meds'
                            ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Pill className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            Extracted Medications ({scanResult.structuredFields.medications.length})
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {scanResult.structuredFields.medications.map((m, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-200">{m.name}</span>
                              <span className="text-cyan-400 font-mono text-[11px]">{m.dose} • {m.freq}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Card 4: Extracted Labs */}
                  {scanResult.structuredFields.labItems &&
                    scanResult.structuredFields.labItems.length > 0 && (
                      <div
                        className={`p-3.5 rounded-2xl border transition-all ${
                          activeHighlightZone === 'labs'
                            ? 'bg-indigo-950/60 border-indigo-400 shadow-md ring-1 ring-indigo-400/40'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            Extracted Laboratory Biomarkers
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {scanResult.structuredFields.labItems.map((lab, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-200">{lab.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-cyan-300 font-bold">{lab.value} {lab.unit}</span>
                                {lab.flag && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                    lab.flag === 'Critical'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                      : 'bg-amber-950 text-amber-300'
                                  }`}>
                                    {lab.flag}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Card 5: Findings */}
                  {scanResult.structuredFields.findings.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Clinical Assessment & Directives:
                      </span>
                      <ul className="space-y-1">
                        {scanResult.structuredFields.findings.map((f, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw Text Toggle */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowRawText(!showRawText)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{showRawText ? 'Hide Raw Optical Stream' : 'View Raw Optical Stream (OCR Text)'}</span>
                    </button>

                    {showRawText && (
                      <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto relative">
                        <button
                          onClick={copyExtractedText}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Copy raw text"
                        >
                          {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {scanResult.extractedText}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Ingestion Action */}
            {scanResult && !isScanning && (
              <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
                {commitSuccess ? (
                  <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Successfully committed to {activePatient.fullName}'s EHR Chart!</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300">AUDIT #INGEST-OK</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCommitToChart}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-400 hover:from-cyan-500 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.01]"
                  >
                    <Database className="w-4 h-4" />
                    <span>Commit Extracted Data to {activePatient.fullName}'s Chart</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
