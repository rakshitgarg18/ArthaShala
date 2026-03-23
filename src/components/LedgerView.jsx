import { TRANSLATIONS } from '../data/translations';

export default function LedgerView({ onBack, language, finances }) {
  const t = TRANSLATIONS[language];

  const months = [
    { id: 1, label: `${t.month} १`, status: t.sowing_time, icon: '🌱', color: 'bg-green-100', text: 'text-green-700' },
    { id: 2, label: `${t.month} २`, status: 'हरा-भरा', icon: '🌿', color: 'bg-green-50', text: 'text-green-600' },
    { id: 3, label: `${t.month} ३`, status: 'सूखा/सुखाई', icon: '☀️', color: 'bg-orange-100', text: 'text-orange-700', highlight: true },
    { id: 4, label: `${t.month} ४`, status: 'पीला', icon: '🌾', color: 'bg-yellow-100', text: 'text-yellow-700' },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#fdfbf4] p-10 animate-fade-in custom-scrollbar overflow-y-auto rural-pattern">
      
      <header className="flex items-center gap-8 mb-12">
         <button onClick={onBack} className="w-16 h-16 rounded-[2rem] bg-white border-4 border-gray-50 flex items-center justify-center shadow-xl active:scale-90 transition-all text-3xl hover:rotate-[-5deg]">
            ←
         </button>
         <div className="flex flex-col text-left">
            <h2 className="text-5xl font-black italic text-slate-800 tracking-tighter uppercase leading-[0.8]">{t.ledger}</h2>
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mt-2 underline decoration-orange-300 decoration-4 underline-offset-8">Financial_History</p>
         </div>
      </header>

      {/* Stats Summary - Floating Integrated Tokens */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        <div className="p-8 bg-white rounded-[3rem] border-4 border-green-50 shadow-2xl flex items-center gap-6 group hover:scale-[1.02] transition-transform">
            <div className="w-20 h-20 bg-green-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-green-200 group-hover:rotate-[5deg] transition-transform">
               <span className="text-4xl text-white">💵</span>
            </div>
            <div className="flex flex-col text-left">
               <span className="text-xs uppercase font-black text-slate-400 tracking-widest mb-1">{t.cash}</span>
               <span className="text-3xl font-black text-slate-800 italic tracking-tighter">₹{finances.cash.toLocaleString()}</span>
            </div>
        </div>
        <div className="p-8 bg-white rounded-[3rem] border-4 border-red-50 shadow-2xl flex items-center gap-6 group hover:scale-[1.02] transition-transform">
            <div className="w-20 h-20 bg-red-400 rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-200 group-hover:rotate-[-5deg] transition-transform">
               <span className="text-4xl text-white">📕</span>
            </div>
            <div className="flex flex-col text-left">
               <span className="text-xs uppercase font-black text-slate-400 tracking-widest mb-1">{t.loan}</span>
               <span className="text-3xl font-black text-slate-800 italic tracking-tighter">₹{finances.loans.toLocaleString()}</span>
            </div>
        </div>
      </div>

      <h3 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 mb-6 ml-4">JOURNEY_TRACKER</h3>

      {/* Horizontal Timeline - Improved Immersiveness */}
      <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar px-4">
        {months.map(m => (
          <div 
            key={m.id} 
            className={`min-w-[180px] p-8 rounded-[3.5rem] border-4 transition-all ${m.highlight ? 'border-orange-400 bg-white shadow-2xl shadow-orange-100 scale-105 rotate-[1deg]' : 'border-gray-50 bg-white/80 active:scale-95'} flex flex-col items-center gap-4`}
          >
            <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
            <div className={`w-24 h-24 rounded-[2.5rem] ${m.color} flex items-center justify-center text-6xl shadow-inner border-2 border-white/50`}>
               {m.icon}
            </div>
            <span className={`text-sm font-black text-center italic tracking-tighter uppercase ${m.text}`}>{m.status}</span>
          </div>
        ))}
      </div>

      {/* Intervention Modal - Organic Style */}
      <div className="mt-8 p-12 bg-white rounded-[4rem] border-4 border-blue-50 shadow-3xl flex flex-col items-center text-center relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-blue-50 to-transparent flex justify-center pt-4">
            <div className="flex items-center gap-2 group-hover:scale-125 transition-transform duration-500">
               <span className="w-10 h-5 bg-[#FF9933] rounded-sm"></span>
               <span className="w-10 h-5 bg-white flex items-center justify-center rounded-sm"><div className="w-3 h-3 rounded-full bg-blue-800"></div></span>
               <span className="w-10 h-5 bg-[#128807] rounded-sm"></span>
            </div>
         </div>
         
         <div className="mt-12 flex flex-col items-center gap-8 w-full max-w-sm">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center shadow-inner border-4 border-white group-hover:rotate-[10deg] transition-transform">
               <span className="text-5xl">🏛️</span>
            </div>
            <div className="flex flex-col">
               <h3 className="text-4xl font-black text-red-600 italic uppercase tracking-tighter leading-none underline decoration-red-200 underline-offset-[14px] decoration-4">
                 {t.panchayat_intervention}
               </h3>
               <p className="text-lg font-black text-slate-700 leading-relaxed mt-6 italic">
                 {t.pm_kisan_msg}
               </p>
            </div>
            
            <button className="btn-primary w-full py-6 text-2xl tracking-tighter italic border-b-[8px] border-green-700 active:translate-y-2 active:border-b-0">
               {t.add_bank_account}
            </button>
         </div>
      </div>

      {/* Risk Trend Visual - Integrated into Footer */}
      <div className="mt-16 p-10 bg-white rounded-[4rem] border-4 border-gray-50 flex flex-col gap-6 shadow-inner">
         <div className="flex justify-between items-center px-4">
             <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Survival_Confidence</span>
                <span className="text-3xl font-black text-slate-800 italic tracking-tighter uppercase">SAFE_ZONE</span>
             </div>
             <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shadow-inner">
                <span className="text-3xl animate-bounce">📈</span>
             </div>
         </div>
         <div className="h-6 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-inner">
            <div className="h-full bg-green-500 w-[85%] rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
         </div>
      </div>

      <div className="mt-20 text-center pb-12 opacity-30">
         <span className="text-xs font-black uppercase tracking-[1em] text-slate-400">ARTHASHALA_VILLAGE_CORE</span>
      </div>

    </div>
  );
}
 
 
