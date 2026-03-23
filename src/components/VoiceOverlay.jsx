import React from 'react';
import { TRANSLATIONS } from '../data/translations';

const VoiceOverlay = ({ language, isListening, transcript, onCancel }) => {
  if (!isListening) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.hi;

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-2xl animate-in fade-in duration-500">
      
      {/* Waveform Visualization */}
      <div className="flex items-center gap-1.5 h-16 mb-12">
        <div className="w-1.5 bg-green-400 rounded-full animate-waveform"></div>
        <div className="w-1.5 bg-green-400 rounded-full animate-waveform delay-100"></div>
        <div className="w-1.5 bg-green-400 rounded-full animate-waveform delay-200"></div>
        <div className="w-1.5 bg-green-300 rounded-full animate-waveform delay-300 scale-y-125"></div>
        <div className="w-1.5 bg-green-400 rounded-full animate-waveform delay-200"></div>
        <div className="w-1.5 bg-green-400 rounded-full animate-waveform delay-100"></div>
        <div className="w-1.5 bg-green-400 rounded-full animate-waveform"></div>
      </div>

      <div className="text-center px-10">
        <h2 className="text-4xl font-black text-white italic tracking-tighter mb-4 animate-pulse">
          {language === 'hi' ? 'बोलिए...' : 'Listening...'}
        </h2>
        <p className="text-lg font-bold text-green-300/80 min-h-[1.5em] max-w-xs mx-auto leading-tight italic">
          "{transcript || (language === 'hi' ? 'मैं सुन रहा हूँ...' : 'Go ahead, I am listening...')}"
        </p>
      </div>

      {/* Cancel Action */}
      <button 
        onClick={onCancel}
        className="absolute bottom-20 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full backdrop-blur-md transition-all active:scale-95 group"
      >
        <span className="text-xs font-black text-white uppercase tracking-[0.3em] group-hover:text-red-400 transition-colors">
          {language === 'hi' ? 'रद्द करें' : 'CANCEL'}
        </span>
      </button>

      {/* Decorative pulse ring */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full animate-ping opacity-20"></div>
      </div>
    </div>
  );
};

export default VoiceOverlay;
 
 
