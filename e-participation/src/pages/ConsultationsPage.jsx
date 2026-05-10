import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, ChevronRight, Search, Filter, Calendar, User, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ConsultationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [selectedContribution, setSelectedContribution] = useState(null);

  const categories = ['Tous', 'Idée', 'Projet', 'Suggestion'];

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    // We only show 'Traité' contributions for public consultations
    const { data, error } = await supabase
      .from('contributions')
      .select('*, profiles(first_name, last_name)')
      .eq('status', 'Traité')
      .order('created_at', { ascending: false });
    
    if (data) setContributions(data);
    setLoading(false);
  };

  const filtered = contributions.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Tous' || c.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16">
          <span className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-[11px] font-black uppercase tracking-widest mb-6 inline-block">
            Consultations Citoyennes
          </span>
          <h1 className="text-5xl font-black text-brand-navy mb-4 tracking-tight">Projets & Idées de la communauté</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl leading-relaxed">
            Découvrez les contributions des citoyens pour la transformation digitale du Maroc et suivez leur évolution.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher une idée, un projet..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
            />
          </div>
          <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-gray-400 hover:text-brand-blue'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-[450px] bg-gray-100 animate-pulse rounded-[32px]"></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-brand-navy mb-2">Aucune contribution trouvée</h3>
            <p className="text-gray-400 font-medium">Soyez le premier à soumettre une idée pour cette catégorie !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col h-full">
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                      ${c.type === 'Projet' ? 'bg-purple-50 text-brand-purple' : 'bg-blue-50 text-brand-blue'}`}>
                      {c.type}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      Approuvé
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-brand-navy mb-4 leading-tight group-hover:text-brand-blue transition-colors break-words line-clamp-2">
                    {c.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-4 mb-8">
                    {c.description}
                  </p>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-brand-blue text-xs border border-gray-100">
                        {c.profiles?.first_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-brand-navy leading-none">{c.profiles?.first_name} {c.profiles?.last_name?.charAt(0)}.</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Citoyen</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Publié le</p>
                      <p className="text-[11px] font-black text-brand-navy">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      setSelectedContribution(c);
                    }}
                    className="w-full mt-8 py-4 bg-brand-verylightblue text-brand-blue rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-brand-blue group-hover:text-white transition-all shadow-sm"
                  >
                    Voir les détails <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <div className="flex gap-2">
                  <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${selectedContribution.type === 'Projet' ? 'bg-purple-100 text-brand-purple' : 'bg-blue-100 text-brand-blue'}`}>
                    {selectedContribution.type}
                  </span>
                  <span className="bg-green-100 text-green-700 text-[11px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">Approuvé</span>
                </div>
                <span className="text-gray-400 font-bold text-sm">Publié le {new Date(selectedContribution.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-8 leading-tight break-words">{selectedContribution.title}</h2>
              
              <div className="flex items-center gap-4 p-6 bg-brand-verylightblue/30 rounded-[30px] mb-10">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl font-black text-brand-blue">
                  {selectedContribution.profiles?.first_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-black text-brand-navy text-lg">{selectedContribution.profiles?.first_name} {selectedContribution.profiles?.last_name}</p>
                  <p className="text-[11px] text-brand-blue font-black uppercase tracking-[3px] mt-0.5">Citoyen Contributeur</p>
                </div>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed font-medium whitespace-pre-wrap break-words">
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
    </div>
  );
};

export default ConsultationsPage;
