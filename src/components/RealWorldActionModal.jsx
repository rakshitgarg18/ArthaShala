import React from 'react';

const RealWorldActionModal = ({ scheme, onClose, language = 'hi' }) => {
  if (!scheme) return null;

  const isHi = language === 'hi';
  const checklist = scheme.actionChecklist || [];
  const destination = isHi ? scheme.destination?.hi : scheme.destination?.en;

  const handleWhatsAppExport = () => {
    const text = isHi 
      ? `नमस्कार! मुझे *${scheme.nameHi}* योजना के लिए आवेदन करना है। आवश्यक दस्तावेज: ${checklist.map(c => c.hi).join(', ')}। स्थान: ${destination}`
      : `Hello! I want to apply for *${scheme.name}*. Required Documents: ${checklist.map(c => c.en).join(', ')}. Location: ${destination}`;
    
    if (navigator.share) {
      navigator.share({ title: scheme.name, text }).catch(() => {});
    } else {
      alert(isHi ? "WhatsApp पर भेजा गया!" : "Sent to WhatsApp!");
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500 border-8 border-slate-100">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-4xl">🏅</span>
            <span className="text-sm font-black text-blue-400 uppercase tracking-widest leading-none">Victory!</span>
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-tight">
            {isHi ? 'असल जिंदगी में यह लाभ कैसे पाएं?' : 'How to get this in real life?'}
          </h2>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Document Checklist */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">
              {isHi ? 'जरूरी दस्तावेज (Checklist)' : 'Required Documents'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border-2 border-slate-100 transition-transform active:scale-[0.98]">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-xl font-bold text-slate-800">
                    {isHi ? item.hi : item.en}
                  </span>
                  <div className="ml-auto w-8 h-8 rounded-full bg-green-100 border-2 border-green-500/20 flex items-center justify-center text-green-600 font-black">
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destination Section */}
          <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-3xl border-2 border-blue-100">
            <span className="text-3xl">📍</span>
            <div>
              <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-1">
                {isHi ? 'कहां जाएं?' : 'Where to go?'}
              </h4>
              <p className="text-xl font-bold text-blue-800 leading-tight">
                {destination}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleWhatsAppExport}
            className="w-full py-6 bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white rounded-[30px] flex items-center justify-center gap-4 shadow-xl shadow-green-500/20 group"
          >
            <span className="text-3xl group-hover:rotate-12 transition-transform">💬</span>
            <span className="text-2xl font-black">
              {isHi ? 'WhatsApp पर जानकारी भेजें' : 'Send info to WhatsApp'}
            </span>
          </button>

          <p className="text-center text-slate-400 font-bold text-sm px-6 leading-relaxed">
            {isHi 
              ? "यह जानकारी अपने पास सुरक्षित रखें और नजदीकी CSC केंद्र पर जाकर आवेदन करें।"
              : "Keep this info safe and visit your nearest CSC to apply."}
          </p>

        </div>
      </div>
    </div>
  );
};

export default RealWorldActionModal;
 
 
