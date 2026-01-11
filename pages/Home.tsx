
import React, { useState, useEffect, useRef } from 'react';
import { Course, AppSettings, BannerSlide } from '../types';
import { subscribeToCourses, subscribeToSettings, subscribeToComments, addComment } from '../services/firebaseService';
import CourseCard from '../components/CourseCard';
import Popup from '../components/Popup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const LOGO_URL = "https://api.deline.web.id/sIzpbEAP1y.png";

  useEffect(() => {
    const unsubscribeCourses = subscribeToCourses(setCourses);
    const unsubscribeSettings = subscribeToSettings(setSettings);
    return () => {
      unsubscribeCourses();
      unsubscribeSettings();
    };
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const unsubscribeComments = subscribeToComments(selectedCourse.id, setComments);
      return () => unsubscribeComments();
    }
  }, [selectedCourse]);

  const months = Array.from(new Set(courses.map(c => c.month))).sort();
  const filteredCourses = selectedMonth === 'all' 
    ? courses 
    : courses.filter(c => c.month === selectedMonth);

  const handlePostComment = async () => {
    if (!commentName || !commentText || !selectedCourse) return;
    await addComment(selectedCourse.id, {
      author: commentName,
      text: commentText,
      time: new Date().toLocaleString('id-ID'),
      timestamp: Date.now()
    });
    setCommentText('');
  };

  const toggleAutoplay = () => {
    if (swiperRef.current) {
      if (isAutoplay) {
        swiperRef.current.autoplay.stop();
      } else {
        swiperRef.current.autoplay.start();
      }
      setIsAutoplay(!isAutoplay);
    }
  };

  const bannerList = settings?.banners && Object.keys(settings.banners).length > 0 
    ? (Object.entries(settings.banners) as [string, BannerSlide][]).map(([id, b]) => b)
    : [{
        id: 'default',
        title: 'Professional Editing Class',
        subtitle: 'Cashback 70% s/d 10rb Gopay Coins!!!',
        imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1920',
        buttonLink: 'https://google.com'
      }];

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950' : 'bg-[#fdfdf1]'}`}>
      {settings && <Popup settings={settings.popup} />}

      {/* Sidebar Navigasi */}
      <div className={`fixed inset-0 z-[150] transition-opacity duration-700 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={() => setIsSidebarOpen(false)} />
        <aside className={`absolute top-0 left-0 h-full w-80 bg-[#00311e]/90 backdrop-blur-[40px] text-white p-8 transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[40px_0_80px_rgba(0,0,0,0.4)] border-r border-white/5`}>
          <div className="flex items-center gap-3 mb-16 px-4">
            <img src={LOGO_URL} className="w-12 h-12 object-contain filter brightness-0 invert" alt="Logo" />
            <h2 className="text-2xl font-black italic tracking-tighter">AQTING</h2>
          </div>
          <nav className="space-y-4">
            <button onClick={() => {setSelectedMonth('all'); setIsSidebarOpen(false);}} className={`w-full text-left py-5 px-8 rounded-[32px] flex items-center gap-5 transition-all duration-300 font-black text-sm uppercase tracking-wider ${selectedMonth === 'all' ? 'bg-white text-[#00311e] shadow-2xl scale-105' : 'hover:bg-white/10'}`}>
              <span className="text-xl">📚</span> Library
            </button>
            <div className="h-px bg-white/10 my-8 mx-4" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6 px-8">Filter</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 px-2">
              {months.map(m => (
                <button 
                  key={m}
                  onClick={() => {setSelectedMonth(m); setIsSidebarOpen(false);}}
                  className={`w-full text-left py-4 px-8 rounded-3xl transition-all duration-300 font-bold flex items-center gap-5 ${selectedMonth === m ? 'bg-white text-[#00311e] shadow-xl scale-105' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
                >
                  <span className="text-xl opacity-40">📅</span> {m}
                </button>
              ))}
            </div>
          </nav>
          <div className="absolute bottom-10 left-8 right-8">
             <a href="#/adminlogin" className="block w-full text-center py-5 bg-white/5 border border-white/10 hover:bg-white/20 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] transition-all backdrop-blur-md">Admin Portal</a>
          </div>
        </aside>
      </div>

      {/* Header Utama - Dark Mode Always, Logo & Text Closer */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#00311e] border-b border-white/5 shadow-2xl transition-all duration-700">
        <div className="container mx-auto px-6 h-24 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <img src={LOGO_URL} className="w-14 h-14 object-contain filter brightness-0 invert transition-all duration-500 group-hover:scale-110" alt="Logo" />
            <h1 className="text-3xl font-black text-white italic tracking-tighter">AQTING</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
               onClick={() => setIsDarkMode(!isDarkMode)}
               className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all shadow-inner border border-white/5 flex items-center justify-center w-12 h-12"
               title="Toggle Theme"
            >
               {isDarkMode ? '🌞' : '🌙'}
            </button>

            <button 
               onClick={() => setIsSidebarOpen(true)}
               className="bg-white/10 text-white px-6 py-3 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3 backdrop-blur-md border border-white/5"
            >
               <span className="text-xl">☰</span> Explore
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Slider - Clickable */}
      <section className="pt-24 bg-black relative">
        <div className="relative h-[350px] md:h-[600px] w-full group">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{ delay: 10000, disableOnInteraction: false }}
            pagination={{ 
                el: '.custom-pagination',
                clickable: true,
                renderBullet: (index, className) => {
                    return `<span class="${className}"></span>`;
                }
            }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            loop={true}
            className="h-full w-full"
          >
            {bannerList.map((banner) => (
              <SwiperSlide key={banner.id}>
                <a 
                  href={banner.buttonLink || '#'} 
                  target={banner.buttonLink?.startsWith('http') ? "_blank" : "_self"} 
                  rel="noopener noreferrer"
                  className="relative h-full w-full flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-60 scale-100 animate-gentle-zoom" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="relative z-10 text-center px-6 max-w-5xl">
                    <p className="text-white/60 text-[10px] md:text-xs font-black mb-6 tracking-[0.5em] uppercase drop-shadow-lg">{banner.title}</p>
                    <h2 className="text-4xl md:text-7xl font-black text-[#3ee83e] mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] tracking-tighter leading-none italic">
                        {banner.subtitle}
                    </h2>
                  </div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation / Pagination Bar */}
          <div className="absolute bottom-12 left-0 right-0 z-20 flex items-center justify-center gap-8">
            <button 
                onClick={toggleAutoplay}
                className="text-white/50 hover:text-white transition-all transform hover:scale-150 active:scale-90"
            >
                {isAutoplay ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            <div className="custom-pagination flex items-center gap-4"></div>
          </div>
        </div>

        {/* Boundary Blur Effect */}
        <div className={`absolute -bottom-2 left-0 right-0 h-40 bg-gradient-to-t transition-colors duration-500 ${isDarkMode ? 'from-zinc-950' : 'from-[#fdfdf1]'} via-transparent to-transparent z-10 pointer-events-none backdrop-blur-[4px]`} />
      </section>

      {/* Filter & Konten Utama */}
      <div className="container mx-auto px-6 max-w-6xl mt-16 relative z-20">
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 border-b pb-12 transition-colors duration-500 ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
          <div className="animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-5 mb-6 opacity-60">
              <div className={`w-14 h-[2px] ${isDarkMode ? 'bg-white' : 'bg-[#00311e]'}`} />
              <p className={`${isDarkMode ? 'text-white' : 'text-[#00311e]'} font-black text-[10px] tracking-[0.4em] uppercase`}>Archive</p>
            </div>
            <h3 className={`${isDarkMode ? 'text-white' : 'text-[#00311e]'} font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.8] italic mb-6`}>
                SEMUA<br/>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-white via-zinc-400 to-white/20' : 'from-[#00311e] via-[#005a36] to-[#00311e]/20'} tracking-normal not-italic font-extrabold opacity-90`}>MATERI</span>
            </h3>
            <p className="text-gray-400 font-bold tracking-tight max-w-sm leading-relaxed">Koleksi panduan eksklusif profesional.</p>
          </div>
          
          {/* pt-8 and pb-8 to prevent translation clipping */}
          <div className="flex overflow-x-auto pt-8 pb-8 gap-4 scrollbar-hide px-2">
            <button 
              onClick={() => setSelectedMonth('all')}
              className={`whitespace-nowrap px-12 py-5 rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm ${selectedMonth === 'all' ? 'bg-[#00311e] text-white shadow-2xl shadow-black/30 -translate-y-4' : (isDarkMode ? 'bg-zinc-900 text-gray-500 border border-white/5 hover:border-white' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#00311e]')}`}
            >
              Semua
            </button>
            {months.map(m => (
              <button 
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`whitespace-nowrap px-12 py-5 rounded-[32px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm ${selectedMonth === m ? 'bg-[#00311e] text-white shadow-2xl shadow-black/30 -translate-y-4' : (isDarkMode ? 'bg-zinc-900 text-gray-500 border border-white/5 hover:border-white' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#00311e]')}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Kursus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-14">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, idx) => (
              <div key={course.id} className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                <CourseCard course={course} onClick={setSelectedCourse} />
              </div>
            ))
          ) : (
            <div className={`col-span-full py-48 text-center border-4 border-dashed rounded-[80px] backdrop-blur-md ${isDarkMode ? 'bg-white/5 border-white/5 text-white/10' : 'bg-white/40 border-gray-100 text-[#00311e]/10'}`}>
               <span className="text-[140px] block mb-10 opacity-5">🎞️</span>
               <p className="text-3xl font-black italic tracking-tighter">Archive is Empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Video */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-[60px] flex items-center justify-center md:p-12 p-0 overflow-y-auto animate-in fade-in duration-700">
          <div className="bg-white w-full max-w-7xl md:rounded-[70px] overflow-hidden relative shadow-[0_60px_120px_rgba(0,0,0,0.6)] h-full md:h-auto md:max-h-[95vh] flex flex-col transform transition-all animate-in zoom-in duration-700">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-12 right-12 z-20 bg-black/30 backdrop-blur-xl text-white w-16 h-16 rounded-full hover:bg-black/60 transition-all flex items-center justify-center text-3xl shadow-2xl"
            >
              ✕
            </button>
            
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-[75%] bg-black flex flex-col group">
                <div className="relative pt-[56.25%] w-full shadow-2xl">
                  {selectedCourse.videoUrl.includes('mp4') || selectedCourse.videoUrl.includes('catbox') ? (
                    <video controls className="absolute inset-0 w-full h-full" autoPlay>
                      <source src={selectedCourse.videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <iframe src={selectedCourse.videoUrl} className="absolute inset-0 w-full h-full" allowFullScreen allow="autoplay" />
                  )}
                </div>
                <div className="p-12 md:p-24 bg-white flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-8 mb-10">
                    <span className="bg-[#00311e] text-white text-[11px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.3em] shadow-2xl shadow-[#00311e]/30">{selectedCourse.level}</span>
                    <div className="h-1.5 w-1.5 bg-gray-200 rounded-full" />
                    <span className="text-gray-400 font-black text-xs uppercase tracking-widest">{selectedCourse.duration} • {selectedCourse.month}</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-[#00311e] mb-12 leading-[0.9] tracking-tighter italic">{selectedCourse.title}</h2>
                  <div className="prose prose-2xl max-w-none text-gray-500 font-bold leading-relaxed tracking-tight">
                    {selectedCourse.description}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[25%] bg-[#fcfcfc] flex flex-col h-full border-l border-gray-100/40 backdrop-blur-3xl">
                 <div className="p-12 border-b border-gray-100 bg-white/60 backdrop-blur-2xl">
                   <h3 className="text-3xl font-black text-[#00311e] flex items-center gap-5 italic tracking-tighter">
                     <span className="text-4xl">🗯️</span> Chat
                   </h3>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    {comments.map(c => (
                      <div key={c.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100/40 transform transition-all hover:translate-x-2">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-black text-[#00311e] text-[10px] uppercase tracking-tighter bg-[#00311e]/5 px-3 py-1 rounded-full">{c.author}</span>
                          <span className="text-[9px] text-gray-300 font-bold">{c.time}</span>
                        </div>
                        <p className="text-[13px] text-gray-800 leading-relaxed font-bold tracking-tight">{c.text}</p>
                      </div>
                    ))}
                 </div>

                 <div className="p-12 bg-white/90 backdrop-blur-[40px] border-t border-gray-100/50">
                    <input 
                      placeholder="Nama"
                      value={commentName}
                      onChange={e => setCommentName(e.target.value)}
                      className="w-full mb-5 p-6 bg-gray-50 border border-gray-100/50 rounded-3xl text-sm font-black focus:ring-4 focus:ring-[#00311e]/10 outline-none transition-all placeholder:opacity-30"
                    />
                    <textarea 
                      placeholder="Pertanyaan..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="w-full p-6 bg-gray-50 border border-gray-100/50 rounded-3xl text-sm font-bold h-36 resize-none focus:ring-4 focus:ring-[#00311e]/10 outline-none transition-all placeholder:opacity-30"
                    />
                    <button 
                      onClick={handlePostComment}
                      className="w-full mt-8 bg-[#00311e] text-white py-6 rounded-[32px] font-black text-xl hover:bg-[#005a36] shadow-[0_20px_40px_rgba(0,49,30,0.4)] transition-all hover:scale-[1.03] active:scale-95"
                    >
                      Kirim Pesan
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes gentle-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-gentle-zoom {
          animation: gentle-zoom 25s ease-in-out infinite alternate;
        }
        .custom-pagination .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: #fff;
          opacity: 0.2;
          margin: 0 !important;
          border-radius: 50%;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          border: 1.5px solid rgba(255,255,255,0.4);
        }
        .custom-pagination .swiper-pagination-bullet-active {
          background: #3ee83e !important;
          opacity: 1;
          transform: scale(1.8) rotate(45deg);
          box-shadow: 0 0 25px rgba(62, 232, 62, 1);
          border-color: #3ee83e;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00311e33;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Home;
