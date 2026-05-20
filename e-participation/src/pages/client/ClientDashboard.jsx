import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, FileText, Clock, CheckCircle, ChevronRight, LogOut, LayoutDashboard, Search, HelpCircle, Shield, Info, User as UserIcon, Settings, Home, AlertCircle, X, TrendingUp, Activity, BarChart3, Edit3, Users, Calendar, MapPin, Phone, Save, Menu, MessageSquare } from 'lucide-react';
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
  const [surveys, setSurveys] = useState([]);
  const [publicConsultations, setPublicConsultations] = useState([]);
  const [searchConsultation, setSearchConsultation] = useState('');
  const [activeConsultationCategory, setActiveConsultationCategory] = useState('Tous');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [votingId, setVotingId] = useState(null);
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterNature, setFilterNature] = useState('Tous');
  const [editModal, setEditModal] = useState({ isOpen: false, contribution: null, title: '', description: '' });
  const [searchMyContrib, setSearchMyContrib] = useState('');

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
      return;
    }
    if (user && (profile?.role === 'admin' || user.email === 'hindpfe2002@gmail.com')) {
      signOut();
      return;
    }
    if (user) {
      fetchAllData();
    }
  }, [user, loadingAuth, profile, navigate, signOut]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: contribData } = await supabase
        .from('contributions')
        .select('*')
        .or(`user_id.eq.${user.id},email_contact.eq.${user.email}`)
        .order('created_at', { ascending: false });
      setContributions(contribData || []);

      // 2. Sondages (Tous)
      const { data: surData } = await supabase
        .from('surveys')
        .select('*, survey_votes(*)')
        .order('created_at', { ascending: false });
        
      if (surData) {
        const formattedSurveys = surData.map(s => {
          const votes = s.survey_votes || [];
          const total = votes.length;
          const userVote = user ? votes.find(v => v.user_id === user.id) : null;
          
          return {
            ...s,
            total_votes: total,
            voted: !!userVote,
            selectedOption: userVote ? userVote.option_index : null,
            options: s.options.map((opt, idx) => ({
              ...opt,
              votes: votes.filter(v => v.option_index === idx).length
            }))
          };
        });
        setSurveys(formattedSurveys);
      } else {
        setSurveys([]);
      }

      // 3. Consultations (Toutes les contributions Traitées)
      const { data: consultData } = await supabase
        .from('contributions')
        .select('*, profiles(first_name, last_name)')
        .eq('status', 'Traité')
        .order('created_at', { ascending: false });
      setPublicConsultations(consultData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
  };

  const filteredPublicConsultations = publicConsultations.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchConsultation.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchConsultation.toLowerCase());
    const matchesCategory = activeConsultationCategory === 'Tous' || (c.nature || c.type) === activeConsultationCategory;
    return matchesSearch && matchesCategory;
  });

  const [filterService, setFilterService] = useState('Tous');
  const [filterDate, setFilterDate] = useState('all');
  
  const filteredContributions = contributions.filter(c => {
    const matchesNature = filterNature === 'Tous' || (c.nature || c.type) === filterNature;
    const matchesService = filterService === 'Tous' || c.category === filterService || c.target_service === filterService || c.project === filterService;
    
    let matchesDate = true;
    if (filterDate !== 'all' && c.created_at) {
      const itemDate = new Date(c.created_at);
      const diffTime = Math.abs(new Date() - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterDate === 'month' && diffDays > 30) matchesDate = false;
      if (filterDate === '3months' && diffDays > 90) matchesDate = false;
      if (filterDate === 'year' && diffDays > 365) matchesDate = false;
    }

    const matchesSearch = !searchMyContrib || c.title.toLowerCase().includes(searchMyContrib.toLowerCase()) || (c.description || '').toLowerCase().includes(searchMyContrib.toLowerCase());
    return matchesNature && matchesService && matchesDate && matchesSearch;
  });

  const handleEditContribution = (contribution) => {
    setEditModal({
      isOpen: true,
      contribution,
      title: contribution.title,
      description: contribution.description,
      nature: contribution.nature || contribution.type || 'Idée',
      project: contribution.project || contribution.target_service || contribution.category || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editModal.contribution) return;
    try {
      const { error } = await supabase
        .from('contributions')
        .update({ 
          title: editModal.title, 
          description: editModal.description,
          nature: editModal.nature,
          project: editModal.project
        })
        .eq('id', editModal.contribution.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setContributions(contributions.map(c =>
        c.id === editModal.contribution.id
          ? { ...c, title: editModal.title, description: editModal.description, nature: editModal.nature, project: editModal.project }
          : c
      ));
      setEditModal({ isOpen: false, contribution: null, title: '', description: '', nature: '', project: '' });
      showNotification('Contribution modifiée avec succès !', 'success');
    } catch (err) {
      showNotification('Erreur lors de la modification.', 'error');
    }
  };

  if (loadingAuth || (user && loading && activeTab === 'dashboard')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F7FA] flex flex-col lg:flex-row font-sans">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-[#FAF9F6] border-b border-gray-150 text-brand-navy p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/Logo.png" alt="e-Participation Logo" className="h-10 w-auto object-contain" />
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-tight">ESPACE</span>
            <span className="text-[11px] font-black text-brand-blue uppercase tracking-wider block">CITOYEN</span>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-400 hover:text-brand-navy transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#061A40]/30 backdrop-blur-sm z-45 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Premium Citoyen */}
      <aside className={`w-72 bg-[#FAF9F6] border-r border-gray-150 flex flex-col fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="e-Participation Logo" className="h-24 w-auto object-contain" />
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-tight">ESPACE</span>
              <span className="text-[11px] font-black text-brand-blue uppercase tracking-wider block">CITOYEN</span>
            </div>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-brand-navy"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-10 px-4 space-y-3">
          <p className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Navigation</p>
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#0066A1]/10 text-[#0066A1]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0066A1]'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Mes contributions</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('surveys'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'surveys' ? 'bg-[#0066A1]/10 text-[#0066A1]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0066A1]'}`}
          >
            <Activity className="w-5 h-5" />
            <span>e-Sondages</span>
          </button>

          <button 
            onClick={() => { setActiveTab('parameters'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'parameters' ? 'bg-[#0066A1]/10 text-[#0066A1]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0066A1]'}`}
          >
            <Settings className="w-5 h-5" />
            <span>Paramètres</span>
          </button>

        </nav>

        <div className="p-4 bg-white border border-gray-150 mx-4 mb-8 rounded-[24px] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-black text-white shadow-md text-sm shrink-0">
              {profile?.first_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] font-black text-brand-navy truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Citoyen ADD</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 p-6 md:p-12 overflow-y-auto">
        
        {/* Page Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-[36px] font-black text-brand-navy tracking-tight">
              {activeTab === 'dashboard' && "Mes contributions"}
              {activeTab === 'consultations' && "Consultations Citoyennes"}
              {activeTab === 'surveys' && "e-Sondages citoyens"}
              {activeTab === 'parameters' && "Paramètres du compte"}
            </h1>
            <p className="text-[#6B7280] font-medium mt-1">
              {activeTab === 'dashboard' && "Consultez l'historique et suivez l'état de traitement de vos demandes."}
              {activeTab === 'consultations' && "Découvrez les projets et propositions de la communauté ADD."}
              {activeTab === 'surveys' && "Votre avis compte pour les priorités nationales."}
              {activeTab === 'parameters' && "Gérez vos informations personnelles et vos préférences."}
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
              <div className="p-10 border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                  <h2 className="text-2xl font-black text-brand-navy">Historique de mes demandes</h2>
                  <button 
                    onClick={() => navigate('/client/soumettre')}
                    className="px-6 py-3 bg-brand-blue text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-brand-blue/90 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Nouveau dossier
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-5">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher dans mes contributions..." 
                    value={searchMyContrib}
                    onChange={(e) => setSearchMyContrib(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium text-brand-navy text-sm"
                  />
                </div>

                {/* Nature Filter Chips */}
                <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                  {['Tous', 'Idée', 'Suggestion', 'Signalement', 'Plainte'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilterNature(cat)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${filterNature === cat ? 'bg-[#0066A1] text-white shadow-lg shadow-[#0066A1]/20' : 'text-gray-400 hover:text-brand-blue'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                
                {/* Secondary Filters: Service and Date */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <select 
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-brand-blue/30 shadow-sm"
                  >
                    <option value="Tous">Tous les services</option>
                    <option value="Academia Raqmiya">Academia Raqmiya</option>
                    <option value="E-Himaya">E-Himaya</option>
                    <option value="Open Data">Open Data</option>
                    <option value="Moutatawi3">Moutatawi3</option>
                    <option value="Industrie 4.0">Industrie 4.0</option>
                    <option value="Khawarazmi">Khawarazmi</option>
                    <option value="Startup Hub">Startup Hub</option>
                    <option value="Mokawala Raqmiya">Mokawala Raqmiya</option>
                    <option value="Label Jeune Entreprise Innovante (JEI)">Label Jeune Entreprise Innovante (JEI)</option>
                    <option value="Interopérabilité">Interopérabilité</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Accessibilité Numérique">Accessibilité Numérique</option>
                  </select>
                  <select 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-brand-blue/30 shadow-sm"
                  >
                    <option value="all">Toutes les dates</option>
                    <option value="month">Dernier mois</option>
                    <option value="3months">Derniers 3 mois</option>
                    <option value="year">Dernière année</option>
                  </select>
                </div>
              </div>

              {filteredContributions.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-brand-verylightblue rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-brand-blue opacity-30" />
                  </div>
                  <h3 className="text-xl font-black text-brand-navy mb-2">Aucun dossier trouvé</h3>
                  <p className="text-gray-500 max-w-sm mb-8 font-medium">
                    {contributions.length === 0 
                      ? "Commencez par soumettre votre première idée ou projet à l'ADD."
                      : "Aucun résultat ne correspond à vos filtres."
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredContributions.map(c => (
                    <div key={c.id} className="p-8 hover:bg-gray-50/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-3 py-1 bg-brand-lightblue/30 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-md">{c.nature || c.type}</span>
                          <span className="text-[11px] text-gray-400 font-medium">Réf: {c.reference_number || '—'}</span>
                        </div>
                        <h4 className="text-[18px] font-black text-brand-navy mb-1 truncate">{c.title}</h4>
                        <p className="text-[13px] text-gray-400 font-medium">Soumis le {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {c.status === 'En attente' && (
                          <button
                            onClick={() => handleEditContribution(c)}
                            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-blue/10 hover:text-brand-blue transition-all border border-gray-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Modifier
                          </button>
                        )}
                        <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${c.status === 'Traité' ? 'bg-green-50 text-green-600' : c.status === 'En cours' ? 'bg-blue-50 text-blue-600' : 'bg-brand-lightblue text-brand-blue'}`}>
                          <span className={`w-2 h-2 rounded-full ${c.status === 'Traité' ? 'bg-green-500' : c.status === 'En cours' ? 'bg-blue-500' : 'bg-brand-blue'}`}></span>
                          {c.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-6 mb-12">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher une consultation validée..." 
                  value={searchConsultation}
                  onChange={(e) => setSearchConsultation(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium text-brand-navy"
                />
              </div>
              <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                {['Tous', 'Idée', 'Suggestion', 'Signalement', 'Plainte'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveConsultationCategory(cat)}
                    className={`px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeConsultationCategory === cat ? 'bg-[#0066A1] text-white shadow-lg shadow-[#0066A1]/20' : 'text-gray-400 hover:text-brand-blue'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredPublicConsultations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-brand-navy mb-2">Aucune consultation validée</h3>
                <p className="text-gray-400 font-medium">Il n'y a pas de contributions validées par l'administration pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPublicConsultations.map((c) => (
                  <div key={c.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col h-full">
                    <div className="p-8 flex-grow">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                          ${(c.nature || c.type) === 'Projet' ? 'bg-purple-50 text-brand-purple' : (c.nature || c.type) === 'Signalement' ? 'bg-orange-50 text-orange-600' : (c.nature || c.type) === 'Plainte' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-brand-blue'}`}>
                          {c.nature || c.type}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-lg">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Validé
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-brand-navy mb-3 leading-tight group-hover:text-brand-blue transition-colors break-words line-clamp-2">
                        {c.title}
                      </h3>
                      
                      <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-4 mb-6">
                        {c.description}
                      </p>
                    </div>

                    <div className="p-8 pt-0 mt-auto">
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center font-black text-brand-blue text-xs border border-gray-100">
                            {c.profiles?.first_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-brand-navy leading-none">{c.profiles?.first_name} {c.profiles?.last_name?.charAt(0)}.</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Citoyen</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Validé le</p>
                          <p className="text-[10px] font-black text-brand-navy">{new Date(c.updated_at || c.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedConsultation(c)}
                        className="w-full mt-6 py-3.5 bg-brand-verylightblue text-brand-blue rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-[#0066A1] group-hover:text-white transition-all shadow-sm"
                      >
                        Voir les détails <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {activeTab === 'surveys' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {surveys.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Aucun sondage actif pour le moment.</p>
                </div>
              ) : (
                surveys.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-black text-brand-navy leading-tight">{s.question}</h3>
                    </div>

                    <div className="space-y-4 flex-grow">
                      {s.options.map((opt, idx) => {
                        const percentage = s.total_votes > 0 ? Math.round((opt.votes / s.total_votes) * 100) : 0;
                        const isSelected = s.voted ? s.selectedOption === idx : selectedOptions[s.id] === idx;
                        return (
                          <div key={idx} className="space-y-2">
                            <button 
                              onClick={() => !s.voted && setSelectedOptions({...selectedOptions, [s.id]: idx})}
                              disabled={s.voted}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                s.voted 
                                  ? isSelected 
                                    ? 'bg-[#0066A1]/10 border-[#0066A1]/30 cursor-default' 
                                    : 'bg-gray-50/50 border-gray-50 cursor-default'
                                  : isSelected
                                    ? 'border-[#0066A1] bg-[#0066A1]/5'
                                    : 'border-gray-50 bg-gray-50 hover:border-gray-150'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  s.voted && isSelected 
                                    ? 'bg-[#0066A1] border-[#0066A1]'
                                    : isSelected 
                                      ? 'border-[#0066A1] bg-[#0066A1]' 
                                      : 'border-gray-350 bg-white'
                                }`}>
                                  {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${s.voted ? 'bg-white' : 'bg-white'}`}></div>}
                                </div>
                                <span className={`text-xs font-semibold ${isSelected ? 'text-[#0066A1]' : 'text-gray-700'}`}>{opt.text}</span>
                              </div>
                              <span className="text-[11px] font-black text-brand-navy">{percentage}%</span>
                            </button>
                            <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0066A1] rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50">
                      {s.voted ? (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                          <span className="text-xs font-bold text-green-700">✓ Merci pour votre participation !</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleVote(s.id)}
                          disabled={votingId === s.id}
                          className="w-full py-3 bg-[#0066A1] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {votingId === s.id ? "Enregistrement..." : "Confirmer mon vote"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'parameters' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
              <ProfileSettings />
            </div>
          </div>
        )}

      </main>

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedConsultation(null)}></div>
          <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="h-2 w-full bg-gradient-to-r from-brand-blue to-brand-purple"></div>
            <button 
              onClick={() => setSelectedConsultation(null)}
              className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-10 md:p-14 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${selectedConsultation.type === 'Projet' ? 'bg-purple-100 text-brand-purple' : 'bg-blue-100 text-brand-blue'}`}>
                    {selectedConsultation.type}
                  </span>
                  <span className="bg-green-100 text-green-700 text-[11px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">Approuvé</span>
                </div>
                <span className="text-gray-400 font-bold text-sm">Publié le {new Date(selectedConsultation.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-8 leading-tight break-words">{selectedConsultation.title}</h2>
              
              <div className="flex items-center gap-4 p-6 bg-brand-verylightblue/30 rounded-[30px] mb-10">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl font-black text-brand-blue">
                  {selectedConsultation.profiles?.first_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-black text-brand-navy text-lg">{selectedConsultation.profiles?.first_name} {selectedConsultation.profiles?.last_name}</p>
                  <p className="text-[11px] text-brand-blue font-black uppercase tracking-[3px] mt-0.5">Citoyen Contributeur</p>
                </div>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed font-medium whitespace-pre-wrap break-words">
                  {selectedConsultation.description}
                </p>
              </div>

              {selectedConsultation.file_url && (
                <div className="mt-12 pt-10 border-t border-gray-100">
                  <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-6">Document attaché</h4>
                  <a 
                    href={selectedConsultation.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-brand-blue/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="font-black text-brand-navy">Visualiser le document PDF</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-blue transition-colors" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Contribution Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setEditModal({ isOpen: false, contribution: null, title: '', description: '' })}></div>
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="h-2 w-full bg-gradient-to-r from-brand-blue to-brand-purple"></div>
            <button 
              onClick={() => setEditModal({ isOpen: false, contribution: null, title: '', description: '' })}
              className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-10 md:p-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-verylightblue flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-brand-navy">Modifier ma contribution</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Réf: {editModal.contribution?.reference_number || '—'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-brand-navy mb-2">Nature</label>
                    <select
                      value={editModal.nature}
                      onChange={(e) => setEditModal({ ...editModal, nature: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-brand-navy focus:ring-2 focus:ring-brand-blue outline-none"
                    >
                      <option value="Idée">Idée</option>
                      <option value="Suggestion">Suggestion</option>
                      <option value="Signalement">Signalement</option>
                      <option value="Plainte">Plainte</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-brand-navy mb-2">Service concerné</label>
                    <select
                      value={editModal.project}
                      onChange={(e) => setEditModal({ ...editModal, project: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-brand-navy focus:ring-2 focus:ring-brand-blue outline-none"
                    >
                      <option value="">Sélectionnez le service...</option>
                      <option value="Academia Raqmiya">Academia Raqmiya</option>
                      <option value="E-Himaya">E-Himaya</option>
                      <option value="Open Data">Open Data</option>
                      <option value="Moutatawi3">Moutatawi3</option>
                      <option value="Industrie 4.0">Industrie 4.0</option>
                      <option value="Khawarazmi">Khawarazmi</option>
                      <option value="Startup Hub">Startup Hub</option>
                      <option value="Mokawala Raqmiya">Mokawala Raqmiya</option>
                      <option value="Label Jeune Entreprise Innovante (JEI)">Label Jeune Entreprise Innovante (JEI)</option>
                      <option value="Interopérabilité">Interopérabilité</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Accessibilité Numérique">Accessibilité Numérique</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-brand-navy mb-2">Objet</label>
                  <input
                    type="text"
                    value={editModal.title}
                    onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-brand-navy focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-brand-navy mb-2">Description</label>
                  <textarea
                    value={editModal.description}
                    onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                    rows={6}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-brand-navy focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setEditModal({ isOpen: false, contribution: null, title: '', description: '' })}
                  className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-sm border border-gray-100 hover:bg-gray-100 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-all shadow-md"
                >
                  <Save className="w-4 h-4" /> Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
