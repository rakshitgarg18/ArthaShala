import React, { useState, useEffect, useCallback } from 'react';
import { useFinancials } from '../context/FinancialContext.jsx';

/**
 * BOLO VOICE ENGINE
 * Implements "Artha Chacha" as a voice-driven tutor and router.
 * Features: Web Speech API (Ears), Speech Synthesis (Mouth), and LLM intent routing (Brain).
 */
export default function BoloEngine({ onCommand, activeModal }) {
  const { 
    language, 
    walletBalance, 
    sahukarDebt, 
    bankDebt, 
    arthaScore, 
    currentMonth, 
    eligibleSchemes 
  } = useFinancials();
  
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [chachaResponse, setChachaResponse] = useState('');
  const [preferredVoice, setPreferredVoice] = useState(null);

  // Load voices - Prioritize local system voices for offline stability
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("BOLO - Available Voices:", voices.length);
      
      // Filter for Hindi/Indian voices
      const inVoices = voices.filter(v => v.lang.includes('hi') || v.lang.includes('IN'));
      
      // 1. Try to find a LOCAL MALE Indian voice (robust offline)
      const localMale = inVoices.find(v => 
        v.localService && 
        (v.name.toLowerCase().includes('male') || v.name.includes('Hemant') || v.name.includes('Rishi'))
      );

      // 2. Try any LOCAL Indian voice
      const anyLocalIn = inVoices.find(v => v.localService);

      // 3. Fallback to any Indian voice (might be cloud-based)
      const anyIn = inVoices[0] || voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      
      const finalVoice = localMale || anyLocalIn || anyIn;
      if (finalVoice) setPreferredVoice(finalVoice);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 1. EAR: Native Speech Recognition
  // ... (startListening matches previous logic)
  const startListening = () => {
    // ... existing recognition setup ...
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice features are not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    window._recognition = recognition; 
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('listening');
      setTranscript('');
      setChachaResponse('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscript = (finalTranscript || interimTranscript).toLowerCase();
      setTranscript(currentTranscript);

      if (finalTranscript) {
        console.log("BOLO - Final Recognized:", finalTranscript);
        recognition.stop();
        processCommand(finalTranscript.toLowerCase());
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus('idle');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // 2. BRAIN: Contextual Wisdom Engine
  const processCommand = async (text) => {
    setIsThinking(true);
    setStatus('thinking');

    // Synonym Maps
    const LOAN_KEYS = ['loan', 'उधार', 'कर्ज', 'borrow', 'paisa', 'money', 'rupaye', 'sahukar', 'kist', 'debt'];
    const SEED_KEYS = ['seed', 'बीज', 'buy', 'खरीद', 'fasal', 'crop', 'mandi', 'price', 'rate', 'khad', 'fertilizer', 'shop'];
    const IRRIGATION_KEYS = ['water', 'पानी', 'सिंचाई', 'irrigation', 'pump', 'boring', 'kuan'];
    const NAV_PANCHAYAT = ['panchayat', 'पंचायत', 'scheme', 'yojna', 'office', 'government'];
    const NAV_BANK = ['bank', 'बैंक', 'manager', 'account', 'खाता'];
    const NAV_SHOP = ['shop', 'store', 'dukaan', 'दुकान'];
    const NAV_HOME = ['home', 'ghar', 'घर', 'residence'];
    const NAV_MANDI = ['mandi', 'मंडी', 'market', 'bazaar', 'price'];
    const BAL_KEYS = ['balance', 'बैलेंस', 'कितना', 'kitna', 'money', 'paisa', 'budget', 'kharcha'];
    const SCORE_KEYS = ['score', 'स्कोर', 'artha', 'credit', 'performance'];
    const GAME_GOAL = ['win', 'जीत', 'aim', 'goal', 'finish', 'end', 'khel', 'objective'];
    const TIME_KEYS = ['month', 'mahina', 'समय', 'time', 'kab'];

    setTimeout(() => {
      // ── AI Dynamic Response Generation ──
      const getAIResponse = () => {
        const input = text.toLowerCase();
        
        // 1. NAVIGATION
        if (NAV_PANCHAYAT.some(k => input.includes(k))) {
          return { target: "panchayat", action: "open_node", type: "command", spoken: language === 'hi' ? "पंचायत में योजनाएं आपका इंतज़ार कर रही हैं। चलिए।" : "Government schemes await you at the Panchayat. Let's head there." };
        }
        if (NAV_BANK.some(k => input.includes(k))) {
          return { target: "bank", action: "open_node", type: "command", spoken: language === 'hi' ? "बैंक जाना ही सबसे सुरक्षित रास्ता है। चलिए।" : "The bank is the safest path, beta. Let's go." };
        }
        if (NAV_MANDI.some(k => input.includes(k))) {
          return { target: "market", action: "open_node", type: "command", spoken: language === 'hi' ? "मंडी में आज की दरें देख लेते हैं।" : "Let's check today's market rates at the mandi." };
        }

        // 2. CONTEXTUAL STATS
        if (BAL_KEYS.some(k => input.includes(k))) {
          return { spoken: language === 'hi' ? `बेटा, आप पास ₹${walletBalance} हैं। संभलकर चलें।` : `You have ₹${walletBalance} with you, beta. Spend wisely.` };
        }
        if (SCORE_KEYS.some(k => input.includes(k))) {
          const comment = arthaScore > 70 ? (language === 'hi' ? "बहुत शानदार!" : "Excellent!") : (language === 'hi' ? "मेहनत की ज़रूरत है।" : "Needs some work.");
          return { spoken: language === 'hi' ? `आपका अर्था स्कोर ${arthaScore} है। ${comment}` : `Your Artha Score is ${arthaScore}. ${comment}` };
        }
        if (LOAN_KEYS.some(k => input.includes(k))) {
          const totalDebt = sahukarDebt + bankDebt;
          if (totalDebt > 0) return { spoken: language === 'hi' ? `आप पर ₹${totalDebt} का कर्ज है। इसे चुकाने की योजना बनाएं।` : `You owe ₹${totalDebt} in loans. Plan to repay it soon, beta.` };
          return { spoken: language === 'hi' ? "अभी आप पर कोई कर्ज नहीं है। यह बहुत अच्छा है!" : "You have no debt right now. That's excellent!" };
        }

        // 3. SEED SHOP LOGIC
        if (SEED_KEYS.some(k => input.includes(k))) {
           if (activeModal === 'seed_shop') {
             return { spoken: language === 'hi' ? "हाइब्रिड बीज से फसल अच्छी होगी, पर खर्च भी ज़्यादा होगा।" : "Hybrid seeds give more yield but cost more too." };
           }
           return { target: "seed_shop", action: "open_node", type: "command", spoken: language === 'hi' ? "बीज और खाद के लिए दुकान चलते हैं।" : "Let's go to the shop for seeds and fertilizer." };
        }

        // 4. FALLBACK
        const fallbacks = language === 'hi' 
          ? ["साहूकार से बचें, बैंक से जुड़ें।", "बचत करना ही अमीरी की पहली सीढ़ी है।", "मुझसे कुछ भी पूछें, मैं आपकी मदद करूँगा।"]
          : ["Avoid the moneylender, stay with the bank.", "Saving is the first step to prosperity.", "Ask me anything, beta, I am here to help."];
        return { spoken: fallbacks[Math.floor(Math.random() * fallbacks.length)] };
      };

      const result = getAIResponse();
      const mockIntent = {
        type: result.type || "question",
        action: result.action || "none",
        target: result.target || null,
        spoken_response: result.spoken
      };

      setIsThinking(false);
      setChachaResponse(mockIntent.spoken_response);
      speak(mockIntent.spoken_response, mockIntent);
    }, 1000);
  };

  // 3. MOUTH: Native Speech Synthesis (Tuned for Rural Persona)
  const speak = (text, intent) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    
    // Voice Tuning for Rural Indian Elder
    // Force MASCULINE parameters if a natural male voice isn't found
    const pitchValue = preferredVoice?.name.toLowerCase().includes('male') ? 0.9 : 0.85; 
    const rateValue = 0.82; // Slightly faster but still deliberate
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = rateValue;
    utterance.pitch = pitchValue; 

    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => {
      setStatus('idle');
      if (intent && intent.target && activeModal !== intent.target) {
        onCommand(intent.target);
      }
    };

    synth.speak(utterance);
  };

  const toggleListening = () => {
    if (status === 'listening') {
      if (window._recognition) {
        window._recognition.stop();
        setIsListening(false);
        setStatus('idle');
      }
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[2000] pointer-events-none flex flex-col items-center pb-12">
      {/* Visual Feedback Overlay - Refined for 320px width */}
      {(status !== 'idle') && (
        <div className="mb-4 w-[92vw] max-w-[320px] px-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900/98 backdrop-blur-2xl border border-white/20 p-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 pointer-events-auto">
            
            {status === 'listening' && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1 items-end justify-center h-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={`vbar-${i}`} className="w-1.5 bg-green-400 rounded-full animate-voice-bar" style={{ height: '30%', animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
                <div className="text-center">
                   <p className="text-green-400 font-black uppercase text-[11px] tracking-[0.2em] mb-2">
                     {language === 'hi' ? "सुन रहा हूँ..." : "LISTENING..."}
                   </p>
                   <p className="text-white font-black text-sm italic opacity-95 leading-tight px-2">
                     {transcript || "..."}
                   </p>
                </div>
              </div>
            )}

            {status === 'thinking' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-blue-400/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-blue-400 font-black uppercase text-[11px] tracking-[0.2em]">
                  {language === 'hi' ? "सोच रहा हूँ..." : "THINKING..."}
                </p>
              </div>
            )}

            {status === 'speaking' && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-3xl shadow-inner animate-soft-bounce">
                  👴
                </div>
                <p className="text-white font-bold text-sm leading-snug tracking-tight px-2">
                  {chachaResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* The Master Control Mic Button */}
      <div className="pointer-events-auto">
        <button 
          onClick={toggleListening}
          disabled={(status !== 'idle' && status !== 'listening') || (activeModal === 'tour')}
          className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl border-[6px] active:scale-90 ${status === 'listening' ? 'bg-red-500 border-red-200 ring-[8px] ring-red-500/20' : 'bg-green-500 border-white hover:bg-green-600'} ${(activeModal === 'tour' && (status === 'idle' || status === 'listening')) ? 'opacity-30 grayscale' : 'opacity-100'}`}
        >
          <span className="text-3xl mb-0.5">{status === 'listening' ? '⏹️' : '🎤'}</span>
          <span className="text-[9px] font-black text-white uppercase tracking-widest">
            {status === 'listening' ? (language === 'hi' ? 'बंद' : 'STOP') : 'BOLO'}
          </span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes voice-bar {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
        .animate-voice-bar {
          animation: voice-bar 0.6s ease-in-out infinite;
        }
        @keyframes soft-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-soft-bounce {
          animation: soft-bounce 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
 
 
