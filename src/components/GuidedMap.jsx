import React, { useState } from 'react';
import { useGameState } from './GuidedGameController';
import DecisionModal from './DecisionModal';

// ─── STEP CONFIGURATIONS ────────────────────────────────────────────────────
const STEPS = {
  1: {
    label: 'फसल बोने का वक्त',
    labelEn: 'Sowing Time',
    icon: '🌱',
    description: 'आपको खेत के लिए ₹10,000 चाहिए। आप कहाँ से उधार लेंगे?',
    descriptionEn: 'You need ₹10,000 for your farm. Where will you borrow from?',
    activeNodes: ['bank', 'moneylender'],
  },
  2: {
    label: 'चिकित्सा संकट',
    labelEn: 'Medical Crisis',
    icon: '🏥',
    description: 'आपके परिवार को इलाज की जरूरत है। आप कहाँ जाएंगे?',
    descriptionEn: 'Your family needs medical care. Where will you go?',
    activeNodes: ['panchayat', 'medical'],
  },
  3: {
    label: 'फसल कटाई का समय',
    labelEn: 'Harvest Time',
    icon: '🌾',
    description: 'आपकी फसल तैयार है। आप कहाँ बेचेंगे?',
    descriptionEn: 'Your crop is ready. Where will you sell?',
    activeNodes: ['market', 'home'],
  },
};

// ─── NODE CONFIGS (position as % of map area) ──────────────────────────────
const MAP_NODES = [
  // Step 1
  {
    id: 'bank',       step: 1, x: 28, y: 32, icon: '🏦', label: 'बैंक',       labelEn: 'Bank',
    modal: {
      title: 'बैंक से KCC ऋण',
      subtitle: 'सरकारी ब्याज दर — सिर्फ 4% सालाना',
      options: [
        { label: 'KCC ऋण लें — ₹10,000 @ 4%', sublabel: '₹10,400 वापस करना होगा — ₹400 ब्याज', icon: '🏦', cost: 10000, debtAdded: 10400, waste: 400, isGood: true },
      ],
    },
  },
  {
    id: 'moneylender', step: 1, x: 68, y: 28, icon: '💰', label: 'साहूकार', labelEn: 'Moneylender',
    modal: {
      title: 'साहूकार से उधार',
      subtitle: 'खतरनाक! ब्याज दर — 24% सालाना',
      options: [
        { label: 'साहूकार से उधार लें — ₹10,000 @ 24%', sublabel: '₹12,400 वापस करना होगा — ₹2,400 ब्याज', icon: '💸', cost: 10000, debtAdded: 12400, waste: 2400, isGood: false },
      ],
    },
  },
  // Step 2
  {
    id: 'panchayat',  step: 2, x: 20, y: 64, icon: '🏛️', label: 'पंचायत / CSC', labelEn: 'Panchayat',
    modal: {
      title: 'आयुष्मान भारत योजना',
      subtitle: 'सरकारी स्वास्थ्य योजना — मुफ्त इलाज',
      options: [
        { label: 'आयुष्मान कार्ड से इलाज करवाएं', sublabel: 'बीमा से मुफ्त — ₹0 खर्च', icon: '🏛️', cost: 0, debtAdded: 0, waste: 0, isGood: true },
      ],
    },
  },
  {
    id: 'medical',    step: 2, x: 72, y: 58, icon: '🏥', label: 'प्राइवेट अस्पताल', labelEn: 'Private Clinic',
    modal: {
      title: 'प्राइवेट क्लिनिक',
      subtitle: 'नकद इलाज — महंगा!',
      options: [
        { label: 'नकद में इलाज करवाएं — ₹5,000', sublabel: 'जेब से खर्च — बीमा नहीं', icon: '💊', cost: -5000, debtAdded: 0, waste: 5000, isGood: false },
      ],
    },
  },
  // Step 3
  {
    id: 'market',     step: 3, x: 48, y: 72, icon: '🌽', label: 'मंडी (MSP)',   labelEn: 'Mandi',
    modal: {
      title: 'सरकारी मंडी में बेचें',
      subtitle: 'MSP पर बेचें — सही दाम, ₹2,000 परिवहन खर्च',
      options: [
        { label: 'मंडी में बेचें — ₹40,000 (MSP)', sublabel: 'परिवहन: -₹2,000 — शुद्ध: ₹38,000', icon: '🌽', cost: 38000, debtAdded: 0, waste: 0, isGood: true },
      ],
    },
  },
  {
    id: 'home',       step: 3, x: 22, y: 26, icon: '🏠', label: 'स्थानीय व्यापारी', labelEn: 'Local Trader',
    modal: {
      title: 'स्थानीय व्यापारी को बेचें',
      subtitle: 'बाज़ार से कम भाव — सुविधाजनक लेकिन नुकसानदेह',
      options: [
        { label: 'व्यापारी को बेचें — ₹30,000', sublabel: 'MSP से ₹8,000 कम — यह नुकसान है', icon: '🏷️', cost: 30000, debtAdded: 0, waste: 8000, isGood: false },
      ],
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
export default function GuidedMap() {
  const { step, wallet, debt, wastedMoney, makeDecision } = useGameState();
  const [activeNode, setActiveNode] = useState(null);

  const currentStepConfig = STEPS[step];
  const activeNodeIds = currentStepConfig?.activeNodes || [];

  const handleNodeClick = (node) => {
    if (!activeNodeIds.includes(node.id)) return;
    setActiveNode(node);
  };

  const handleChoose = (cost, debtAdded, waste) => {
    setActiveNode(null);
    makeDecision(cost, debtAdded, waste);
  };

  return (
    <div className="h-full flex flex-col">

      {/* ── TOP STATUS BAR ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b-2 border-slate-100 px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-lg">
              {currentStepConfig?.icon}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                चरण {step} / 3
              </p>
              <p className="text-slate-800 font-black text-sm leading-tight">
                {currentStepConfig?.label}
              </p>
            </div>
          </div>
          {/* Progress dots */}
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-3 h-3 rounded-full transition-colors ${
                s < step ? 'bg-green-500' :
                s === step ? 'bg-indigo-500 animate-pulse' :
                'bg-slate-200'
              }`} />
            ))}
          </div>
        </div>

        {/* Instruction box */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <p className="text-amber-900 font-bold text-sm leading-snug">
            👆 {currentStepConfig?.description}
          </p>
        </div>

        {/* Financial indicators */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-200">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">बटुआ</p>
            <p className="text-slate-800 font-black text-base tabular-nums">₹{wallet.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl p-2.5 text-center border ${debt > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-[8px] font-black uppercase tracking-widest ${debt > 0 ? 'text-red-400' : 'text-slate-400'}`}>कर्ज़</p>
            <p className={`font-black text-base tabular-nums ${debt > 0 ? 'text-red-600' : 'text-slate-800'}`}>₹{debt.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl p-2.5 text-center border ${wastedMoney > 0 ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-[8px] font-black uppercase tracking-widest ${wastedMoney > 0 ? 'text-orange-400' : 'text-slate-400'}`}>नुकसान</p>
            <p className={`font-black text-base tabular-nums ${wastedMoney > 0 ? 'text-orange-600' : 'text-slate-800'}`}>₹{wastedMoney.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ── MAP AREA ────────────────────────────────────────────────────── */}
      <div className="flex-1 relative bg-gradient-to-b from-[#e8f5e9] to-[#c8e6c9] overflow-hidden">
        {/* Decorative terrain */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-green-700 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-yellow-600 blur-2xl" />
        </div>
        
        {/* Map label */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur rounded-full px-4 py-1.5 text-[10px] font-black text-slate-600 uppercase tracking-widest shadow-sm">
          🗺️ ग्राम पंचायत — अर्थाशाला गाँव
        </div>

        {/* ── NODES ─────────────────────────────────────────────────── */}
        {MAP_NODES.map(node => {
          const isActive = activeNodeIds.includes(node.id);
          const isCurrentNode = activeNode?.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node)}
              disabled={!isActive}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all
                ${isActive ? 'cursor-pointer scale-100 opacity-100' : 'cursor-not-allowed opacity-30 scale-90'}
                ${isActive && !isCurrentNode ? 'hover:scale-110' : ''}
              `}
            >
              {/* Pulse ring for active nodes */}
              {isActive && (
                <span className="absolute w-16 h-16 rounded-full bg-indigo-400/30 animate-ping" style={{ top: -8, left: -8 }} />
              )}

              {/* Node circle */}
              <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 transition-colors
                ${isActive
                  ? 'bg-white border-indigo-500 shadow-indigo-200'
                  : 'bg-slate-200 border-slate-300'
                }`}
              >
                {node.icon}
              </div>
              
              {/* Label */}
              <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap shadow-sm border
                ${isActive
                  ? 'bg-white border-indigo-100 text-indigo-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              >
                {node.label}
              </div>

              {/* TAP indicator */}
              {isActive && (
                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest animate-bounce">
                  ▼ टैप करें
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── DECISION MODAL ──────────────────────────────────────────────── */}
      {activeNode && (
        <DecisionModal
          title={activeNode.modal.title}
          subtitle={activeNode.modal.subtitle}
          options={activeNode.modal.options}
          onChoose={handleChoose}
          onClose={() => setActiveNode(null)}
        />
      )}
    </div>
  );
}
 
 
