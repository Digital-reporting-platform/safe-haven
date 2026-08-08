import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  CheckCircle2,
  Heart,
  LogOut,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from './AppContext';
import '../styles/safehaven-footer.css';

// --- Main Footer Component ---
export function Footer() {
  const { t } = useTranslation();
  const { user } = useApp();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'am'>('en');

  const isSurvivor = user?.role === 'SURVIVOR';
  const isProfessional = [
    'COUNSELOR',
    'MEDICAL_PROFESSIONAL',
    'LEGAL_ADVISOR',
    'MODERATOR',
    'ADMIN',
  ].includes(user?.role || '');

  const toggleLanguage = () =>
    setLanguage((prev) => (prev === 'en' ? 'am' : 'en'));
  const handleSignOut = () => {
    navigate('/login');
  };

  return (
    <>
      <footer className="sh-footer" role="contentinfo">
        {/* Gradient Accent Line */}
        <div className="sh-footer-accent" />

        <div className="sh-footer-main">
          <div className="sh-footer-container">
            {/* Brand & Mission */}
            <div className="sh-footer-brand">
              <div className="brand-logo">
                <Shield className="logo-icon" />
                <span className="brand-name">SAFEHAVEN</span>
              </div>
              <p className="brand-tagline">
                {t('mainFooter.tagline')}
              </p>
              <div className="security-badge">
                <Lock className="h-3.5 w-3.5" />
                <span>{t('mainFooter.encryption')}</span>
                <Sparkles className="h-3 w-3" />
              </div>
            </div>

            {/* Quick Links */}
            <div className="sh-footer-section">
              <h4 className="section-title">{t('mainFooter.sections.platform')}</h4>
              <nav className="section-links">
                <Link to="/" className="footer-link">
                  <span>{t('mainFooter.links.home')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
                <Link to="/about" className="footer-link">
                  <span>{t('mainFooter.links.about')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
                {isSurvivor && (
                  <>
                    <Link to="/report" className="footer-link">
                      <span>{t('mainFooter.links.reportIncident')}</span>
                      <ArrowUpRight className="link-arrow" />
                    </Link>
                    <Link to="/survivor/my-cases" className="footer-link">
                      <span>{t('mainFooter.links.myCases')}</span>
                      <ArrowUpRight className="link-arrow" />
                    </Link>
                    <Link to="/resources" className="footer-link">
                      <span>{t('mainFooter.links.resources')}</span>
                      <ArrowUpRight className="link-arrow" />
                    </Link>
                  </>
                )}
                {isProfessional && (
                  <>
                    <Link to="/reports" className="footer-link">
                      <span>{t('mainFooter.links.cases')}</span>
                      <ArrowUpRight className="link-arrow" />
                    </Link>
                    <Link to="/counselor/audit" className="footer-link">
                      <span>{t('mainFooter.links.auditLogs')}</span>
                      <ArrowUpRight className="link-arrow" />
                    </Link>
                  </>
                )}
                {!isSurvivor && !isProfessional && (
                  <>
                    <Link to="/report" className="footer-link">
                      <span>{t('mainFooter.links.report')}</span>
                      <ArrowUpRight className="link-arrow" />
                    </Link>
                    <Link to="/support-services" className="footer-link">
                      <span>{t('mainFooter.links.support')}</span>
                      <ArrowUpRight className="link-arrow" />
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Resources & Support */}
            <div className="sh-footer-section">
              <h4 className="section-title">{t('mainFooter.sections.resources')}</h4>
              <nav className="section-links">
                <Link to="/missing-persons" className="footer-link">
                  <span>{t('mainFooter.links.missingPersons')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
                <Link to="/public-support-directory" className="footer-link">
                  <span>{t('mainFooter.links.supportDirectory')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
                <Link to="/recovery-hub" className="footer-link">
                  <span>{t('mainFooter.links.recoveryHub')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
                <Link to="/blog" className="footer-link">
                  <span>{t('mainFooter.links.blog')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
              </nav>
            </div>

            {/* Legal & Trust */}
            <div className="sh-footer-section">
              <h4 className="section-title">{t('mainFooter.sections.legal')}</h4>
              <nav className="section-links">
                <Link to="/privacy" className="footer-link">
                  <span>{t('mainFooter.links.privacyPolicy')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
                <Link to="/terms" className="footer-link">
                  <span>{t('mainFooter.links.termsOfService')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
                <Link to="/accessibility" className="footer-link">
                  <span>{t('mainFooter.links.accessibility')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
                <Link to="/transparency" className="footer-link">
                  <span>{t('mainFooter.links.transparency')}</span>
                  <ArrowUpRight className="link-arrow" />
                </Link>
              </nav>
              <div className="compliance-badges">
                <div className="badge-item">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t('mainFooter.compliance.wcag')}</span>
                </div>
                <div className="badge-item">
                  <Shield className="h-3.5 w-3.5" />
                  <span>{t('mainFooter.compliance.iso')}</span>
                </div>
              </div>
            </div>

                      </div>
        </div>

        {/* Bottom Bar */}
        <div className="sh-footer-bottom">
          <div className="sh-footer-container">
            <div className="bottom-content">
              <div className="copyright">
                <span className="brand-mark">SAFEHAVEN</span>
                <span className="separator">·</span>
                <span>{t('mainFooter.bottom.rights')}</span>
              </div>
              <div className="bottom-meta">
                <div className="meta-item">
                  <Heart className="h-3 w-3" />
                  <span>{t('mainFooter.bottom.builtFor')}</span>
                </div>
                {user && (
                  <button onClick={handleSignOut} className="logout-btn">
                    <LogOut className="h-3 w-3" />
                    <span>{t('mainFooter.bottom.signOut')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
