import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn({ email, password });
      if (signInError) throw signInError;
      
      // The redirect logic will be handled by the layout or dashboard
      navigate('/administration-pfe-secure');
    } catch (err) {
      setError("Accès refusé. Identifiants invalides ou droits insuffisants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001D4A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[40px] shadow-2xl p-12 border border-white/10 relative z-10">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-blue/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Page Administration</h1>
          <p className="text-brand-lightblue font-medium mt-2">Portail de contrôle sécurisé</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-[20px] flex items-start gap-4 text-red-400 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p className="text-[14px] font-bold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-brand-lightblue uppercase tracking-widest ml-1">Identifiant Admin</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-white placeholder-white/20 transition-all"
                placeholder="admin@pfe.ma"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-brand-lightblue uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-white placeholder-white/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-blue text-white rounded-[24px] font-black text-[17px] shadow-xl shadow-brand-blue/30 hover:bg-blue-600 transition-all transform active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Accéder au Studio</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-white/20 font-bold text-xs uppercase tracking-widest">
            Accès réservé au personnel autorisé
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
