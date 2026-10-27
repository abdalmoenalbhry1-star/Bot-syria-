import React from 'react';

export const BotLogo: React.FC<{ size?: number }> = ({ size = 52 }) => {
  return (
    <div
      className="relative flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Outer Cyan Neon Glow Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.65)]" />

      {/* Inner Dark Badge */}
      <div className="w-[88%] h-[88%] rounded-full bg-gradient-to-b from-[#101f33] via-[#07111e] to-[#03070f] flex items-center justify-center border border-cyan-500/50 overflow-hidden shadow-inner relative">
        {/* Sleek Syrian Eagle / Falcon Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-[80%] h-[80%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Eagle Silhouette & Feathers */}
          <path
            d="M50 14 C36 22 22 36 18 52 C26 48 34 46 42 46 C30 56 26 68 28 82 C38 72 46 64 50 56 C54 64 62 72 72 82 C74 68 70 56 58 46 C66 46 74 48 82 52 C78 36 64 22 50 14 Z"
            fill="url(#eagleMetalGrad)"
          />

          {/* Eagle Head & Beak Profile */}
          <path
            d="M45 20 C48 14 54 14 57 20 C55 24 53 26 50 26 C47 26 46 24 45 20 Z"
            fill="#ffffff"
          />

          {/* Glowing Green Shield Checkmark */}
          <path
            d="M40 50 L48 58 L62 42"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]"
          />

          {/* Eye */}
          <circle cx="51" cy="21" r="1.5" fill="#00f0ff" />

          <defs>
            <linearGradient id="eagleMetalGrad" x1="50" y1="14" x2="50" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.45" stopColor="#cbd5e1" />
              <stop offset="0.8" stopColor="#64748b" />
              <stop offset="1" stopColor="#334155" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
