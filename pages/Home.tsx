
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

  const SunIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );

  const MoonIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );

  return (
    <div className={`min-h-screen pb-20 transition-all duration-700 ease-in-out ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#fdfdf1]'}`}>
      {settings && <Popup settings={settings.popup} />}

      <div className={`fixed inset-0 z-[150] transition-all duration-700 ease-in-out ${isSidebarOpen ? 'opacity-100 backdrop-blur-xl' : 'opacity-0 pointer-events-none backdrop-blur-none'}`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
        <aside className={`absolute top-0 left-0 h-full w-80 bg-[#00311e]/95 backdrop-blur-2xl text-white p-8 transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[40px_0_80px_rgba(0,0,0,0.4)] border-r border-white/5`}>
          <div className="flex items-center gap-3 mb-16 px-4">
            <img src={LOGO_URL} className="w-12 h-12 object-contain filter brightness-0 invert" alt="Logo" />
            <h2 className="text-2xl font-black italic tracking-tighter">AQTING</h2>
          </div>
          <nav className="space-y-4">
            <button onClick={() => {setSelectedMonth('all'); setIsSidebarOpen(false);}} className={`w-full text-left py-5 px-8 rounded-[32px] flex items-center gap-5 transition-all duration-300 font-black text-sm uppercase tracking-wider ${selectedMonth === 'all' ? 'bg-white text-[#00311e] shadow-2xl scale-105' : 'hover:bg-white/10'}`}>
              <span className="text-xl">📚</span> Library Materi
            </button>
            <div className="h-px bg-white/10 my-8 mx-4" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6 px-8">Filter Kategori</p>
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

      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#001a10] border-b border-white/5 shadow-2xl transition-all duration-700 ease-in-out">
        <div className="container mx-auto px-4 md:px-6 h-20 md:h-24 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <img src={LOGO_URL} className="w-10 h-10 md:w-14 md:h-14 object-contain filter brightness-0 invert transition-all duration-500 group-hover:scale-110" alt="Logo" />
            <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black text-white italic tracking-tighter leading-none">AQTING Class</h1>
                <span className="text-[#3ee83e] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-1">Pro Edition</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
               onClick={() => setIsDarkMode(!isDarkMode)}
               className="p-2.5 rounded-full bg-white/5 text-white hover:bg-white/15 transition-all shadow-inner border border-white/5 flex items-center justify-center w-10 h-10 md:w-12 md:h-12"
               title="Toggle Theme"
            >
               {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            <button 
               onClick={() => setIsSidebarOpen(true)}
               className="bg-white/10 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 md:gap-3 backdrop-blur-md border border-white/5"
            >
               <span className="text-lg md:text-xl">☰</span> 
               <span className="hidden xs:inline">Explore</span>
            </button>
          </div>
        </div>
      </header>

      <section className="pt-20 md:pt-24 bg-black relative">
        <div className="relative h-[300px] md:h-[600px] w-full group">
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
                    <p className="text-white/60 text-[8px] md:text-xs font-black mb-4 md:mb-6 tracking-[0.5em] uppercase drop-shadow-lg">{banner.title}</p>
                    <h2 className="text-2xl md:text-7xl font-black text-[#3ee83e] mb-8 md:mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] tracking-tighter leading-none italic">
                        {banner.subtitle}
                    </h2>
                  </div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-20 flex items-center justify-center gap-6 md:gap-8">
            <button 
                onClick={toggleAutoplay}
                className="text-white/50 hover:text-white transition-all transform hover:scale-150 active:scale-90"
            >
                {isAutoplay ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            <div className="custom-pagination flex items-center gap-3 md:gap-4"></div>
          </div>
        </div>

        <div className={`absolute -bottom-2 left-0 right-0 h-40 bg-gradient-to-t transition-all duration-700 ${isDarkMode ? 'from-[#0a0a0a]' : 'from-[#fdfdf1]'} via-transparent to-transparent z-10 pointer-events-none backdrop-blur-[4px]`} />
      </section>

      <div className="container mx-auto px-6 max-w-6xl mt-8 md:mt-16 relative z-20">
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-12 md:mb-20 border-b pb-8 md:pb-12 transition-all duration-700 ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
          <div className="animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-6 opacity-60">
              <div className={`w-10 md:w-14 h-[2px] ${isDarkMode ? 'bg-white' : 'bg-[#00311e]'}`} />
              <p className={`${isDarkMode ? 'text-white' : 'text-[#00311e]'} font-black text-[8px] md:text-[10px] tracking-[0.4em] uppercase transition-colors duration-700`}>Archive</p>
            </div>
            <h3 className={`${isDarkMode ? 'text-white' : 'text-[#00311e]'} font-black text-4xl md:text-8xl uppercase tracking-tighter leading-[0.8] italic mb-4 md:mb-6 transition-colors duration-700`}>
                SEMUA<br/>
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-white via-zinc-500 to-white/20' : 'from-[#00311e] via-[#005a36] to-[#00311e]/20'} tracking-normal not-italic font-extrabold opacity-90`}>MATERI</span>
            </h3>
            <p className="text-gray-400 font-bold tracking-tight max-w-sm leading-relaxed text-sm md:text-base">Koleksi panduan eksklusif profesional.</p>
          </div>
          
          <div className="flex overflow-x-auto pt-6 pb-12 gap-4 scrollbar-hide px-2 -mb-8 snap-x">
            <button 
              onClick={() => setSelectedMonth('all')}
              className={`whitespace-nowrap snap-center px-10 md:px-12 py-4 md:py-5 rounded-[28px] md:rounded-[32px] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm ${selectedMonth === 'all' ? 'bg-[#00311e] text-white shadow-2xl shadow-black/30 -translate-y-4' : (isDarkMode ? 'bg-zinc-900 text-gray-500 border border-white/5 hover:border-white' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#00311e]')}`}
            >
              Semua
            </button>
            {months.map(m => (
              <button 
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`whitespace-nowrap snap-center px-10 md:px-12 py-4 md:py-5 rounded-[28px] md:rounded-[32px] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-sm ${selectedMonth === m ? 'bg-[#00311e] text-white shadow-2xl shadow-black/30 -translate-y-4' : (isDarkMode ? 'bg-zinc-900 text-gray-500 border border-white/5 hover:border-white' : 'bg-white text-gray-400 border border-gray-100 hover:border-[#00311e]')}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, idx) => (
              <div key={course.id} className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                <CourseCard course={course} onClick={setSelectedCourse} />
              </div>
            ))
          ) : (
            <div className={`col-span-full py-32 md:py-48 text-center border-4 border-dashed rounded-[60px] md:rounded-[80px] backdrop-blur-md transition-all duration-700 ${isDarkMode ? 'bg-white/5 border-white/5 text-white/10' : 'bg-white/40 border-gray-100 text-[#00311e]/10'}`}>
               <span className="text-[100px] md:text-[140px] block mb-8 md:mb-10 opacity-5">🎞️</span>
               <p className="text-xl md:text-3xl font-black italic tracking-tighter transition-colors duration-700">Archive is Empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Video - Floating Design with backdrop blur */}
      {selectedCourse && (
        <div 
          className="fixed inset-0 z-[200] bg-zinc-900/40 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 overflow-y-auto animate-in fade-in duration-500"
          onClick={() => setSelectedCourse(null)}
        >
          <div 
            className="bg-white w-full max-w-6xl md:rounded-[50px] rounded-3xl overflow-hidden relative shadow-[0_60px_100px_-20px_rgba(0,0,0,0.6)] h-fit flex flex-col transform transition-all animate-in zoom-in duration-500 border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-20 bg-black/40 backdrop-blur-md text-white w-10 h-10 md:w-14 md:h-14 rounded-full hover:bg-black/60 transition-all flex items-center justify-center text-xl md:text-2xl shadow-xl hover:scale-110"
            >
              ✕
            </button>
            
            <div className="flex flex-col md:flex-row">
              {/* Left Content Area */}
              <div className="w-full md:w-[70%] bg-white flex flex-col">
                <div className="relative pt-[56.25%] w-full bg-black">
                  {selectedCourse.videoUrl.includes('mp4') || selectedCourse.videoUrl.includes('catbox') ? (
                    <video controls className="absolute inset-0 w-full h-full" autoPlay>
                      <source src={selectedCourse.videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <iframe src={selectedCourse.videoUrl} className="absolute inset-0 w-full h-full" allowFullScreen allow="autoplay" />
                  )}
                </div>
                <div className="p-8 md:p-16">
                  <div className="flex items-center gap-6 mb-8">
                    <span className="bg-[#00311e] text-white text-[9px] md:text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-[0.3em] shadow-lg shadow-[#00311e]/20">{selectedCourse.level}</span>
                    <span className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest">{selectedCourse.duration} • {selectedCourse.month}</span>
                  </div>
                  <h2 className="text-3xl md:text-6xl font-black text-[#00311e] mb-8 leading-[0.95] tracking-tighter italic">{selectedCourse.title}</h2>
                  <div className="prose prose-lg md:prose-2xl max-w-none text-gray-500 font-bold leading-relaxed tracking-tight">
                    {selectedCourse.description}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Comments Area */}
              <div className="w-full md:w-[30%] bg-[#fafafa] flex flex-col border-l border-gray-100/50 backdrop-blur-md">
                 <div className="p-8 border-b border-gray-100 bg-white/40">
                   <h3 className="text-2xl font-black text-[#00311e] flex items-center gap-4 italic tracking-tighter">
                     <span className="text-3xl">🗯️</span> KOMENTAR
                   </h3>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[400px] md:max-h-none custom-scrollbar bg-white/30">
                    {comments.map(c => (
                      <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col transform transition-all hover:translate-x-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-[#00311e] text-[9px] uppercase tracking-tighter bg-[#00311e]/5 px-3 py-1 rounded-full">{c.author}</span>
                          <span className="text-[8px] text-gray-300 font-bold">{c.time}</span>
                        </div>
                        <p className="text-[13px] text-gray-700 leading-relaxed font-bold tracking-tight">{c.text}</p>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center py-10 opacity-20 italic font-bold text-sm">Belum ada komentar.</div>
                    )}
                 </div>

                 <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          placeholder="Nama Anda"
                          value={commentName}
                          onChange={e => setCommentName(e.target.value)}
                          className="w-full p-4 md:p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-[#00311e]/10 focus:border-[#00311e]/40 focus:bg-white outline-none transition-all placeholder:text-gray-300 shadow-inner"
                        />
                      </div>
                      <div className="relative">
                        <textarea 
                          placeholder="Tulis komentar..."
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          className="w-full p-4 md:p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold h-32 resize-none focus:ring-4 focus:ring-[#00311e]/10 focus:border-[#00311e]/40 focus:bg-white outline-none transition-all placeholder:text-gray-300 shadow-inner"
                        />
                      </div>
                      <button 
                        onClick={handlePostComment}
                        className="w-full bg-[#00311e] text-white py-4 md:py-5 rounded-[24px] font-black text-lg hover:bg-[#005a36] shadow-2xl shadow-[#00311e]/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                      >
                        Kirim Komentar 🚀
                      </button>
                    </div>
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
          width: 10px;
          height: 10px;
          background: #fff;
          opacity: 0.2;
          margin: 0 !important;
          border-radius: 50%;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          border: 1.5px solid rgba(255,255,255,0.4);
        }
        @media (min-width: 768px) {
          .custom-pagination .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
          }
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
        .xs\:inline {
          display: none;
        }
        @media (min-width: 480px) {
          .xs\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
