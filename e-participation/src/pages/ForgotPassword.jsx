import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/client');
    }
  }, [user, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception.");
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
          <Link to="/" className="inline-block mb-8">
            <div className="text-3xl font-black">
              <span className="text-brand-blue">e</span>
              <span className="text-brand-purple">~</span>
              <span className="text-brand-navy ml-1">participation</span>
            </div>
          </Link>
          <h2 className="text-3xl font-black text-[#001D4A] mb-4">Mot de passe oublié</h2>
          <p className="text-[#6B7280] font-medium">Entrez votre e-mail pour recevoir un lien de réinitialisation.</p>
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
            <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1">Adresse e-mail</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
                placeholder="nom@exemple.com"
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
              <span>Envoyer le lien</span>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link to="/login" className="text-brand-blue font-black flex items-center justify-center gap-2 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
