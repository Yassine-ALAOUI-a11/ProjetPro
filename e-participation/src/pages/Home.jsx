import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle, MessageSquare, ChevronRight, Send, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState({ total: 4018, processed: 2958, rate: 90 });
  const [selectedContribution, setSelectedContribution] = useState(null);
  const isRtl = i18n.language === 'AR';

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from('contributions')
        .select('*, profiles(first_name, last_name)')
        .eq('status', 'Traité')
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (data) setNews(data);
    };

    const fetchStats = async () => {
      // Get total count
      const { count: totalCount } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true });

      // Get processed count
      const { count: processedCount } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Traité');

      const rate = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

      // Update state if we successfully fetched counts
      if (totalCount !== null) {
        setStats({
          total: totalCount,
          processed: processedCount || 0,
          rate: rate
        });
      }
    };

    const fetchPetitions = async () => {
      const { data } = await supabase.from('petitions').select('*').limit(2).order('created_at', { ascending: false });
      if (data) setPetitions(data);
    };

    const fetchSurveys = async () => {
      const { data } = await supabase.from('surveys').select('*').limit(2).order('created_at', { ascending: false });
      if (data) setSurveys(data);
    };

    fetchNews();
    fetchStats();
    fetchPetitions();
    fetchSurveys();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-brand-navy text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-purple/20 opacity-80"></div>
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
            
            <p className="text-lg text-gray-300 mb-10 max-w-2xl leading-relaxed">
              {t('home.hero_subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={user ? "/client/soumettre" : "/login"} className="bg-brand-blue hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-blue/30">
                <Send className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                {t('home.btn_submit')}
              </Link>
              <Link to="/consultations" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all backdrop-blur-sm">
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
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-brand-verylightblue/50">
              <div className="w-14 h-14 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-brand-navy">{stats.total.toLocaleString()}</h3>
                <p className="text-gray-600 font-medium">{t('home.stat_total')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-brand-verylightblue/50">
              <div className="w-14 h-14 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-brand-navy">{stats.processed.toLocaleString()}</h3>
                <p className="text-gray-600 font-medium">{t('home.stat_processed')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-brand-verylightblue/50">
              <div className="w-14 h-14 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-brand-navy">{stats.rate}%</h3>
                <p className="text-gray-600 font-medium">{t('home.stat_rate')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Petitions & Surveys Quick View */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Petitions Column */}
            <div className="animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-brand-navy mb-2">Pétitions Actives</h2>
                  <p className="text-gray-500 font-medium italic">Soutenez les causes qui vous tiennent à cœur.</p>
                </div>
                <Link to="/petitions" className="w-12 h-12 rounded-2xl bg-brand-verylightblue text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all shadow-sm">
                  <ChevronRight className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
                </Link>
              </div>

              <div className="space-y-6">
                {petitions.length === 0 ? (
                  <p className="text-gray-400 italic">Aucune pétition active pour le moment.</p>
                ) : petitions.map(p => {
                  const progress = Math.min(Math.round((p.current_signatures / p.goal_signatures) * 100), 100);
                  return (
                    <div key={p.id} className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 group hover:shadow-xl hover:shadow-brand-purple/5 transition-all duration-500">
                      <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{p.category}</span>
                      <h3 className="text-xl font-black text-brand-navy mb-4 leading-snug group-hover:text-brand-blue transition-colors flex-grow break-words line-clamp-2">
                        {p.title}
                      </h3>
                      
                      <div className="flex justify-between items-end mb-3">
                        <p className="text-[14px] font-black text-brand-navy">{p.current_signatures.toLocaleString()} <span className="text-gray-400 font-bold">/ {p.goal_signatures.toLocaleString()} signatures</span></p>
                        <span className="text-brand-purple font-black text-sm">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Surveys Column */}
            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-brand-navy mb-2">Sondages en cours</h2>
                  <p className="text-gray-500 font-medium italic">Votre avis compte pour nos futures décisions.</p>
                </div>
                <Link to="/sondages" className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm">
                  <ChevronRight className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
                </Link>
              </div>

              <div className="space-y-6">
                {surveys.length === 0 ? (
                  <p className="text-gray-400 italic">Aucun sondage actif pour le moment.</p>
                ) : surveys.map(s => (
                  <div key={s.id} className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 group hover:shadow-xl hover:shadow-green-600/5 transition-all duration-500">
                    <h3 className="text-xl font-black text-brand-navy mb-6 leading-tight group-hover:text-green-600 transition-colors break-words line-clamp-2">{s.question}</h3>
                    <div className="space-y-3 mb-6">
                      {s.options.slice(0, 2).map((opt, idx) => {
                        const percentage = s.total_votes > 0 ? Math.round((opt.votes / s.total_votes) * 100) : 0;
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-500">{opt.text}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-1.5 bg-white rounded-full overflow-hidden shadow-inner hidden sm:block">
                                <div className="h-full bg-green-500 rounded-full opacity-60" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="text-[12px] font-black text-brand-navy min-w-[35px] text-right">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <Users className="w-4 h-4" /> {s.total_votes} PARTICIPANTS
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Recent Feed placeholder */}
      <section className="py-20 bg-brand-verylightblue/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-brand-navy mb-2">{t('home.news_title')}</h2>
              <p className="text-gray-600">{t('home.news_subtitle')}</p>
            </div>
            <Link to="/consultations" className="text-brand-blue font-semibold hover:underline hidden sm:block">
              {t('home.see_all')}
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-500 italic">
                {t('header.no_news')}
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">{t('home.processed')}</span>
                    <span className="text-gray-400 text-sm">{new Date(item.updated_at).toLocaleDateString(i18n.language === 'AR' ? 'ar-MA' : 'fr-FR')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-lightblue flex items-center justify-center text-[10px] font-bold text-brand-navy border border-brand-blue/20">
                        {item.profiles?.first_name?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs font-bold text-brand-navy">{item.profiles?.first_name} {item.profiles?.last_name?.charAt(0)}.</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        setSelectedContribution(item);
                      }}
                      className="text-brand-blue text-sm font-semibold hover:underline"
                    >
                      {t('home.read_more')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Detail Modal */}
      {selectedContribution && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedContribution(null)}></div>
          <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="h-2 w-full bg-gradient-to-r from-brand-blue to-brand-purple"></div>
            <button 
              onClick={() => setSelectedContribution(null)}
              className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-10 md:p-14 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center justify-between mb-8">
                <span className="bg-green-100 text-green-700 text-[11px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">{t('home.processed')}</span>
                <span className="text-gray-400 font-bold text-sm">Publié le {new Date(selectedContribution.updated_at).toLocaleDateString(i18n.language === 'AR' ? 'ar-MA' : 'fr-FR')}</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-8 leading-tight">{selectedContribution.title}</h2>
              
              <div className="flex items-center gap-4 p-6 bg-brand-verylightblue/30 rounded-[30px] mb-10">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl font-black text-brand-blue">
                  {selectedContribution.profiles?.first_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-brand-navy text-lg">{selectedContribution.profiles?.first_name} {selectedContribution.profiles?.last_name}</p>
                  <p className="text-[11px] text-brand-blue font-black uppercase tracking-[3px] mt-0.5">Citoyen Contributeur</p>
                </div>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedContribution.description}
                </p>
              </div>

              {selectedContribution.file_url && (
                <div className="mt-12 pt-10 border-t border-gray-100">
                  <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-6">Document attaché</h4>
                  <a 
                    href={selectedContribution.file_url} 
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
      
      {/* Floating Chat Button Placeholder */}
      <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} w-14 h-14 bg-brand-blue rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors z-50`}>
        <MessageSquare className="w-6 h-6 text-white" />
        <span className={`absolute -top-1 ${isRtl ? '-left-1' : '-right-1'} w-5 h-5 bg-brand-purple rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold`}>1</span>
      </div>
    </div>
  );
};

export default Home;
