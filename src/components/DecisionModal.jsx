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
      className="absolute inset-0 z-[3000] flex items-center justify-center p-2 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Immersive Glass Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

      {/* Premium Decision Card */}
      <div
        className="relative w-[92vw] max-w-[320px] bg-white rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/40 animate-in zoom-in slide-in-from-bottom-10 duration-500 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modern Header - Compact */}
        <div className="bg-slate-900 px-4 pt-5 pb-3 text-center relative overflow-hidden shrink-0">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
          
          <h2 className="text-lg font-black text-white leading-tight mb-1 tracking-tight relative z-10">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest opacity-80 relative z-10">
              {subtitle}
            </p>
          )}
        </div>

        {/* Scrollable Container for Options */}
        <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
          {/* Options Grid */}
          <div className="p-3 flex flex-col gap-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onChoose(opt.cost, opt.debtAdded, opt.waste, opt)}
              className={`w-full text-left p-4 rounded-3xl border-2 transition-all active:scale-[0.98] group relative overflow-hidden
                ${opt.isGood
                  ? 'bg-white border-green-100'
                  : 'bg-white border-red-100'
                }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl shadow-inner border transition-colors ${opt.isGood ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  {opt.icon || (opt.isGood ? '✅' : '⚠️')}
                </div>
                
                <div className="flex-1">
                  <p className={`font-black text-[15px] leading-tight mb-0.5 ${opt.isGood ? 'text-slate-800' : 'text-slate-800'}`}>
                    {opt.label}
                  </p>
                  {opt.sublabel && (
                    <p className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${opt.isGood ? 'text-green-600' : 'text-red-600'}`}>
                      {opt.sublabel}
                    </p>
                  )}
                </div>

                {(opt.waste > 0 || opt.debtAdded > 0) && (
                   <div className={`flex-shrink-0 text-right`}>
                      <span className={`text-[8px] font-black uppercase tracking-widest block mb-0.5 ${opt.isGood ? 'text-slate-400' : 'text-red-400'}`}>
                        {opt.isGood ? 'DEBT' : 'WASTE'}
                      </span>
                      <span className={`text-base font-black tabular-nums ${opt.isGood ? 'text-slate-900' : 'text-red-600'}`}>
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
        </div>

        {/* Dynamic Micro-Feedback Footer - Compact & Localized */}
        <div className="px-6 py-3 bg-slate-100/50 border-t border-slate-200 flex justify-center italic shrink-0">
           <p className="text-[10px] font-black text-slate-400 tracking-wide text-center">
             {title?.includes('KCC') || subtitle?.includes('बीज') || title?.includes('Loan') 
               ? (title.includes('बीज') ? 'विवेकपूर्ण चुनाव करें, विकास सुनिश्चित करें' : 'Choose the path that leads to prosperity.')
               : 'विवेकपूर्ण चुनाव करें, विकास सुनिश्चित करें'}
           </p>
        </div>
      </div>
    </div>
  );
}
 
 
