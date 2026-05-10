import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import ProfilePage from './pages/client/ProfilePage';
import SubmitContributionPage from './pages/client/SubmitContributionPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PetitionsPage from './pages/PetitionsPage';
import SurveysPage from './pages/SurveysPage';
import ConsultationsPage from './pages/ConsultationsPage';
import GuidePage from './pages/GuidePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Header and Footer */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="consultations" element={<ConsultationsPage />} />
          <Route path="petitions" element={<PetitionsPage />} />
          <Route path="sondages" element={<SurveysPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="client" element={<ProfilePage />} />
          <Route path="client/soumettre" element={<SubmitContributionPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />



        {/* Admin Routes */}
        <Route path="/administration-pfe-secure/login" element={<AdminLogin />} />
        <Route path="/administration-pfe-secure/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
