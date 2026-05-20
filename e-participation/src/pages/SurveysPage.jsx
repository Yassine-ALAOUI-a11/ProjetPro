import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BarChart3, ChevronRight, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({}); // { surveyId: optionIndex }
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*, survey_votes(*)')
      .order('created_at', { ascending: false });
    
    if (data) {
      const formattedData = data.map(s => {
        const votes = s.survey_votes || [];
        const total = votes.length;
        const updatedOptions = s.options.map((opt, idx) => ({
          ...opt,
          votes: votes.filter(v => v.option_index === idx).length
        }));
        return {
          ...s,
          total_votes: total,
          options: updatedOptions
        };
      });
      setSurveys(formattedData);
    }
    setLoading(false);
  };

  const handleVote = async (surveyId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const optionIndex = selectedOptions[surveyId];
    if (optionIndex === undefined) {
      setMessage({ text: "Veuillez sélectionner une option avant de voter.", type: 'error' });
      return;
    }

    setVotingId(surveyId);
    try {
      const { error } = await supabase
        .from('survey_votes')
        .insert([{ survey_id: surveyId, user_id: user.id, option_index: optionIndex }]);

      if (error) {
        if (error.code === '23505') {
          setMessage({ text: "Vous avez déjà participé à ce sondage.", type: 'error' });
        } else {
          throw error;
        }
      } else {
        fetchSurveys();
        setMessage({ text: "Merci pour votre participation !", type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors du vote.", type: 'error' });
    } finally {
      setVotingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <main className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 inline-block">
              Sondages ADD
            </span>
            <h1 className="text-5xl font-black text-brand-navy mb-4 tracking-tight">Sondages citoyens</h1>
            <p className="text-gray-500 font-medium text-lg max-w-2xl leading-relaxed">
              Votre opinion guide les priorités de la transformation digitale nationale.
            </p>
          </div>

          {message && (
            <div className={`mb-10 p-6 rounded-[24px] border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500
              ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
              {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <p className="font-bold">{message.text}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => <div key={i} className="h-[500px] bg-gray-100 animate-pulse rounded-[40px]"></div>)}
            </div>
          ) : surveys.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-brand-navy mb-2">Aucun sondage actif</h3>
              <p className="text-gray-500 text-sm font-medium">Il n'y a aucun sondage citoyen actif pour le moment. Revenez plus tard pour participer !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {surveys.map((s) => (
                <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-brand-navy leading-tight break-words line-clamp-2">{s.question}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.total_votes.toLocaleString()} votes</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Clôture : {new Date(s.closing_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {s.options.map((opt, idx) => {
                      const percentage = s.total_votes > 0 ? Math.round((opt.votes / s.total_votes) * 100) : 0;
                      const isSelected = selectedOptions[s.id] === idx;
                      return (
                        <div key={idx} className="space-y-2">
                          <button 
                            onClick={() => setSelectedOptions({...selectedOptions, [s.id]: idx})}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'border-brand-blue bg-blue-50/30' : 'border-gray-50 bg-gray-50 hover:border-gray-150'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-blue bg-brand-blue' : 'border-gray-300 bg-white'}`}>
                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                              </div>
                              <span className={`text-xs font-semibold ${isSelected ? 'text-brand-blue' : 'text-gray-600'}`}>{opt.text}</span>
                            </div>
                            <span className="text-[11px] font-black text-brand-navy">{percentage}%</span>
                          </button>
                          <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-blue rounded-full transition-all duration-1000" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => handleVote(s.id)}
                    disabled={votingId === s.id}
                    className="w-full mt-6 py-3 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {votingId === s.id ? 'Enregistrement...' : 'Confirmer mon vote'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SurveysPage;
