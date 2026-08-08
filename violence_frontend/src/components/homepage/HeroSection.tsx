import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  ArrowRight,
  Shield,
  Menu,
  X,
  Globe,
  Lock,
  Eye,
  Heart,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import heroImage from '../../assets/hero-community.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useApp } from '../AppContext';

export default function HeroSection() {
  const { theme, setTheme } = useTheme();
  const { user } = useApp();
  const { t, i18n } = useTranslation();
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();

  // Update words array when language changes
  const words = [
    t('hero.words.voice'),
    t('hero.words.story'),
    t('hero.words.hope'),
    t('hero.words.power')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const navBg = scrollY > 50 ? 'rgba(253, 253, 245, 0.98)' : 'transparent';
  const textColor = scrollY > 50 ? '#2f3126' : 'white';
  const textColorSecondary = scrollY > 50 ? '#4e5241' : 'rgba(255, 255, 255, 0.6)';

  // Dynamic colors based on theme
  const dynamicBg = theme === 'dark' ? 'bg-[var(--color-background)]' : 'bg-black';
  const dynamicTextColor = theme === 'dark' ? 'text-[var(--color-foreground)]' : 'text-white';
  const dynamicTextColorSecondary = theme === 'dark' ? 'text-[var(--color-foreground)]/60' : 'text-white/60';

  return (
    <section className={`relative min-h-screen w-full overflow-hidden ${dynamicBg}`}>
      {/* Dynamic Background with Mouse Parallax */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
            transform: `scale(1.1) translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[var(--color-background)]/40' : 'bg-[#062d46]/85'}`} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(193,91,62,0.2) 0%, transparent 50%, rgba(221,161,94,0.15) 100%)',
          }}
        />
      </div>

      {/* Animated Geometric Shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 h-64 w-64 rotate-45 border border-white/10"
          animate={{ rotate: [45, 135, 45] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-40 left-10 h-32 w-32 rounded-full border border-[#C15B3E]/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 h-2 w-2 rounded-full bg-[#DDA15E]"
          animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 h-2 w-2 rounded-full bg-[#C15B3E]"
          animate={{ y: [0, 100, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 right-0 left-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: navBg,
          backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C15B3E]"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Shield className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-sm font-bold tracking-widest" style={{ color: textColor }}>
                SAFEHAVEN
              </span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {[
                { label: t('navigation.home'), to: '/' },
                { label: t('navigation.report'), to: '/report' },
                { label: t('navigation.missing'), to: '/missing-persons' },
                { label: t('navigation.support'), to: '/support-services' }
              ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-xs tracking-widest transition-colors hover:text-[#C15B3E] bg-transparent border-0 cursor-pointer uppercase"
                    style={{ color: textColorSecondary }}
                  >
                    {item.label}
                  </Link>
              ))}
              <button
                onClick={() => {
                  const newLang = i18n.language === 'en' ? 'am' : 'en';
                  i18n.changeLanguage(newLang);
                  localStorage.setItem('preferred_language', newLang);
                }}
                className="flex items-center gap-1 text-xs"
                style={{ color: textColorSecondary }}
              >
                <Globe className="h-3 w-3" /> {i18n.language === 'en' ? 'ENG' : 'አማ'}
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-1 text-xs"
                style={{ color: textColorSecondary }}
                title="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-3 w-3" />
                ) : (
                  <Moon className="h-3 w-3" />
                )}
              </button>
              {!user && (
                <motion.button
                  onClick={() => navigate('/auth/login')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-full bg-[#C15B3E] px-4 py-2 text-xs font-bold tracking-wider text-white transition-colors hover:bg-[#8c3e2b]"
                >
                  {t('common.login')}
                </motion.button>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20"
              style={{ color: textColor }}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] md:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 z-[60] md:hidden flex flex-col"
            style={{
              width: 'min(320px, 85vw)',
              height: '100dvh',
              background: '#FDFDF5',
              borderLeft: '1px solid #E8E7E0',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-[#E8E7E0]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C15B3E]">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold tracking-widest text-[#2f3126]">SAFEHAVEN</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#E8E7E0] bg-transparent text-[#6B705C] hover:text-[#C15B3E] hover:bg-[#F7F3E6] hover:border-[#C15B3E] transition-all"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Role label */}
            <div className="px-5 pt-4 pb-1 text-[9px] font-black tracking-[0.15em] text-[#C15B3E] uppercase">
              {t('hero.guestAccess')}
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-3 pb-2">
              {[
                { label: t('navigation.home'), to: '/' },
                { label: t('navigation.report'), to: '/report' },
                { label: t('navigation.missing'), to: '/missing-persons' },
                { label: t('navigation.support'), to: '/support-services' },
              ].map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setTimeout(() => navigate(item.to), 100);
                  }}
                  className="flex items-center w-full px-3 py-[0.85rem] text-base font-bold lowercase tracking-wide text-[#6B705C] hover:text-[#C15B3E] hover:bg-[#C15B3E]/8 rounded-lg transition-all border-l-[3px] border-transparent hover:border-[#C15B3E] text-left"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-5 my-2 h-px bg-[#E8E7E0]" />

            {/* Action icons row */}
            <div className="flex items-center gap-3 px-5 py-3 flex-wrap">
              <button
                onClick={() => {
                  const newLang = i18n.language === 'en' ? 'am' : 'en';
                  i18n.changeLanguage(newLang);
                  localStorage.setItem('preferred_language', newLang);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E8E7E0] bg-transparent text-[#6B705C] hover:text-[#C15B3E] hover:bg-[#F7F3E6] hover:border-[#C15B3E] transition-all text-xs font-bold"
              >
                <Globe className="h-3.5 w-3.5" />
                {i18n.language === 'en' ? 'ENG' : 'አማ'}
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E8E7E0] bg-transparent text-[#6B705C] hover:text-[#C15B3E] hover:bg-[#F7F3E6] hover:border-[#C15B3E] transition-all text-xs"
                title="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-[#6B705C]" />
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="mx-5 my-2 h-px bg-white/10" />

            {/* Login / user section */}
            <div className="px-5 pb-8 pt-2">
              {!user ? (
                <motion.button
                  onClick={() => { setIsMenuOpen(false); setTimeout(() => navigate('/auth/login'), 100); }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C15B3E] to-[#8c3e2b] px-6 py-3 text-sm font-bold tracking-wider text-white shadow-lg shadow-[#C15B3E]/30 hover:from-[#8c3e2b] hover:to-[#C15B3E] transition-all"
                >
                  Login
                </motion.button>
              ) : (
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C15B3E]/20 border border-[#C15B3E]/30">
                    <span className="text-xs font-black text-[#C15B3E]">
                      {user.firstName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-[#C15B3E]/70 uppercase tracking-widest">Logged in</div>
                    <div className="text-xs font-bold text-[#3D4035]">{user.firstName}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creative Hero Content */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 pt-20 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-7xl">
          {/* Asymmetric Typography Layout */}
          <div className="mb-12 grid grid-cols-12 items-end gap-4">
            {/* YOUR - Left aligned */}
            <motion.div
              className="col-span-12 md:col-span-5"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-[15vw] leading-[0.8] font-black tracking-tighter text-white md:text-[10vw] lg:text-[8vw]">
                {t('hero.your')}
              </h1>
            </motion.div>

            {/* Animated Word - Right side with gradient */}
            <motion.div
              className="col-span-12 flex items-end md:col-span-7"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ y: 50, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -50, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-[#C15B3E] via-[#DDA15E] to-[#f54070] bg-clip-text text-[15vw] leading-[0.8] font-black tracking-tighter text-transparent md:text-[10vw] lg:text-[8vw]"
                >
                  {words[currentWord]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* MATTERS - Full width with stroke effect */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <h1
              className="text-[20vw] leading-[0.75] font-black tracking-tighter md:text-[14vw]"
              style={{
                WebkitTextStroke: '2px rgba(193,91,62,0.4)',
                color: 'transparent',
              }}
            >
              {t('hero.matters')}
            </h1>
          </motion.div>

          {/* Bottom Section - Description and CTAs */}
          <div className="grid grid-cols-12 items-end gap-8">
            {/* Left - Description */}
            <motion.div
              className="col-span-12 md:col-span-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p className="mb-8 max-w-sm text-lg leading-relaxed text-white/60">
                {t('hero.description')}
                <span className="text-white">
                  {' '}
                  {t('hero.descriptionHighlight')}
                </span>
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Lock, text: t('hero.features.encrypted') },
                  { icon: Eye, text: t('hero.features.anonymous') },
                  { icon: Heart, text: t('hero.features.support') },
                ].map((tag, i) => (
                  <motion.div
                    key={tag.text}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                  >
                    <tag.icon className="h-3 w-3 text-[#C15B3E]" />
                    <span className="text-xs text-white/70">{tag.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="col-span-12 flex items-end md:col-span-7"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/report')}
                  className="group relative h-14 overflow-hidden rounded-full border-0 bg-gradient-to-r from-[#C15B3E] to-[#8c3e2b] px-10 text-sm font-bold tracking-wider text-white shadow-lg shadow-[#C15B3E]/30 transition-all duration-300 hover:from-[#8c3e2b] hover:to-[#C15B3E] hover:shadow-[#C15B3E]/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t('hero.cta.startReport')}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                  </span>
                </Button>
              </motion.div>
            </motion.div>
              <Link to="/resources">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="group h-14 rounded-full border border-white/20 bg-white/5 px-10 text-sm font-bold tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:border-[#C15B3E]/50 hover:bg-white/10 hover:text-[#C15B3E]"
                  >
                    {t('hero.cta.exploreResources')}
                  </Button>
                </motion.div>
              </Link>
          </div>

          {/* Bottom Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-20 flex items-center justify-between border-t border-white/10 pt-8"
          >
            <div className="flex gap-12">
              {[
                { num: '100%', label: t('hero.stats.anonymous') },
                { num: '24/7', label: t('hero.stats.available') },
                { num: '0', label: t('hero.stats.compromises') },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {stat.num}
                  </div>
                  <div className="text-[10px] tracking-widest text-white/40 uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Plus className="h-6 w-6 text-[#C15B3E]/40" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
