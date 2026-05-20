import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Globe, LogIn, LogOut, ChevronDown, Check, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [lang, setLang] = useState(i18n.language?.toUpperCase() || 'FR');
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-brand-blue bg-brand-lightblue/30 px-3 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
      : "text-gray-600 hover:text-brand-blue px-3 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap";
  };

  const notifRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    // Handle RTL and LTR
    const isRtl = i18n.language === 'AR';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    // Fetch latest "Traité" contributions
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('contributions')
          .select('id, title, updated_at')
          .eq('status', 'Traité')
          .order('updated_at', { ascending: false })
          .limit(4);

        if (!error && data) {
          setNotifications(data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des notifications:", err);
      }
    };

    fetchNotifications();

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifs(false);
      if (langRef.current && !langRef.current.contains(event.target)) setShowLang(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [i18n.language]);

  const changeLanguage = (newLang) => {
    i18n.changeLanguage(newLang);
    setLang(newLang);
    setShowLang(false);
  };

  const languages = [
    { code: 'FR', label: 'Français' },
    { code: 'AR', label: 'العربية' },
    { code: 'EN', label: 'English' }
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/Logo.png" alt="e-Participation Logo" className="h-42 w-auto object-contain" />
              <div className="hidden lg:block h-10 w-px bg-gray-300 mx-2"></div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t('header.agency')}</span>
                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">{t('header.participation')}</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6 lg:space-x-10 rtl:space-x-reverse">
            <Link to="/" className={getNavClass("/")}>
              {t('header.home')}
            </Link>

            <Link to="/consultations" className={getNavClass("/consultations")}>
              {t('header.consultations')}
            </Link>
            <Link to="/sondages" className={getNavClass("/sondages")}>
              {t('header.surveys')}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 lg:space-x-6 rtl:space-x-reverse">

            {/* Notification Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="text-gray-500 hover:text-brand-blue relative flex items-center justify-center p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-lightblue"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0.5 rtl:left-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-brand-navy">{t('header.notifications')}</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          {t('header.no_news')}
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-50">
                          {notifications.map((notif) => (
                            <li key={notif.id} className="p-4 hover:bg-brand-verylightblue/30 transition-colors cursor-pointer">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-green-600 text-xs font-bold">✓</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-brand-navy line-clamp-2">{notif.title}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notif.updated_at).toLocaleDateString(i18n.language === 'AR' ? 'ar-MA' : 'fr-FR')}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLang(!showLang)}
                className="flex items-center text-gray-600 text-sm font-medium hover:text-brand-blue transition-colors focus:outline-none p-1 rounded"
              >
                <span>{lang}</span>
                <Globe className="h-4 w-4 mx-1.5" />
                <ChevronDown className={`h-3 w-3 transition-transform ${showLang ? 'rotate-180' : ''}`} />
              </button>

              {showLang && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-3 w-40 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <ul className="py-1">
                    {languages.map((language) => (
                      <li key={language.code}>
                        <button
                          onClick={() => changeLanguage(language.code)}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-brand-verylightblue/50 transition-colors ${lang === language.code ? 'text-brand-blue font-bold bg-brand-verylightblue/20' : 'text-gray-700'}`}
                        >
                          {language.label}
                          {lang === language.code && <Check className="w-4 h-4" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={profile?.role === 'admin' ? '/administration-pfe-secure' : '/client'}
                  className="hidden md:flex flex-col items-end justify-center"
                >
                  <span className="text-sm font-bold text-brand-navy hover:text-brand-blue transition-colors whitespace-nowrap">
                    {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : user.email}
                  </span>
                </Link>

                <Link to={profile?.role === 'admin' ? '/administration-pfe-secure' : '/client'} className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-brand-verylightblue border-2 border-white shadow-sm flex items-center justify-center text-brand-blue font-black overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile?.first_name?.charAt(0) || user.user_metadata?.first_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-brand-blue text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {t('header.login')}
              </Link>
            )}
            
            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-brand-blue hover:bg-gray-150 rounded-xl transition-all focus:outline-none flex items-center justify-center border border-gray-100/50 shadow-sm"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md animate-in slide-in-from-top duration-300 shadow-md rounded-b-3xl">
            <div className="px-4 py-6 space-y-2">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-5 py-3.5 rounded-2xl text-[15px] font-black transition-all ${
                  location.pathname === '/' 
                    ? 'bg-brand-verylightblue text-brand-blue shadow-sm' 
                    : 'text-gray-650 hover:bg-gray-50 hover:text-brand-blue'
                }`}
              >
                {t('header.home')}
              </Link>
              <Link 
                to="/consultations" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-5 py-3.5 rounded-2xl text-[15px] font-black transition-all ${
                  location.pathname === '/consultations' 
                    ? 'bg-brand-verylightblue text-brand-blue shadow-sm' 
                    : 'text-gray-655 hover:bg-gray-50 hover:text-brand-blue'
                }`}
              >
                {t('header.consultations')}
              </Link>
              <Link 
                to="/sondages" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-5 py-3.5 rounded-2xl text-[15px] font-black transition-all ${
                  location.pathname === '/sondages' 
                    ? 'bg-brand-verylightblue text-brand-blue shadow-sm' 
                    : 'text-gray-655 hover:bg-gray-50 hover:text-brand-blue'
                }`}
              >
                {t('header.surveys')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
