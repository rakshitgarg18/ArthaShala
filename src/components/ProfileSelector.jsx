export default function ProfileSelector({ language, onSelect }) {
  // Localized titles
  const titles = {
    hi: { main: 'अपना प्रोफाइल चुनें', sub: 'आप क्या करते हैं?' },
    mr: { main: 'तुमचा प्रोफाईल निवडा', sub: 'तुम्ही काय करता?' },
    en: { main: 'Select Your Profile', sub: 'What do you do?' },
    gu: { main: 'તમારી પ્રોફાઇલ પસંદ કરો', sub: 'તમે શું કરો છો?' },
    bh: { main: 'अपना प्रोफाइल चुनें', sub: 'रउआ का करत हईं?' },
    bn: { main: 'আপনার প্রোফাইল নির্বাচন করুন', sub: 'আপনি কী করেন?' },
    te: { main: 'మీ ప్రొఫైల్ ఎంచుకోండి', sub: 'మీరు ఏమి చేస్తారు?' },
    ta: { main: 'உங்கள் விவரத்தை தேர்ந்தெடுங்கள்', sub: 'நீங்கள் என்ன செய்கிறீர்கள்?' },
    kn: { main: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ', sub: 'ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ?' },
  };

  const profiles = [
    {
      id: 'farmer',
      icon: '🚜',
      labels: { hi: 'खेती', mr: 'शेती', en: 'Farming', gu: 'ખેતી', bh: 'खेती', bn: 'কৃষি', te: 'వ్యవసాయం', ta: 'விவசாயம்', kn: 'ಕೃಷಿ' },
      bg: '#d1fae5',   // light green
      iconBg: '#a7f3d0',
    },
    {
      id: 'trader',
      icon: '🏪',
      labels: { hi: 'व्यापार', mr: 'व्यापार', en: 'Trade', gu: 'વ્યાપાર', bh: 'व्यापार', bn: 'ব্যবসা', te: 'వ్యాపారం', ta: 'வியாபாரம்', kn: 'ವ್ಯಾಪಾರ' },
      bg: '#bfdbfe',   // light blue
      iconBg: '#93c5fd',
    },
    {
      id: 'labour',
      icon: '🪓',
      labels: { hi: 'मजदूरी', mr: 'मजुरी', en: 'Labour', gu: 'મજૂરી', bh: 'मजदूरी', bn: 'শ্রম', te: 'కూలి', ta: 'கூலி', kn: 'ಕೂಲಿ' },
      bg: '#fed7aa',   // light orange
      iconBg: '#fdba74',
    },
    {
      id: 'other',
      icon: '🎙️',
      labels: { hi: 'इतर / बोला', mr: 'इतर / बोला', en: 'Other / Bolo', gu: 'અન્ય / બોલો', bh: 'अन्य / बोलो', bn: 'অন্যান্য', te: 'ఇతర', ta: 'மற்றவை', kn: 'ಇತರೆ' },
      bg: '#ccfbf1',   // light teal
      iconBg: '#99f6e4',
    },
  ];

  const t = titles[language] || titles.hi;

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden" style={{ fontFamily: 'sans-serif' }}>
      
      {/* Header - Compacted */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
        <h1 className="text-xl font-extrabold text-slate-800 mb-0.5 leading-tight">
          {t.main}
        </h1>
        <p className="text-xs text-slate-500 font-bold">{t.sub}</p>
      </div>

      {/* 2×2 Profile Cards */}
      <div className="flex-1 px-5 pb-10">
        <div className="grid grid-cols-2 gap-4 h-full" style={{ maxHeight: '480px' }}>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="flex flex-col items-center justify-center rounded-3xl py-8 px-4 active:scale-95 transition-all shadow-sm"
              style={{ background: p.bg, border: 'none' }}
            >
              {/* Icon container */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-5xl"
                style={{ background: p.iconBg }}
              >
                {p.icon}
              </div>
              <span className="text-lg font-bold text-slate-800">
                {p.labels[language] || p.labels.hi}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
 
 
