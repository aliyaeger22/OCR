/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Fingerprint,
  KeyRound,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { EchoLogo } from './EchoLogo';

interface TerminalLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  clinicianName?: string;
  clinicianRole?: string;
}

export const TerminalLockModal: React.FC<TerminalLockModalProps> = ({
  isOpen,
  onUnlock,
  clinicianName = 'Dr. Sarah Lin, MD',
  clinicianRole = 'Attending Intensivist (ID: SL-9812)'
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEmergencyOverride, setIsEmergencyOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  if (!isOpen) return null;

  const correctPin = '1234';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin === correctPin) {
        setTimeout(() => {
          onUnlock();
          setPin('');
        }, 150);
      } else if (nextPin.length === 4) {
        setErrorMsg('Invalid PIN. Use default 1234 or Biometric.');
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricUnlock = () => {
    // Simulated instant biometric sensor authentication
    onUnlock();
    setPin('');
  };

  const handleEmergencyOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setErrorMsg('Clinical rationale is required for emergency break-glass override.');
      return;
    }
    onUnlock();
    setPin('');
    setIsEmergencyOverride(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Top subtle lock aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center mb-5">
          <EchoLogo size="lg" layout="vertical" showSubtitle={false} showConfidentialBadge={true} />
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-600/70 text-rose-300 text-[10px] font-mono font-bold tracking-widest uppercase">
            <Lock className="w-3 h-3 text-rose-400" />
            <span>CONFIDENTIAL MEDICAL TERMINAL • RESTRICTED</span>
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-100 tracking-tight">
          Workstation Locked
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          HIPAA Safeguard § 164.312(a)(2)(iii). Protected Health Information is shielded.
        </p>

        {/* User Card */}
        <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-200">{clinicianName}</div>
            <div className="text-[11px] text-slate-400">{clinicianRole}</div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40">
            WS-ICU-04
          </span>
        </div>

        {!isEmergencyOverride ? (
          <>
            {/* PIN Code Circles */}
            <div className="mt-6 flex justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      filled
                        ? 'bg-cyan-400 border-cyan-300 scale-110 shadow-sm shadow-cyan-400/50'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-400 mt-3 animate-shake">
                {errorMsg}
              </p>
            )}

            <p className="text-[11px] text-slate-500 mt-2">
              Default Demo PIN: <strong className="text-cyan-400 font-mono">1234</strong>
            </p>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mt-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-lg font-bold font-mono text-slate-100 hover:text-cyan-300 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/60 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center"
              >
                Clear
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-lg font-bold font-mono text-slate-100 hover:text-cyan-300 transition-all active:scale-95 flex items-center justify-center shadow-sm"
              >
                0
              </button>
              <button
                onClick={handleBiometricUnlock}
                title="Simulated Biometric Sensor"
                className="h-12 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 transition-all flex items-center justify-center group"
              >
                <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-5 flex flex-col gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleBiometricUnlock}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Instant Clinician Biometric Unlock</span>
              </button>

              <button
                onClick={() => setIsEmergencyOverride(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1.5 py-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Break-Glass Emergency Access Override</span>
              </button>
            </div>
          </>
        ) : (
          /* Emergency Break-Glass Form */
          <form onSubmit={handleEmergencyOverrideSubmit} className="mt-4 text-left space-y-3">
            <div className="p-3 bg-rose-950/40 border border-rose-700/60 rounded-xl text-rose-200 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Emergency Break-Glass Protocol</span>
              </div>
              <p className="text-[11px] text-rose-300/80">
                This emergency access is logged with high priority and triggers an immediate compliance audit notice.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clinical Emergency Rationale:
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Code Blue called in Pod B, immediate resuscitation required..."
                className="w-full h-20 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEmergencyOverride(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Back to PIN
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-rose-600/30"
              >
                Authorize Override
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
