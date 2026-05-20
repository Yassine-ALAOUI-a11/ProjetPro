import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, FileText, CheckCircle, Clock, LogOut, Search, Activity, Shield, TrendingUp, MoreHorizontal, ExternalLink, Calendar, Mail, User, Phone, MapPin, ChevronRight, Trash2, Eye, Download, X, AlertCircle, Bell, Plus, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sendCustomEmail } from '../../lib/brevo';

const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contributions');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [activeTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [showAddModal, setShowAddModal] = useState(null); // 'petition' or 'survey'
  const [newPetition, setNewPetition] = useState({ title: '', description: '', category: 'e-Gov', author_name: 'Administration ADD', goal_signatures: 5000 });
  const [newSurvey, setNewSurvey] = useState({ question: '', options: [{ text: '', votes: 0 }, { text: '', votes: 0 }], closing_date: '' });
  const [emailModal, setEmailModal] = useState({ isOpen: false, contribution: null, subject: '', body: '' });
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/administration-pfe-secure/login');
      return;
    }
    if (user.email !== 'hindpfe2002@gmail.com' || (profile && profile.role !== 'admin')) {
      signOut();
      return;
    }
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile, navigate, signOut]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: contribData, error: contribError } = await supabase
        .from('contributions')
        .select('*, profiles(first_name, last_name, id)')
        .order('created_at', { ascending: false });

      if (contribError) throw contribError;
      setContributions(contribData || []);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;
      setProfiles(profileData || []);

      const { data: surData } = await supabase
        .from('surveys')
        .select('*, survey_votes(*)')
        .order('created_at', { ascending: false });

      if (surData) {
        const formattedSurveys = surData.map(s => {
          const votes = s.survey_votes || [];
          return {
            ...s,
            total_votes: votes.length,
            options: s.options.map((opt, idx) => ({
              ...opt,
              votes: votes.filter(v => v.option_index === idx).length
            }))
          };
        });
        setSurveys(formattedSurveys);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('contributions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setContributions(contributions.map(c => c.id === id ? { ...c, status: newStatus } : c));
      setOpenMenuId(null);
      showNotification('Le statut a été mis à jour avec succès !', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Erreur lors de la mise à jour du statut.', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const openEmailModal = (contribution) => {
    const defaultSubject = `Suivi de votre contribution e-Participation - Réf: ${contribution.reference_number || 'N/A'}`;
    const citizenName = contribution.profiles
      ? `${contribution.profiles.first_name || ''} ${contribution.profiles.last_name || ''}`
      : `${contribution.email_contact?.split('@')[0] || 'Citoyen'}`;

    let defaultBody = `Bonjour ${citizenName},\n\nNous vous informons que votre contribution concernant "${contribution.title}" (Réf: ${contribution.reference_number || 'N/A'}) est en cours de traitement par les services de l'ADD.\n\nNous vous remercions pour votre contribution et votre engagement.\n\nCordialement,\nL'équipe e-Participation ADD`;

    if (contribution.status === 'Traité') {
      defaultBody = `Bonjour ${citizenName},\n\nNous nous réjouissons de vous informer que votre contribution concernant "${contribution.title}" (Réf: ${contribution.reference_number || 'N/A'}) a été traitée par les services de l'ADD.\n\nNous vous remercions pour votre intérêt pour le développement des services digitaux.\n\nCordialement,\nL'équipe e-Participation ADD`;
    }

    setEmailModal({
      isOpen: true,
      contribution,
      subject: defaultSubject,
      body: defaultBody
    });
    setOpenMenuId(null);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const citizenEmail = emailModal.contribution?.email_contact || emailModal.contribution?.profiles?.email || '';
      const citizenName = emailModal.contribution?.profiles
        ? `${emailModal.contribution.profiles.first_name || ''} ${emailModal.contribution.profiles.last_name || ''}`
        : 'Citoyen';

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; color: #334155; line-height: 1.6; }
            .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; background: #ffffff; }
            .logo { font-size: 20px; font-weight: 800; color: #0066A1; margin-bottom: 20px; }
            .message { background: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #edf2f7; white-space: pre-wrap; font-size: 14px; }
            .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">e-Participation ADD</div>
            <p>Bonjour <strong>${citizenName}</strong>,</p>
            <p>Un administrateur de la plateforme e-Participation a envoyé une réponse concernant votre dossier <strong>${emailModal.contribution?.reference_number || ''}</strong> :</p>
            <div class="message">${emailModal.body}</div>
            <div class="footer">
              Cet e-mail vous a été envoyé automatiquement suite au traitement de votre demande.<br>
              &copy; 2026 Agence de Développement Digital (ADD).
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await sendCustomEmail({
        toEmail: citizenEmail,
        toName: citizenName,
        subject: emailModal.subject,
        htmlContent: htmlBody
      });

      if (!result.success && !result.simulated) {
        throw new Error(result.error);
      }

      showNotification(`E-mail envoyé avec succès à ${citizenEmail} !`, 'success');
      setEmailModal({ isOpen: false, contribution: null, subject: '', body: '' });
    } catch (err) {
      console.error(err);
      showNotification(`Erreur lors de l'envoi de l'e-mail : ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format) => {
    const headers = ['Référence', 'Citoyen', 'Email', 'Téléphone', 'Ville', 'Pays', 'Age', 'Nature', 'Service concerné', 'Objet', 'Message', 'Statut', 'Date de création'];
    const rows = contributions.map(c => [
      c.reference_number || '',
      c.profiles ? `${c.profiles.first_name || ''} ${c.profiles.last_name || ''}` : 'Anonyme',
      c.email_contact || c.profiles?.email || '',
      c.phone_contact || c.profiles?.phone || '',
      c.city || '',
      c.country || '',
      c.age_at_submission || '',
      c.nature || c.type || '',
      c.project || '',
      c.title || '',
      c.description || '',
      c.status || '',
      new Date(c.created_at).toLocaleDateString()
    ]);

    if (format === 'csv') {
      let csvContent = '\uFEFF'; // UTF-8 BOM
      csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contributions_e_participation_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Export Excel (CSV) généré avec succès !', 'success');
    } else if (format === 'xls') {
      let tableHtml = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1">';
      tableHtml += '<tr>' + headers.map(h => `<th style="background-color: #0066A1; color: white; font-weight: bold;">${h}</th>`).join('') + '</tr>';
      rows.forEach(row => {
        tableHtml += '<tr>' + row.map(val => `<td>${String(val).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('') + '</tr>';
      });
      tableHtml += '</table></body></html>';

      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `contributions_e_participation_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Export Excel (XLS) généré avec succès !', 'success');
    }
    setShowExportMenu(false);
  };

  const handleDeleteContribution = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer la contribution',
      message: 'Êtes-vous sûr de vouloir supprimer cette contribution ? Cette action est irréversible et les données seront définitivement perdues.',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('contributions')
            .delete()
            .eq('id', id);

          if (error) throw error;
          setContributions(contributions.filter(c => c.id !== id));
          setOpenMenuId(null);
          showNotification('La contribution a été supprimée définitivement.', 'success');
        } catch (error) {
          console.error('Error deleting:', error);
          showNotification('Erreur lors de la suppression.', 'error');
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleAddPetition = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('petitions').insert([newPetition]).select();
      if (error) throw error;
      setPetitions([data[0], ...petitions]);
      setShowAddModal(null);
      setNewPetition({ title: '', description: '', category: 'e-Gov', author_name: 'Administration ADD', goal_signatures: 5000 });
      showNotification('e-Pétition créée avec succès !', 'success');
    } catch (err) {
      showNotification('Erreur lors de la création.', 'error');
    }
  };

  const handleDeletePetition = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer l\'e-pétition',
      message: 'Voulez-vous vraiment supprimer cette e-pétition ?',
      onConfirm: async () => {
        await supabase.from('petitions').delete().eq('id', id);
        setPetitions(petitions.filter(p => p.id !== id));
        showNotification('e-Pétition supprimée.', 'success');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleAddSurvey = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('surveys').insert([newSurvey]).select();
      if (error) throw error;
      setSurveys([data[0], ...surveys]);
      setShowAddModal(null);
      setNewSurvey({ question: '', options: [{ text: '', votes: 0 }, { text: '', votes: 0 }], closing_date: '' });
      showNotification('Sondage créé avec succès !', 'success');
    } catch (err) {
      showNotification('Erreur lors de la création.', 'error');
    }
  };

  const handleDeleteSurvey = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer le sondage',
      message: 'Voulez-vous vraiment supprimer ce sondage ?',
      onConfirm: async () => {
        await supabase.from('surveys').delete().eq('id', id);
        setSurveys(surveys.filter(s => s.id !== id));
        showNotification('Sondage supprimé.', 'success');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const generatePDF = async (contribution) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(22);
    doc.setTextColor(0, 102, 161);
    doc.text('Récapitulatif de Contribution', margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Référence : ${contribution.reference_number || 'N/A'}`, margin, y);
    y += 10;
    doc.text(`Date : ${new Date(contribution.created_at).toLocaleDateString()}`, margin, y);
    y += 15;

    doc.setDrawColor(0, 102, 161);
    doc.line(margin, y, 190, y);
    y += 15;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Informations du Citoyen', margin, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(`Nom : ${contribution.profiles?.first_name} ${contribution.profiles?.last_name}`, margin + 5, y);
    y += 7;
    doc.text(`E-mail : ${contribution.email_contact || contribution.profiles?.email || 'N/A'}`, margin + 5, y);
    y += 7;
    doc.text(`Téléphone : ${contribution.phone_contact || contribution.profiles?.phone || 'N/A'}`, margin + 5, y);
    y += 7;
    doc.text(`Ville : ${contribution.city || 'N/A'}`, margin + 5, y);
    y += 15;

    doc.setFontSize(14);
    doc.text('Détails de la Contribution', margin, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(`Nature : ${contribution.nature || contribution.type}`, margin + 5, y);
    y += 7;
    doc.text(`Objet : ${contribution.title}`, margin + 5, y);
    y += 10;

    doc.text('Message :', margin + 5, y);
    y += 7;
    const splitText = doc.splitTextToSize(contribution.description, 170);
    doc.text(splitText, margin + 10, y);

    doc.save(`Contribution_${contribution.reference_number || contribution.id}.pdf`);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const filteredContributions = contributions.filter(c =>
    (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.profiles?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.profiles?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
        <p className="text-brand-navy font-bold animate-pulse">Chargement du Studio Admin...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F7FA] flex flex-col lg:flex-row font-admin">

      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white border-b border-gray-150 p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/Logo.png" alt="e-Participation Logo" className="h-8 w-auto object-contain" />
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          <div>
            <span className="font-black text-[11.5px] text-brand-navy tracking-tight block uppercase">Admin Space</span>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-500 hover:text-brand-blue transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#061A40]/30 backdrop-blur-sm z-45 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Premium Sidebar */}
      <aside className={`w-72 bg-[#FAF9F6] border-r border-gray-150 flex flex-col fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="e-Participation Logo" className="h-24 w-auto object-contain" />
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-tight">ESPACE</span>
              <span className="text-[11px] font-black text-[#0066A1] uppercase tracking-wider block">ADMIN</span>
            </div>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-brand-navy"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-10 px-4 space-y-3">
          <p className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Navigation</p>
          <button
            onClick={() => { setActiveTab('contributions'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'contributions' ? 'bg-[#0066A1]/10 text-[#0066A1]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0066A1]'}`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <span>Contributions</span>
            </div>
            {contributions.filter(c => c.status === 'En attente').length > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'contributions' ? 'bg-[#0066A1] text-white' : 'bg-red-100 text-red-600'}`}>{contributions.filter(c => c.status === 'En attente').length}</span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setSelectedUser(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'users' ? 'bg-[#0066A1]/10 text-[#0066A1]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0066A1]'}`}
          >
            <Users className="w-5 h-5" />
            <span>Citoyens</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('surveys');
              setSelectedUser(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${activeTab === 'surveys' ? 'bg-[#0066A1]/10 text-[#0066A1]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0066A1]'}`}
          >
            <Activity className="w-5 h-5" />
            <span>Sondages</span>
          </button>
        </nav>

        <div className="p-4 bg-white border border-gray-150 mx-4 mb-8 rounded-[24px] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-black text-white shadow-md text-sm shrink-0">
              {profile?.first_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] font-black text-brand-navy truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Chef de Projet ADD</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 overflow-y-auto">

        {/* Page Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-[36px] font-black text-brand-navy tracking-tight">Tableau de bord</h1>
            <p className="text-[#6B7280] font-medium mt-1">Gérez les demandes citoyennes et l'activité de la plateforme.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 px-4">
              <Calendar className="w-4 h-4 text-brand-blue" />
              <span className="text-sm font-bold text-brand-navy">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Modern KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Total Dossiers', val: contributions.length, icon: FileText, color: 'text-brand-blue', bg: 'bg-[#EBF5FB]' },
            { label: 'En attente', val: contributions.filter(c => c.status === 'En attente').length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Traité', val: contributions.filter(c => c.status === 'Traité').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Citoyens', val: profiles.length, icon: Users, color: 'text-brand-purple', bg: 'bg-purple-50' }
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-brand-blue/5 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-brand-navy">{kpi.val}</h3>
            </div>
          ))}
        </div>

        {activeTab === 'contributions' && (
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30">
              <h2 className="text-2xl font-black text-brand-navy flex items-center gap-3">
                <Activity className="w-6 h-6 text-brand-blue" />
                Liste des demandes
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-md shadow-green-600/15 w-full md:w-auto justify-center"
                  >
                    <Download className="w-4 h-4" /> Exporter Excel
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <button onClick={() => exportData('xls')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-bold text-brand-navy flex items-center gap-2">
                        <span>Format Excel (.xls)</span>
                      </button>
                      <button onClick={() => exportData('csv')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-bold text-brand-navy flex items-center gap-2">
                        <span>Format CSV (.csv)</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher une demande ou un citoyen..."
                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-blue focus:border-transparent shadow-sm transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#9CA3AF] text-[11px] font-black uppercase tracking-[3px]">
                    <th className="px-10 py-6">Contribution & Citoyen</th>
                    <th className="px-10 py-6">Détails de la demande</th>
                    <th className="px-10 py-6">Statut de traitement</th>
                    <th className="px-10 py-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContributions.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-verylightblue to-brand-lightblue text-brand-blue flex items-center justify-center text-sm font-black shadow-inner">
                            {c.profiles?.first_name?.charAt(0) || c.email_contact?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-[15px] font-black text-brand-navy leading-tight">
                              {c.profiles?.first_name || c.profiles?.last_name
                                ? `${c.profiles.first_name || ''} ${c.profiles.last_name || ''}`
                                : (c.email_contact || 'Citoyen Anonyme')}
                            </p>
                            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{c.nature || c.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-[15px] font-black text-brand-navy truncate max-w-md group-hover:text-brand-blue transition-colors">{c.title}</p>
                        <p className="text-[13px] text-gray-400 mt-1 line-clamp-1">{c.description}</p>
                        {c.file_url && (
                          <a
                            href={c.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 text-[11px] font-black text-brand-blue uppercase tracking-widest hover:bg-brand-verylightblue px-3 py-1.5 rounded-lg transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" /> Pièce jointe
                          </a>
                        )}
                      </td>
                      <td className="px-10 py-8">
                        <div className="relative">
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            className={`w-full appearance-none px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest cursor-pointer transition-all border-none focus:ring-2 focus:ring-offset-2
                              ${c.status === 'Traité' ? 'bg-green-100 text-green-700 focus:ring-green-500' :
                                c.status === 'En cours de traitement' ? 'bg-brand-lightblue text-brand-blue focus:ring-brand-blue' :
                                  'bg-gray-100 text-gray-600 focus:ring-gray-300'}`}
                          >
                            <option value="En attente">En attente</option>
                            <option value="En cours de traitement">En cours</option>
                            <option value="Traité">Traité</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                          className="p-3 hover:bg-white rounded-xl text-gray-400 hover:text-brand-navy transition-all shadow-sm hover:shadow-md border border-transparent hover:border-gray-100"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {openMenuId === c.id && (
                          <div className="absolute right-10 top-20 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[100] animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => setSelectedContribution(c)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-brand-verylightblue transition-colors"
                            >
                              <Eye className="w-4 h-4 text-brand-blue" /> Voir les détails
                            </button>
                            <button
                              onClick={() => generatePDF(c)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-brand-verylightblue transition-colors"
                            >
                              <Download className="w-4 h-4 text-brand-purple" /> Générer PDF
                            </button>
                            <button
                              onClick={() => openEmailModal(c)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-brand-verylightblue transition-colors"
                            >
                              <Mail className="w-4 h-4 text-brand-blue" /> Envoyer un e-mail
                            </button>
                            <div className="h-px bg-gray-50 my-2"></div>
                            <p className="px-5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Changer le statut</p>
                            <button
                              onClick={() => handleStatusChange(c.id, 'En attente')}
                              className="w-full flex items-center gap-3 px-5 py-2 text-sm font-bold text-gray-700 hover:bg-brand-verylightblue transition-colors"
                            >
                              <Clock className="w-4 h-4 text-orange-400" /> En attente
                            </button>
                            <button
                              onClick={() => handleStatusChange(c.id, 'En cours de traitement')}
                              className="w-full flex items-center gap-3 px-5 py-2 text-sm font-bold text-gray-700 hover:bg-brand-verylightblue transition-colors"
                            >
                              <Activity className="w-4 h-4 text-brand-blue" /> En cours
                            </button>
                            <button
                              onClick={() => handleStatusChange(c.id, 'Traité')}
                              className="w-full flex items-center gap-3 px-5 py-2 text-sm font-bold text-gray-700 hover:bg-brand-verylightblue transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" /> Traité
                            </button>
                            <div className="h-px bg-gray-50 my-2"></div>
                            <button
                              onClick={() => handleDeleteContribution(c.id)}
                              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && !selectedUser && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {profiles.filter(p => p.role === 'client').map(p => (
                <div key={p.id} className="relative bg-white rounded-[32px] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-brand-blue/10 hover:-translate-y-2 transition-all duration-500 group overflow-hidden flex flex-col">
                  {/* Decorative Header Background */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-brand-navy to-[#0066A1] opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
                  </div>
                  
                  <div className="p-8 pt-16 relative flex flex-col flex-1 text-center items-center">
                    {/* Avatar */}
                    <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-xl mb-5 group-hover:scale-105 transition-transform duration-500 shrink-0">
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-3xl font-black text-brand-navy overflow-hidden">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          p.first_name?.charAt(0) || 'U'
                        )}
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <h3 className="text-xl font-black text-brand-navy mb-1 tracking-tight">{p.first_name} {p.last_name}</h3>
                    <div className="inline-flex items-center px-3 py-1 bg-brand-verylightblue text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                      Citoyen Digital
                    </div>

                    <div className="w-full space-y-4 pt-6 border-t border-gray-50 flex-1">
                      <div className="flex items-center justify-center gap-3 text-[13px] text-gray-600 font-medium">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-verylightblue group-hover:text-brand-blue transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="truncate">{p.email || 'Email non fourni'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-[13px] text-gray-600 font-medium">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-verylightblue group-hover:text-brand-blue transition-colors">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span>{new Date(p.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedUser(p)}
                      className="mt-8 w-full py-4 relative overflow-hidden rounded-2xl group/btn transition-all"
                    >
                      <div className="absolute inset-0 bg-brand-navy group-hover/btn:bg-brand-blue transition-colors"></div>
                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover/btn:translate-x-full duration-1000 ease-in-out transition-all"></div>
                      <span className="relative z-10 font-black text-[12px] text-white uppercase tracking-widest flex items-center justify-center gap-2">
                        Consulter le profil
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && selectedUser && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-2 text-gray-500 hover:text-brand-blue font-bold transition-colors mb-8"
            >
              <ChevronRight className="w-5 h-5 rotate-180" /> Retour à la liste des citoyens
            </button>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-brand-navy to-brand-blue p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-4xl font-black text-brand-blue border-4 border-white/20 shadow-2xl overflow-hidden shrink-0">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      selectedUser.first_name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="text-center md:text-left text-white">
                    <h2 className="text-3xl font-black mb-2">{selectedUser.first_name} {selectedUser.last_name}</h2>
                    <p className="text-brand-lightblue font-medium flex items-center justify-center md:justify-start gap-2">
                      <Shield className="w-4 h-4" /> Citoyen Vérifié
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-12">
                <h3 className="text-xl font-black text-brand-navy mb-8 flex items-center gap-3">
                  <User className="w-6 h-6 text-brand-blue" />
                  Informations Personnelles
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">E-mail</p>
                    <p className="text-[15px] font-bold text-brand-navy flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-blue" /> {selectedUser.email || 'Non renseigné'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Téléphone</p>
                    <p className="text-[15px] font-bold text-brand-navy flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-blue" /> {selectedUser.phone || 'Non renseigné'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Âge</p>
                    <p className="text-[15px] font-bold text-brand-navy flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-blue" /> {selectedUser.age ? `${selectedUser.age} ans` : 'Non renseigné'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 md:col-span-2 lg:col-span-3">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Adresse complète</p>
                    <p className="text-[15px] font-bold text-brand-navy flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                      {selectedUser.address || 'Non renseignée'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-12 border-t border-gray-100">
                  {/* Dossiers Section */}
                  <div>
                    <h3 className="text-xl font-black text-brand-navy mb-8 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-brand-blue" />
                      Dossiers soumis ({contributions.filter(c => c.user_id === selectedUser.id || (selectedUser.email && c.email_contact === selectedUser.email)).length})
                    </h3>

                    <div className="space-y-4">
                      {contributions.filter(c => c.user_id === selectedUser.id || (selectedUser.email && c.email_contact === selectedUser.email)).length === 0 ? (
                        <p className="text-gray-500 font-medium italic p-6 bg-gray-50 rounded-2xl text-center text-sm">Aucun dossier soumis.</p>
                      ) : (
                        contributions.filter(c => c.user_id === selectedUser.id || (selectedUser.email && c.email_contact === selectedUser.email)).map(c => (
                          <div key={c.id} className="p-5 bg-white border border-gray-100 rounded-2xl flex justify-between items-center shadow-sm">
                            <div>
                              <span className="px-2 py-0.5 bg-brand-lightblue/30 text-brand-blue text-[9px] font-black uppercase tracking-wider rounded mb-1 inline-block">{c.nature || c.type}</span>
                              <h4 className="font-bold text-brand-navy text-sm">{c.title}</h4>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${c.status === 'Traité' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                              {c.status}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Participation Section */}
                  <div>
                    <h3 className="text-xl font-black text-brand-navy mb-8 flex items-center gap-3">
                      <Activity className="w-6 h-6 text-brand-purple" />
                      Participation Citoyenne
                    </h3>

                    <div className="space-y-6">

                      {/* Survey Votes */}
                      <div className="pt-4">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Votes aux sondages</p>
                        {surveys.length === 0 ? (
                          <p className="text-gray-400 text-xs italic">Aucune participation.</p>
                        ) : (
                          <div className="space-y-3">
                            {surveys.slice(0, 2).map(s => (
                              <div key={s.id} className="p-4 bg-green-50/50 border border-green-100 rounded-2xl flex justify-between items-center">
                                <span className="text-[12px] font-bold text-brand-navy truncate pr-4">{s.question}</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">A voté</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {activeTab === 'surveys' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-brand-navy">Gestion des Sondages</h2>
              <button
                onClick={() => setShowAddModal('survey')}
                className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
              >
                <Plus className="w-5 h-5" /> Nouveau Sondage
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {surveys.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h3 className="text-base font-black text-brand-navy leading-tight">{s.question}</h3>
                      <button onClick={() => handleDeleteSurvey(s.id)} className="text-gray-400 hover:text-red-500 shrink-0 mt-0.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-3">
                      {s.options.map((opt, idx) => {
                        const percentage = s.total_votes > 0 ? Math.round((opt.votes / s.total_votes) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span className="text-gray-650">{opt.text}</span>
                              <span className="text-brand-blue font-black">{opt.votes} votes ({percentage}%)</span>
                            </div>
                            <div className="w-full h-1 bg-gray-55 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-blue rounded-full opacity-70" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Users className="w-3.5 h-3.5" /> {s.total_votes} participants au total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Détails Contribution */}
        {selectedContribution && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={() => setSelectedContribution(null)}></div>
            <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-brand-navy to-brand-blue p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black mb-1">Détails du Dossier</h3>
                  <p className="text-brand-lightblue font-medium text-sm">Réf : {selectedContribution.reference_number || 'N/A'}</p>
                </div>
                <button onClick={() => setSelectedContribution(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-12 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Informations Citoyen</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-verylightblue text-brand-blue flex items-center justify-center font-black">
                        {selectedContribution.profiles?.first_name?.charAt(0) || selectedContribution.email_contact?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-black text-brand-navy">
                          {selectedContribution.profiles?.first_name || selectedContribution.profiles?.last_name
                            ? `${selectedContribution.profiles.first_name || ''} ${selectedContribution.profiles.last_name || ''}`
                            : 'Citoyen Anonyme'}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">{selectedContribution.email_contact || 'Email non fourni'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-brand-blue" /> {selectedContribution.phone_contact || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-brand-blue" /> {selectedContribution.city || 'N/A'}, {selectedContribution.country || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-brand-blue" /> {selectedContribution.age_at_submission || 'N/A'} ans
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Détails de la demande</h4>
                    <div>
                      <p className="text-[11px] font-black text-brand-blue uppercase mb-1">Nature / Projet</p>
                      <p className="font-bold text-brand-navy">{selectedContribution.nature || selectedContribution.type} {selectedContribution.project ? `- ${selectedContribution.project}` : ''}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-brand-blue uppercase mb-1">Objet</p>
                      <p className="font-bold text-brand-navy">{selectedContribution.title}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-brand-blue uppercase mb-1">Statut actuel</p>
                      <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mt-1
                        ${selectedContribution.status === 'Traité' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {selectedContribution.status}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4 pt-6">
                    <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Message détaillé</h4>
                    <div className="bg-gray-50 p-6 rounded-3xl text-brand-navy leading-relaxed font-medium">
                      {selectedContribution.description}
                    </div>
                  </div>

                  {selectedContribution.file_url && (
                    <div className="md:col-span-2">
                      <a
                        href={selectedContribution.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-brand-verylightblue text-brand-blue rounded-2xl font-black text-sm hover:bg-brand-blue hover:text-white transition-all"
                      >
                        <Download className="w-5 h-5" /> Télécharger la pièce jointe
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center gap-4">
                <button
                  onClick={() => {
                    const c = selectedContribution;
                    setSelectedContribution(null);
                    openEmailModal(c);
                  }}
                  className="px-8 py-3 bg-brand-blue text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-brand-blue/20"
                >
                  <Mail className="w-4 h-4" /> Répondre par e-mail
                </button>
                <button
                  onClick={() => generatePDF(selectedContribution)}
                  className="px-8 py-3 bg-brand-purple text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-brand-purple/20"
                >
                  <Download className="w-4 h-4" /> Exporter en PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-[100] p-4 pr-8 rounded-2xl bg-white border border-gray-150 shadow-2xl flex items-center gap-3.5 animate-in slide-in-from-right-10 duration-500 overflow-hidden">
          {/* Colored Accent strip on the left */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <div className={`p-2 rounded-xl ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-black text-sm text-brand-navy leading-tight">{notification.message}</p>
          </div>
          {/* Closing line timer animation */}
          <div
            className={`absolute bottom-0 left-0 h-1 ${notification.type === 'success' ? 'bg-emerald-500/30' : 'bg-red-500/30'} animate-shrink-width`}
            style={{ animationDuration: '4000ms', animationTimingFunction: 'linear', animationFillMode: 'forwards' }}
          />
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}></div>
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-brand-navy mb-3">{confirmDialog.title}</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">{confirmDialog.message}</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black text-sm transition-all border border-gray-150">Annuler</button>
                <button onClick={confirmDialog.onConfirm} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-500/20 transition-all">Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EMAIL COMPOSER */}
      {emailModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md" onClick={() => setEmailModal({ isOpen: false, contribution: null, subject: '', body: '' })}></div>
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-brand-blue p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <h2 className="text-2xl font-black">Envoyer un e-mail de suivi</h2>
              </div>
              <button onClick={() => setEmailModal({ isOpen: false, contribution: null, subject: '', body: '' })} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSendEmail} className="p-10 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Destinataire</label>
                <input
                  disabled
                  type="text"
                  value={emailModal.contribution?.email_contact || emailModal.contribution?.profiles?.email || 'Citoyen'}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Sujet de l'e-mail</label>
                <input
                  required
                  type="text"
                  value={emailModal.subject}
                  onChange={e => setEmailModal({ ...emailModal, subject: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-brand-navy focus:ring-2 focus:ring-brand-blue outline-none"
                  placeholder="Sujet..."
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Message</label>
                <textarea
                  required
                  rows={8}
                  value={emailModal.body}
                  onChange={e => setEmailModal({ ...emailModal, body: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-brand-navy focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                  placeholder="Écrivez votre message ici..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-brand-blue text-white rounded-3xl font-black text-lg shadow-xl shadow-brand-blue/30 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer l\'e-mail'}
              </button>
            </form>
          </div>
        </div>
      )}



      {/* MODAL ADD SURVEY */}
      {showAddModal === 'survey' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md" onClick={() => setShowAddModal(null)}></div>
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-green-600 p-5 text-white flex justify-between items-center">
              <h2 className="text-base font-black uppercase tracking-wider">Nouveau Sondage</h2>
              <button onClick={() => setShowAddModal(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSurvey} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Question du sondage</label>
                <input required type="text" value={newSurvey.question} onChange={e => setNewSurvey({ ...newSurvey, question: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-brand-navy focus:border-green-600 focus:bg-white outline-none transition-colors" placeholder="Ex: Que pensez-vous de...?" />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Options de réponse</label>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {newSurvey.options.map((opt, idx) => (
                    <input key={idx} required type="text" value={opt.text} onChange={e => {
                      const newOpts = [...newSurvey.options];
                      newOpts[idx].text = e.target.value;
                      setNewSurvey({ ...newSurvey, options: newOpts });
                    }} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg font-bold text-xs text-brand-navy focus:border-green-600 focus:bg-white outline-none transition-colors" placeholder={`Option ${idx + 1}`} />
                  ))}
                </div>
                <button type="button" onClick={() => setNewSurvey({ ...newSurvey, options: [...newSurvey.options, { text: '', votes: 0 }] })} className="text-green-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">+ Ajouter une option</button>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Date de clôture</label>
                <input required type="date" value={newSurvey.closing_date} onChange={e => setNewSurvey({ ...newSurvey, closing_date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm text-brand-navy focus:border-green-600 focus:bg-white outline-none transition-colors" />
              </div>
              <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-green-600/10 hover:bg-green-700 transition-all">Publier le sondage</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
