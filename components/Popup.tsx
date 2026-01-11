
import React, { useEffect, useState } from 'react';
import { PopupSettings } from '../types';

interface PopupProps {
  settings: PopupSettings;
}

const Popup: React.FC<PopupProps> = ({ settings }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (settings.enabled) {
      const hasSeen = sessionStorage.getItem('aq_has_seen_popup');
      if (!hasSeen) {
        setIsVisible(true);
      }
    }
  }, [settings]);

  const closePopup = () => {
    setIsVisible(false);
    sessionStorage.setItem('aq_has_seen_popup', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="relative aspect-video bg-[#00311e] flex items-center justify-center">
            {settings.image.startsWith('http') ? (
                <img src={settings.image} alt="Popup" className="w-full h-full object-cover" />
            ) : (
                <span className="text-8xl">{settings.image}</span>
            )}
            <button 
                onClick={closePopup}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            >
                ✕
            </button>
        </div>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-[#00311e] mb-4">{settings.text}</h2>
          <div className="flex flex-col gap-3">
            <a 
              href={settings.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00311e] text-white py-3 rounded-xl font-bold hover:bg-[#005a36] transition-colors"
            >
              Lihat Selengkapnya
            </a>
            <button 
              onClick={closePopup}
              className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
