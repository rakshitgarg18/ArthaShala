import React, { useState } from 'react';

export default function LessonViewer({ lesson, onStartDemo }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showInteraction, setShowInteraction] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);

  if (!lesson) return null;

  const slides = lesson.slides || [];
  const maxSlides = slides.length;
  const interaction = lesson.interaction;

  const handleNext = () => {
    if (activeSlide < maxSlides - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      setShowInteraction(true);
    }
  };

  const handlePrev = () => {
    if (showInteraction) {
      setShowInteraction(false);
      setSelectedDecision(null);
    } else if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };

  const handleDecision = (optionId) => {
    setSelectedDecision(optionId);
  };

  const selectedOption = interaction?.options.find(opt => opt.id === selectedDecision);

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col overflow-hidden font-sans">
      
      {/* Background Image Layer */}
      <div className="absolute inset-x-0 top-0 h-[60%] overflow-hidden">
        <img 
          src={lesson.simulation?.images?.present || "https://images.unsplash.com/photo-1454165833767-02755157f86e?auto=format&fit=crop&w=800&q=80"} 
          className="w-full h-full object-cover brightness-[0.4] scale-110 blur-sm animate-pulse" 
          alt="Lesson Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
      </div>

      {/* Top Header */}
      <header className="relative p-8 pt-14 flex items-center justify-between z-10">
         <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-1">
              {showInteraction ? "Crucial Moment" : "The Story"}
            </span>
            <div className="flex gap-2">
               {!showInteraction ? slides.map((_, i) => (
                 <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i === activeSlide ? 'bg-blue-500 scale-x-125' : 'bg-slate-700'}`} />
               )) : (
                 <div className="h-1.5 w-full bg-amber-500 rounded-full" />
               )}
            </div>
         </div>
         <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-inner">
            {showInteraction ? "⚖️" : (slides[activeSlide]?.visual || lesson.icon)}
         </div>
      </header>

      {/* Slide Content Overlay */}
      <div className="relative flex-1 px-8 flex flex-col z-10 overflow-y-auto pt-10 pb-32">
         {!showInteraction ? (
           <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 mt-auto">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-2">
                Part {activeSlide + 1}
              </h2>
              <h1 className="text-3xl font-black text-white italic tracking-tighter leading-tight drop-shadow-2xl">
                {slides[activeSlide]?.text.split('(')[0]}
              </h1>
              <p className="text-slate-400 font-bold text-lg mt-4 leading-relaxed italic opacity-80">
                {slides[activeSlide]?.text.split('(')[1]?.replace(')', '') || ""}
              </p>
           </div>
         ) : (
           <div className="animate-in zoom-in-95 fade-in duration-500">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-400 mb-2">Taking Action</h2>
              <h1 className="text-2xl font-black text-white leading-tight mb-8">
                {interaction.question}
              </h1>
              
              <div className="flex flex-col gap-4">
                {interaction.options.map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => handleDecision(opt.id)}
                    className={`w-full p-6 text-left rounded-3xl font-bold transition-all border-2 relative overflow-hidden ${selectedDecision === opt.id ? 'bg-amber-500 border-amber-300 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}
                  >
                    {opt.text}
                    {selectedDecision === opt.id && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                         ✓
                       </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedOption && (
                <div className="mt-8 p-6 bg-blue-600/20 border border-blue-500/30 rounded-3xl animate-in slide-in-from-top-4 duration-500">
                   <p className="text-blue-300 font-bold italic text-sm text-center">
                     "{selectedOption.foreshadowing}"
                   </p>
                </div>
              )}
           </div>
         )}
      </div>

      {/* Fixed Bottom Navigation Container */}
      <div className="absolute bottom-0 inset-x-0 p-8 pt-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent z-20">
         <div className="flex gap-4 w-full">
            {!selectedDecision ? (
              <>
                <button 
                  onClick={handlePrev}
                  className={`flex-1 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all ${activeSlide === 0 && !showInteraction ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  Back
                </button>
                {!showInteraction && (
                  <button 
                    onClick={handleNext}
                    className="flex-[2] py-5 bg-blue-600 border border-blue-400 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Next ➔
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={() => {
                  console.log("Navigating to Map Demo...");
                  onStartDemo();
                }}
                className="w-full py-8 bg-gradient-to-r from-amber-500 to-orange-600 border border-white/20 text-white rounded-[2.5rem] font-black text-2xl animate-pulse shadow-[0_20px_60px_-15px_rgba(245,158,11,0.6)] active:scale-95 transition-all"
              >
                 मैप पर आजमाएं (Try on Map) ➔
              </button>
            )}
         </div>
      </div>

    </div>
  );
}
