import React, { useState } from 'react';

export default function BhavishyaSlider({ lesson, onComplete }) {
  const [sliderVal, setSliderVal] = useState(100);
  const [hasInteracted, setHasInteracted] = useState(false);

  if (!lesson) return null;

  const handleSliderChange = (e) => {
    setSliderVal(parseInt(e.target.value));
    if (!hasInteracted) setHasInteracted(true);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in duration-500">
      
      {/* HUD Hint */}
      <div className="mb-6 text-center">
        <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2 animate-pulse">
          Vision Mode Active
        </p>
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          Slide to see the Future
        </h3>
      </div>

      {/* Main Image Container (60vh) */}
      <div className="relative w-full max-w-4xl h-[55vh] sm:h-[60vh] overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,1)] border-4 border-gray-800/50 group">
        
        {/* BASE LAYER (Future/Ruined) */}
        <div className="absolute inset-0 w-full h-full">
           <img 
              src={lesson.images.future} 
              alt="Future Vision" 
              className="w-full h-full object-cover grayscale-[0.5] brightness-75 transition-all duration-300 group-hover:brightness-90"
           />
           <div className="absolute inset-0 bg-black/20" />
           <div className="absolute bottom-10 right-10 bg-red-600/80 backdrop-blur-md px-6 py-2 rounded-full border border-red-400/50">
              <span className="text-sm font-black uppercase tracking-widest text-white">The Consequence</span>
           </div>
        </div>

        {/* TOP LAYER (Present/Good) - Wiped by sliderVal */}
        <div 
           className="absolute inset-0 w-full h-full z-10 pointer-events-none transition-all duration-75"
           style={{ clipPath: `polygon(0 0, ${sliderVal}% 0, ${sliderVal}% 100%, 0 100%)` }}
        >
           <img 
              src={lesson.images.present} 
              alt="Present Day" 
              className="w-full h-full object-cover shadow-2xl"
           />
           <div className="absolute bottom-10 left-10 bg-green-600/80 backdrop-blur-md px-6 py-2 rounded-full border border-green-400/50">
              <span className="text-sm font-black uppercase tracking-widest text-white">Your Decision</span>
           </div>
        </div>

        {/* Vertical Divider Line (Visual Aid) */}
        <div 
          className="absolute inset-y-0 w-1 bg-white/50 backdrop-blur-md z-20 pointer-events-none transition-all duration-75 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          style={{ left: `${sliderVal}%` }}
        >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-black" />
        </div>

        {/* CUSTOM RANGE INPUT (Overlayed) */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderVal} 
          onChange={handleSliderChange}
          className="absolute inset-x-0 top-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        />
      </div>

      {/* Lesson Text (Large & Impactful) */}
      <div className={`mt-8 max-w-2xl text-center transition-all duration-1000 delay-300 ${hasInteracted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
         <p className="text-2xl sm:text-3xl font-black text-rose-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] leading-tight italic">
           "{lesson.lessonText}"
         </p>
      </div>

      {/* Action Button */}
      <div className={`mt-10 transition-all duration-500 ${hasInteracted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
         <button 
           onClick={onComplete}
           className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-full text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 transition-all flex items-center gap-3 border-t border-white/20"
         >
           Continue the Journey <span className="text-xl">➔</span>
         </button>
      </div>

    </div>
  );
}
 
 
