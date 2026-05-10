import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      setMessage("Votre mot de passe a été réinitialisé avec succès ! Redirection vers la connexion...");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-brand-purple/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white rounded-[40px] shadow-[0_30px_80px_rgba(0,102,161,0.1)] p-12 relative z-10 border border-white">
        <div className="text-center mb-10">
          <div className="text-3xl font-black mb-8">
            <span className="text-brand-blue">e</span>
            <span className="text-brand-purple">~</span>
            <span className="text-brand-navy ml-1">participation</span>
          </div>
          <h2 className="text-3xl font-black text-[#001D4A] mb-4">Nouveau mot de passe</h2>
          <p className="text-[#6B7280] font-medium">Veuillez entrer votre nouveau mot de passe sécurisé.</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[20px] flex items-start gap-4 text-red-600 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p className="text-[14px] font-bold leading-relaxed">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-8 p-5 bg-green-50 border border-green-100 rounded-[20px] flex items-start gap-4 text-green-700 animate-in fade-in zoom-in-95">
            <CheckCircle className="w-6 h-6 flex-shrink-0 text-green-600" />
            <p className="text-[14px] font-bold leading-relaxed">{message}</p>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1">Nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#0066A1] text-white rounded-[24px] font-black text-[17px] shadow-xl shadow-[#0066A1]/30 hover:bg-[#005586] transition-all transform active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Réinitialiser le mot de passe</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
