import React from 'react';

/**
 * DecisionModal
 * 
 * Props:
 *   title      - string: heading shown in the modal (Hindi)
 *   subtitle   - string: context description
 *   options    - array of { label, sublabel, cost, debtAdded, waste, isGood }
 *   onChoose   - fn(cost, debtAdded, waste) fired when option clicked
 *   onClose    - fn() fired when backdrop clicked (no choice made)
 */
export default function DecisionModal({ title, subtitle, options = [], onChoose, onClose }) {
  if (!options || options.length === 0) return null;

  return (
    <div
      className="absolute inset-0 z-[3000] flex items-center justify-center p-6 animate-in fade-in duration-500"
      onClick={onClose}
    >
      {/* Immersive Glass Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      {/* Premium Decision Card */}
      <div
        className="relative w-full max-w-sm bg-white/90 backdrop-blur-3xl rounded-[48px] overflow-hidden shadow-[0_48px_96px_-12px_rgba(0,0,0,0.4)] border border-white/40 animate-in zoom-in slide-in-from-bottom-20 duration-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Modern Header */}
        <div className="bg-slate-900 px-8 pt-10 pb-8 text-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
          
          <h2 className="text-3xl font-black text-white leading-[1.1] mb-3 italic tracking-tight relative z-10">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-400 text-[13px] font-bold leading-relaxed uppercase tracking-[0.1em] opacity-80 relative z-10">
              {subtitle}
            </p>
          )}
        </div>

        {/* Options Grid */}
        <div className="p-6 bg-slate-50/50 flex flex-col gap-4">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onChoose(opt.cost, opt.debtAdded, opt.waste, opt)}
              className={`w-full text-left p-6 rounded-[32px] border-2 transition-all active:scale-[0.98] group relative overflow-hidden
                ${opt.isGood
                  ? 'bg-white border-green-100 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/10'
                  : 'bg-white border-red-100 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10'
                }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border transition-colors ${opt.isGood ? 'bg-green-50 border-green-100 group-hover:bg-green-400 group-hover:text-white' : 'bg-red-50 border-red-100 group-hover:bg-red-400 group-hover:text-white'}`}>
                  {opt.icon || (opt.isGood ? '✅' : '⚠️')}
                </div>
                
                <div className="flex-1">
                  <p className={`font-black text-[17px] leading-tight mb-0.5 ${opt.isGood ? 'text-slate-800 group-hover:text-green-700' : 'text-slate-800 group-hover:text-red-700'}`}>
                    {opt.label}
                  </p>
                  {opt.sublabel && (
                    <p className={`text-[11px] font-black uppercase tracking-widest opacity-60 ${opt.isGood ? 'text-green-600' : 'text-red-600'}`}>
                      {opt.sublabel}
                    </p>
                  )}
                </div>

                {(opt.waste > 0 || opt.debtAdded > 0) && (
                   <div className={`flex-shrink-0 text-right`}>
                      <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${opt.isGood ? 'text-slate-400' : 'text-red-400'}`}>
                        {opt.isGood ? 'DEBT' : 'WASTE'}
                      </span>
                      <span className={`text-lg font-black tabular-nums ${opt.isGood ? 'text-slate-900' : 'text-red-600'}`}>
                        ₹{(opt.waste || opt.debtAdded).toLocaleString()}
                      </span>
                   </div>
                )}
              </div>
              
              {/* Subtle hover background glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none ${opt.isGood ? 'bg-green-500' : 'bg-red-500'}`} />
            </button>
          ))}
        </div>

        {/* Dynamic Micro-Feedback Footer */}
        <div className="px-8 py-6 bg-slate-100/50 border-t border-slate-200 flex justify-center italic">
           <p className="text-[11px] font-bold text-slate-400 tracking-wide text-center">
             Choose the path that leads to prosperity, beta.
           </p>
        </div>
      </div>
    </div>
  );
}
 
 
