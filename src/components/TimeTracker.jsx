import React from 'react';

const TimeTracker = ({ progress, isPaused, togglePause, language }) => {
  // Color Dynamics logic
  const getBarColor = () => {
    if (progress >= 90) return 'bg-red-500 animate-pulse';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full px-6 py-2 bg-slate-900/10 backdrop-blur-sm flex items-center gap-4">
      {/* Play/Pause Toggle */}
      <button 
        onClick={togglePause}
        className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-xs active:scale-90 transition-transform"
      >
        {isPaused ? '▶️' : '⏸️'}
      </button>

      {/* Progress Track */}
      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden relative">
        <div 
          className={`absolute inset-y-0 left-0 transition-all duration-100 ease-linear ${getBarColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Label */}
      <div className="min-w-[80px] text-right">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none">
          {language === 'hi' ? 'महीना समाप्ति' : 'MONTH END'}
        </p>
        <p className="text-xs font-black text-slate-900">{progress}%</p>
      </div>
    </div>
  );
};

export default TimeTracker;
 
 
