import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <footer className="bg-[#041029] text-gray-300 py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          {/* Column 1: Logo & Desc */}
          <div className="md:col-span-1">
            <div className="flex-shrink-0 flex items-center gap-4 mb-6">
              <Link to="/" className="flex items-center gap-3">
                <img src="/Logo.png" alt="e-Participation Logo" className="h-44 w-auto object-contain" />
              </Link>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-wide">{t('footer.platform')}</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-blue"></span> {t('footer.home')}</Link></li>
              <li><Link to="/consultations" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-blue"></span> {t('footer.consultations')}</Link></li>
              <li><Link to="/sondages" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-blue"></span> {t('footer.surveys')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Participate */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-wide">{t('footer.participate')}</h4>
            <ul className="space-y-4">
              <li><Link to="/client/soumettre" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-purple"></span> {t('footer.submit_idea')}</Link></li>
              <li><Link to="/client" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-purple"></span> {t('footer.my_space')}</Link></li>
              <li><Link to="/guide" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-brand-purple"></span> {t('footer.guide')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Legal */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg tracking-wide">{t('footer.legal')}</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:outazguihind@gmail.com" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  outazguihind@gmail.com
                </a>
              </li>
              <li><Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gray-500"></span> {t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gray-500"></span> {t('footer.privacy')}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-gray-500">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
