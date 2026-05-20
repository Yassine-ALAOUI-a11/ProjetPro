import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle, MessageSquare, ChevronRight, Send, X, Shield, Sparkles, Filter, Calendar, Lightbulb, Zap, AlertTriangle, Clock, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState({ total: 4218, processed: 3105, rate: 94, pending: 87 });

  const [sondagesData, setSondagesData] = useState([]);

  const handleSelectOption = (surveyId, optionIndex) => {
    setSondagesData(prev => prev.map(s => {
      if (s.id === surveyId) {
        if (s.voted) return s;
        return { ...s, selectedOption: optionIndex };
      }
      return s;
    }));
  };

  const handleVoteSubmit = async (surveyId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const survey = sondagesData.find(s => s.id === surveyId);
    if (!survey || survey.selectedOption === null) return;

    const isRealSurvey = typeof surveyId === 'string';

    if (isRealSurvey) {
      try {
        const { error } = await supabase
          .from('survey_votes')
          .insert([{ survey_id: surveyId, user_id: user.id, option_index: survey.selectedOption }]);

        if (error) {
          if (error.code === '23505') {
            alert("Vous avez déjà participé à ce sondage.");
          } else {
            throw error;
          }
          return;
        }
      } catch (err) {
        console.error("Error submitting vote:", err);
        return;
      }
    }

    setSondagesData(prev => prev.map(s => {
      if (s.id === surveyId) {
        if (s.voted || s.selectedOption === null) return s;
        const updatedOptions = s.options.map((opt, idx) => {
          if (idx === s.selectedOption) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });
        const newTotalVotes = s.totalVotes + 1;
        const finalOptions = updatedOptions.map(opt => ({
          ...opt,
          percentage: newTotalVotes > 0 ? Math.round((opt.votes / newTotalVotes) * 100) : 0
        }));
        return {
          ...s,
          voted: true,
          totalVotes: newTotalVotes,
          options: finalOptions
        };
      }
      return s;
    }));
  };

  // Filtering states for community consultations
  const [dateFilter, setDateFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const getDaysLeft = (created_at) => {
    if (!created_at) return "30j restants";
    const created = new Date(created_at);
    const target = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}j restants` : "Clôturé";
  };

  const getClosingDate = (created_at) => {
    if (!created_at) return "30 mai 2026";
    const created = new Date(created_at);
    const target = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
    return target.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const displayConsultations = consultations && consultations.length > 0
    ? consultations.map((c) => ({
        id: c.id,
        category: c.nature || c.type || 'Suggestion',
        categoryBg: (c.nature || c.type) === 'Projet' ? 'bg-purple-50 text-brand-purple' : (c.nature || c.type) === 'Signalement' ? 'bg-orange-50 text-orange-600' : (c.nature || c.type) === 'Plainte' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-brand-blue',
        status: 'Validé',
        statusBg: 'bg-green-50 text-green-600',
        daysLeft: getDaysLeft(c.created_at),
        title: c.title,
        text: c.description || '',
        authorName: c.profiles ? `${c.profiles.first_name || ''} ${c.profiles.last_name?.charAt(0) || ''}.` : 'Citoyen',
        closingDate: new Date(c.created_at).toLocaleDateString('fr-FR'),
        isReal: true
      }))
    : [];


  // Chatbot states
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([
    { text: "Bonjour ! Je suis l'assistant virtuel de la plateforme de e-participation. Comment puis-je vous aider ?", isBot: true }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const isRtl = i18n.language === 'AR';

  const quickReplies = [
    { label: "Comment soumettre une idée ?", val: "comment_soumettre" },
    { label: "Qu'est-ce que l'ADD ?", val: "quoi_add" },
    { label: "Comment participer à un sondage ?", val: "participer_sondage" },
    { label: "Quels sont les services de l'ADD ?", val: "services_add" }
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatbotMessages, isBotTyping]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from('contributions')
        .select('*, profiles(first_name, last_name)')
        .eq('status', 'Traité')
        .order('updated_at', { ascending: false });
      
      if (data) setNews(data);
    };

    const fetchStats = async () => {
      try {
        const { count: totalCount } = await supabase
          .from('contributions')
          .select('*', { count: 'exact', head: true });

        const { count: processedCount } = await supabase
          .from('contributions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Traité');

        const { count: pendingCount } = await supabase
          .from('contributions')
          .select('*', { count: 'exact', head: true })
          .in('status', ['En attente', 'En cours']);

        const rate = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

        setStats({
          total: totalCount !== null ? totalCount : 4218,
          processed: processedCount !== null ? processedCount : 3105,
          rate: totalCount > 0 ? rate : 94,
          pending: pendingCount !== null ? pendingCount : 87
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    const fetchConsultations = async () => {
      const { data } = await supabase
        .from('contributions')
        .select('*, profiles(first_name, last_name)')
        .eq('status', 'Traité')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (data) {
        setConsultations(data);
      }
    };

    const fetchSurveys = async () => {
      const { data } = await supabase
        .from('surveys')
        .select('*, survey_votes(*)')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (data && data.length > 0) {
        const formattedData = data.map(s => {
          const votes = s.survey_votes || [];
          const total = votes.length;
          
          const userVote = user ? votes.find(v => v.user_id === user.id) : null;
          const hasVoted = !!userVote;
          const userSelectedOption = userVote ? userVote.option_index : null;

          const updatedOptions = s.options.map((opt, idx) => {
            const optVotes = votes.filter(v => v.option_index === idx).length;
            return {
              text: opt.text,
              votes: optVotes,
              percentage: total > 0 ? Math.round((optVotes / total) * 100) : 0,
              colorClass: idx === 0 ? 'bg-brand-blue' : idx === 1 ? 'bg-cyan-500' : idx === 2 ? 'bg-brand-purple' : 'bg-orange-500'
            };
          });

          return {
            id: s.id,
            title: s.question,
            totalVotes: total,
            closingDate: s.closing_date ? new Date(s.closing_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '30 avril 2026',
            voted: hasVoted,
            selectedOption: userSelectedOption,
            options: updatedOptions
          };
        });
        setSondagesData(formattedData);
      } else {
        setSondagesData([]);
      }
    };

    fetchNews();
    fetchStats();
    fetchConsultations();
    fetchSurveys();
  }, [user]);

  const handleQuickReply = (val) => {
    let userMsg = "";
    let botReply = "";

    if (val === "comment_soumettre") {
      userMsg = "Comment soumettre une contribution ?";
      botReply = "Pour soumettre une contribution, cliquez sur le bouton 'Contribuer' en haut à droite ou 'Soumettre ma contribution' sur la page d'accueil. Remplissez ensuite le formulaire public en 3 étapes en décrivant votre proposition.";
    } else if (val === "quoi_add") {
      userMsg = "Qu'est-ce que l'ADD ?";
      botReply = "L'Agence de Développement du Digital (ADD) est un établissement public marocain chargé de piloter la mise en œuvre de la stratégie de l'État en matière de développement du digital.";
    } else if (val === "participer_sondage") {
      userMsg = "Comment participer à un sondage ?";
      botReply = "Vous pouvez participer aux sondages citoyens en accédant à la section 'Sondages' de la barre de navigation. Les résultats sont consultables en temps réel après votre participation.";
    } else if (val === "services_add") {
      userMsg = "Quels sont les services de l'ADD ?";
      botReply = "L'ADD propose plusieurs services clés dont le Bureau d'Ordre Digital, Chikaya (portail national des réclamations), la plateforme Jisr de messagerie de l'Etat, Fiducia pour la signature électronique et l'Open Data.";
    }

    sendChatMessage(userMsg, botReply);
  };

  const sendChatMessage = (userMsg, botReply) => {
    setChatbotMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setIsBotTyping(true);
    
    setTimeout(() => {
      setChatbotMessages(prev => [...prev, { text: botReply, isBot: true }]);
      setIsBotTyping(false);
    }, 800);
  };

  const handleSendCustomMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    
    let botReply = "Je vous remercie pour votre message. Je suis en train d'apprendre et n'ai pas encore de réponse précise pour cela, mais vous pouvez soumettre une contribution officielle pour partager vos retours avec l'ADD.";
    
    const lower = msg.toLowerCase();
    if (lower.includes("bonjour") || lower.includes("salut")) {
      botReply = "Bonjour ! Comment puis-je vous renseigner aujourd'hui sur la e-participation de l'ADD ?";
    } else if (lower.includes("chikaya") || lower.includes("réclamation")) {
      botReply = "Le service Chikaya est intégré à la plateforme. Vous pouvez soumettre une réclamation/plainte en sélectionnant 'Plainte' ou 'Signalement' à la 3ème étape du formulaire de contribution.";
    } else if (lower.includes("bureau d'ordre") || lower.includes("courrier")) {
      botReply = "Le Bureau d'Ordre Digital permet de déposer des courriers administratifs de manière dématérialisée auprès de l'ADD et des autres administrations partenaires.";
    } else if (lower.includes("contact") || lower.includes("téléphone") || lower.includes("email")) {
      botReply = "Vous pouvez nous contacter via la page Légal & Contact ou soumettre vos requêtes directement dans votre Espace Citoyen.";
    } else if (lower.includes("loi 09-08") || lower.includes("cndp") || lower.includes("données")) {
      botReply = "Toutes les contributions et données personnelles sont traitées conformément à la loi 09-08 sur la protection des données personnelles, sous la supervision de la CNDP.";
    }

    sendChatMessage(msg, botReply);
  };

  // Local filtering for community contributions
  const filteredNews = news.filter(item => {
    if (serviceFilter !== 'all' && item.project !== serviceFilter) {
      return false;
    }
    
    if (dateFilter !== 'all') {
      const itemDate = new Date(item.updated_at);
      const diffTime = Math.abs(new Date() - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'week' && diffDays > 7) {
        return false;
      }
      if (dateFilter === 'month' && diffDays > 30) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#001D4A] text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#001D4A] via-[#001D4A] to-brand-purple/20 opacity-80"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm mb-8 backdrop-blur-sm">
              <span className="text-brand-purple text-lg leading-none">✦</span>
              <span>{t('home.official_platform')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('home.hero_title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lightblue to-brand-purple">
                {t('home.hero_highlight')}
              </span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-10 max-w-2xl leading-relaxed font-medium">
              Une plateforme sécurisée pour exprimer vos idées afin de contribuer au développement des services de l’ADD
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/client/soumettre" className="bg-brand-blue hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-blue/30">
                <Send className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                {t('home.btn_submit')}
              </Link>
              <Link to="/consultations" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all backdrop-blur-sm">
                {t('home.btn_view')}
                <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-4">
              <div className={`flex ${isRtl ? 'space-x-reverse -space-x-3' : '-space-x-3'}`}>
                <div className="w-10 h-10 rounded-full border-2 border-brand-navy bg-brand-blue flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-navy bg-brand-purple flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-navy bg-brand-lightblue flex items-center justify-center"><Users className="w-5 h-5 text-brand-navy" /></div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-navy bg-gray-600 flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
              </div>
              <div className="text-sm">
                <span className="font-bold block">{t('home.citizens_count')}</span>
                <span className="text-gray-400">{t('home.already_contributed')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-b border-gray-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Block */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-4 py-1.5 bg-brand-verylightblue/60 text-brand-blue rounded-full text-[11px] font-black uppercase tracking-widest mb-4 inline-block">
              Tableau de bord
            </span>
            <h2 className="text-4xl font-black text-brand-navy mb-4 tracking-tight">
              Impact de la participation citoyenne
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Des statistiques en temps réel sur le traitement de vos contributions par l'Agence de Développement du Digital.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1: Contributions reçues */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow min-h-[220px]">
              <div className="absolute top-0 left-8 w-12 h-1 bg-brand-blue rounded-b-lg"></div>
              <div className="mt-4">
                <h3 className="text-4xl font-black text-brand-navy mb-2">
                  {stats.total.toLocaleString()}
                </h3>
                <p className="text-sm font-black text-brand-navy mb-1">
                  Contributions reçues
                </p>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Idées, suggestions et feedbacks soumis
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold w-fit">
                  ↑ +12% ce mois
                </span>
              </div>
            </div>

            {/* Card 2: Dossiers traités */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow min-h-[220px]">
              <div className="absolute top-0 left-8 w-12 h-1 bg-emerald-500 rounded-b-lg"></div>
              <div className="mt-4">
                <h3 className="text-4xl font-black text-brand-navy mb-2">
                  {stats.processed.toLocaleString()}
                </h3>
                <p className="text-sm font-black text-brand-navy mb-1">
                  Dossiers traités
                </p>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Contributions analysées et traitées par l'ADD
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold w-fit">
                  ↑ +8% ce mois
                </span>
              </div>
            </div>

            {/* Card 3: Taux de réponse */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow min-h-[220px]">
              <div className="absolute top-0 left-8 w-12 h-1 bg-brand-purple rounded-b-lg"></div>
              <div className="mt-4">
                <h3 className="text-4xl font-black text-brand-navy mb-2">
                  {stats.rate}%
                </h3>
                <p className="text-sm font-black text-brand-navy mb-1">
                  Taux de réponse
                </p>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Des contributions reçoivent une réponse
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold w-fit">
                  ↑ Stable • cible 95%
                </span>
              </div>
            </div>

            {/* Card 4: Réclamations en cours */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow min-h-[220px]">
              <div className="absolute top-0 left-8 w-12 h-1 bg-amber-500 rounded-b-lg"></div>
              <div className="mt-4">
                <h3 className="text-4xl font-black text-amber-600 mb-2">
                  {stats.pending.toLocaleString()}
                </h3>
                <p className="text-sm font-black text-brand-navy mb-1">
                  Réclamations en cours
                </p>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Signalements et plaintes en traitement actif
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold w-fit">
                  ↓ -5 depuis hier
                </span>
              </div>
            </div>

          </div>


        </div>
      </section>

      {/* What is e-participation Section */}
      <section className="py-24 bg-[#F8FAFC] border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <span className="px-4 py-1.5 bg-brand-purple/10 text-brand-purple rounded-full text-[11px] font-black uppercase tracking-widest mb-4 inline-block">
                Pourquoi participer ?
              </span>
              <h2 className="text-4xl font-black text-brand-navy mb-4 tracking-tight leading-tight">
                La plateforme officielle de l'ADD pour les citoyens
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                e-participation est dédiée exclusivement à la collecte des avis, idées et suggestions liés aux services et projets numériques de l'ADD.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link 
                to="/client/soumettre" 
                className="px-6 py-4 bg-brand-blue hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-brand-blue/20"
              >
                Commencer ma contribution <span className="text-lg leading-none">→</span>
              </Link>
            </div>
          </div>
          
          {/* Grid of 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Vos idées comptent */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-brand-navy mb-3">Vos idées comptent</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium flex-grow">
                Soumettez vos suggestions, idées et signalements pour améliorer les services numériques de l'administration marocaine.
              </p>
            </div>
            
            {/* Card 2: Participation active */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="w-12 h-12 bg-purple-50 text-brand-purple rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-brand-navy mb-3">Participation active</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium flex-grow">
                Contribuez directement à la transformation digitale du Maroc en rejoignant des milliers de citoyens engagés.
              </p>
            </div>
            
            {/* Card 3: Impact réel */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-brand-navy mb-3">Impact réel</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium flex-grow">
                Vos contributions sont analysées par les équipes de l'ADD et peuvent influencer directement les projets numériques nationaux.
              </p>
            </div>
            
            {/* Card 4: Données protégées */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-brand-navy mb-3">Données protégées</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium flex-grow">
                Vos données personnelles sont traitées conformément à la loi 09-08 et déclarées auprès de la CNDP.
              </p>
            </div>
            
          </div>

          {/* Warning Banner / Périmètre */}
          <div className="bg-[#EBF3F8] p-6 rounded-[24px] border border-[#D5E6F0] flex gap-4 items-start mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black text-brand-navy mb-1">Périmètre de la plateforme</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Les demandes sans lien direct avec les missions de l'ADD (transformation digitale, e-Gov, open data, cybersécurité, identité numérique) ne pourront pas être traitées via cette plateforme. Pour d'autres sujets, veuillez contacter les services concernés.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Public Consultations Section */}
      <section className="py-24 bg-white overflow-hidden border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <span className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-[11px] font-black uppercase tracking-widest mb-4 inline-block">
                Consultations publiques ADD
              </span>
              <h2 className="text-4xl font-black text-brand-navy mb-4 tracking-tight leading-tight">
                Consultations en cours
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Participez aux consultations liées à la transformation digitale nationale pilotée par l'ADD.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link 
                to="/client/soumettre" 
                className="text-brand-blue hover:text-blue-700 font-black text-sm flex items-center gap-1 transition-all"
              >
                Soumettre ma contribution <span className="text-lg leading-none">→</span>
              </Link>
            </div>
          </div>

          {/* Grid of Validated Consultations */}
          {displayConsultations.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MessageSquare className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-brand-navy mb-2">Aucune consultation validée</h3>
              <p className="text-gray-400 font-medium max-w-md mx-auto">Les contributions validées par l'administration apparaîtront ici. Soyez le premier à soumettre une idée !</p>
              <Link 
                to="/client/soumettre" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-brand-blue/20 mt-8"
              >
                Soumettre ma contribution <span className="text-lg leading-none">→</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {displayConsultations.map((c) => (
                  <div 
                    key={c.id} 
                    className="p-8 bg-white rounded-[32px] border border-gray-150 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Tags and Days Left */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${c.categoryBg}`}>
                            {c.category}
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${c.statusBg}`}>
                            {c.status}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                          <Clock className="w-3.5 h-3.5" /> {c.daysLeft}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-black text-brand-navy mb-3 leading-snug hover:text-brand-blue transition-colors">
                        {c.title}
                      </h3>

                      {/* Text */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                        {c.text}
                      </p>
                    </div>

                    {/* Footer stats */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-50 text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" /> {c.authorName} (Citoyen)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" /> Validé le : {c.closingDate}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              {/* Center Button */}
              <div className="text-center mt-12">
                <Link 
                  to="/consultations" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-brand-blue/20"
                >
                  Voir toutes les consultations <span className="text-lg leading-none">→</span>
                </Link>
              </div>
            </>
          )}

        </div>
      </section>

      {/* Sondages Citoyens Section */}
      <section className="py-24 bg-[#F8FAFC] overflow-hidden border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <span className="px-4 py-1.5 bg-green-55 text-green-600 rounded-full text-[11px] font-black uppercase tracking-widest mb-4 inline-block bg-green-50">
                Sondages ADD
              </span>
              <h2 className="text-4xl font-black text-brand-navy mb-4 tracking-tight leading-tight">
                Sondages citoyens
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Votre opinion guide les priorités de la transformation digitale nationale.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link 
                to="/sondages" 
                className="text-green-600 hover:text-green-700 font-black text-sm flex items-center gap-1 transition-all"
              >
                Voir tous les sondages <span className="text-lg leading-none">→</span>
              </Link>
            </div>
          </div>

          {sondagesData.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-brand-navy mb-2">Aucun sondage actif</h3>
              <p className="text-gray-500 text-sm font-medium">Il n'y a aucun sondage citoyen actif pour le moment. Revenez plus tard pour participer !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {sondagesData.map((s) => (
                <div 
                  key={s.id} 
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    
                    {/* Top Bar Chart Icon */}
                    <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-4 h-4" />
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-black text-brand-navy mb-1.5 leading-snug">
                      {s.title}
                    </h3>

                    {/* Meta stats under title */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mb-5 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {s.totalVotes.toLocaleString()} votes
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Clôture : {s.closingDate}
                      </span>
                    </div>

                    {/* Options with selection buttons and progress bars */}
                    <div className="space-y-3 mb-5">
                      {s.options.map((opt, idx) => {
                        const isSelected = s.selectedOption === idx;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => !s.voted && handleSelectOption(s.id, idx)}
                            className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                              s.voted 
                                ? isSelected 
                                  ? 'bg-brand-verylightblue/30 border-brand-blue/30' 
                                  : 'bg-gray-50/50 border-gray-50'
                                : isSelected
                                  ? 'bg-brand-verylightblue/20 border-brand-blue/50 shadow-sm'
                                  : 'bg-white border-gray-100 hover:border-brand-blue/55'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-2">
                                {!s.voted && (
                                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 bg-white">
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-brand-blue transition-all"></div>}
                                  </div>
                                )}
                                {s.voted && isSelected && (
                                  <div className="w-3.5 h-3.5 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                  </div>
                                )}
                                {s.voted && !isSelected && (
                                  <div className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0 bg-gray-100"></div>
                                )}
                                <span className={`text-xs font-semibold ${isSelected ? 'text-brand-navy' : 'text-gray-600'}`}>
                                  {opt.text}
                                </span>
                              </div>
                              <span className="text-[10px] font-black text-brand-navy">
                                {opt.percentage}%
                              </span>
                            </div>
                            
                            {/* Animated Progress Bar */}
                            <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${opt.colorClass}`} 
                                style={{ width: `${s.voted ? opt.percentage : 0}%` }}
                              ></div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* Vote Button */}
                  <div>
                    {s.voted ? (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                        <span className="text-xs font-bold text-green-700">✓ Merci pour votre participation ! Votre vote a été enregistré.</span>
                      </div>
                    ) : (
                      <button 
                        disabled={s.selectedOption === null}
                        onClick={() => s.selectedOption !== null && handleVoteSubmit(s.id)}
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center block ${
                          s.selectedOption === null 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-brand-verylightblue text-brand-blue hover:bg-brand-blue hover:text-white shadow-sm cursor-pointer'
                        }`}
                      >
                        Voter maintenant
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>


      
      {/* Floating Chatbot */}
      <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="w-14 h-14 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-full shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all text-white relative focus:outline-none"
        >
          {isChatbotOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!isChatbotOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold animate-bounce">1</span>
          )}
        </button>

        {/* Chat Drawer */}
        {isChatbotOpen && (
          <div className={`absolute bottom-18 ${isRtl ? 'left-0' : 'right-0'} w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 z-50`}>
            {/* Header */}
            <div className="bg-[#001D4A] text-white p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Assistant Virtuel ADD</h3>
                <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> En ligne
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/50">
              {chatbotMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.isBot 
                      ? 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm' 
                      : 'bg-brand-blue text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-400 p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-xs flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {chatbotMessages.length === 1 && !isBotTyping && (
              <div className="p-4 border-t border-gray-50 bg-white flex flex-col gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Questions fréquentes :</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReply(r.val)}
                      className="text-xs text-left bg-brand-verylightblue text-brand-blue px-3 py-2 rounded-xl font-bold hover:bg-brand-blue hover:text-white transition-all outline-none"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Box */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                placeholder="Posez votre question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCustomMessage()}
                className="flex-1 bg-gray-50 border border-gray-100 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue/30 font-medium"
              />
              <button 
                onClick={handleSendCustomMessage}
                className="w-10 h-10 bg-brand-blue hover:bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-brand-blue/15 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
