import React, { useState, useEffect, useRef } from 'react';
import { Check, UploadCloud, Shield, ArrowLeft, ArrowRight, User, Tag, MessageSquare, CheckCircle, FileText, X, Send, AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { sendContributionEmail } from '../lib/brevo';

const steps = [
  { id: 1, title: 'Introduction' },
  { id: 2, title: 'Informations' },
  { id: 3, title: 'Participation' },
  { id: 4, title: 'Message' },
  { id: 5, title: 'Consentement' },
  { id: 6, title: 'Confirmation' },
];

const ContributionWizard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: profile?.last_name || '',
    prenom: profile?.first_name || '',
    ville: '',
    pays: '',
    age: '',
    email: user?.email || '',
    telephone: '',
    nature: '',
    service: '',
    projet: '',
    objet: '',
    message: '',
    consentCndp: false,
    consentEmail: true,
    consentNewsletter: false
  });

  useEffect(() => {
    if (user || profile) {
      setFormData(prev => ({
        ...prev,
        nom: prev.nom || profile?.last_name || '',
        prenom: prev.prenom || profile?.first_name || '',
        email: prev.email || user?.email || ''
      }));
    }
  }, [user, profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = () => {
    setError(null);
    if (currentStep === 2) {
      if (!formData.nom.trim() || !formData.prenom.trim()) {
        setError("Veuillez renseigner votre nom et prénom.");
        return false;
      }
      if (!formData.email.trim()) {
        setError("Veuillez renseigner votre adresse e-mail.");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Veuillez entrer une adresse e-mail valide.");
        return false;
      }
      const ageVal = parseInt(formData.age, 10);
      if (isNaN(ageVal) || ageVal < 18) {
        setError("Vous devez avoir au moins 18 ans pour participer.");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.nature) {
        setError("Veuillez sélectionner la nature de votre participation.");
        return false;
      }
      if (!formData.service) {
        setError("Veuillez sélectionner le service concerné.");
        return false;
      }
      if (!formData.objet.trim()) {
        setError("Veuillez renseigner l'objet de votre participation.");
        return false;
      }
    }
    if (currentStep === 4) {
      if (!formData.message.trim()) {
        setError("Veuillez rédiger le contenu de votre message.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!formData.consentCndp) {
      setError("Veuillez accepter la politique de protection des données (Loi 09-08).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let fileUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const folder = user ? user.id : 'anonymous';
        const filePath = `${folder}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('contributions').upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('contributions').getPublicUrl(filePath);
        fileUrl = publicUrl;
      }
      const ref = `ADD-${Math.floor(Math.random() * 9000000) + 1000000}`;
      
      // Mappage de la nature vers les types autorisés par la base de données ('Idée', 'Projet')
      let dbType = 'Idée';
      if (formData.nature === 'Projet') {
        dbType = 'Projet';
      }

      const { error } = await supabase.from('contributions').insert([{ 
        user_id: user?.id || null, 
        type: dbType, 
        title: formData.objet || 'Sans objet', 
        description: formData.message || 'Sans message',
        file_url: fileUrl,
        city: formData.ville,
        country: formData.pays,
        age_at_submission: parseInt(formData.age, 10) || null,
        email_contact: formData.email,
        phone_contact: formData.telephone,
        nature: formData.nature,
        project: formData.service || formData.projet || 'Autre',
        reference_number: ref
      }]);
      if (error) throw error;

      // Envoi de l'e-mail de confirmation via Brevo
      try {
        await sendContributionEmail({
          reference_number: ref,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          city: formData.ville,
          country: formData.pays,
          nature: formData.nature,
          service: formData.service || formData.projet || 'Autre',
          title: formData.objet || 'Sans objet',
          description: formData.message || 'Sans message'
        });
      } catch (mailErr) {
        console.error("Erreur lors de l'envoi de l'e-mail de confirmation:", mailErr);
      }

      setReference(ref);
      setCurrentStep(6);
    } catch (error) {
      console.error('Submission error:', error);
      setError(`Une erreur est survenue : ${error.message}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F3F7FA] min-h-screen pb-20 font-sans">
      {/* Step Indicator Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-5 w-full h-0.5 bg-[#E5E7EB] -z-0"></div>
            <div className="absolute left-0 top-5 h-0.5 bg-[#2ECC71] transition-all duration-700" style={{ width: `${((currentStep - 1) / 5) * 100}%` }}></div>
            
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-3 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                  ${currentStep > step.id ? 'bg-[#2ECC71] border-[#2ECC71] text-white' : 
                    currentStep === step.id ? 'bg-[#0066A1] border-[#0066A1] text-white' : 
                    'bg-[#F3F4F6] border-[#D1D5DB] text-[#9CA3AF]'}`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" strokeWidth={3} /> : step.id}
                </div>
                <span className={`text-[11px] font-bold tracking-tight ${currentStep === step.id ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] font-medium text-[#9CA3AF] mt-4 tracking-wider uppercase">Étape {currentStep} sur 6</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,102,161,0.08)] overflow-hidden relative">
          
          {/* Pixel Perfect Top Gradient Border */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[#0066A1] via-[#8E44AD] to-[#6EABC7]"></div>

          <div className="p-10 md:p-14">
            
            {error && (
              <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 text-red-600 animate-in slide-in-from-top-4 duration-500">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="font-bold text-sm">{error}</p>
                <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-red-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
            )}

            {/* ETAPE 1 : Introduction */}
            {currentStep === 1 && (
               <div className="animate-in fade-in duration-500 text-center py-6">
                 <div className="w-20 h-20 bg-[#EBF5FB] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                   <Send className="w-10 h-10 text-[#0066A1]" />
                 </div>
                 <h2 className="text-3xl font-black text-[#001D4A] mb-4 tracking-tight">Bienvenue sur le portail de participation</h2>
                 <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed mb-12">
                   Votre contribution est essentielle pour co-construire le Maroc digital de demain. Prenez quelques minutes pour partager vos idées ou suggestions.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                   <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 transition-all hover:shadow-md group">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0066A1] shadow-sm mb-6 font-black group-hover:scale-110 transition-transform">1</div>
                     <p className="font-black text-[#001D4A] text-[15px] mb-2 uppercase tracking-widest">Identité</p>
                     <p className="text-sm text-gray-500 font-medium leading-relaxed">Renseignez vos informations pour authentifier votre contribution citoyenne.</p>
                   </div>
                   <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 transition-all hover:shadow-md group">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-purple shadow-sm mb-6 font-black group-hover:scale-110 transition-transform">2</div>
                     <p className="font-black text-[#001D4A] text-[15px] mb-2 uppercase tracking-widest">Projet</p>
                     <p className="text-sm text-gray-500 font-medium leading-relaxed">Détaillez votre idée, joignez des documents et expliquez son impact potentiel.</p>
                   </div>
                   <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 transition-all hover:shadow-md group">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm mb-6 font-black group-hover:scale-110 transition-transform">3</div>
                     <p className="font-black text-[#001D4A] text-[15px] mb-2 uppercase tracking-widest">Suivi</p>
                     <p className="text-sm text-gray-500 font-medium leading-relaxed">Recevez une référence de dossier unique pour suivre l'état de traitement.</p>
                   </div>
                 </div>
               </div>
            )}

            {/* ETAPE 2 : Informations personnelles */}
            {currentStep === 2 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-start gap-5 mb-10">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-[#EBF5FB] text-[#0066A1] flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-[28px] font-bold text-[#001D4A] leading-tight mb-2">Informations personnelles</h2>
                    <p className="text-[#6B7280] text-[15px] leading-relaxed max-w-2xl">
                      Vos informations nous permettent de mieux comprendre et traiter votre contribution. Les champs obligatoires sont marqués d'un astérisque.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Nom <span className="text-[#E74C3C]">*</span></label>
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Prénom <span className="text-[#E74C3C]">*</span></label>
                    <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Ville <span className="text-[#E74C3C]">*</span></label>
                    <input type="text" name="ville" value={formData.ville} onChange={handleChange} placeholder="Saisissez votre ville" className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Pays <span className="text-[#E74C3C]">*</span></label>
                    <input type="text" name="pays" value={formData.pays} onChange={handleChange} placeholder="Saisissez votre pays" className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px]" />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Âge <span className="text-[#E74C3C]">*</span></label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px]" />
                    <p className="text-[12px] text-[#9CA3AF] font-medium ml-1">Vous devez avoir au moins 18 ans</p>
                  </div>
                  <div className="hidden md:block"></div>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Adresse email <span className="text-[#E74C3C]">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px]" />
                    <p className="text-[12px] text-[#9CA3AF] font-medium ml-1">Utilisée pour le suivi de votre contribution</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#6B7280]">Téléphone <span className="text-[#9CA3AF] font-medium">(optionnel)</span></label>
                    <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px]" />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPE 3 : Participation */}
            {currentStep === 3 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-start gap-5 mb-10">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center flex-shrink-0"><Tag className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-[28px] font-bold text-[#001D4A] leading-tight mb-2">Type de participation</h2>
                    <p className="text-[#6B7280] text-[15px]">Précisez la nature de votre contribution, le service de l'ADD concerné et le projet.</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[14px] font-bold text-[#1F2937]">Nature de la participation <span className="text-[#E74C3C]">*</span></label>
                      <select name="nature" value={formData.nature} onChange={handleChange} className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px] cursor-pointer">
                        <option value="">Sélectionnez le type...</option>
                        <option value="Contribution">Contribution</option>
                        <option value="Suggestion">Suggestion</option>
                        <option value="Idée">Idée</option>
                        <option value="Signalement">Signalement</option>
                        <option value="Plainte">Plainte</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[14px] font-bold text-[#1F2937]">Service de l'ADD concerné <span className="text-[#E74C3C]">*</span></label>
                      <select name="service" value={formData.service} onChange={handleChange} className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px] cursor-pointer">
                        <option value="">Sélectionnez le service...</option>
                        <option value="Academia Raqmiya">Academia Raqmiya</option>
                        <option value="E-Himaya">E-Himaya</option>
                        <option value="Open Data">Open Data</option>
                        <option value="Moutatawi3">Moutatawi3</option>
                        <option value="Industrie 4.0">Industrie 4.0</option>
                        <option value="Khawarazmi">Khawarazmi</option>
                        <option value="Startup Hub">Startup Hub</option>
                        <option value="Mokawala Raqmiya">Mokawala Raqmiya</option>
                        <option value="Label Jeune Entreprise Innovante (JEI)">Label Jeune Entreprise Innovante (JEI)</option>
                        <option value="Interopérabilité">Interopérabilité</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Accessibilité Numérique">Accessibilité Numérique</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Objet de la participation <span className="text-[#E74C3C]">*</span></label>
                    <input type="text" name="objet" value={formData.objet} onChange={handleChange} placeholder="Ex: Amélioration de l'accès aux cours sur Academia Raqmiya" className="w-full px-5 py-4 bg-[#F3F4F6] border-none rounded-2xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[15px]" />
                  </div>
                  <div className="bg-[#EBF5FB] border border-[#D6EAF8] rounded-2xl p-6 text-[15px] text-[#0066A1] flex gap-3">
                    <span className="font-bold">Conseil :</span>
                    <p>Un objet clair et précis permet aux équipes de l'ADD de traiter votre contribution plus rapidement.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPE 4 : Message & File */}
            {currentStep === 4 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-start gap-5 mb-10">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-[28px] font-bold text-[#001D4A] leading-tight mb-2">Votre message</h2>
                    <p className="text-[#6B7280] text-[15px]">Décrivez votre idée de manière claire et détaillée.</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Votre contribution <span className="text-[#E74C3C]">*</span></label>
                    <textarea name="message" value={formData.message} onChange={handleChange} rows="6" className="w-full px-6 py-5 bg-[#F3F4F6] border-none rounded-3xl text-[#1F2937] focus:ring-2 focus:ring-[#0066A1] outline-none font-medium text-[16px] resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[14px] font-bold text-[#1F2937]">Pièce jointe <span className="text-[#9CA3AF] font-medium">(optionnel)</span></label>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    {!selectedFile ? (
                      <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-[#6EABC7] bg-[#F8FAFC] rounded-[32px] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F3F4F6] transition-all">
                        <UploadCloud className="w-12 h-12 text-[#0066A1] mb-4" />
                        <p className="font-bold text-[#1F2937] text-[17px]">Glissez-déposez votre fichier ici</p>
                        <p className="text-[13px] text-[#6B7280] mt-2">ou cliquez pour parcourir · PDF, JPG, PNG (max. 5 Mo)</p>
                      </div>
                    ) : (
                      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-3xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#16A34A]"><FileText /></div>
                          <div>
                            <p className="font-bold text-[#1F2937] text-[15px]">{selectedFile.name}</p>
                            <p className="text-[12px] text-[#16A34A] font-bold uppercase tracking-widest">Prêt à l'envoi</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-[#DCFCE7] rounded-full text-[#EF4444] transition-colors"><X className="w-6 h-6" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ETAPE 5 : Consentement */}
            {currentStep === 5 && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-start gap-5 mb-10">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6" /></div>
                  <div>
                    <h2 className="text-[28px] font-bold text-[#001D4A] leading-tight mb-2">Consentement & Validation</h2>
                    <p className="text-[#6B7280] text-[15px]">Vérifiez votre récapitulatif avant l'envoi final.</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="bg-[#F9FAFB] rounded-3xl p-8 border border-[#E5E7EB]">
                    <h4 className="font-bold text-[#1F2937] mb-6 flex items-center gap-2 uppercase tracking-widest text-[12px]"><FileText className="w-4 h-4 text-[#0066A1]" /> Récapitulatif</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div><p className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-1">Identité</p><p className="font-bold text-[#1F2937]">{formData.nom} {formData.prenom}</p></div>
                      <div><p className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-1">Objet</p><p className="font-bold text-[#1F2937]">{formData.objet}</p></div>
                      <div className="md:col-span-2"><p className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-1">Message</p><p className="text-[#4B5563] text-[14px] leading-relaxed line-clamp-3">{formData.message}</p></div>
                    </div>
                  </div>
                  <label className="flex items-start gap-4 p-6 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[24px] cursor-pointer hover:bg-[#E0F2FE] transition-colors">
                    <input type="checkbox" checked={formData.consentCndp} onChange={(e) => setFormData({...formData, consentCndp: e.target.checked})} className="mt-1 w-6 h-6 rounded-lg text-[#0066A1]" />
                    <span className="text-[14px] text-[#001D4A] leading-relaxed">J'accepte que mes données soient traitées conformément à la politique de protection des données <strong>(Loi 09-08)</strong>.</span>
                  </label>
                </div>
              </div>
            )}

            {/* ETAPE 6 : Confirmation */}
            {currentStep === 6 && (
              <div className="text-center py-10 animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-[#16A34A]/10">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-[36px] font-black text-[#001D4A] mb-3">Contribution enregistrée !</h2>
                <p className="text-[#6B7280] text-[18px] mb-12">Merci pour votre participation citoyenne.</p>
                <div className="bg-[#001D4A] rounded-[24px] p-8 max-w-sm mx-auto shadow-2xl mb-12">
                   <p className="text-[#6EABC7] text-[12px] font-black uppercase tracking-[4px] mb-2">Référence de dossier</p>
                   <p className="text-white text-[32px] font-black tracking-widest">{reference}</p>
                </div>
                <div className="flex justify-center items-center max-w-xs mx-auto">
                  <button onClick={() => navigate('/')} className="w-full bg-[#0066A1] text-white px-8 py-4 rounded-[20px] font-black text-[15px] shadow-xl shadow-[#0066A1]/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                    <Home className="w-4 h-4" /> Accueil
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer Navigation */}
          {currentStep < 6 && (
            <div className={`px-10 py-10 bg-white border-t border-[#F3F4F6] flex items-center ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
              {currentStep > 1 && (
                <button 
                  onClick={prevStep} 
                  className="flex items-center gap-2 px-8 py-4 rounded-[18px] border-2 border-[#E5E7EB] text-[#6B7280] font-black text-[15px] hover:bg-[#F9FAFB] transition-all"
                >
                  <ArrowLeft className="w-5 h-5" /> Retour
                </button>
              )}
              
              {currentStep < 5 ? (
                <button 
                  onClick={nextStep} 
                  className="flex items-center gap-3 bg-[#0066A1] text-white px-10 py-4 rounded-[18px] font-black text-[15px] shadow-xl shadow-[#0066A1]/25 hover:bg-[#005586] transition-all"
                >
                  Suivant <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={loading || !formData.consentCndp}
                  className="bg-[#001D4A] text-white px-12 py-4 rounded-[18px] font-black text-[15px] shadow-xl shadow-[#001D4A]/25 hover:bg-[#000F25] transition-all disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : 'Envoyer ma contribution'}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContributionWizard;
