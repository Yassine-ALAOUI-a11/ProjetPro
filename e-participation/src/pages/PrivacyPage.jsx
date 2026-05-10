import React from 'react';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="py-20 px-4 bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-[42px] font-black text-brand-navy tracking-tight mb-4">Confidentialité & CNDP</h1>
          <p className="text-gray-500 font-medium text-lg">Protection de vos données personnelles conformément à la Loi 09-08.</p>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-gray-100 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-brand-navy mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-brand-blue" />
              Collecte des données
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              L'Agence de Développement du Digital collecte vos données (Nom, Prénom, Email, Ville) uniquement pour le traitement de vos contributions et sondages. Vos données ne sont jamais cédées à des tiers à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-navy mb-6 flex items-center gap-3">
              <Eye className="w-6 h-6 text-brand-purple" />
              Vos droits (Droit d'accès et rectification)
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              Conformément à la loi 09-08, vous disposez d'un droit d'accès, de rectification et d'opposition au traitement de vos données personnelles. Vous pouvez exercer ces droits directement depuis votre **Espace Citoyen** ou en nous contactant par écrit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-navy mb-6 flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-green-600" />
              Conformité CNDP
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              Ce traitement a fait l'objet d'une déclaration auprès de la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) sous le numéro de récépissé [En cours d'homologation].
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
              L'Agence de Développement du Digital est garante de votre souveraineté numérique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
