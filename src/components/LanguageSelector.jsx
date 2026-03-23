export default function LanguageSelector({ onSelect }) {
  // 8 regional languages in 2-column grid, then English as full-width CTA
  const regional = [
    { code: 'hi', label: 'हिंदी', default: true },
    { code: 'mr', label: 'मराठी' },
    { code: 'bn', label: 'बांग्ला' },
    { code: 'gu', label: 'गुजराती' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'bh', label: 'भोजपुरी', badge: 'Dialect Supported' },
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden" style={{ fontFamily: 'sans-serif' }}>
      
      {/* Top Bar: ArthaShala only */}
      <div className="flex items-center justify-center px-5 pt-5 pb-3">
        <span className="text-xl font-bold text-slate-800" style={{ letterSpacing: '-0.5px' }}>ArthaShala</span>
      </div>

      {/* Welcome Title */}
      <div className="flex flex-col items-center pt-4 pb-3 px-5 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 leading-tight mb-1">
          स्वागत है
        </h1>
        <p className="text-base text-slate-600 font-medium">अपनी भाषा चुनें</p>
      </div>

      {/* Sound Wave Icon */}
      <div className="flex justify-center items-center gap-1 mb-5">
        {[3, 6, 9, 13, 9, 6, 3].map((h, i) => (
          <div
            key={i}
            className="bg-red-500 rounded-full"
            style={{ width: '4px', height: `${h * 2}px`, opacity: 0.85 }}
          />
        ))}
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mx-1 shadow-md">
          <span className="text-white text-sm">🎙</span>
        </div>
        {[3, 6, 9, 13, 9, 6, 3].map((h, i) => (
          <div
            key={i + 10}
            className="bg-red-500 rounded-full"
            style={{ width: '4px', height: `${h * 2}px`, opacity: 0.85 }}
          />
        ))}
      </div>

      {/* Regional Language Grid — 2 columns */}
      <div className="flex-1 px-5 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {regional.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className="relative flex items-center justify-center py-3.5 rounded-xl border-2 text-lg font-semibold transition-all active:scale-95"
              style={{
                borderColor: lang.default ? '#22c55e' : '#d1d5db',
                color: lang.default ? '#15803d' : '#374151',
                background: '#fff'
              }}
            >
              {lang.label}
              {lang.badge && (
                <span className="absolute -top-2.5 right-2 text-[8px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full border border-blue-200">
                  {lang.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* English — Full-width solid blue CTA */}
      <div className="px-5 pb-10 pt-4">
        <button
          onClick={() => onSelect('en')}
          className="w-full py-4 rounded-2xl text-white text-lg font-bold active:scale-95 transition-all shadow-md"
          style={{ background: '#2563eb' }}
        >
          English
        </button>
      </div>
    </div>
  );
}
 
 
