/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

interface EchoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showConfidentialBadge?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const EchoLogo: React.FC<EchoLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  showConfidentialBadge = false,
  layout = 'horizontal'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div
      className={`flex select-none ${
        layout === 'vertical' ? 'flex-col items-center text-center' : 'items-center gap-3'
      } ${className}`}
    >
      {/* Exact User E+ Medical Metallic Medallion */}
      <div
        className={`relative shrink-0 rounded-full transition-transform hover:scale-105 duration-200 ${iconSizes[size]}`}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md pointer-events-none" />

        {/* High-Fidelity SVG rendering of user's E+ Emblem */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(6,182,212,0.35)]"
        >
          <defs>
            <radialGradient id="logoBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d1820" />
              <stop offset="70%" stopColor="#03070a" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            <linearGradient id="logoRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="35%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>

            <linearGradient id="logoTealShine" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="30%" stopColor="#06b6d4" />
              <stop offset="65%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>

            <linearGradient id="logoLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0e7490" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
          </defs>

          {/* Outer Ring */}
          <circle cx="250" cy="250" r="236" fill="none" stroke="url(#logoRing)" strokeWidth="18" />
          <circle cx="250" cy="250" r="226" fill="url(#logoBg)" />

          {/* Inner Accent Ring */}
          <circle cx="250" cy="250" r="226" fill="none" stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.4" />

          {/* Upper Crescent Arc */}
          <path
            d="M 160 375 A 175 175 0 1 1 350 120 A 185 185 0 0 0 135 340 Z"
            fill="url(#logoTealShine)"
          />

          {/* Medical Cross (+) top right */}
          <path
            d="M 374 148 L 374 168 L 354 168 L 354 182 L 374 182 L 374 202 L 388 202 L 388 182 L 408 182 L 408 168 L 388 168 L 388 148 Z"
            fill="url(#logoTealShine)"
            stroke="#a5f3fc"
            strokeWidth="1.5"
          />

          {/* Stylized Serif "E" */}
          <path
            d="M 198 152 
               C 210 148 245 146 345 146 
               L 345 190 
               L 326 190 
               C 318 174 300 168 280 168 
               L 256 168 
               L 256 226 
               L 310 226 
               C 328 226 332 238 332 250 
               C 332 262 328 274 310 274 
               L 256 274 
               L 256 312 
               C 278 312 308 304 330 286 
               L 345 322 
               C 310 338 270 340 226 340 
               C 185 340 180 320 180 290 
               L 180 188 
               C 180 162 188 155 198 152 Z"
            fill="url(#logoTealShine)"
            stroke="#cffafe"
            strokeWidth="1.5"
          />

          {/* 3 Healing Leaves Rising from lower-left */}
          <path
            d="M 172 376 C 140 330 120 250 134 208 C 152 232 176 275 174 340 Z"
            fill="url(#logoLeafGrad)"
            stroke="#a5f3fc"
            strokeWidth="1.2"
          />
          <path
            d="M 184 355 C 162 305 160 255 186 218 C 198 250 206 295 192 345 Z"
            fill="url(#logoLeafGrad)"
            stroke="#a5f3fc"
            strokeWidth="1.2"
          />
          <path
            d="M 198 348 C 192 285 220 230 262 215 C 264 260 230 310 198 348 Z"
            fill="url(#logoLeafGrad)"
            stroke="#cffafe"
            strokeWidth="1.2"
          />

          {/* Protective Cradling Hand */}
          <path
            d="M 166 385 
               C 185 410 240 415 270 412 
               C 310 408 360 385 390 320 
               C 405 348 370 415 305 432 
               C 240 448 180 432 152 398 
               C 148 392 158 376 166 385 Z"
            fill="url(#logoTealShine)"
            stroke="#67e8f9"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Typography & Subtitle */}
      <div className={`flex flex-col ${layout === 'vertical' ? 'items-center mt-3' : ''}`}>
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight bg-gradient-to-r from-slate-100 via-cyan-100 to-teal-300 bg-clip-text text-transparent ${textSizes[size]}`}
          >
            ECHO
          </span>
          <span className="text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 uppercase shadow-sm">
            E+
          </span>

          {showConfidentialBadge && (
            <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/80 border border-rose-600/60 text-rose-300 shadow-sm animate-pulse">
              <Lock className="w-2.5 h-2.5" />
              <span>CONFIDENTIAL</span>
            </span>
          )}
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold tracking-widest text-cyan-400/90 uppercase">
              Clinical Intelligence
            </span>
            <span className="text-slate-600 text-[9px]">•</span>
            <span className="text-[9px] font-mono text-slate-400">
              HIPAA SECURE
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
