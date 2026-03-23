import React, { useState, useEffect } from 'react';

const T = {
  en: {
    step1: "Hello! I am Artha Chacha. I'm here to help you manage your money this season.",
    step2: "Here is your Wallet and your Debt. Keep that 'Artha Score' shield green for a happy life!",
    step3: "Confused? Just tap this green button and tell me what you need in your own voice. The AI brain handles the rest.",
    step4: "This is the Panchayat. Looking for help? The government schemes that match your profile will appear here!",
    step5: "It's sowing season! You need ₹15,000 for seeds. Go to the Bank or Sahukar now. Make a smart choice!",
    next: "Next",
    finish: "Start My Journey",
    sahukarWarning: "Careful! High Interest",
    bankSafe: "Safe Choice",
    sahukarDialogue: "This must be repaid quickly, or there will be trouble.",
    schemeDialogue: "Great! The government scheme saved your money.",
    moduleStart: "Let's begin:",
    moduleComplete: "Great job! You learned this lesson perfectly!"
  },
  hi: {
    step1: "राम-राम! मैं अर्था चाचा हूँ। मैं इस सीजन में आपके पैसे मैनेज करने में आपकी मदद करने आया हूँ।",
    step2: "यहाँ आपकी जेब (Wallet) और आपका कर्ज (Debt) है। सुखद जीवन के लिए 'अर्था स्कोर' शील्ड को हरा रखें!",
    step3: "उलझन में हैं? बस इस हरे बटन को दबाएँ और मुझे अपनी आवाज में बताएँ कि आपको क्या चाहिए। एआई बाकी सब संभाल लेगा।",
    step4: "यह पंचायत है। मदद चाहिए? आपकी प्रोफाइल से मेल खाने वाली सरकारी योजनाएँ यहाँ दिखाई देंगी!",
    step5: "बुवाई का समय है! आपको बीजों के लिए ₹15,000 चाहिए। अभी बैंक या साहूकार के पास जाएँ। समझदारी भरा फैसला लें!",
    next: "आगे बढ़ें",
    finish: "अपनी यात्रा शुरू करें",
    sahukarWarning: "सावधान! अधिक ब्याज",
    bankSafe: "सुरक्षित विकल्प",
    sahukarDialogue: "यह कर्ज जल्दी चुकाना होगा, नहीं तो मुश्किल होगी।",
    schemeDialogue: "बहुत बढ़िया! सरकारी योजना ने आपके पैसे बचा लिए।",
    moduleStart: "आइए शुरू करें:",
    moduleComplete: "बहुत बढ़िया! आपने यह पाठ पूरी तरह सीख लिया!"
  }
};

export default function ArthaChacha({ 
  activeModal, 
  lastDecision, 
  language = 'hi', 
  isFirstVisit, 
  onCompleteTour,
  onStepChange,
  activeLesson
}) {
  const [tourStep, setTourStep] = useState(isFirstVisit ? 1 : 0);
  const [bubbleText, setBubbleText] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState('happy');
  const [introducedLessonId, setIntroducedLessonId] = useState(null);

  const t = T[language] || T.hi;

  useEffect(() => {
    if (tourStep > 0) {
      setBubbleText(t[`step${tourStep}`]);
      setShowMessage(true);
      if (onStepChange) onStepChange(tourStep);
    } else {
      setShowMessage(false);
      if (onStepChange) onStepChange(0);
    }
  }, [tourStep, t, onStepChange]);

  const handleNext = () => {
    if (tourStep < 5) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      // Force immediate update to parent for synchronization
      if (onStepChange) onStepChange(nextStep);
    } else if (tourStep === 10) {
      // Intro Module step
      setTourStep(0);
      setIntroducedLessonId(activeLesson?.id);
      if (onStepChange) onStepChange(0);
    } else {
      setTourStep(0);
      onCompleteTour();
      if (onStepChange) onStepChange(0);
    }
  };

  // CAMPAIGN MODULE NARRATOR
  useEffect(() => {
    if (activeLesson && !isFirstVisit && introducedLessonId !== activeLesson.id) {
       setTourStep(10); // 10 is the special code for Module Introduction
       setBubbleText(`${t.moduleStart} ${activeLesson.title}. \n\n${activeLesson.quest.task}`);
       setShowMessage(true);
    } else if (!activeLesson) {
       setIntroducedLessonId(null); // Reset when quitting
    }
  }, [activeLesson, isFirstVisit, introducedLessonId, t]);

  // POST-TOUR REACTION ENGINE
  useEffect(() => {
    if (tourStep > 0) return;
    if (!lastDecision) return;

    let newBubble = null;
    if (lastDecision.type === 'loan' && lastDecision.source === 'moneylender') {
      newBubble = t.sahukarDialogue;
      setAvatarExpression('worried');
    } else if (lastDecision.type === 'scheme') {
      newBubble = t.schemeDialogue;
      setAvatarExpression('happy');
    }

    if (newBubble) {
      setBubbleText(newBubble);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        setAvatarExpression('happy');
      }, 4000);
    }
  }, [lastDecision, tourStep, t]);

  // Status Pill feedback
  let statusText = '';
  if (tourStep === 0) {
    if (activeModal === 'moneylender') {
      statusText = t.sahukarWarning;
    } else if (activeModal === 'bank' || activeModal === 'panchayat') {
      statusText = t.bankSafe;
    }
  }

  const getPositionStyles = () => {
     if (tourStep === 0) return "bottom-6 right-6 translate-x-0 translate-y-0 scale-100";
     // Step 1: Greeting - Center of screen
     if (tourStep === 1) return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-125";
     // ...
     if (tourStep === 2) return "top-1/3 right-4 translate-x-0 translate-y-0 scale-100";
     if (tourStep === 3) return "bottom-40 left-1/2 -translate-x-1/2 translate-y-0 scale-110";
     if (tourStep === 4) return "top-48 left-10 translate-x-0 translate-y-0 scale-100";
     if (tourStep === 5) return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-110";
     if (tourStep === 10) return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-110 z-[3000]";
     return "bottom-6 right-6 translate-x-0 translate-y-0 scale-100";
  };

  return (
    <div className={`absolute transition-all duration-1000 ease-in-out z-[1000] flex flex-col items-end pointer-events-none ${getPositionStyles()}`}>
      
      <style>{`
        @keyframes chacha-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-chacha-float {
          animation: chacha-float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Speech Bubble (Premium Glassmorphism) */}
      <div className={`mb-4 max-w-[280px] bg-white/80 backdrop-blur-xl text-slate-900 p-6 rounded-[32px] rounded-br-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/40 transition-all duration-700 origin-bottom-right pointer-events-auto ${showMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
        <p className="text-sm font-[800] leading-relaxed tracking-tight">{bubbleText}</p>
        
        {tourStep > 0 && (
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleNext}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all"
            >
              {tourStep === 5 ? t.finish : tourStep === 10 ? t.next : t.next} →
            </button>
          </div>
        )}
      </div>

      {/* Chacha Avatar (Realistic Illustration) */}
      <div className="relative pointer-events-auto group animate-chacha-float">
        {statusText && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20 animate-in slide-in-from-bottom-4">
            {statusText}
          </div>
        )}
        <div className={`relative w-28 h-28 rounded-full overflow-hidden border-2 border-white bg-white shadow-2xl transition-transform duration-500 ${avatarExpression === 'worried' ? 'scale-90' : 'scale-100'}`}>
          <img 
            src="/assets/artha_chacha.png" 
            alt="Artha Chacha" 
            className="w-full h-full object-cover bg-slate-100"
            onError={(e) => { e.target.style.opacity = '0.5'; e.target.style.backgroundColor = '#94a3b8'; }}
          />
        </div>
        {/* Subtle Glow Ring */}
        <div className="absolute inset-x-0 -bottom-2 h-4 w-20 left-1/2 -translate-x-1/2 bg-slate-900/20 blur-xl -z-10" />
      </div>
    </div>
  );
}
 
 
