import React from 'react';
import { BookOpen, UserCheck, Send, BarChart, ShieldCheck } from 'lucide-react';

const GuidePage = () => {
  return (
    <div className="py-20 px-4 bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-[42px] font-black text-brand-navy tracking-tight mb-4">Guide d'utilisation</h1>
          <p className="text-gray-500 font-medium text-lg">Apprenez à utiliser toutes les fonctionnalités de la plateforme E-Participation.</p>
        </div>

        <div className="space-y-12">
          {/* Step 1 */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex gap-8 items-start">
            <div className="w-16 h-16 bg-brand-verylightblue rounded-2xl flex items-center justify-center text-brand-blue shrink-0">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-navy mb-4">1. Inscription et Profil</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                Pour participer pleinement, créez un compte avec votre adresse e-mail. Une fois connecté, vous pouvez accéder à votre espace citoyen pour mettre à jour vos informations (nom, prénom, téléphone) et voir l'historique de vos activités.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex gap-8 items-start">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-brand-purple shrink-0">
              <Send className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-navy mb-4">2. Soumettre une contribution</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                Vous avez une idée pour l'administration digitale ? Cliquez sur "Soumettre ma contribution". Remplissez le formulaire en 6 étapes simples, joignez vos documents si nécessaire, et recevez un numéro de référence unique (ex: ADD-1234567) pour le suivi.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex gap-8 items-start">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <BarChart className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-navy mb-4">3. Voter aux sondages</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                L'ADD lance régulièrement des sondages pour recueillir l'avis des citoyens. Rendez-vous dans la section "Sondages", choisissez votre option et confirmez votre vote. Vos réponses sont anonymes et aident à définir les priorités nationales.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex gap-8 items-start">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-navy mb-4">4. Sécurité et Confidentialité</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                Toutes vos données sont protégées conformément à la loi 09-08. Seul le personnel autorisé de l'ADD peut consulter vos propositions détaillées pour les traiter. Votre voix compte, et elle est en sécurité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
