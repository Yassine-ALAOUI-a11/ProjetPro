import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, AlertCircle, Shield, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin' || user.email === 'hindpfe2002@gmail.com') {
        signOut();
      } else {
        navigate('/client/soumettre');
      }
    }
  }, [user, profile, navigate, signOut]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    // Sécurité contre les injections SQL (bien que Supabase utilise déjà des requêtes paramétrées sécurisées)
    const sqlPattern = /(--|;|UNION|SELECT|INSERT|UPDATE|DELETE|DROP)/i;
    if (sqlPattern.test(email) || sqlPattern.test(firstName) || sqlPattern.test(lastName)) {
      setError("Sécurité : Caractères ou mots-clés non autorisés détectés.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        if (email.trim().toLowerCase() === 'hindpfe2002@gmail.com') {
          setError("Accès refusé. Les comptes administrateurs ne peuvent pas se connecter ici.");
          setLoading(false);
          return;
        }

        const { data, error: authError } = await signIn({ email, password });
        if (authError) throw authError;

        // Fetch user profile to verify role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileData?.role === 'admin' || data.user.email === 'hindpfe2002@gmail.com') {
          await signOut();
          setError("Accès refusé. Les comptes administrateurs ne peuvent pas se connecter ici.");
          setLoading(false);
          return;
        }

        navigate('/client/soumettre');
      } else {
        const { error } = await signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        });
        if (error) throw error;

        // Déconnecter l'utilisateur automatiquement pour forcer la connexion manuelle
        if (signOut) await signOut();

        // Basculer vers l'écran de connexion avec un message de succès
        setIsLogin(true);
        setPassword('');
        setSuccessMsg("Compte créé avec succès ! Veuillez vous connecter avec vos nouveaux accès.");
      }
    } catch (error) {
      setError(error.message || 'Une erreur est survenue lors de l\'authentification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-brand-purple/5 rounded-full blur-3xl"></div>

      <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[40px] shadow-[0_30px_80px_rgba(0,102,161,0.1)] overflow-hidden relative z-10 border border-white">

        {/* Left Side: Illustration & Branding */}
        <div className="bg-brand-navy p-16 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-20 right-20 w-64 h-64 border-8 border-white rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 border-8 border-brand-blue rounded-full"></div>
          </div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-16 group">
              <ArrowLeft className="w-5 h-5 text-brand-blue group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold tracking-widest uppercase text-brand-lightblue">Retour au site</span>
            </Link>

            <Link to="/" className="flex items-center gap-4 mb-12 bg-white p-4 px-6 rounded-3xl border border-white/10 shadow-lg hover:scale-[1.02] transition-all w-fit">
              <img src="/Logo.png" alt="e-Participation Logo" className="h-26 w-auto object-contain" />
              <div className="h-12 w-px bg-gray-200 mx-2"></div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-normal mb-1">{t('header.agency')}</span>
                <span className="text-[11px] font-bold text-brand-blue uppercase tracking-widest leading-normal">{t('header.participation')}</span>
              </div>
            </Link>
            <h1 className="text-5xl font-black leading-tight mb-8">
              {isLogin ? "Rapprochons l'administration du citoyen." : "Rejoignez la démocratie participative."}
            </h1>
            <p className="text-[#6EABC7] text-lg font-medium leading-relaxed max-w-md">
              Une plateforme sécurisée pour exprimer vos idées afin de contribuer au développement des services de l’ADD
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-16 md:p-24 flex flex-col justify-center">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-brand-navy mb-4">
              {isLogin ? "S'authentifier" : "Créer un compte"}
            </h2>
            <p className="text-[#6B7280] font-medium">
              {isLogin ? "Entrez vos accès pour accéder à votre espace citoyen." : "Inscrivez-vous pour commencer à contribuer."}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[20px] flex items-start gap-4 text-red-600 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <p className="text-[14px] font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-8 p-5 bg-green-50 border border-green-100 rounded-[20px] flex items-start gap-4 text-green-700 animate-in fade-in zoom-in-95">
              <Shield className="w-6 h-6 flex-shrink-0 text-green-600" />
              <p className="text-[14px] font-bold leading-relaxed">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937] placeholder-gray-400"
                    placeholder=""
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937] placeholder-gray-400"
                    placeholder=""
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1">Adresse e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937] placeholder-gray-400"
                placeholder="nom@exemple.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest">Mot de passe</label>
                {isLogin && <Link to="/forgot-password" size="sm" className="text-[12px] font-black text-brand-blue uppercase hover:underline">Oublié ?</Link>}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
                placeholder="••••••••"
              />
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
                  <LogIn className="w-5 h-5" />
                  <span>{isLogin ? "S'authentifier" : "Créer mon compte"}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[#6B7280] font-bold text-sm">
              {isLogin ? "Vous n'avez pas encore de compte ?" : "Vous avez déjà un compte ?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-2 text-[#0066A1] font-black text-lg hover:underline decoration-4"
            >
              {isLogin ? "Créer un compte citoyen" : "Se connecter ici"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
