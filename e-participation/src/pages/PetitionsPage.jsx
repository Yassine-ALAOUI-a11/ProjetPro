import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Edit3, Users, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PetitionsPage = () => {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingId, setSigningId] = useState(null);
  const [message, setMessage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPetitions();
  }, []);

  const fetchPetitions = async () => {
    const { data, error } = await supabase
      .from('petitions')
      .select('*, petition_signatures(count)')
      .order('created_at', { ascending: false });
    
    if (data) {
      const formattedData = data.map(p => ({
        ...p,
        current_signatures: p.petition_signatures[0]?.count || 0
      }));
      setPetitions(formattedData);
    }
    setLoading(false);
  };

  const handleSign = async (petitionId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSigningId(petitionId);
    try {
      const { error } = await supabase
        .from('petition_signatures')
        .insert([{ petition_id: petitionId, user_id: user.id }]);

      if (error) {
        if (error.code === '23505') {
          setMessage({ text: "Vous avez déjà signé cette pétition.", type: 'error' });
        } else {
          throw error;
        }
      } else {
        // Update local count
        const { error: updateError } = await supabase.rpc('increment_petition_signatures', { petition_row_id: petitionId });
        // If RPC doesn't exist, we fallback to simple update or just re-fetch
        fetchPetitions();
        setMessage({ text: "Merci ! Votre signature a été enregistrée.", type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors de la signature.", type: 'error' });
    } finally {
      setSigningId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="px-4 py-1.5 bg-brand-purple/10 text-brand-purple rounded-full text-[11px] font-black uppercase tracking-widest mb-6 inline-block">
            e-Pétitions ADD
          </span>
          <h1 className="text-5xl font-black text-brand-navy mb-4 tracking-tight">e-Pétitions populaires</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <p className="text-gray-500 font-medium text-lg max-w-2xl leading-relaxed">
              Soutenez les initiatives citoyennes liées à la transformation digitale du Maroc.
            </p>
            <button className="text-brand-purple font-black text-sm flex items-center gap-2 hover:underline">
              Voir toutes les e-Pétitions <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-10 p-6 rounded-[24px] border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500
            ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
            {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <p className="font-bold">{message.text}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-[32px]"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {petitions.map((p) => {
              const progress = Math.min(Math.round((p.current_signatures / p.goal_signatures) * 100), 100);
              return (
                <div key={p.id} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                  <div className="mb-8">
                    <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                      ${p.category === 'e-Gov' ? 'bg-blue-50 text-blue-600' : 
                        p.category === 'Infrastructure' ? 'bg-green-50 text-green-600' : 
                        'bg-purple-50 text-brand-purple'}`}>
                      {p.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-black text-brand-navy mb-4 leading-snug group-hover:text-brand-blue transition-colors flex-grow break-words line-clamp-2">
                    {p.title}
                  </h3>
                  
                  <p className="text-sm text-gray-400 font-medium mb-8">
                    Initié par <span className="text-gray-600 font-bold">{p.author_name}</span>
                  </p>

                  <div className="space-y-4 mt-auto">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-brand-navy">
                      <span>{p.current_signatures.toLocaleString()} signatures</span>
                      <span className="text-gray-400">Objectif : {p.goal_signatures.toLocaleString()}</span>
                    </div>
                    
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span className="text-brand-purple">{progress}% de l'objectif atteint</span>
                      <span className="text-green-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> +{Math.floor(Math.random() * 500) + 100} cette semaine
                      </span>
                    </div>

                    <button 
                      onClick={() => handleSign(p.id)}
                      disabled={signingId === p.id}
                      className="w-full mt-6 py-4 rounded-2xl border-2 border-gray-100 text-brand-blue font-black text-sm flex items-center justify-center gap-3 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all disabled:opacity-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      {signingId === p.id ? 'Signature...' : 'Signer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetitionsPage;
