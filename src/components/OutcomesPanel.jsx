import { TRANSLATIONS } from '../data/translations';

export default function OutcomesPanel({ rewards, finances, simulationResult, onClose, language }) {
  const t = TRANSLATIONS[language];

  if (!simulationResult) return null;

  return (
    <div className="w-full h-full bg-[#fdfbf4] p-10 flex flex-col animate-fade-in rural-pattern custom-scrollbar overflow-y-auto">
      
      {/* Immersive Header */}
      <header className="flex flex-col items-center text-center gap-6 mb-12">
          <div className="w-24 h-24 bg-[#22C55E] rounded-[2rem] flex items-center justify-center text-6xl shadow-[0_20px_50px_rgba(34,197,94,0.4)] rotate-[-10deg]">⚛️</div>
          <div className="flex flex-col">
             <h2 className="text-5xl font-black italic text-slate-800 tracking-tighter uppercase leading-[0.8]">Future<br/>Forecast</h2>
             <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mt-4 underline decoration-green-300 decoration-4 underline-offset-8">Quantum_Projection_Result</p>
          </div>
      </header>

      {/* Probability Gauge - Screen 5 Style */}
      <div className="relative w-full max-w-sm mx-auto mb-16">
          <div className="bg-white p-12 rounded-[4.5rem] border-4 border-green-50 shadow-[0_40px_100px_rgba(0,0,0,0.1)] flex flex-col items-center gap-6">
              <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="96" cy="96" r="80" 
                      className="fill-none stroke-gray-100 stroke-[16]"
                    />
                    <circle 
                      cx="96" cy="96" r="80" 
                      className="fill-none stroke-green-500 stroke-[16] transition-all duration-1000 animate-draw"
                      style={{ strokeDasharray: 502, strokeDashoffset: 502 * (1 - simulationResult.prob_gain/100) }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                      <span className="text-6xl font-black text-slate-800 italic tracking-tighter">{Math.round(simulationResult.prob_gain)}%</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sahi Direction</span>
                  </div>
              </div>
              <p className="text-xl font-black text-green-700 italic uppercase underline decoration-2 underline-offset-8">Growth_Probability</p>
          </div>
      </div>

      <h3 className="text-xs font-black uppercase tracking-[0.6em] text-slate-400 mb-8 ml-6">WEALTH_PATHWAYS</h3>

      {/* Outcome Cards - Organic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 px-4">
        {[
          { label: 'BEST_CASE', val: simulationResult.best, color: 'text-green-600', bg: 'bg-green-50', icon: '🌟' },
          { label: 'MEDIAN', val: simulationResult.median, color: 'text-slate-800', bg: 'bg-slate-50', icon: '⚖️' },
          { label: 'WORST_CASE', val: simulationResult.worst, color: 'text-red-500', bg: 'bg-red-50', icon: '⚠️' }
        ].map((item, idx) => (
          <div key={idx} className={`${item.bg} p-8 rounded-[3rem] border-2 border-white/50 shadow-xl flex items-center gap-8 group hover:scale-[1.02] transition-transform`}>
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-md group-hover:rotate-6 transition-transform">
                 {item.icon}
              </div>
              <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</span>
                  <span className={`text-3xl font-black italic tracking-tighter ${item.color}`}>₹{Math.round(item.val).toLocaleString()}</span>
              </div>
          </div>
        ))}
      </div>

      {/* Call to Action - Organic Banner */}
      <div className="bg-orange-600 p-12 rounded-[4rem] text-white flex flex-col items-center text-center gap-8 shadow-3xl shadow-orange-200 border-b-[12px] border-orange-800 mb-20 animate-receipt">
          <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center text-5xl">🧘</div>
          <div className="flex flex-col gap-4 max-w-xs">
             <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Smart<br/>Decision</h3>
             <p className="text-lg font-bold text-orange-100">
               "Your insurance is shielding you from 85% of market risks. Keep it active!"
             </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-white py-6 rounded-3xl text-orange-600 font-black text-2xl italic uppercase tracking-tighter shadow-xl hover:bg-orange-50 transition-colors active:scale-95"
          >
            RETURN_TO_ACT
          </button>
      </div>

      <footer className="text-center pb-12 opacity-20">
         <span className="text-[10px] font-black uppercase tracking-[1em] text-slate-400 italic">Quantum Intelligence Integrated</span>
      </footer>

    </div>
  );
}
 
 
