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
    const PROF_KEYS = ['profile', 'name', 'land', 'zamin', 'kheti', 'income'];
    const TOUR_KEYS = ['help', 'tour', 'sikhao', 'baat', 'chacha', 'guide'];

    setTimeout(() => {
      let mockIntent = {
        type: "question",
        action: "none",
        target: null,
        spoken_response: language === 'hi' 
          ? "माफ़ कीजिए, मुझे इसके बारे में जानकारी नहीं है। कृपया खेती या बैंक के बारे में पूछें।" 
          : "I'm sorry, beta, I don't know about that. Please ask about farming or banking."
      };

      // ── NAVIGATION OVERRIDES (Highest Priority) ──
      if (NAV_PANCHAYAT.some(k => text.includes(k))) {
        mockIntent = { type: "command", action: "open_node", target: "panchayat", spoken_response: language === 'hi' ? "ज़रूर, पंचायत ऑफिस में कई योजनाएं हैं। चलिए देखते हैं।" : "Of course, there are many schemes at the Panchayat office. Let's look." };
      } else if (NAV_BANK.some(k => text.includes(k))) {
        mockIntent = { type: "command", action: "open_node", target: "bank", spoken_response: language === 'hi' ? "बैंक जाना एक समझदारी भरा फैसला है। चलिए।" : "Going to the bank is a wise decision. Let's head there." };
      } else if (NAV_HOME.some(k => text.includes(k))) {
        mockIntent = { type: "command", action: "open_node", target: "home", spoken_response: language === 'hi' ? "घर चलिए, थोड़ा आराम कीजिए।" : "Let's go home and rest, beta." };
      } else if (NAV_MANDI.some(k => text.includes(k))) {
        mockIntent = { type: "command", action: "open_node", target: "market", spoken_response: language === 'hi' ? "मंडी में आज की दरें देखेंगे?" : "Let's check today's rates at the mandi." };
      }

      // ── STATE QUERIES (NEW) ──
      if (BAL_KEYS.some(k => text.includes(k)) && !text.includes('loan')) {
        mockIntent.spoken_response = language === 'hi'
          ? `बेटा, आपकी जेब में ₹${walletBalance} बचे हैं। सोच-समझकर खर्च करें।`
          : `Beta, you have ₹${walletBalance} in your wallet. Spend it wisely.`;
      } else if (SCORE_KEYS.some(k => text.includes(k))) {
        mockIntent.spoken_response = language === 'hi'
          ? `आपका अर्था स्कोर ${arthaScore} है। इसे बेहतर करने के लिए समय पर लोन चुकाएं।`
          : `Your Artha Score is ${arthaScore}. Repay loans on time to improve it, beta.`;
      } else if (TIME_KEYS.some(k => text.includes(k))) {
        mockIntent.spoken_response = language === 'hi'
          ? `यह ${currentMonth} का महीना है। खेती का अच्छा समय है।`
          : `This is the month of ${currentMonth}, beta. A crucial time for your farm.`;
      } else if (GAME_GOAL.some(k => text.includes(k))) {
        mockIntent.spoken_response = language === 'hi'
          ? "हमारा लक्ष्य आपके गाँव को समृद्ध करना और आपको साहूकार के कर्ज से बचाना है।"
          : "Our goal is to make your village prosperous and keep you away from the moneylender's trap, beta.";
      } else if (PROF_KEYS.some(k => text.includes(k))) {
        mockIntent.spoken_response = language === 'hi'
             ? `आप एक मेहनती किसान हैं। अपनी मेहनत पर भरोसा रखें।`
             : `You are a hardworking farmer. Trust in your strategy, beta.`;
      } else if (TOUR_KEYS.some(k => text.includes(k))) {
        mockIntent.spoken_response = language === 'hi'
             ? "मैं आपको गाँव की सैर करा सकता हूँ। क्या आप तैयार हैं?"
             : "I can show you around the village. Are you ready, beta?";
      }

      // ── WISDOM LOGIC: SEEDS & SPENDING (Now triggers Seed Shop) ──
      else if (SEED_KEYS.some(k => text.includes(k))) {
        // Special case: Already in the shop!
        if (activeModal === 'seed_shop') {
          mockIntent.spoken_response = language === 'hi'
            ? "हाइब्रिड बीज से फसल अच्छी होगी, बेटा, पर उसमें मेहनत और खाद ज़्यादा लगेगी। अगर पैसे कम हैं तो देसी बीज ही लें।"
            : "Hybrid seeds will give a better yield, beta, but they need more care and fertilizers. If budget is tight, stick to basic seeds.";
        } else {
          mockIntent.target = "seed_shop";
          mockIntent.action = "open_node";
          mockIntent.type = "command";

          if (walletBalance < 2000) {
            mockIntent.spoken_response = language === 'hi'
              ? `बेटा, जेब में सिर्फ ₹${walletBalance} हैं। खाद-बीज लेना अभी भारी पड़ेगा। पहले बैंक से मदद माँगें।`
              : `Beta, you only have ₹${walletBalance}. Buying seeds now will be hard. Let's head to the shop anyway, but consider a loan first.`;
          } else {
            mockIntent.spoken_response = language === 'hi'
              ? `बुवाई का समय है! ₹${walletBalance} में बढ़िया बीज आएँगे। चलिए दुकान चलते हैं।`
              : `It's sowing season! ₹${walletBalance} is enough for good seeds. Let's go to the seed shop.`;
          }
        }
      }

      // ── WISDOM LOGIC: LOANS & DEBT ──
      else if (LOAN_KEYS.some(k => text.includes(k))) {
        if (eligibleSchemes.length > 0) {
           mockIntent.spoken_response = language === 'hi'
              ? "साहूकार से मत उलझो! पंचायत में आपके लिए सरकारी सहायता है। चलिए वहाँ चलते हैं।"
              : "Don't get stuck with the moneylender! There's government help at the Panchayat. Let's head there.";
           mockIntent.target = "panchayat";
           mockIntent.action = "open_node";
           mockIntent.type = "command";
        } else if (arthaScore > 600) {
           mockIntent.spoken_response = language === 'hi'
              ? "आपका अर्था स्कोर बढ़िया है! बैंक से कम ब्याज पर लोन मिलेगा। चलिए बैंक चलते हैं।"
              : "Your Artha Score is great! You'll get a low-interest bank loan. Let's go to the bank.";
           mockIntent.target = "bank";
           mockIntent.action = "open_node";
           mockIntent.type = "command";
        }
      }

      // ── WISDOM LOGIC: WATER ──
      else if (IRRIGATION_KEYS.some(k => text.includes(k))) {
        mockIntent.spoken_response = language === 'hi'
          ? "फसल को पानी की ज़रूरत है, पर उतना ही दें जितनी मिट्टी की माँग हो।"
          : "The crop needs water, but give only what the soil asks for, beta.";
      }

      // ── WISDOM LOGIC: GENERAL ENCOURAGEMENT ──
      else if (text.includes('kaisa') || text.includes('theek') || text.includes('how') || text.includes('good')) {
        mockIntent.spoken_response = language === 'hi'
          ? "सब ठीक हो जाएगा! बस अपनी मेहनत और अकल पर भरोसा रखें। मैं साथ हूँ।"
          : "Everything will be fine! Just trust your hard work and wisdom. I am right here with you, beta.";
      }

      setIsThinking(false);
      setChachaResponse(mockIntent.spoken_response);
      speak(mockIntent.spoken_response, mockIntent);
    }, 1200);
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
      {/* Visual Feedback Overlay */}
      {(status !== 'idle') && (
        <div className="mb-8 w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 p-8 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 pointer-events-auto">
            
            {status === 'listening' && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1.5 items-end justify-center h-12">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={`vbar-${i}`} className="w-2 bg-green-400 rounded-full animate-voice-bar" style={{ height: '30%', animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
                <div className="text-center">
                   <p className="text-green-400 font-black uppercase text-[11px] tracking-[0.2em] mb-2">
                     {language === 'hi' ? "सुन रहा हूँ..." : "LISTENING..."}
                   </p>
                   <p className="text-white font-medium text-lg italic opacity-90 leading-snug">
                     {transcript || "..."}
                   </p>
                </div>
              </div>
            )}

            {status === 'thinking' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative w-16 h-16">
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
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-4xl shadow-inner animate-soft-bounce">
                  👴
                </div>
                <p className="text-white font-bold text-xl leading-relaxed tracking-tight">
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
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border-[8px] active:scale-90 ${status === 'listening' ? 'bg-red-500 border-red-200 ring-[12px] ring-red-500/20' : 'bg-[#22C55E] border-white hover:shadow-green-500/20'} ${(activeModal === 'tour' && (status === 'idle' || status === 'listening')) ? 'opacity-30 grayscale' : 'opacity-100'}`}
        >
          <span className="text-4xl mb-1">{status === 'listening' ? '⏹️' : '🎤'}</span>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
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
 
 
