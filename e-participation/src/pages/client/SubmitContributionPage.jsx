import React from 'react';
import ContributionWizard from '../../components/ContributionWizard';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SubmitContributionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="py-20 px-4 bg-brand-verylightblue/30 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-[42px] font-black text-brand-navy tracking-tight mb-4">Soumettre une idée</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">
            Partagez votre vision pour une administration digitale plus efficace. Votre contribution sera étudiée par nos équipes.
          </p>
        </div>
        
        <ContributionWizard />
      </div>
    </div>
  );
};

export default SubmitContributionPage;
