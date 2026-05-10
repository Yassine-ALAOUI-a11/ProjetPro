import React, { useState, useEffect } from 'react';
import ProfileSettings from '../../components/ProfileSettings';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContributions();
    }
  }, [user]);

  const fetchContributions = async () => {
    try {
      const { data } = await supabase
        .from('contributions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setContributions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 px-4 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center">
          <h1 className="text-[42px] font-black text-brand-navy tracking-tight mb-4">Mon Espace Citoyen</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
            Gérez vos informations et suivez l'avancement de vos dossiers en temps réel.
          </p>
        </div>
        
        {/* Profile Form */}
        <section>
          <ProfileSettings />
        </section>

        {/* Contributions List */}
        <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
          <div className="p-8 md:p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div>
              <h2 className="text-2xl font-black text-brand-navy flex items-center gap-3">
                <FileText className="w-6 h-6 text-brand-blue" />
                Mes Dossiers Soumis
              </h2>
              <p className="text-gray-500 font-medium mt-1">Historique de vos propositions à l'ADD.</p>
            </div>
            <Link 
              to="/client/soumettre"
              className="px-6 py-3 bg-brand-blue text-white rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" /> Nouvelle idée
            </Link>
          </div>
          
          <div className="p-8 md:p-10">
            {loading ? (
              <div className="py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement des dossiers...</div>
            ) : contributions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-brand-verylightblue rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-brand-blue/30" />
                </div>
                <h3 className="text-lg font-black text-brand-navy mb-2">Aucun dossier pour le moment</h3>
                <p className="text-gray-400 font-medium mb-8">Vous n'avez pas encore soumis de proposition à l'ADD.</p>
                <Link to="/client/soumettre" className="text-brand-blue font-black text-sm hover:underline">Soumettre ma première idée maintenant →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {contributions.map(c => (
                  <div key={c.id} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-brand-blue/20 transition-all flex justify-between items-center group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-brand-verylightblue px-2 py-0.5 rounded mb-1 inline-block">{c.type}</span>
                        <h4 className="font-bold text-brand-navy">{c.title}</h4>
                        <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase">SOUUMIS LE {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2
                      ${c.status === 'Traité' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {c.status === 'Traité' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {c.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;

