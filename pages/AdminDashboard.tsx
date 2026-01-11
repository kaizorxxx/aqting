
import React, { useState, useEffect } from 'react';
import { Course, AppSettings, BannerSlide, PopupSettings } from '../types';
import { 
  subscribeToCourses, 
  subscribeToSettings, 
  updatePopupSettings, 
  addBanner, 
  deleteBanner,
  addCourse,
  deleteCourse
} from '../services/firebaseService';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'courses' | 'comments'>('config');
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // Forms state
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id'>>({
    title: '', description: '', videoUrl: '', duration: '', level: 'Pemula', icon: '🎬', month: '', uploadTime: ''
  });
  const [newBanner, setNewBanner] = useState<Omit<BannerSlide, 'id'>>({
    title: '', subtitle: '', imageUrl: '', buttonLink: ''
  });
  const [popupEdit, setPopupEdit] = useState<PopupSettings>({
    enabled: false, image: '', text: '', link: ''
  });

  useEffect(() => {
    const unsubC = subscribeToCourses(setCourses);
    const unsubS = subscribeToSettings(setSettings);
    return () => { unsubC(); unsubS(); };
  }, []);

  useEffect(() => {
    if (settings) setPopupEdit(settings.popup);
  }, [settings]);

  const handleSavePopup = async () => {
    await updatePopupSettings(popupEdit);
    alert('Popup settings updated! ✅');
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.imageUrl) return;
    await addBanner(newBanner);
    setNewBanner({ title: '', subtitle: '', imageUrl: '', buttonLink: '' });
    alert('Slide Banner ditambahkan! 🖼️');
  };

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.videoUrl) return;
    await addCourse({ ...newCourse, uploadTime: new Date().toLocaleString('id-ID') });
    setNewCourse({ title: '', description: '', videoUrl: '', duration: '', level: 'Pemula', icon: '🎬', month: '', uploadTime: '' });
    alert('Materi Berhasil Diupload! 🎞️');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-[#00311e] text-white flex flex-col p-8 shadow-2xl z-[100]">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">⚙️</div>
            <h1 className="text-3xl font-black italic tracking-tighter">AQTING</h1>
          </div>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Admin Control Center</p>
        </div>
        
        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full text-left p-5 rounded-[24px] flex items-center gap-4 font-black text-sm transition-all ${activeTab === 'config' ? 'bg-white text-[#00311e] shadow-2xl' : 'hover:bg-white/10'}`}
          >
            ⚙️ Pengaturan Web
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full text-left p-5 rounded-[24px] flex items-center gap-4 font-black text-sm transition-all ${activeTab === 'courses' ? 'bg-white text-[#00311e] shadow-2xl' : 'hover:bg-white/10'}`}
          >
            🎞️ Kelola Materi
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full p-5 rounded-[24px] bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-black transition-all flex items-center justify-center gap-3"
          >
            Sign Out 🚪
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-16 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-16">
          <h2 className="text-4xl font-black text-[#00311e] tracking-tighter capitalize">{activeTab.replace('config', 'Konfigurasi')}</h2>
          <p className="text-gray-400 font-bold">Update konten secara instan ke seluruh pengguna.</p>
        </header>

        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Banner Management */}
            <section className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50 border border-gray-100">
               <h3 className="text-2xl font-black text-[#00311e] mb-10 flex items-center gap-4">
                 <span className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">🖼️</span> Banner Slider
               </h3>
               
               <div className="space-y-4 mb-10 p-6 bg-gray-50 rounded-[32px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tambah Slide Baru</p>
                  <input placeholder="Judul Banner" className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
                  <input placeholder="Deskripsi Singkat" className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-medium" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} />
                  <input placeholder="URL Gambar (Direct Link)" className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-mono text-xs" value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} />
                  <input placeholder="Tautan Tombol (Opsional)" className="w-full p-4 bg-white border border-gray-100 rounded-2xl" value={newBanner.buttonLink} onChange={e => setNewBanner({...newBanner, buttonLink: e.target.value})} />
                  <button onClick={handleAddBanner} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg">Tambah Slide</button>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Slide Aktif</h4>
                  {settings?.banners && (Object.entries(settings.banners) as [string, BannerSlide][]).map(([id, b]) => (
                    <div key={id} className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm group">
                       <img src={b.imageUrl} className="w-16 h-16 rounded-2xl object-cover" alt="Preview" />
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-[#00311e] truncate">{b.title}</p>
                       </div>
                       <button onClick={() => deleteBanner(id)} className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all">🗑️</button>
                    </div>
                  ))}
               </div>
            </section>

            {/* Popup Management */}
            <section className="bg-white p-10 rounded-[48px] shadow-xl shadow-gray-200/50 border border-gray-100">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-[#00311e] flex items-center gap-4">
                    <span className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">📢</span> Kontrol Popup
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer scale-125">
                      <input type="checkbox" checked={popupEdit.enabled} onChange={e => setPopupEdit({...popupEdit, enabled: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00311e]"></div>
                  </label>
               </div>
               <div className="space-y-6">
                  <input placeholder="Icon Preview (Emoji/URL)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={popupEdit.image} onChange={e => setPopupEdit({...popupEdit, image: e.target.value})} />
                  <textarea placeholder="Pesan Popup" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium h-32 resize-none" value={popupEdit.text} onChange={e => setPopupEdit({...popupEdit, text: e.target.value})} />
                  <input placeholder="Redirect Link" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl" value={popupEdit.link} onChange={e => setPopupEdit({...popupEdit, link: e.target.value})} />
                  <button onClick={handleSavePopup} className="w-full bg-[#00311e] text-white py-5 rounded-[24px] font-black text-lg hover:bg-[#005a36] shadow-xl transition-all">Simpan Pengaturan Popup</button>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="bg-white p-10 rounded-[48px] shadow-xl border border-gray-100 h-fit">
                <h3 className="text-2xl font-black text-[#00311e] mb-10">Publish Materi</h3>
                <div className="space-y-4">
                   <input placeholder="Judul Materi" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                   <textarea placeholder="Deskripsi Materi" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium h-32 resize-none" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                   <input placeholder="URL Video (YouTube Embed/MP4)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-xs" value={newCourse.videoUrl} onChange={e => setNewCourse({...newCourse, videoUrl: e.target.value})} />
                   <div className="grid grid-cols-2 gap-4">
                     <input placeholder="Durasi (15:00)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} />
                     <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value as any})}>
                        <option>Pemula</option>
                        <option>Menengah</option>
                        <option>Lanjutan</option>
                        <option>Spring</option>
                     </select>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <input placeholder="Icon (Emoji)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center text-xl" value={newCourse.icon} onChange={e => setNewCourse({...newCourse, icon: e.target.value})} />
                     <input placeholder="Bulan (Jan 2025)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newCourse.month} onChange={e => setNewCourse({...newCourse, month: e.target.value})} />
                   </div>
                   <button onClick={handleAddCourse} className="w-full bg-[#00311e] text-white py-5 rounded-[24px] font-black text-lg hover:bg-[#005a36] shadow-xl mt-6 transition-all">Upload Materi Baru</button>
                </div>
             </div>

             <div className="lg:col-span-2 space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-6">Database Materi</h4>
                {courses.map(c => (
                  <div key={c.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-8 group hover:shadow-xl transition-all">
                     <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl group-hover:bg-[#00311e] group-hover:text-white transition-all shadow-inner">
                        {c.icon}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[8px] font-black text-[#00311e] bg-green-50 px-3 py-1 rounded-full uppercase tracking-tighter">{c.level}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase">{c.month}</span>
                        </div>
                        <h4 className="font-black text-[#00311e] text-2xl tracking-tight leading-none truncate">{c.title}</h4>
                     </div>
                     <button 
                        onClick={() => confirm('Hapus materi?') && deleteCourse(c.id)}
                        className="w-14 h-14 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                     >
                        🗑️
                     </button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
