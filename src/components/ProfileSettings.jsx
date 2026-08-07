import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Save, User, Mail, Phone, MapPin, Image as ImageIcon, Calendar, Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProfileSettings = () => {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age: '',
    phone: '',
    address: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (profile && user) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: user.email || '',
        age: profile.age || '',
        phone: profile.phone || '',
        address: profile.address || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide.');
        setLoading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
      setSuccess("Image téléchargée ! N'oubliez pas d'enregistrer.");
    } catch (err) {
      setError("Erreur d'upload. Avez-vous créé le bucket 'avatars' en mode public dans Supabase ? " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update email in Auth if changed
      if (formData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: formData.email });
        if (authError) throw authError;
        // Depending on Supabase settings, this might require email confirmation
      }

      // Update profile data in DB
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          age: formData.age === '' ? null : parseInt(formData.age, 10),
          phone: formData.phone,
          address: formData.address,
          avatar_url: formData.avatar_url
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update the global context profile so changes reflect everywhere (e.g. Header)
      await refreshProfile();

      setSuccess('Votre profil a été mis à jour avec succès !');
      // Scroll to top of form to see message
      window.scrollTo(0, 0);
      
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
      <div className="p-8 md:p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div>
          <h2 className="text-2xl font-black text-brand-navy flex items-center gap-3">
            <User className="w-6 h-6 text-brand-blue" />
            Paramètres du Profil
          </h2>
          <p className="text-gray-500 font-medium mt-1">Gérez vos informations personnelles et vos préférences.</p>
        </div>
      </div>

      <div className="p-8 md:p-10">
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-[20px] flex items-start gap-4 text-red-600 animate-in fade-in zoom-in-95">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p className="text-[14px] font-bold leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 p-5 bg-green-50 border border-green-100 rounded-[20px] flex items-start gap-4 text-green-700 animate-in fade-in zoom-in-95">
            <Shield className="w-6 h-6 flex-shrink-0 text-green-600" />
            <p className="text-[14px] font-bold leading-relaxed">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-verylightblue to-brand-lightblue flex items-center justify-center text-brand-blue border-4 border-white shadow-lg overflow-hidden shrink-0">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black">{formData.first_name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-blue" /> Changer la photo de profil
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={loading}
                className="w-full px-6 py-3 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-blue file:text-white hover:file:bg-blue-700 cursor-pointer transition-all"
              />
              <p className="text-[11px] text-gray-500 font-medium ml-2">Sélectionnez une image sur votre appareil.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-blue" /> Prénom
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-blue" /> Nom
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-blue" /> Âge
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Ex: 35"
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-blue" /> Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
              />
              <p className="text-[11px] text-gray-500 font-medium ml-2">La modification de l'e-mail peut nécessiter une validation.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-blue" /> Numéro de téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+212 6 XX XX XX XX"
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-black text-[#1F2937] uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-blue" /> Adresse postale
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                placeholder="Entrez votre adresse complète..."
                className="w-full px-6 py-4 bg-[#F3F4F6] border-none rounded-[20px] focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#1F2937] resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-[#0066A1] text-white rounded-[24px] font-black text-[15px] shadow-xl shadow-[#0066A1]/30 hover:bg-[#005586] transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
