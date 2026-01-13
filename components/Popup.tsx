
import React, { useEffect, useState } from 'react';
import { PopupSettings } from '../types';

interface PopupProps {
  settings: PopupSettings;
}

const Popup: React.FC<PopupProps> = ({ settings }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If disabled via admin, hide immediately
    if (!settings.enabled) {
      setIsVisible(false);
      return;
    }

    // Check session storage to see if user has already closed it in this session
    const hasSeen = sessionStorage.getItem('aq_has_seen_popup');
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, [settings.enabled]); // Re-run when admin toggles the status

  const closePopup = () => {
    setIsVisible(false);
    sessionStorage.setItem('aq_has_seen_popup', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-500">
      <div className="bg-white rounded-[40px] overflow-hidden max-w-lg w-full shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500 border border-white/20">
        <div className="relative aspect-[16/10] bg-[#00311e] flex items-center justify-center overflow-hidden">
            {settings.image && settings.image.startsWith('http') ? (
                <img src={settings.image} alt="Popup" className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700" />
            ) : (
                <span className="text-9xl drop-shadow-2xl animate-bounce">{settings.image || '📢'}</span>
            )}
            <button 
                onClick={closePopup}
                className="absolute top-6 right-6 bg-black/40 backdrop-blur-xl hover:bg-black/60 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl hover:rotate-90 active:scale-75 z-20"
            >
                ✕
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
        <div className="p-10 text-center">
          <h2 className="text-3xl font-black text-[#00311e] mb-6 leading-tight italic tracking-tighter">{settings.text}</h2>
          <div className="flex flex-col gap-4">
            <a 
              href={settings.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closePopup}
              className="bg-[#00311e] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#005a36] shadow-2xl shadow-[#00311e]/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              Cek Detail Sekarang ⚡
            </a>
            <button 
              onClick={closePopup}
              className="text-gray-400 text-xs font-black uppercase tracking-widest hover:text-[#00311e] transition-colors py-2"
            >
              Mungkin Nanti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
