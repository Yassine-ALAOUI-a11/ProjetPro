import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Shield, Lock, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin' && user.email === 'hindpfe2002@gmail.com') {
        navigate('/administration-pfe-secure');
      } else {
        signOut();
      }
    }
  }, [user, profile, navigate, signOut]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (email.trim().toLowerCase() !== 'hindpfe2002@gmail.com') {
        setError("Accès refusé. Seul le compte administrateur autorisé (hindpfe2002@gmail.com) a accès à cet espace.");
        setLoading(false);
        return;
      }

      const { data, error: signInError } = await signIn({ email, password });
      if (signInError) throw signInError;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileData?.role !== 'admin' || data.user.email !== 'hindpfe2002@gmail.com') {
        await signOut();
        setError("Accès refusé. Droits insuffisants.");
        setLoading(false);
        return;
      }

      navigate('/administration-pfe-secure');
    } catch (err) {
      setError("Accès refusé. Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] flex items-center justify-center p-6 relative overflow-hidden font-admin">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white rounded-[40px] shadow-[0_30px_80px_rgba(0,102,161,0.08)] p-12 border border-gray-100 relative z-10">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="bg-gray-50 p-5 px-6 rounded-[28px] shadow-sm border border-gray-100 mb-6 flex items-center justify-center gap-5 hover:scale-[1.02] transition-transform w-full">
            <img src="/Logo.png" alt="e-Participation Logo" className="h-22 w-auto object-contain" />
            <div className="h-14 w-px bg-gray-200"></div>
            <div className="flex flex-col text-left shrink-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">ESPACE</span>
              <span className="text-[14px] font-black text-brand-blue uppercase tracking-wider leading-none">ADMINISTRATION</span>
            </div>
          </div>
          <p className="text-gray-400 font-black text-xs tracking-widest uppercase">Portail de contrôle sécurisé</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[20px] flex items-start gap-4 text-red-600 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p className="text-[14px] font-bold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-brand-navy uppercase tracking-widest ml-1">Identifiant Admin</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue focus:bg-white outline-none font-bold text-brand-navy placeholder-gray-400 transition-all"
                placeholder="admin@pfe.ma"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-brand-navy uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue focus:bg-white outline-none font-bold text-brand-navy placeholder-gray-400 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-blue text-white rounded-[24px] font-black text-[17px] shadow-xl shadow-brand-blue/30 hover:bg-brand-blue/90 transition-all transform active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Accéder à l'Espace Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            Accès réservé au personnel autorisé
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
