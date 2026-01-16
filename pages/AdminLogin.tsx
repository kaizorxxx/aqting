
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/firebaseService';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const LOGO_URL = "https://api.deline.web.id/sIzpbEAP1y.png";
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        await loginAdmin(email, password);
        // Login berhasil via Firebase
        onLogin();
        navigate('/dashboard');
    } catch (firebaseErr: any) {
        console.error("Login Failed:", firebaseErr);
        if (firebaseErr.code === 'auth/invalid-credential' || firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/wrong-password') {
            setError('Email atau password salah. Pastikan Anda sudah membuat akun di Firebase Authentication.');
        } else if (firebaseErr.code === 'auth/too-many-requests') {
            setError('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
        } else {
            setError(`Gagal Login: ${firebaseErr.message}`);
        }
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001a10] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.5)] p-12 animate-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gray-50 rounded-[35px] flex items-center justify-center mx-auto mb-6 shadow-xl p-5 border border-gray-100 transform -rotate-6">
             <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-[#00311e] tracking-tighter italic leading-none">AQTING ADMIN</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">Secure Database Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-xs font-black border border-red-100 animate-in fade-in slide-in-from-top duration-300">
               ⚠️ {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Email Admin</label>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@aqting.com"
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:outline-none focus:border-[#00311e]/30 focus:bg-white transition-all font-bold text-[#00311e] shadow-inner"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Password</label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:outline-none focus:border-[#00311e]/30 focus:bg-white transition-all font-mono shadow-inner"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00311e] text-white py-6 rounded-[28px] font-black text-xl hover:bg-[#005a36] transition-all shadow-[0_20px_40px_rgba(0,49,30,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Verifying...' : 'Login Dashboard ⚡'}
          </button>
        </form>

        <div className="mt-10 text-center">
           <button onClick={() => navigate('/')} className="text-[10px] text-gray-400 hover:text-[#00311e] transition-colors font-black uppercase tracking-widest bg-gray-50 px-6 py-3 rounded-full">
              ← Kembali ke Beranda
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
