import React from 'react';
import { Link } from 'react-router-dom';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-brand-navy mb-4">{title}</h1>
      <p className="text-gray-600 mb-8 max-w-lg">
        Cette section est en cours de développement. Vous pourrez bientôt y retrouver toutes les informations relatives aux {title.toLowerCase()}.
      </p>
      <Link to="/" className="text-brand-blue hover:underline font-medium">
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default PlaceholderPage;
