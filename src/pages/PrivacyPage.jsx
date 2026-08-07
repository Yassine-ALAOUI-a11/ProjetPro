import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="py-20 px-4 bg-gray-50/50 min-h-[60vh] flex items-center justify-center">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-brand-navy tracking-tight mb-6">Confidentialité & CNDP</h1>
        <p className="text-gray-500 font-medium text-lg leading-relaxed">
          Le contenu relatif à la politique de confidentialité et la conformité CNDP est en cours de mise à jour par l'Agence de Développement du Digital (ADD).
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
