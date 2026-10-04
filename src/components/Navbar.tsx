/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  FileScan,
  PenTool,
  ShieldCheck,
  Lock,
  ChevronDown,
  UserCheck,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { ViewTab, PatientRecord } from '../types';
import { EchoLogo } from './EchoLogo';

interface NavbarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  activePatient: PatientRecord;
  allPatients: PatientRecord[];
  onSelectPatient: (patient: PatientRecord) => void;
  onLockTerminal: () => void;
  inactivityRemainingSec: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activePatient,
  allPatients,
  onSelectPatient,
  onLockTerminal,
  inactivityRemainingSec
}) => {
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: Array<{ id: ViewTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'clinical', label: 'Clinical Intelligence', icon: Activity, badge: 'Live' },
    { id: 'database', label: 'Patient Directory', icon: Database, badge: `${allPatients.length}` },
    { id: 'ocr', label: 'OCR Scanner', icon: FileScan },
    { id: 'handwriting', label: 'Handwriting Pad', icon: PenTool },
    { id: 'hipaa', label: 'HIPAA Audit', icon: ShieldCheck }
  ];

  const formatSec = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <EchoLogo size="md" showConfidentialBadge={true} />

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center: Active Patient Quick Selector */}
          <div className="relative">
            <button
              onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/40 rounded-xl transition-all text-left shadow-sm group"
            >
              <div className="relative">
                <img
                  src={activePatient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100'}
                  alt={activePatient.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600 group-hover:border-cyan-400 transition-colors"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-200 transition-colors truncate max-w-[120px] sm:max-w-[150px]">
                    {activePatient.fullName}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-1 rounded border border-cyan-800/40">
                    {activePatient.mrn}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                  {activePatient.roomBed} • {activePatient.department}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform" />
            </button>

            {/* Quick Switcher Dropdown */}
            {patientDropdownOpen && (
              <div
                className="absolute left-0 sm:right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between">
                  <span>Switch Active Chart</span>
                  <span className="text-cyan-400 font-mono">{allPatients.length} Active</span>
                </div>
                <div className="max-h-64 overflow-y-auto mt-1 space-y-1 divide-y divide-slate-800/40">
                  {allPatients.map((p) => {
                    const isSelected = p.id === activePatient.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPatient(p);
                          setPatientDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/15 border border-cyan-500/30'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <img
                          src={p.avatarUrl}
                          alt={p.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-100 truncate">
                              {p.fullName}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-400 ml-1">
                              {p.mrn}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="truncate">{p.department}</span>
                            <span>•</span>
                            <span
                              className={`font-semibold ${
                                p.status === 'Critical'
                                  ? 'text-rose-400'
                                  : p.status === 'Observation'
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Hospital Station, Clinician Profile, Lock Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime || '11:35:00'}</span>
            </div>

            {/* Clinician Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/30">
                SL
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200 leading-tight">Dr. S. Lin, MD</span>
                <span className="text-[9px] text-slate-400 leading-tight">ICU Attending #9812</span>
              </div>
            </div>

            {/* Terminal Emergency Lock */}
            <button
              onClick={onLockTerminal}
              title="Lock Workstation (HIPAA Compliance)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/50 text-rose-300 hover:text-rose-100 text-xs font-semibold transition-all group shadow-sm hover:shadow-rose-900/20"
            >
              <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-rose-400" />
              <span className="hidden sm:inline">Lock</span>
              <span className="text-[10px] font-mono opacity-80 bg-rose-900/60 px-1 py-0.5 rounded">
                {formatSec(inactivityRemainingSec)}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/80 overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
