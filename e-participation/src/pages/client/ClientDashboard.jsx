import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, FileText, Clock, CheckCircle, ChevronRight, LogOut, LayoutDashboard, Search, HelpCircle, Shield, Info, User as UserIcon, Settings, Home, AlertCircle, X, TrendingUp, Activity, BarChart3, Edit3, Users, Calendar, MapPin, Phone, Save } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ContributionWizard from '../../components/ContributionWizard';
import ProfileSettings from '../../components/ProfileSettings';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ClientDashboard = () => {
  const { t } = useTranslation();
  const { user, profile, signOut, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [signingId, setSigningId] = useState(null);
  const [votingId, setVotingId] = useState(null);
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          first_name: profileData.first_name,
          last_name: profileData.last_name 
        }
      });

      if (error) throw error;

      // Update public.profiles too
      await supabase
        .from('profiles')
        .update({ 
          first_name: profileData.first_name, 
          last_name: profileData.last_name 
        })
        .eq('id', user.id);

      showNotification("Profil mis à jour avec succès !", "success");
    } catch (err) {
      showNotification("Erreur lors de la mise à jour.", "error");
    }
  };

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/login');
    }
    if (user) {
      fetchAllData();
    }
  }, [user, loadingAuth, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Contributions du client
      const { data: contribData } = await supabase
        .from('contributions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setContributions(contribData || []);

      // 2. Pétitions (Toutes)
      const { data: petData } = await supabase
        .from('petitions')
        .select('*')
        .order('created_at', { ascending: false });
      setPetitions(petData || []);

      // 3. Sondages (Tous)
      const { data: surData } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      setSurveys(surData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (petitionId) => {
    setSigningId(petitionId);
    try {
      const { error } = await supabase
        .from('petition_signatures')
        .insert([{ petition_id: petitionId, user_id: user.id }]);

      if (error) {
        if (error.code === '23505') {
          showNotification("Vous avez déjà signé cette pétition.", 'error');
        } else {
          throw error;
        }
      } else {
        // En mode réel, on utiliserait une fonction DB pour incrémenter.
        // Ici on refresh simplement.
        fetchAllData();
        showNotification("Merci ! Votre signature a été enregistrée.", 'success');
      }
    } catch (err) {
      showNotification("Erreur lors de la signature.", 'error');
    } finally {
      setSigningId(null);
    }
  };

  const [selectedOptions, setSelectedOptions] = useState({}); // { surveyId: optionIndex }

  const handleVote = async (surveyId) => {
    const optionIndex = selectedOptions[surveyId];
    if (optionIndex === undefined) {
      showNotification("Veuillez sélectionner une option avant de voter.", 'error');
      return;
    }

    setVotingId(surveyId);
    try {
      const { error } = await supabase
        .from('survey_votes')
        .insert([{ survey_id: surveyId, user_id: user.id, option_index: optionIndex }]);

      if (error) {
        if (error.code === '23505') {
          showNotification("Vous avez déjà participé à ce sondage.", 'error');
        } else {
          throw error;
        }
      } else {
        fetchAllData();
        showNotification("Merci pour votre participation !", 'success');
      }
    } catch (err) {
      showNotification("Erreur lors du vote.", 'error');
    } finally {
      setVotingId(null);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loadingAuth || (user && loading && activeTab === 'dashboard')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F7FA] flex font-sans">
      
      {/* Sidebar Premium Citoyen */}
      <aside className="w-72 bg-[#001D4A] text-white flex flex-col fixed h-full z-50">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-black flex items-center tracking-tight">
                <span className="text-white">e</span>
                <span className="text-brand-purple">~</span>
                <span className="text-white ml-1">participation</span>
              </div>
              <p className="text-[10px] text-brand-lightblue font-black tracking-[2px] uppercase opacity-60">Espace Citoyen</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-10 px-4 space-y-3">
          <p className="px-4 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Navigation</p>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#0066A1] text-white shadow-xl shadow-[#0066A1]/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Mon Tableau de bord</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('petitions')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'petitions' ? 'bg-[#0066A1] text-white shadow-xl shadow-[#0066A1]/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Pétitions ADD</span>
          </button>

          <button 
            onClick={() => setActiveTab('surveys')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'surveys' ? 'bg-[#0066A1] text-white shadow-xl shadow-[#0066A1]/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Activity className="w-5 h-5" />
            <span>Sondages en cours</span>
          </button>

          <div className="pt-10">
            <p className="px-4 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Compte</p>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'settings' ? 'bg-[#0066A1] text-white shadow-xl shadow-[#0066A1]/20' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Settings className="w-5 h-5" />
              <span>Paramètres</span>
            </button>
          </div>
        </nav>

        <div className="p-6 bg-white/5 mx-4 mb-8 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-black shadow-lg">
              {profile?.first_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[14px] font-black truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[11px] text-brand-lightblue font-bold uppercase tracking-wider">Citoyen ADD</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12 overflow-y-auto">
        
        {/* Page Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-[36px] font-black text-[#001D4A] tracking-tight">
              {activeTab === 'dashboard' && "Mon activité citoyenne"}
              {activeTab === 'petitions' && "Pétitions populaires"}
              {activeTab === 'surveys' && "Sondages citoyens"}
              {activeTab === 'settings' && "Paramètres du compte"}
            </h1>
            <p className="text-[#6B7280] font-medium mt-1">
              {activeTab === 'dashboard' && "Gérez vos contributions et suivez l'avancement de vos dossiers."}
              {activeTab === 'petitions' && "Soutenez les initiatives de transformation digitale."}
              {activeTab === 'surveys' && "Votre avis compte pour les priorités nationales."}
            </p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-3 bg-white text-brand-blue rounded-2xl font-black text-sm flex items-center gap-2 border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <Home className="w-4 h-4" /> Retour au site
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-brand-verylightblue text-brand-blue flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-[13px] font-black text-gray-400 uppercase mb-1">Dossiers soumis</p>
                <h3 className="text-3xl font-black text-brand-navy">{contributions.length}</h3>
              </div>
              <div className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-[13px] font-black text-gray-400 uppercase mb-1">En attente</p>
                <h3 className="text-3xl font-black text-brand-navy">{contributions.filter(c => c.status === 'En attente').length}</h3>
              </div>
              <div className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-[13px] font-black text-gray-400 uppercase mb-1">Traités</p>
                <h3 className="text-3xl font-black text-brand-navy">{contributions.filter(c => c.status === 'Traité').length}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h2 className="text-2xl font-black text-brand-navy">Historique de mes demandes</h2>
                <button 
                  onClick={() => navigate('/soumettre-idee')}
                  className="px-6 py-3 bg-brand-blue text-white rounded-2xl font-black text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Nouveau dossier
                </button>
              </div>

              {contributions.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-brand-verylightblue rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-brand-blue opacity-30" />
                  </div>
                  <h3 className="text-xl font-black text-brand-navy mb-2">Aucun dossier pour le moment</h3>
                  <p className="text-gray-500 max-w-sm mb-8 font-medium">Commencez par soumettre votre première idée ou projet à l'ADD.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {contributions.map(c => (
                    <div key={c.id} className="p-8 hover:bg-gray-50/50 transition-all flex justify-between items-center">
                      <div>
                        <span className="px-3 py-1 bg-brand-lightblue/30 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-md mb-2 inline-block">{c.type}</span>
                        <h4 className="text-[18px] font-black text-brand-navy mb-1">{c.title}</h4>
                        <p className="text-[13px] text-gray-400 font-medium">Soumis le {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${c.status === 'Traité' ? 'bg-green-50 text-green-600' : 'bg-brand-lightblue text-brand-blue'}`}>
                        <span className={`w-2 h-2 rounded-full ${c.status === 'Traité' ? 'bg-green-500' : 'bg-brand-blue'}`}></span>
                        {c.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'petitions' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {petitions.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed">
                  <p className="text-gray-400 font-black uppercase tracking-widest">Aucune pétition active pour le moment.</p>
                </div>
              ) : (
                petitions.map(p => {
                  const progress = Math.min(Math.round((p.current_signatures / p.goal_signatures) * 100), 100);
                  return (
                    <div key={p.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-lg text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                      </div>
                      <h3 className="text-lg font-black text-brand-navy mb-4 leading-tight group-hover:text-brand-blue transition-colors flex-grow">{p.title}</h3>
                      <p className="text-[13px] text-gray-400 font-medium mb-8">Initié par <span className="text-gray-600 font-bold">{p.author_name}</span></p>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black uppercase text-brand-navy">
                          <span>{p.current_signatures.toLocaleString()} signatures</span>
                          <span className="text-gray-400">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <button 
                          onClick={() => handleSign(p.id)}
                          disabled={signingId === p.id}
                          className="w-full mt-6 py-4 bg-brand-verylightblue text-brand-blue rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          {signingId === p.id ? "Signature..." : "Soutenir l'initiative"} <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'surveys' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {surveys.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed">
                  <p className="text-gray-400 font-black uppercase tracking-widest">Aucun sondage actif pour le moment.</p>
                </div>
              ) : (
                surveys.map(s => (
                  <div key={s.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-brand-navy leading-tight">{s.question}</h3>
                    </div>

                    <div className="space-y-6 flex-grow">
                      {s.options.map((opt, idx) => {
                        const percentage = s.total_votes > 0 ? Math.round((opt.votes / s.total_votes) * 100) : 0;
                        const isSelected = selectedOptions[s.id] === idx;
                        return (
                          <div key={idx} className="space-y-3">
                            <button 
                              onClick={() => setSelectedOptions({...selectedOptions, [s.id]: idx})}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-brand-blue bg-brand-verylightblue' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-brand-blue bg-brand-blue' : 'border-gray-300'}`}>
                                  {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-[14px] font-bold ${isSelected ? 'text-brand-blue' : 'text-gray-700'}`}>{opt.text}</span>
                              </div>
                              <span className="text-[12px] font-black text-brand-navy">{percentage}%</span>
                            </button>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-blue rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-50">
                      <button 
                        onClick={() => handleVote(s.id)}
                        disabled={votingId === s.id}
                        className="w-full py-5 bg-brand-blue text-white rounded-[24px] font-black text-[15px] hover:bg-blue-700 transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                      >
                        {votingId === s.id ? "Enregistrement..." : "Confirmer mon vote"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'petitions' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {petitions.map(p => {
                const progress = Math.min(Math.round((p.current_signatures / p.goal_signatures) * 100), 100);
                return (
                  <div key={p.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-4 py-1.5 bg-brand-purple/10 text-brand-purple rounded-xl text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-purple/10 group-hover:text-brand-purple transition-all">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-brand-navy mb-4 leading-tight">{p.title}</h3>
                    <p className="text-gray-500 font-medium text-[13px] mb-8 line-clamp-3 leading-relaxed">{p.description}</p>
                    <div className="mt-auto space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact actuel</p>
                          <p className="text-[15px] font-black text-brand-navy">{p.current_signatures.toLocaleString()} <span className="text-gray-300 font-bold">/ {p.goal_signatures.toLocaleString()}</span></p>
                        </div>
                        <span className="text-[14px] font-black text-brand-blue">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                      </div>
                      <button 
                        onClick={() => handleSign(p.id)}
                        disabled={signingId === p.id}
                        className="w-full mt-4 py-4 bg-brand-blue text-white rounded-2xl font-black text-[13px] hover:bg-blue-700 transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                      >
                        {signingId === p.id ? "Signature..." : "Signer la pétition"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'surveys' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {surveys.map(s => (
                <div key={s.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-navy leading-tight">{s.question}</h3>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Clôture : {new Date(s.closing_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 flex-grow">
                    {s.options.map((opt, idx) => {
                      const percentage = s.total_votes > 0 ? Math.round((opt.votes / s.total_votes) * 100) : 0;
                      const isSelected = selectedOptions[s.id] === idx;
                      return (
                        <div key={idx} className="space-y-3">
                          <button 
                            onClick={() => setSelectedOptions({...selectedOptions, [s.id]: idx})}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-brand-blue bg-brand-verylightblue' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-brand-blue bg-brand-blue' : 'border-gray-300'}`}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                              </div>
                              <span className={`text-[14px] font-bold ${isSelected ? 'text-brand-blue' : 'text-gray-700'}`}>{opt.text}</span>
                            </div>
                            <span className="text-[12px] font-black text-brand-navy">{percentage}%</span>
                          </button>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-blue rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-10 pt-6 border-t border-gray-50">
                    <button 
                      onClick={() => handleVote(s.id)}
                      disabled={votingId === s.id}
                      className="w-full py-5 bg-brand-blue text-white rounded-[24px] font-black text-[15px] hover:bg-blue-700 transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                    >
                      {votingId === s.id ? "Enregistrement..." : "Confirmer mon vote"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <ProfileSettings />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <ProfileSettings />
          </div>
        )}
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-10 right-10 z-[100] px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 border-l-[6px] animate-in slide-in-from-right duration-500 ${notification.type === 'success' ? 'bg-white text-brand-navy border-green-500' : 'bg-white text-brand-navy border-red-500'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
          <div>
            <p className="text-sm font-black tracking-tight">{notification.message}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Notification Système</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
