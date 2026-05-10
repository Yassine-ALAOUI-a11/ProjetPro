import React from 'react';

const TermsPage = () => {
  return (
    <div className="py-20 px-4 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto prose prose-blue lg:prose-lg">
        <h1 className="text-[42px] font-black text-brand-navy tracking-tight mb-8">Conditions d'utilisation</h1>
        
        <p className="lead font-medium text-gray-500">
          Bienvenue sur le portail E-Participation de l'Agence de Développement du Digital (ADD). En utilisant cette plateforme, vous acceptez les conditions suivantes.
        </p>

        <h2 className="text-2xl font-black text-brand-navy mt-12 mb-4">1. Objet de la plateforme</h2>
        <p className="text-gray-600">
          Le portail E-Participation a pour but de favoriser l'implication des citoyens marocains dans le processus de transformation digitale du pays à travers des contributions, des sondages et des pétitions.
        </p>

        <h2 className="text-2xl font-black text-brand-navy mt-12 mb-4">2. Engagements de l'utilisateur</h2>
        <p className="text-gray-600">
          L'utilisateur s'engage à fournir des informations exactes lors de son inscription. Toute contribution doit être respectueuse, constructive et exempte de tout propos offensant, politique ou commercial.
        </p>

        <h2 className="text-2xl font-black text-brand-navy mt-12 mb-4">3. Propriété intellectuelle</h2>
        <p className="text-gray-600">
          En soumettant une idée sur le portail, l'utilisateur accepte que l'ADD puisse exploiter cette proposition dans le cadre de ses missions de service public, sans que cela n'ouvre droit à une rémunération.
        </p>

        <h2 className="text-2xl font-black text-brand-navy mt-12 mb-4">4. Limitation de responsabilité</h2>
        <p className="text-gray-600">
          L'ADD s'efforce de maintenir la plateforme disponible 24h/24. Toutefois, l'agence ne pourra être tenue responsable en cas d'interruption technique ou de perte accidentelle de données.
        </p>

        <h2 className="text-2xl font-black text-brand-navy mt-12 mb-4">5. Modification des conditions</h2>
        <p className="text-gray-600">
          L'ADD se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés de toute mise à jour importante via leur espace personnel.
        </p>

        <div className="mt-20 p-8 bg-gray-50 rounded-[30px] border border-gray-100 italic text-sm text-gray-500">
          Dernière mise à jour : 10 mai 2026. Pour toute question, contactez-nous à l'adresse support@add.gov.ma.
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
