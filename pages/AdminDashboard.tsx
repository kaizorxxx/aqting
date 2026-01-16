
import React, { useState, useEffect } from 'react';
import { Course, AppSettings, BannerSlide, PopupSettings, Comment } from '../types';
import { 
  subscribeToCourses, 
  subscribeToSettings, 
  updatePopupSettings, 
  addBanner, 
  deleteBanner,
  addCourse,
  updateCourse,
  deleteCourse,
  ensureAuthConnection,
  logoutAdmin,
  subscribeToComments,
  deleteComment,
  replyToComment,
  deleteReply
} from '../services/firebaseService';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'courses' | 'comments'>('config');
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Comment Management State
  const [selectedCourseForComments, setSelectedCourseForComments] = useState<string>('');
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState<string>('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  
  // Forms state
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id'>>({
    title: '', description: '', videoUrl: '', duration: '', level: 'Canva', icon: '🎨', month: '', uploadTime: ''
  });
  const [newBanner, setNewBanner] = useState<Omit<BannerSlide, 'id'>>({
    title: '', subtitle: '', imageUrl: '', buttonLink: ''
  });
  const [popupEdit, setPopupEdit] = useState<PopupSettings>({
    enabled: false, image: '', text: '', link: ''
  });

  useEffect(() => {
    // Jalankan auth check di background
    ensureAuthConnection();

    const handleDataError = (err: Error) => {
        if (err.message.toLowerCase().includes('permission_denied')) {
            setAuthError('PERMISSION_DENIED');
        } else if (err.message.toLowerCase().includes('client is offline')) {
            // Abaikan offline sementara
        } else {
             setAuthError('PERMISSION_DENIED');
        }
    };

    const unsubC = subscribeToCourses(setCourses, handleDataError);
    const unsubS = subscribeToSettings((data) => {
      setSettings(data);
      if (data && data.popup) {
        setPopupEdit(data.popup);
      }
    }, handleDataError);

    return () => { unsubC(); unsubS(); };
  }, []);

  // Fetch comments when a course is selected
  useEffect(() => {
      if (activeTab === 'comments' && selectedCourseForComments) {
          const unsub = subscribeToComments(selectedCourseForComments, setCommentsList);
          return () => unsub();
      } else {
          setCommentsList([]);
      }
  }, [selectedCourseForComments, activeTab]);

  const handleLogout = async () => {
      await logoutAdmin();
      onLogout();
  };

  const handleSavePopup = async () => {
    setIsSubmitting(true);
    try {
      await updatePopupSettings(popupEdit);
      alert('Pengaturan Popup berhasil diperbarui! 📢');
    } catch (e: any) {
      console.error(e);
      if (e.message.toLowerCase().includes('permission_denied')) setAuthError('PERMISSION_DENIED');
      else alert('Gagal memperbarui popup. Pastikan koneksi stabil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.imageUrl) {
      alert('Mohon isi Judul dan URL Gambar Banner.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addBanner(newBanner);
      setNewBanner({ title: '', subtitle: '', imageUrl: '', buttonLink: '' });
      alert('Banner baru berhasil ditambahkan! 🖼️');
    } catch (e: any) {
      console.error(e);
      if (e.message.toLowerCase().includes('permission_denied')) setAuthError('PERMISSION_DENIED');
      else alert('Gagal menambah banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCourseSubmit = async () => {
    if (!newCourse.title || !newCourse.videoUrl) {
      alert('Judul dan URL Video wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, newCourse);
        alert('Materi berhasil diperbarui! ✨');
      } else {
        await addCourse({ ...newCourse, uploadTime: new Date().toLocaleString('id-ID') });
        alert('Materi berhasil diupload! 🚀');
      }
      setNewCourse({ title: '', description: '', videoUrl: '', duration: '', level: 'Canva', icon: '🎨', month: '', uploadTime: '' });
      setEditingCourseId(null);
    } catch (e: any) {
      console.error(e);
      if (e.message.toLowerCase().includes('permission_denied')) setAuthError('PERMISSION_DENIED');
      else alert('Gagal menyimpan materi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setNewCourse({
      title: course.title,
      description: course.description,
      videoUrl: course.videoUrl,
      duration: course.duration,
      level: course.level,
      icon: course.icon,
      month: course.month,
      uploadTime: course.uploadTime
    });
    setEditingCourseId(course.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setNewCourse({ title: '', description: '', videoUrl: '', duration: '', level: 'Canva', icon: '🎨', month: '', uploadTime: '' });
    setEditingCourseId(null);
  };

  // Logic Reply Comment
  const handleReplySubmit = async (commentId: string) => {
      if (!replyText.trim()) return;
      setIsSubmitting(true);
      try {
          await replyToComment(selectedCourseForComments, commentId, {
              text: replyText,
              author: 'Admin',
              time: new Date().toLocaleString('id-ID')
          });
          setReplyText('');
          setReplyingToId(null);
          // Alert not needed, UI updates automatically via subscription
      } catch (e: any) {
          console.error(e);
          alert('Gagal mengirim balasan.');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeleteReply = async (commentId: string) => {
      if(!confirm('Hapus balasan admin?')) return;
      try {
          await deleteReply(selectedCourseForComments, commentId);
      } catch (e) {
          alert('Gagal menghapus balasan.');
      }
  };

  // Tampilan Error Permission Denied (SOLUSI KEAMANAN)
  if (authError === 'PERMISSION_DENIED') {
      return (
          <div className="min-h-screen bg-[#fff0f0] flex items-center justify-center p-8">
              <div className="bg-white max-w-4xl w-full p-10 rounded-[40px] shadow-2xl border-4 border-red-100">
                  <div className="text-center">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-3xl font-black text-red-600 mb-4">Database Terkunci (Permission Denied)</h2>
                    <p className="text-gray-600 mb-8 font-medium max-w-lg mx-auto">
                        Anda tidak memiliki izin untuk mengubah data. Ini karena Anda menggunakan aturan keamanan baru tapi belum login sebagai Admin yang valid, atau Rules belum diupdate.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-8">
                      <h4 className="font-black text-blue-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                          <span className="text-xl">✅</span> Pengaturan Rules Aman (Rekomendasi)
                      </h4>
                      <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                          Gunakan kode di bawah ini di tab <strong>Rules</strong> Firebase Console. 
                          Kode ini menghilangkan peringatan keamanan merah karena hanya mengizinkan Admin (Login Email) untuk menulis data.
                      </p>
                      <pre className="bg-[#001a10] text-green-400 p-5 rounded-2xl text-[11px] font-mono overflow-x-auto border border-blue-200 shadow-inner">
{`{
  "rules": {
    ".read": true,
    // HANYA Admin (yang login pakai password) yang boleh tulis/hapus data
    ".write": "auth.token.firebase.sign_in_provider === 'password'" 
  }
}`}
                      </pre>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button onClick={() => window.location.reload()} className="bg-[#00311e] text-white px-8 py-3 rounded-full font-black hover:bg-[#005a36] transition-all shadow-lg hover:scale-105">
                        Sudah Diupdate? Refresh 🔄
                    </button>
                    <button onClick={handleLogout} className="text-gray-400 font-bold hover:text-red-500 text-xs uppercase tracking-widest px-4 py-3">
                        Logout & Login Ulang
                    </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-[#00311e] text-white flex flex-col p-8 shadow-2xl z-[100]">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <img src="https://api.deline.web.id/sIzpbEAP1y.png" className="w-8 h-8 object-contain filter brightness-0 invert" alt="Logo" />
            <h1 className="text-3xl font-black italic tracking-tighter">AQTING</h1>
          </div>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Control Panel</p>
        </div>
        
        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full text-left p-5 rounded-[24px] flex items-center gap-4 font-black text-sm transition-all ${activeTab === 'config' ? 'bg-white text-[#00311e] shadow-2xl scale-105' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
          >
            ⚙️ Pengaturan Web
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full text-left p-5 rounded-[24px] flex items-center gap-4 font-black text-sm transition-all ${activeTab === 'courses' ? 'bg-white text-[#00311e] shadow-2xl scale-105' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
          >
            🎞️ Kelola Materi
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`w-full text-left p-5 rounded-[24px] flex items-center gap-4 font-black text-sm transition-all ${activeTab === 'comments' ? 'bg-white text-[#00311e] shadow-2xl scale-105' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
          >
            💬 Kelola Komentar
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full p-5 rounded-[24px] bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-black transition-all flex items-center justify-center gap-3"
          >
            Sign Out 🚪
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-16 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-16 flex justify-between items-end">
          <div>
            <h2 className="text-5xl font-black text-[#00311e] tracking-tighter capitalize">
                {activeTab === 'config' ? 'Konfigurasi' : (activeTab === 'courses' ? 'Koleksi Materi' : 'Moderasi Komentar')}
            </h2>
            <p className="text-gray-400 font-bold mt-2">Pembaruan data akan langsung tampil di aplikasi pengguna.</p>
          </div>
          <div className="hidden md:block bg-[#00311e]/5 px-6 py-3 rounded-2xl border border-[#00311e]/10">
            <span className="text-[10px] font-black text-[#00311e] uppercase tracking-widest">Status Sistem:</span>
            <span className="ml-2 text-green-600 font-bold text-xs uppercase tracking-widest animate-pulse">Online</span>
          </div>
        </header>

        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Banner Management */}
            <section className="bg-white p-10 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-bottom duration-500">
               <h3 className="text-2xl font-black text-[#00311e] mb-10 flex items-center gap-4">
                 <span className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">🖼️</span> Slide Banner
               </h3>
               
               <div className="space-y-4 mb-10 p-8 bg-gray-50 rounded-[40px] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Form Slide Baru</p>
                  <input placeholder="Judul Banner" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-black text-[#00311e] focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
                  <input placeholder="Subtitle" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} />
                  <input placeholder="URL Gambar (Direct Link)" className="w-full p-5 bg-white border border-gray-100 rounded-2xl font-mono text-xs focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} />
                  
                  {newBanner.imageUrl && (
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center">
                       <img src={newBanner.imageUrl} className="w-full h-full object-cover opacity-80" alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
                       <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Live Preview</div>
                    </div>
                  )}

                  <input placeholder="Target Link (https://...)" className="w-full p-5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" value={newBanner.buttonLink} onChange={e => setNewBanner({...newBanner, buttonLink: e.target.value})} />
                  <button 
                    disabled={isSubmitting}
                    onClick={handleAddBanner} 
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 mt-4"
                  >
                    {isSubmitting ? 'Memproses...' : 'Tambahkan Slide 🚀'}
                  </button>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-6">Urutan Slide Saat Ini</h4>
                  {settings?.banners && Object.keys(settings.banners).length > 0 ? (
                    (Object.entries(settings.banners) as [string, BannerSlide][]).map(([id, b]) => (
                      <div key={id} className="flex items-center gap-6 p-5 bg-white rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-200 transition-all">
                         <img src={b.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-inner" alt="Banner" />
                         <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{b.subtitle}</p>
                            <p className="text-lg font-black text-[#00311e] truncate leading-none">{b.title}</p>
                         </div>
                         <button 
                           onClick={() => confirm('Hapus slide ini?') && deleteBanner(id)} 
                           className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                         >
                           🗑️
                         </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-300 font-bold italic">
                       Belum ada banner aktif.
                    </div>
                  )}
               </div>
            </section>

            {/* Popup Management */}
            <section className="bg-white p-10 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-bottom duration-500" style={{animationDelay: '100ms'}}>
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-[#00311e] flex items-center gap-4">
                    <span className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">📢</span> Kontrol Popup
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer scale-150">
                      <input type="checkbox" checked={popupEdit.enabled} onChange={e => setPopupEdit({...popupEdit, enabled: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Konten Popup</p>
                    <input placeholder="Icon (Emoji atau URL Gambar)" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl font-black text-2xl text-center focus:bg-white transition-all shadow-inner" value={popupEdit.image} onChange={e => setPopupEdit({...popupEdit, image: e.target.value})} />
                  </div>
                  <textarea placeholder="Tulis pesan pengumuman di sini..." className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[32px] font-bold text-[#00311e] h-48 resize-none focus:bg-white transition-all shadow-inner" value={popupEdit.text} onChange={e => setPopupEdit({...popupEdit, text: e.target.value})} />
                  <input placeholder="Tautan Tujuan (https://...)" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:bg-white transition-all shadow-inner" value={popupEdit.link} onChange={e => setPopupEdit({...popupEdit, link: e.target.value})} />
                  
                  <button 
                    disabled={isSubmitting}
                    onClick={handleSavePopup} 
                    className="w-full bg-[#00311e] text-white py-6 rounded-[32px] font-black text-xl hover:bg-[#005a36] shadow-2xl shadow-[#00311e]/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan ✅'}
                  </button>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-500">
             <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-gray-100 h-fit sticky top-8">
                <h3 className="text-2xl font-black text-[#00311e] mb-10 flex items-center gap-4">
                  <span className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">{editingCourseId ? '✏️' : '🎞️'}</span> 
                  {editingCourseId ? 'Edit Materi' : 'Rilis Materi'}
                </h3>
                <div className="space-y-4">
                   <input placeholder="Judul Materi" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-[#00311e]" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                   <textarea placeholder="Deskripsi Singkat" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold h-32 resize-none" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} />
                   <input placeholder="URL Video (YouTube / Catbox MP4)" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-xs" value={newCourse.videoUrl} onChange={e => setNewCourse({...newCourse, videoUrl: e.target.value})} />
                   <div className="grid grid-cols-2 gap-4">
                     <input placeholder="Durasi (Contoh: 15:40)" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} />
                     <select className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-[#00311e]" value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value as any})}>
                        <option value="Canva">Canva</option>
                        <option value="CapCut">CapCut</option>
                        <option value="Pixellab">Pixellab</option>
                        <option value="Spring">Spring</option>
                     </select>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <input placeholder="Icon (Emoji)" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center text-3xl shadow-inner" value={newCourse.icon} onChange={e => setNewCourse({...newCourse, icon: e.target.value})} />
                     <input placeholder="Periode (Bulan)" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black uppercase text-xs tracking-widest text-center" value={newCourse.month} onChange={e => setNewCourse({...newCourse, month: e.target.value})} />
                   </div>
                   <button 
                     disabled={isSubmitting}
                     onClick={handleCourseSubmit} 
                     className="w-full bg-[#00311e] text-white py-6 rounded-[32px] font-black text-xl hover:bg-[#005a36] shadow-2xl shadow-[#00311e]/30 mt-6 transition-all active:scale-95"
                   >
                     {isSubmitting ? 'Memproses...' : (editingCourseId ? 'Simpan Perubahan ✅' : 'Publikasi Materi 🚀')}
                   </button>
                   {editingCourseId && (
                     <button 
                       onClick={cancelEdit}
                       className="w-full bg-gray-100 text-gray-500 py-4 rounded-[32px] font-bold text-sm mt-2 transition-all hover:bg-gray-200"
                     >
                       Batal Edit
                     </button>
                   )}
                </div>
             </div>

             <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center mb-8 px-4">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Database Perpustakaan</h4>
                   <span className="text-[10px] font-black text-[#00311e] bg-[#00311e]/5 px-4 py-2 rounded-full border border-[#00311e]/10">Total: {courses.length} Video</span>
                </div>
                
                <div className="space-y-6">
                  {courses.length > 0 ? courses.map((c, idx) => (
                    <div key={c.id} className="bg-white p-8 rounded-[48px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 group hover:shadow-2xl hover:border-[#00311e]/10 transition-all animate-in slide-in-from-right duration-500" style={{animationDelay: `${idx * 50}ms`}}>
                       <div className="w-24 h-24 bg-gray-50 rounded-[35px] flex items-center justify-center text-5xl group-hover:bg-[#00311e] group-hover:text-white transition-all shadow-inner transform -rotate-3 group-hover:rotate-0">
                          {c.icon}
                       </div>
                       <div className="flex-1 text-center md:text-left min-w-0">
                          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                             <span className="text-[8px] font-black text-white bg-[#00311e] px-4 py-1 rounded-full uppercase tracking-widest">{c.level}</span>
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.month} • {c.duration}</span>
                          </div>
                          <h4 className="font-black text-[#00311e] text-2xl tracking-tighter leading-none truncate group-hover:italic transition-all">{c.title}</h4>
                          <p className="text-xs text-gray-400 mt-2 font-bold line-clamp-1">{c.description}</p>
                       </div>
                       <div className="flex gap-3">
                         <button 
                            onClick={() => handleEditCourse(c)}
                            className="w-16 h-16 flex items-center justify-center bg-blue-50 text-blue-600 rounded-[28px] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Edit Materi"
                         >
                            <span className="text-2xl">✏️</span>
                         </button>
                         <button 
                            onClick={() => confirm('Hapus materi?') && deleteCourse(c.id)}
                            className="w-16 h-16 flex items-center justify-center bg-red-50 text-red-500 rounded-[28px] hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Hapus Materi"
                         >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                       </div>
                    </div>
                  )) : (
                    <div className="py-32 text-center bg-white rounded-[60px] border-4 border-dashed border-gray-100 opacity-20 italic font-black text-3xl">
                       Empty Library
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'comments' && (
            <div className="animate-in fade-in duration-500 space-y-8">
                {/* Course Selector */}
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">
                        📺
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Pilih Materi Video</label>
                        <select 
                            value={selectedCourseForComments} 
                            onChange={(e) => setSelectedCourseForComments(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-[#00311e] outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                        >
                            <option value="">-- Pilih Materi untuk Lihat Komentar --</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title} ({c.level})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Comments List */}
                <div className="grid gap-6">
                    {selectedCourseForComments && commentsList.length > 0 ? (
                        commentsList.map((comment: Comment) => (
                            <div key={comment.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 group hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#00311e] rounded-full flex items-center justify-center text-white text-xs font-black">
                                            {comment.author.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h5 className="font-black text-[#00311e]">{comment.author}</h5>
                                            <p className="text-[10px] text-gray-400 font-bold">{comment.time}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => confirm('Hapus komentar user ini?') && deleteComment(selectedCourseForComments, comment.id!)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                        title="Hapus Komentar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                
                                <p className="text-gray-600 font-medium ml-13 pl-13 mb-6 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 inline-block min-w-[50%]">
                                    {comment.text}
                                </p>

                                {/* Admin Reply Section */}
                                <div className="ml-8 md:ml-12 border-l-2 border-gray-100 pl-6 mt-4">
                                    {comment.reply ? (
                                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 relative group/reply">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">ADMIN</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{comment.reply.time}</span>
                                            </div>
                                            <p className="text-blue-900 font-bold text-sm">{comment.reply.text}</p>
                                            <button 
                                                onClick={() => handleDeleteReply(comment.id!)}
                                                className="absolute top-2 right-2 opacity-0 group-hover/reply:opacity-100 text-red-400 hover:text-red-600 transition-all text-xs"
                                                title="Hapus Balasan"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            {replyingToId === comment.id ? (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <textarea 
                                                        autoFocus
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Tulis balasan..."
                                                        className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-300 mb-3 h-24 resize-none"
                                                    />
                                                    <div className="flex gap-3">
                                                        <button 
                                                            disabled={isSubmitting}
                                                            onClick={() => handleReplySubmit(comment.id!)}
                                                            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                                        >
                                                            Kirim Balasan 🚀
                                                        </button>
                                                        <button 
                                                            onClick={() => { setReplyingToId(null); setReplyText(''); }}
                                                            className="text-gray-400 hover:text-gray-600 font-bold text-sm px-4"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setReplyingToId(comment.id!)}
                                                    className="text-blue-500 font-black text-xs uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    ↩️ Balas Komentar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200">
                            {selectedCourseForComments ? (
                                <p className="text-gray-300 font-bold italic text-xl">Belum ada komentar di video ini.</p>
                            ) : (
                                <p className="text-gray-300 font-bold italic text-xl">👆 Pilih materi video di atas dulu.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
