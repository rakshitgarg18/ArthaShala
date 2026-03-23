import { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations';

export default function QuantumCoach({ language, finances, onRunSim }) {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Generate initial contextual advice
    const advice = [];
    if (finances.loans > 5000) {
      advice.push("High Debt Detected. Visit the SHG Center to consolidate at lower interest.");
    } else if (finances.cash > 8000) {
      advice.push("Surplus Cash! Consider a Fixed Deposit (FD) at the Bank for better returns.");
    } else {
      advice.push("Good balance. Visit the Farm to check on your crop status.");
    }
    
    setMessages([{
      id: 1,
      text: advice[0],
      sender: 'coach',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, [finances, language]);

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden animate-fade-in font-sans">
      
      {/* Coach Header */}
      <header className="p-4 bg-[var(--primary)] text-white flex items-center gap-3">
         <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-inner">🤖</div>
         <div>
            <h3 className="text-sm font-black italic uppercase tracking-tighter">Artha_Advisor</h3>
            <p className="text-[8px] font-bold text-white/60 tracking-widest">Active_Intelligence</p>
         </div>
      </header>

      {/* Message Area */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-slate-50/50">
        {messages.map(msg => (
          <div key={msg.id} className="flex flex-col gap-1 max-w-[80%] self-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                   "{msg.text}"
                </p>
             </div>
             <span className="text-[8px] font-black text-slate-400 uppercase ml-1">{msg.time}</span>
          </div>
        ))}
        
        {/* Suggestion Chips */}
        <div className="mt-2 flex flex-wrap gap-2">
           <button onClick={onRunSim} className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-[9px] font-black uppercase border border-green-200">Run_Projection</button>
           <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase border border-blue-200">How_to_Save?</button>
        </div>
      </div>

      {/* Input Area - Simplified */}
      <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
         <div className="flex-1 h-10 bg-gray-50 rounded-full border border-gray-100 flex items-center px-4">
            <span className="text-[10px] font-bold text-slate-300">Wait for next event...</span>
         </div>
         <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 text-white">
            <span className="text-xl">🎙️</span>
         </button>
      </div>

    </div>
  );
}
 
 
