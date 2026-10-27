import React from 'react';

export const SyrianCoinBadge: React.FC<{ size?: number }> = ({ size = 96 }) => {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer Cyan Glow Rings & Orbital Disk */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/15 blur-lg pointer-events-none" />
      <div className="absolute -inset-1 rounded-full border border-cyan-400/40 opacity-75 pointer-events-none" />
      
      {/* 3D Coin Stack Base Pedestal */}
      <div className="absolute -bottom-1.5 w-[86%] h-6 bg-gradient-to-r from-cyan-950/80 via-blue-600/50 to-cyan-950/80 rounded-full blur-[2px] border border-cyan-400/40" />

      {/* Main Syrian Flag Medallion with metallic beveled border */}
      <div className="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-900 shadow-[0_0_25px_rgba(6,182,212,0.6)]">
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-cyan-200/70 relative flex flex-col shadow-inner bg-slate-900">
          {/* Syrian Flag: Green Top Stripe */}
          <div className="w-full h-1/3 bg-[#007A3D] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
          
          {/* Syrian Flag: White Middle Stripe with 3 Red Stars SVG */}
          <div className="w-full h-1/3 bg-white flex items-center justify-center gap-1.5 px-2 relative">
            {[0, 1, 2].map((idx) => (
              <svg key={idx} viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#CE1126] drop-shadow-sm">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            ))}
          </div>
          
          {/* Syrian Flag: Black Bottom Stripe */}
          <div className="w-full h-1/3 bg-[#000000] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black to-slate-900/60" />
          </div>

          {/* Glossy Glass Reflection Overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
