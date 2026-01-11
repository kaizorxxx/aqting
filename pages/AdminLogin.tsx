
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const LOGO_URL = "https://api.deline.web.id/sIzpbEAP1y.png";
  
  // Credentials
  const ADMIN_USER = 'admin_aqting';
  const ADMIN_PASSWORD = 'h9Q3kax1SI7WCscwF6ELAXfG8vJMTOju0HgVNPr4KdiBU5lm2RDntpeobqGRFJEJ2SPv1DTwj3oPnkBfQDL57rRq77uNxMQinjla';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
        onLogin();
        navigate('/dashboard');
      } else {
        setError('Kredensial admin tidak valid.');
        setPassword('');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#00311e] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 transform transition-all">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl p-4 border border-gray-100">
             <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-[#00311e] tracking-tighter italic">AQTING ADMIN</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Control Panel Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
               ⚠️ {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input 
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan Username"
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#00311e] focus:bg-white transition-all font-bold text-[#00311e]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Master Password</label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-[#00311e] focus:bg-white transition-all font-mono"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00311e] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#005a36] transition-all shadow-xl hover:shadow-[#00311e]/20 disabled:opacity-50"
          >
            {loading ? 'Verifikasi...' : 'Masuk Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center">
           <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-[#00311e] transition-colors font-black uppercase tracking-widest">
              ← Kembali ke Beranda
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
