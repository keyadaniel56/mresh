import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, Sparkles, Heart, Star, Calendar, MessageSquare, 
  BookOpen, ChevronRight, User, Shield, LogOut, Check, Phone, 
  Mail, MapPin, Smartphone, Gift, Award, Info, AlertCircle, Eye, EyeOff, Loader, Palette, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BookingModal from './components/BookingModal';
import ChatPanel from './components/ChatPanel';
import ReviewsSection from './components/ReviewsSection';
import BlogSection from './components/BlogSection';
import AdminDashboard from './components/AdminDashboard';
import OwnerAuthPage from './components/OwnerAuthPage';
import StyleQuiz from './components/StyleQuiz';
import BeforeAfter from './components/BeforeAfter';
import Testimonials from './components/Testimonials';
import ShareModal from './components/ShareModal';
import { Service, User as UserType, GalleryItem } from './types';
import { getApiUrl } from './lib/api';
import { seasonalPalettes, getCurrentMonthPalette, SeasonalTheme, applySeasonalThemeToDom } from './lib/seasonalThemes';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.985,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    }
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.985,
    filter: 'blur(4px)',
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    }
  }
};

const galleryContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const galleryItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 28, 
    scale: 0.94,
    filter: 'blur(4px)'
  },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: 'blur(0px)',
    transition: { 
      duration: 0.5, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

const serviceGridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03
    }
  }
};

const serviceCardVariants = {
  hidden: { 
    opacity: 0, 
    y: 24, 
    scale: 0.96
  },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.45, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export default function App() {
  // Navigation & Category states
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'gallery' | 'journal' | 'reviews' | 'admin'>('home');
  const [serviceCategory, setServiceCategory] = useState<'all' | 'hair' | 'nails' | 'skincare' | 'makeup'>('all');
  const [galleryCategory, setGalleryCategory] = useState<'all' | 'hair' | 'nails' | 'skincare' | 'makeup'>('all');
  const [showRateCard, setShowRateCard] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [shareGalleryData, setShareGalleryData] = useState<{ title: string; text?: string; url?: string } | null>(null);

  // Seasonal Palette state (subtly adjusts accent based on current month)
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const activeTheme: SeasonalTheme = seasonalPalettes[selectedMonth] || seasonalPalettes[currentMonthIndex];

  useEffect(() => {
    applySeasonalThemeToDom(activeTheme);
  }, [selectedMonth, activeTheme]);

  const heroSlides = [
    {
      img: '/images/african_silk_press_1785327747183.jpg',
      title: 'Luxury Silk Press & Blowout',
      subtitle: 'Glass-like bounce and thermal shine protection'
    },
    {
      img: '/images/butterfly_locs_1784461341414.jpg',
      title: 'Signature Butterfly Locs',
      subtitle: 'Bohemian-textured distressed faux locs'
    },
    {
      img: '/images/knotless_braids_1784461356341.jpg',
      title: 'Knotless Box Braids',
      subtitle: 'Tension-free, featherlight parting perfection'
    },
    {
      img: '/images/fulani_braids_afro_1784461381991.jpg',
      title: 'Fulani Tribal Braids',
      subtitle: 'Adorned with gorgeous shells and beads'
    },
    {
      img: '/images/pink_flower_nails_1784461367686.jpg',
      title: 'French-Tip Floral Nails',
      subtitle: 'Elegant hand-painted pink cherry blossom acrylics'
    }
  ];

  useEffect(() => {
    if (activeTab !== 'home') return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeTab, heroSlides.length]);

  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem('mresh_token'));
  const [user, setUser] = useState<UserType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Core Service Data
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Core Gallery Data
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Fetch gallery items
  const fetchGallery = async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/gallery'));
      if (res.ok) {
        const data = await res.json();
        setGalleryItems(data);
      }
    } catch (e) {
      console.error('Error fetching gallery:', e);
    } finally {
      setGalleryLoading(false);
    }
  };

  // Booking Modal Trigger
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Gift Card checkout states
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftAmount, setGiftAmount] = useState('2000');
  const [giftPhone, setGiftPhone] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftSuccessMsg, setGiftSuccessMsg] = useState<string | null>(null);

  // Fetch logged in profile
  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Clear stale session
        handleSignOut();
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
    }
  };

  // Fetch service menu
  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/services'));
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (e) {
      console.error('Error fetching services:', e);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchGallery();
    if (token) {
      fetchProfile(token);
    }
  }, [token]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleSignOut = () => {
    localStorage.removeItem('mresh_token');
    setToken(null);
    setUser(null);
    setActiveTab('home');
  };

  // Login handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const path = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = authMode === 'login' 
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword };

    try {
      const res = await fetch(getApiUrl(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('mresh_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      } else {
        setAuthError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Connection error. Please retry.');
    }
  };

  // Quick Demo Login helpers with instant sign-in
  const handleQuickLogin = async (role: 'admin' | 'client') => {
    const email = role === 'admin' ? 'admin@mreshsalon.com' : 'daniel@example.com';
    const password = role === 'admin' ? 'admin' : 'daniel';
    setAuthEmail(email);
    setAuthPassword(password);
    setAuthMode('login');
    setAuthError(null);

    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('mresh_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        if (data.user.role === 'admin') {
          setActiveTab('admin');
        }
      } else {
        setAuthError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Connection error. Please retry.');
    }
  };

  // Buy Gift Card M-Pesa Express flow
  const handleBuyGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    if (!giftRecipient || !giftPhone) {
      alert('Recipient email and phone number are required.');
      return;
    }

    setGiftLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/payments/stkpush'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: giftPhone,
          giftCardDetails: {
            recipientEmail: giftRecipient,
            amount: Number(giftAmount),
            buyerName: user?.name
          }
        })
      });

      if (res.ok) {
        setGiftSuccessMsg(
          `🎁 Safaricom M-Pesa STK push initiated!\n\nPlease check your phone for the PIN prompt. Once approved, the gift code will be instantly dispatched to ${giftRecipient}.`
        );
        setTimeout(() => {
          setGiftSuccessMsg(null);
          setShowGiftModal(false);
          setGiftRecipient('');
          setGiftPhone('');
        }, 6000);
      } else {
        const err = await res.json();
        alert(err.error || 'Gift card checkout failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error during checkout.');
    } finally {
      setGiftLoading(false);
    }
  };

  // Categorize services
  const filteredServices = serviceCategory === 'all' 
    ? services 
    : services.filter(s => s.category === serviceCategory);

  // Categorize gallery lookbook items
  const filteredGalleryItems = useMemo(() => {
    return galleryItems.filter(item => 
      galleryCategory === 'all' || item.category?.toLowerCase() === galleryCategory.toLowerCase()
    );
  }, [galleryItems, galleryCategory]);

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-300 antialiased flex flex-col justify-between">
      
      {/* 1. HEADER BRANDING & STICKY NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-md border-b border-zinc-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo & Seasonal Badge */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('home')} 
              className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-zinc-100 group text-left"
              id="brand-logo-btn"
            >
              <div className="bg-rose-950/40 border border-rose-800/30 text-rose-400 p-2 rounded-xl group-hover:rotate-6 transition-transform">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-semibold text-rose-400 uppercase tracking-widest text-[9px]">Premium Beauty</span>
                <span className="block -mt-0.5 text-zinc-50 font-serif font-semibold italic tracking-wider text-base">Mresh Salon</span>
              </div>
            </button>

            {/* Seasonal Accent Badge */}
            <button
              onClick={() => setShowThemeModal(true)}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition cursor-pointer ${activeTheme.badgeBg} ${activeTheme.badgeText} ${activeTheme.badgeBorder} hover:brightness-125 shadow-sm`}
              title="Click to view or switch Seasonal Accent Palette"
              id="seasonal-theme-badge-btn"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{activeTheme.monthName} Accent: {activeTheme.themeName}</span>
            </button>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-medium tracking-widest uppercase text-zinc-400">
            <button 
              onClick={() => setActiveTab('home')} 
              className={`hover:text-rose-400 transition ${activeTab === 'home' ? 'text-rose-400 border-b-2 border-rose-400 pb-1' : ''}`}
              id="nav-home-btn"
            >
              Home
            </button>
            <button 
              onClick={() => { setActiveTab('services'); setServiceCategory('all'); }} 
              className={`hover:text-rose-400 transition ${activeTab === 'services' ? 'text-rose-400 border-b-2 border-rose-400 pb-1' : ''}`}
              id="nav-services-btn"
            >
              Menu
            </button>
            <button 
              onClick={() => setActiveTab('gallery')} 
              className={`hover:text-rose-400 transition ${activeTab === 'gallery' ? 'text-rose-400 border-b-2 border-rose-400 pb-1' : ''}`}
              id="nav-gallery-btn"
            >
              Gallery
            </button>
            <button 
              onClick={() => setActiveTab('journal')} 
              className={`hover:text-rose-400 transition ${activeTab === 'journal' ? 'text-rose-400 border-b-2 border-rose-400 pb-1' : ''}`}
              id="nav-journal-btn"
            >
              Journal
            </button>
            <button 
              onClick={() => setActiveTab('reviews')} 
              className={`hover:text-rose-400 transition ${activeTab === 'reviews' ? 'text-rose-400 border-b-2 border-rose-400 pb-1' : ''}`}
              id="nav-reviews-btn"
            >
              Reviews
            </button>
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`hover:text-rose-400 transition flex items-center gap-1 ${activeTab === 'admin' ? 'text-rose-400 border-b-2 border-rose-400 pb-1 font-bold' : 'text-zinc-300'}`}
              id="nav-admin-btn"
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Owner Portal</span>
            </button>
          </nav>

          {/* Session buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-semibold text-zinc-100 leading-none">{user.name}</span>
                  <span className="text-[9px] bg-rose-950/60 text-rose-300 border border-rose-800/40 font-bold px-2 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider">
                    {user.role === 'admin' ? 'Salon Owner' : 'Client Patron'}
                  </span>
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/40 text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                    title="Open Salon Control Panel"
                    id="owner-header-panel-btn"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Owner Dashboard</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl p-2.5 transition flex items-center justify-center border border-zinc-800 cursor-pointer"
                  title="Sign Out"
                  id="sign-out-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="text-xs border border-zinc-800 hover:bg-zinc-900 text-zinc-200 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                id="open-login-btn"
              >
                Sign In
              </button>
            )}

            {user?.role !== 'admin' && (
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-widest px-5 py-3 rounded-xl transition shadow-lg shadow-rose-950/20 active:scale-95"
                id="trigger-booking-cta"
              >
                Book Treatment
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. CORE VIEW SWITCH CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        <AnimatePresence mode="wait">
          
          {/* VIEW A: HOME / LANDING VIEW */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-16"
            >
              
              {/* PROMO BANNER FOR NEW VISITORS */}
              {showPromoBanner && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-rose-950/70 via-rose-900/60 to-purple-950/70 border border-rose-500/20 rounded-3xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-100 shadow-xl overflow-hidden relative"
                >
                  <div className="absolute top-0 right-1/4 w-32 h-32 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-500/20 text-rose-300 border border-rose-500/30 p-2 rounded-xl shrink-0">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] bg-rose-500 text-white font-bold px-2.5 py-0.5 rounded-full inline-block uppercase tracking-wider mb-1 font-mono">First-Time Client Special</span>
                      <p className="text-xs text-zinc-250">
                        Welcome to Mresh Salon! Book today and enjoy <strong className="text-rose-300">15% off</strong> your first luxury treatment using coupon code <span className="font-mono bg-black/40 border border-rose-500/25 px-1.5 py-0.5 rounded text-rose-400 font-bold select-all tracking-wider">MRESHFIRST15</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {user?.role !== 'admin' ? (
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold uppercase tracking-widest px-4.5 py-2.5 rounded-xl transition shadow-md shadow-rose-950/20 cursor-pointer"
                      >
                        Apply Code & Book
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('admin')}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold uppercase tracking-widest px-4.5 py-2.5 rounded-xl transition shadow-md shadow-rose-950/20 cursor-pointer"
                      >
                        Open Owner Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => setShowPromoBanner(false)}
                      className="text-zinc-500 hover:text-rose-300 text-xs p-1 cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* HERO MODULE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#121214] text-zinc-100 rounded-[32px] overflow-hidden p-8 md:p-14 border border-zinc-900/80 shadow-2xl relative">
                
                <motion.div 
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6 max-w-lg"
                >
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-block bg-rose-950/40 text-rose-300 border border-rose-800/30 text-[10px] font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full"
                  >
                    Nairobi's Premium Luxury Studio
                  </motion.span>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif leading-tight text-4xl md:text-5xl text-white mb-2"
                  >
                    Artistry in <br/><span className="italic font-serif font-light text-rose-400">Every Strand.</span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="text-zinc-400 text-sm leading-relaxed"
                  >
                    Step into Mresh Salon and indulge in world-class Silk Presses, form-sculpted acrylic nails, brightening clinical facials, and gorgeous wedding makeup packages. Experience pampering perfected.
                  </motion.p>

                  {/* Call actions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    {user?.role !== 'admin' ? (
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-widest px-6 py-3.5 rounded-xl transition shadow-lg shadow-rose-950/25 active:scale-95 cursor-pointer"
                      >
                        Select a slot online
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('admin')}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-widest px-6 py-3.5 rounded-xl transition shadow-lg shadow-rose-950/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Shield className="w-4 h-4" />
                        Owner Control Panel
                      </button>
                    )}
                    <button
                      onClick={() => { setActiveTab('services'); setServiceCategory('all'); }}
                      className="text-zinc-300 border border-zinc-850 hover:bg-zinc-900 text-xs font-semibold uppercase tracking-widest px-5 py-3.5 rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      Explore Service Menu
                    </button>
                  </motion.div>
                </motion.div>

                {/* Cover image slider featuring user's original hairstyle/nails images */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.97, x: 24 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-80 md:h-[400px] w-full rounded-2xl overflow-hidden relative shadow-lg group cursor-pointer border border-zinc-800 bg-zinc-950"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHeroSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img 
                        src={heroSlides[currentHeroSlide].img} 
                        alt={heroSlides[currentHeroSlide].title} 
                        className="w-full h-full object-cover transition-transform duration-[4500ms] ease-out scale-100 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                  {/* Indicators / Dot controls */}
                  <div className="absolute top-4 right-4 flex gap-1.5 z-20 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
                    {heroSlides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentHeroSlide(idx);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentHeroSlide === idx ? 'bg-rose-400 w-3' : 'bg-zinc-500 hover:bg-zinc-400'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Info bar updated dynamically with the active style */}
                  <motion.div 
                    key={`label-${currentHeroSlide}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md rounded-xl p-3.5 flex justify-between items-center text-xs border border-white/10 z-10"
                  >
                    <div>
                      <div className="font-medium text-white font-serif italic text-sm">
                        {heroSlides[currentHeroSlide].title}
                      </div>
                      <div className="text-[10px] text-zinc-350 mt-0.5">
                        {heroSlides[currentHeroSlide].subtitle}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex text-amber-400 gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                      <span className="text-[8px] tracking-wider uppercase bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold font-mono">Signature Work</span>
                    </div>
                  </motion.div>
                </motion.div>

              </div>

              {/* THREE COLUMN LUXURY PILLARS */}
              <motion.div 
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15 }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  {
                    icon: <Award className="w-5 h-5" />,
                    bg: "bg-rose-950/40 border-rose-800/30 text-rose-400",
                    title: "Award-Winning Quality",
                    desc: "We use organic hair thermal barriers and clinically formulated skincare serums to ensure your natural glow is protected."
                  },
                  {
                    icon: <Smartphone className="w-5 h-5" />,
                    bg: "bg-emerald-950/40 border-emerald-800/30 text-emerald-400",
                    title: "Prepaid Slot Protection",
                    desc: "Secure your desired appointment times seamlessly with secure, verified prepaid deposits directly through our platform."
                  },
                  {
                    icon: <Gift className="w-5 h-5" />,
                    bg: "bg-amber-950/40 border-amber-800/30 text-amber-400",
                    title: "Digital Gift Vouchers",
                    desc: "Give the ultimate gift of beauty to loved ones. Buy online, enter recipient email, and receive instant redeemable codes."
                  }
                ].map((pillar, idx) => (
                  <motion.div 
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    whileHover={{ y: -6, borderColor: 'rgba(244, 63, 94, 0.4)', boxShadow: '0 10px 30px -15px rgba(244, 63, 94, 0.15)' }}
                    className="bg-[#121214] border border-zinc-900/80 p-6 rounded-2xl space-y-3.5 transition-all duration-300 cursor-pointer"
                  >
                    <div className={`border p-3 rounded-full w-fit ${pillar.bg}`}>
                      {pillar.icon}
                    </div>
                    <h3 className="font-serif italic font-medium text-sm text-zinc-100 tracking-wide">{pillar.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* DYNAMIC SHORT MENU PREVIEW */}
              <div className="space-y-6">
                <div className="flex items-end justify-between border-b border-zinc-900 pb-3">
                  <div>
                    <h2 className="font-serif text-2xl text-white tracking-tight">Popular Treatments</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Explore a select preview of client-favorite styling packages</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('services'); setServiceCategory('all'); }} 
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group transition cursor-pointer"
                  >
                    View All Menu Items
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <motion.div 
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.12 }
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {servicesLoading ? (
                    <div className="text-center py-8 col-span-3 text-zinc-500">Loading beautiful menu...</div>
                  ) : (
                    services.slice(0, 3).map((s) => (
                      <motion.div 
                        key={s.id} 
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
                        }}
                        whileHover={{ 
                          y: -8, 
                          scale: 1.015,
                          borderColor: 'rgba(244, 63, 94, 0.4)', 
                          boxShadow: '0 20px 40px -15px rgba(244, 63, 94, 0.2), 0 10px 30px -10px rgba(0, 0, 0, 0.8)' 
                        }}
                        whileTap={{ scale: 0.985 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="bg-[#121214] border border-zinc-900/85 rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer relative"
                      >
                        <div className="aspect-[16/10] w-full bg-zinc-900 overflow-hidden relative">
                          <img 
                            src={s.image} 
                            alt={s.name} 
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          <span className="absolute top-3 left-3 bg-black/85 text-rose-400 border border-rose-900/30 text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full shadow-sm">
                            {s.category}
                          </span>
                        </div>
                        <div className="p-5 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h4 className="font-serif italic font-medium text-zinc-100 leading-tight text-sm group-hover:text-rose-400 transition-colors">{s.name}</h4>
                            <p className="text-[11px] text-zinc-400 line-clamp-2">{s.description}</p>
                          </div>
                          <div className="flex justify-between items-center pt-3.5 border-t border-zinc-900 mt-3">
                            <div className="text-zinc-200 font-semibold text-xs">KES {s.price}</div>
                            <span className="text-[10px] text-zinc-500 font-medium">{s.duration} mins duration</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </div>

              {/* INTERACTIVE STYLE FINDER QUIZ */}
              <StyleQuiz 
                onBookRecommended={() => {
                  if (user?.role === 'admin') {
                    setActiveTab('admin');
                  } else {
                    setShowBookingModal(true);
                  }
                }} 
                isAdmin={user?.role === 'admin'} 
              />

              {/* BEFORE & AFTER TRANSFORMATION SPOTLIGHT */}
              <BeforeAfter />

              {/* VERIFIED COMMUNITY TESTIMONIALS */}
              <Testimonials />

              {/* PAMPER GIFT CARDS MODULE */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-br from-[#121214] to-[#0c0c0e] text-white rounded-[32px] overflow-hidden p-8 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-zinc-900 shadow-2xl relative"
              >
                <div className="space-y-5">
                  <span className="bg-amber-950/40 text-amber-300 border border-amber-800/30 text-[9px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full inline-block">
                    Mresh Pamper Gift Cards
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl text-white tracking-tight">
                    Gift the Splendor of Complete Beauty
                  </h2>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Surprise your partner, family, or colleagues with an exclusive Mresh Salon digital gift voucher. Valid for 12 months, applicable across our hair studio, nail bar, or glow facials!
                  </p>
                  <button
                    onClick={() => {
                      if (!token) {
                        setShowAuthModal(true);
                      } else {
                        setShowGiftModal(true);
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-widest px-6 py-3.5 rounded-xl transition shadow-lg shadow-amber-950/25 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    Order Digital Gift Card
                  </button>
                </div>

                {/* Gift Card Visual Element: Float effect and subtle interactive scale */}
                <motion.div 
                  animate={{ 
                    y: [0, -8, 0],
                    rotateZ: [0, -0.5, 0.5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 6, 
                    ease: "easeInOut" 
                  }}
                  whileHover={{ scale: 1.03, rotateY: 4, rotateX: -4 }}
                  className="bg-zinc-950/50 border border-zinc-850 rounded-2xl p-6 space-y-5 flex flex-col justify-between max-w-sm w-full mx-auto shadow-inner relative overflow-hidden backdrop-blur-md cursor-pointer transition-all duration-300"
                >
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-600/10 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest block">Prepaid Voucher</span>
                      <h4 className="font-serif italic font-medium text-sm tracking-tight text-white">Mresh Luxury Pamper</h4>
                    </div>
                    <Scissors className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="font-mono text-xl font-bold tracking-widest text-amber-400 text-center py-4 border-y border-zinc-900 bg-black/40 rounded-lg">
                    MRESH-GIFT-8942
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400">
                    <span>Balance: KES 5,000</span>
                    <span>Issued by: Mresh Salon</span>
                  </div>
                </motion.div>
              </motion.div>

            </motion.div>
          )}

          {/* VIEW B: FULL SERVICE MENU VIEW */}
          {activeTab === 'services' && (
            <motion.div
              key="services"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-white tracking-tight">Our Treatment Menu</h2>
                  <p className="text-xs text-zinc-400 mt-1">Select from our expert catalog of treatments below</p>
                </div>
                
                <button
                  onClick={() => setShowRateCard(!showRateCard)}
                  className="w-full md:w-auto text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-5 py-3 rounded-xl transition duration-200 shadow-md shadow-amber-950/20 flex items-center justify-center gap-1.5 cursor-pointer border border-amber-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  {showRateCard ? 'Switch to Treatment Grid' : 'View Salon Price Board Flyer'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {showRateCard ? (
                  <motion.div
                    key="rate-card-panel"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-[#0b0b0d] border border-amber-500/20 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
                  >
                    {/* Glowing gold accents like neon board */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    {/* Retro Border Accent */}
                    <div className="absolute inset-4 border border-dashed border-amber-500/10 rounded-2xl pointer-events-none"></div>

                    {/* Flyer Header */}
                    <div className="text-center relative py-6 space-y-2">
                      <div className="flex justify-center items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-bold tracking-[0.25em] uppercase font-mono">Faith Mresh Signature Salon</span>
                        <Award className="w-4 h-4 text-amber-400" />
                      </div>
                      <h1 className="font-serif italic text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tracking-tight leading-none">
                        Nails, Braids & Locs
                      </h1>
                      <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-1 rounded-full w-fit mx-auto">
                        <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">Official Interactive Flyer Rate Card</span>
                      </div>
                    </div>

                    {/* Hot Highlights Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto py-4 border-y border-amber-500/15 relative z-10">
                      <div className="bg-gradient-to-r from-amber-950/20 to-zinc-950/20 border border-amber-500/15 p-4 rounded-xl flex items-center justify-between group cursor-pointer" onClick={() => user?.role !== 'admin' ? setShowBookingModal(true) : setActiveTab('admin')}>
                        <div className="space-y-1">
                          <span className="bg-rose-500/20 text-rose-300 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded uppercase block w-fit">Best Seller</span>
                          <h4 className="font-serif text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">Artificial Locs Set</h4>
                          <p className="text-[10px] text-zinc-400">Durable, gorgeous locs including hair and labour</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-zinc-500 line-through block">KES 4,500</span>
                          <span className="text-base font-bold text-amber-400">KES 3,500</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-zinc-950/20 to-amber-950/20 border border-amber-500/15 p-4 rounded-xl flex items-center justify-between group cursor-pointer" onClick={() => user?.role !== 'admin' ? setShowBookingModal(true) : setActiveTab('admin')}>
                        <div className="space-y-1">
                          <span className="bg-amber-500/20 text-amber-300 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded uppercase block w-fit">Promo Combo</span>
                          <h4 className="font-serif text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">Mani-Pedi Offer</h4>
                          <p className="text-[10px] text-zinc-400">Full Pedicure, Gel on toes & Full Manicure</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-zinc-500 line-through block">KES 1,800</span>
                          <span className="text-base font-bold text-amber-400">KES 1,300</span>
                        </div>
                      </div>
                    </div>

                    {/* Rates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 relative z-10">
                      
                      {/* Column 1: Nails */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                          <span className="text-sm">💅</span>
                          <h3 className="font-serif italic font-medium text-amber-300 text-base">Manicure & Pedicure</h3>
                        </div>
                        <ul className="space-y-2.5 text-xs text-zinc-300">
                          {[
                            { name: 'Tips & Gel', price: '500' },
                            { name: 'Pedicure', price: '400' },
                            { name: 'Manicure', price: '400' },
                            { name: 'Gel Polish', price: '400' },
                            { name: 'Stickons', price: '500' },
                            { name: 'French Tips (Artistry)', price: '800' },
                            { name: 'Builder Gel', price: '800' },
                            { name: 'Acrylic Extensions', price: '1,000' },
                            { name: 'Gum Gel Set', price: '1,500' },
                            { name: 'Overlays', price: '1,000' },
                            { name: 'Ombre Nails', price: '1,000' },
                            { name: 'Sculpted Extensions', price: '1,800' },
                          ].map((item, i) => (
                            <li key={i} className="flex justify-between items-center group cursor-pointer hover:text-white transition-colors" onClick={() => user?.role !== 'admin' ? setShowBookingModal(true) : setActiveTab('admin')}>
                              <span className="border-b border-dotted border-zinc-800 flex-1 group-hover:border-amber-500/30 pr-2">{item.name}</span>
                              <span className="font-mono text-amber-400 font-medium shrink-0">KES {item.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 2: Braids */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                          <span className="text-sm">💇‍♀️</span>
                          <h3 className="font-serif italic font-medium text-amber-300 text-base">Braids & Styling</h3>
                        </div>
                        <ul className="space-y-2.5 text-xs text-zinc-300">
                          {[
                            { name: 'Locs Retouch', price: '700' },
                            { name: 'Twist Outs', price: '1,000' },
                            { name: 'Cornrows (Lines)', price: '1,300' },
                            { name: 'Box Braids', price: '1,300' },
                            { name: 'Knotless Braids', price: '1,400' },
                            { name: 'Standard Twists', price: '1,500' },
                            { name: 'Stitch Lines', price: '1,700' },
                            { name: 'Goddess Braids', price: '1,700' },
                            { name: 'Jungle Braids', price: '1,800' },
                            { name: 'French Curls Styling', price: '3,400' },
                          ].map((item, i) => (
                            <li key={i} className="flex justify-between items-center group cursor-pointer hover:text-white transition-colors" onClick={() => user?.role !== 'admin' ? setShowBookingModal(true) : setActiveTab('admin')}>
                              <span className="border-b border-dotted border-zinc-800 flex-1 group-hover:border-amber-500/30 pr-2">{item.name}</span>
                              <span className="font-mono text-amber-400 font-medium shrink-0">KES {item.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 3: Locs & Facials */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                            <span className="text-sm">✨</span>
                            <h3 className="font-serif italic font-medium text-amber-300 text-base">Dreadlocks & Locs</h3>
                          </div>
                          <ul className="space-y-2.5 text-xs text-zinc-300">
                            {[
                              { name: 'Dreadlocks Install', price: '2,000' },
                              { name: 'Butterfly Locs', price: '2,800' },
                              { name: 'Passion Twists', price: '2,500' },
                              { name: 'Spring Twists', price: '2,500' },
                              { name: 'Nubian Twists', price: '2,700' },
                              { name: 'Gypsy Locs', price: '3,200' },
                              { name: 'Artificial Sister Locs', price: '3,500' },
                              { name: 'River Locs', price: '3,800' },
                              { name: 'Sister Locs Install', price: '8,000' },
                            ].map((item, i) => (
                              <li key={i} className="flex justify-between items-center group cursor-pointer hover:text-white transition-colors" onClick={() => user?.role !== 'admin' ? setShowBookingModal(true) : setActiveTab('admin')}>
                                <span className="border-b border-dotted border-zinc-800 flex-1 group-hover:border-amber-500/30 pr-2">{item.name}</span>
                                <span className="font-mono text-amber-400 font-medium shrink-0">KES {item.price}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                            <span className="text-sm">💄</span>
                            <h3 className="font-serif italic font-medium text-amber-300 text-base">Wellness & Facial Arts</h3>
                          </div>
                          <ul className="space-y-2.5 text-xs text-zinc-300">
                            {[
                              { name: 'Blade Shaving', price: '100' },
                              { name: 'Threading & Tinting', price: '200' },
                              { name: 'Full Glam Make-up', price: '1,000' },
                              { name: 'Single Lashes Set', price: '1,500' },
                              { name: 'Soft Glam Makeup', price: '500' },
                              { name: 'Microblading Brow Art', price: '6,000' },
                              { name: 'Brazilian Waxing', price: '700' },
                              { name: 'Massage (Relaxing)', price: '2,500' },
                            ].map((item, i) => (
                              <li key={i} className="flex justify-between items-center group cursor-pointer hover:text-white transition-colors" onClick={() => user?.role !== 'admin' ? setShowBookingModal(true) : setActiveTab('admin')}>
                                <span className="border-b border-dotted border-zinc-800 flex-1 group-hover:border-amber-500/30 pr-2">{item.name}</span>
                                <span className="font-mono text-amber-400 font-medium shrink-0">KES {item.price}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>

                    {/* Flyer Footer */}
                    <div className="mt-12 text-center text-[10px] text-zinc-500 font-mono space-y-1 border-t border-amber-500/10 pt-6 relative z-10">
                      <p>✨ ALL PRICES INCLUSIVE OF HIGH-QUALITY BRAIDS, NAILS AND LABOUR MATERIALS ✨</p>
                      <p>📍 Nairobi, Kenya • Click any treatment line to launch the booking scheduler instantly.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="treatment-menu-grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Category selection Tabs bar */}
                    <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-4">
                      {[
                        { id: 'all', label: 'All Treatments' },
                        { id: 'hair', label: 'Hair Styling' },
                        { id: 'nails', label: 'Nail Artistry' },
                        { id: 'skincare', label: 'Skin Wellness' },
                        { id: 'makeup', label: 'Professional Makeup' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setServiceCategory(tab.id as any)}
                          className={`text-xs px-4 py-2.5 rounded-xl border transition font-medium tracking-wide active:scale-95 cursor-pointer ${serviceCategory === tab.id ? 'bg-zinc-100 border-zinc-100 text-zinc-950 shadow-sm font-semibold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Services Grid with Framer Motion staggered entrance and hover interactions */}
                    {servicesLoading ? (
                      <div className="flex justify-center items-center py-20 text-zinc-400 gap-2">
                        <Loader className="w-5 h-5 animate-spin text-rose-500" />
                        <span className="text-xs">Gathering salon secrets...</span>
                      </div>
                    ) : filteredServices.length === 0 ? (
                      <div className="text-center py-16 bg-[#121214] border border-zinc-900 rounded-2xl">
                        <Scissors className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs text-zinc-400 font-medium">No services found in this category.</p>
                      </div>
                    ) : (
                      <motion.div 
                        key={serviceCategory}
                        variants={serviceGridVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        {filteredServices.map((s) => (
                          <motion.div 
                            key={s.id} 
                            variants={serviceCardVariants}
                            whileHover={{ 
                              y: -8, 
                              scale: 1.015,
                              borderColor: 'rgba(244, 63, 94, 0.4)', 
                              boxShadow: '0 20px 40px -15px rgba(244, 63, 94, 0.2), 0 10px 30px -10px rgba(0, 0, 0, 0.8)' 
                            }}
                            whileTap={{ scale: 0.985 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="bg-[#121214] border border-zinc-900/85 rounded-2xl overflow-hidden flex flex-col justify-between group cursor-pointer relative"
                          >
                            <div>
                              <div className="aspect-[16/10] w-full bg-zinc-900 overflow-hidden relative">
                                <img 
                                  src={s.image} 
                                  alt={s.name} 
                                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <span className="absolute top-3 left-3 bg-black/85 text-rose-400 border border-rose-900/30 text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full shadow-sm">
                                  {s.category}
                                </span>
                              </div>

                              <div className="p-5 space-y-2">
                                <h4 className="font-serif italic font-medium text-sm text-zinc-100 leading-tight group-hover:text-rose-400 transition-colors">
                                  {s.name}
                                </h4>
                                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                                  {s.description}
                                </p>
                              </div>
                            </div>

                            <div className="p-5 pt-0">
                              <div className="border-t border-zinc-900 pt-4 flex justify-between items-center mb-4 text-xs">
                                <div>
                                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Price</span>
                                  <span className="text-zinc-100 font-bold">KES {s.price}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Duration</span>
                                  <span className="text-zinc-350 font-medium">{s.duration} mins</span>
                                </div>
                              </div>

                              {user?.role !== 'admin' ? (
                                <button
                                  onClick={() => {
                                    setShowBookingModal(true);
                                  }}
                                  className="w-full text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-rose-950/20 cursor-pointer active:scale-98"
                                >
                                  Book Appointment
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActiveTab('admin');
                                  }}
                                  className="w-full text-xs bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-98"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  Update Service & Prices
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* VIEW C: BEAUTY WORK GALLERY VIEW */}
          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-white tracking-tight">Our Lookbook Gallery</h2>
                  <p className="text-xs text-zinc-400 mt-1">Our creative portfolio showing premium styling works at Mresh Salon</p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Portfolio' },
                    { id: 'hair', label: 'Hair' },
                    { id: 'nails', label: 'Nails' },
                    { id: 'skincare', label: 'Skincare' },
                    { id: 'makeup', label: 'Makeup' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setGalleryCategory(cat.id as any)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-medium active:scale-95 cursor-pointer ${galleryCategory === cat.id ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-semibold shadow-sm' : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {galleryLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-2">
                  <Loader className="w-6 h-6 animate-spin text-rose-500" />
                  <p className="text-xs font-mono">Loading lookbook portfolio...</p>
                </div>
              ) : filteredGalleryItems.length === 0 ? (
                <div className="text-center py-24 text-zinc-500 text-xs bg-[#121214] border border-zinc-900 rounded-2xl">
                  No Lookbook items found in this category. Check back soon!
                </div>
              ) : (
                /* Gallery grid of curated looks with staggered motion entrance */
                <motion.div 
                  key={galleryCategory}
                  variants={galleryContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                >
                  {filteredGalleryItems.map((item) => (
                    <motion.div 
                      key={item.id} 
                      variants={galleryItemVariants}
                      whileHover={{ scale: 1.025, y: -4, borderColor: 'rgba(244, 63, 94, 0.3)' }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#121214] border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition duration-300 group relative cursor-pointer shadow-lg"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-zinc-900">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-widest">{item.category}</span>
                            <h4 className="font-serif italic text-white text-base mt-1">{item.title}</h4>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareGalleryData({
                                title: `${item.title} - Mresh Salon`,
                                text: `Check out this gorgeous ${item.category} look "${item.title}" from Mresh Salon!`,
                                url: window.location.href
                              });
                            }}
                            className="bg-black/70 hover:bg-rose-600 text-white p-2 rounded-full border border-white/20 transition cursor-pointer shadow-md shrink-0"
                            title="Share Look"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {user?.role !== 'admin' && (
                          <div className="mt-3.5 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setShowBookingModal(true)}
                              className="w-fit bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg transition cursor-pointer"
                            >
                              Book Similar Look
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShareGalleryData({
                                  title: `${item.title} - Mresh Salon`,
                                  text: `Check out this gorgeous ${item.category} look "${item.title}" from Mresh Salon!`,
                                  url: window.location.href
                                });
                              }}
                              className="flex items-center gap-1 text-[10px] bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                            >
                              <Share2 className="w-3 h-3 text-rose-400" />
                              Share
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* VIEW D: BEAUTY JOURNAL (BLOG) VIEW */}
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <BlogSection token={token} isAdmin={user?.role === 'admin'} />
            </motion.div>
          )}

          {/* VIEW E: VERIFIED REVIEWS VIEW */}
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ReviewsSection token={token} services={services} onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} />
            </motion.div>
          )}

          {/* VIEW F: SECURE ADMIN CONTROL PANEL */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {user?.role === 'admin' ? (
                <AdminDashboard token={token} services={services} onRefreshGallery={fetchGallery} onRefreshServices={fetchServices} />
              ) : (
                <OwnerAuthPage
                  onSuccessLogin={(loggedInUser, loggedInToken) => {
                    setUser(loggedInUser);
                    setToken(loggedInToken);
                  }}
                  onQuickOwnerLogin={() => handleQuickLogin('admin')}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. LUXURY FOOTER BRANDING */}
      <footer className="bg-black text-zinc-400 text-xs border-t border-zinc-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-serif font-semibold italic text-base tracking-wider">
              <Scissors className="w-5 h-5 text-rose-400" />
              Mresh Salon
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              Providing exquisite, customized hair extensions, BIAB nail bars, brightening facials and soft makeup glams. Designed with modern precision in Nairobi, Kenya.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="font-serif italic font-medium text-zinc-100 text-xs tracking-widest uppercase">Business Schedule</h5>
            <div className="space-y-2 text-zinc-500 text-xs">
              <div className="flex justify-between border-b border-zinc-950 pb-1"><span>Monday - Friday</span><span>08:00 AM - 07:00 PM</span></div>
              <div className="flex justify-between border-b border-zinc-950 pb-1"><span>Saturdays</span><span>08:00 AM - 06:00 PM</span></div>
              <div className="flex justify-between"><span>Sundays</span><span>10:00 AM - 04:00 PM</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-serif italic font-medium text-zinc-100 text-xs tracking-widest uppercase">Studio Location</h5>
            <div className="space-y-2.5 text-zinc-500 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Premium Plaza, 2nd Floor, Kilimani District, Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>+254 745 734 170</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span>hello@mreshsalon.com</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-zinc-500 gap-4">
          <p>© 2026 Mresh Salon. All Rights Reserved.</p>
          <button
            onClick={() => setActiveTab('admin')}
            className="text-zinc-500 hover:text-rose-400 transition text-[11px] flex items-center gap-1.5 cursor-pointer font-mono"
            id="footer-owner-portal-btn"
          >
            <Shield className="w-3.5 h-3.5 text-rose-500/70" />
            <span>Salon Owner Portal</span>
          </button>
        </div>
      </footer>

      {/* FLOATING REAL-TIME CHAT SUPPORT INTEGRATION */}
      <ChatPanel token={token} onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} />

      {/* DYNAMIC BOOKING MODAL FUNNEL */}
      {showBookingModal && (
        <BookingModal
          token={token}
          services={services}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => fetchServices()} // refreshes list of existing bookings slots
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
        />
      )}

      {/* GIFT CARD ORDER DIALOG */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative text-zinc-100">
            <button 
              onClick={() => setShowGiftModal(false)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleBuyGiftCard} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="bg-amber-950/40 p-2.5 rounded-full w-fit mx-auto text-amber-400 border border-amber-800/30">
                  <Gift className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-serif italic text-base text-white mt-2">Buy Luxury Pamper Card</h4>
                <p className="text-[11px] text-zinc-400">Gift card is paid securely via Safaricom M-Pesa</p>
              </div>

              {giftSuccessMsg && (
                <div className="bg-emerald-950/40 border border-emerald-800/30 p-3 rounded-xl text-emerald-300 text-xs font-mono">
                  {giftSuccessMsg}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Recipient Email Address</label>
                  <input
                    type="email"
                    value={giftRecipient}
                    onChange={(e) => setGiftRecipient(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">M-Pesa Billing Number</label>
                  <input
                    type="tel"
                    value={giftPhone}
                    onChange={(e) => setGiftPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Gift Amount (KES)</label>
                  <select
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100 font-semibold"
                  >
                    <option className="bg-[#121214]" value="1500">KES 1,500 (Silk Press Treatment)</option>
                    <option className="bg-[#121214]" value="2500">KES 2,500 (Sculpted Nails)</option>
                    <option className="bg-[#121214]" value="5000">KES 5,000 (Luxury Glow Voucher)</option>
                    <option className="bg-[#121214]" value="10000">KES 10,000 (Royal Day Spa)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={giftLoading}
                className="w-full text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-xl py-3 font-semibold uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow"
              >
                {giftLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : null}
                Pay KES {Number(giftAmount).toLocaleString()} with M-Pesa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USER REGISTRATION / LOGIN AUTH DIALOG OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative text-zinc-150">
            <button 
              onClick={() => {
                setShowAuthModal(false);
                setAuthError(null);
              }} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition"
              id="close-auth-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="text-center">
                <Scissors className="w-8 h-8 text-rose-400 mx-auto" />
                <h4 className="font-serif italic text-lg text-white mt-2">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">Access luxury pampering, review boards & smart chat</p>
              </div>

              {authError && (
                <div className="bg-rose-950/40 border border-rose-800/30 p-2.5 rounded-xl flex gap-1.5 text-rose-300 text-[11px]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-3">
                {authMode === 'register' && (
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Daniel Keya"
                      className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                    required
                    id="auth-email-field"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                    required
                    id="auth-password-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-3 font-semibold uppercase tracking-widest transition shadow"
                id="auth-submit-btn"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              {/* DEMO QUICK ACCOUNTS BLOCK */}
              <div className="border-t border-zinc-900 pt-3.5 space-y-2">
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider text-center">Salon Management</p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthModal(false);
                      setActiveTab('admin');
                    }}
                    className="w-full py-2.5 px-3 border border-rose-800/40 hover:bg-rose-950/60 text-[10px] text-rose-300 bg-rose-950/30 font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    id="quick-login-owner-btn"
                  >
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span>Owner Portal Login</span>
                  </button>
                </div>
              </div>

              <p className="text-center text-[11px] text-zinc-400 pt-1">
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-rose-400 font-semibold hover:underline"
                >
                  {authMode === 'login' ? 'Create one' : 'Sign in instead'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* SEASONAL PALETTE MODAL */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f0f12] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowThemeModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 p-2 rounded-full transition cursor-pointer"
              title="Close"
              id="close-theme-modal-btn"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Palette className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Seasonal Aesthetics</span>
              </div>
              <h3 className="text-2xl font-serif italic text-white font-bold">Monthly Accent Palettes</h3>
              <p className="text-xs text-zinc-400">
                Mresh Salon dynamically evolves its visual accents each month, shifting gracefully between Velvet Rose, Solar Gold, Emerald Silk, and Royal Amethyst.
              </p>
            </div>

            {/* Current Active Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${activeTheme.badgeBg} ${activeTheme.badgeBorder}`}>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded">
                  Active Selected Palette ({activeTheme.monthName})
                </span>
                <h4 className={`font-serif italic font-bold text-base ${activeTheme.badgeText}`}>
                  {activeTheme.themeName}
                </h4>
                <p className="text-xs text-zinc-300">{activeTheme.description}</p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white/20 shrink-0 flex items-center justify-center font-bold text-white text-xs font-mono"
                style={{ backgroundColor: activeTheme.hexColor }}
              >
                ✓
              </div>
            </div>

            {/* 12 Months Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {Object.values(seasonalPalettes).map((palette) => {
                const isSelected = selectedMonth === palette.monthIndex;
                const isCurrentCalendarMonth = new Date().getMonth() === palette.monthIndex;

                return (
                  <button
                    key={palette.monthIndex}
                    onClick={() => {
                      setSelectedMonth(palette.monthIndex);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 relative cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-850 border-amber-500/80 ring-2 ring-amber-500/30 shadow-lg'
                        : 'bg-zinc-950/60 border-zinc-850 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    {isCurrentCalendarMonth && (
                      <span className="absolute top-2 right-2 text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-mono font-bold">NOW</span>
                    )}

                    <div className="space-y-0.5">
                      <span className="block text-[10px] text-zinc-400 font-mono">{palette.monthName}</span>
                      <span className="block text-xs font-bold text-white line-clamp-1">{palette.themeName}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div
                        className="w-5 h-5 rounded-lg border border-white/10"
                        style={{ backgroundColor: palette.hexColor }}
                      />
                      <span className="text-[9px] text-zinc-500 font-mono">{palette.seasonLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
              <button
                onClick={() => setSelectedMonth(new Date().getMonth())}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl border border-zinc-800 transition font-medium cursor-pointer"
              >
                Reset to Current Month
              </button>
              <button
                onClick={() => setShowThemeModal(false)}
                className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider transition shadow cursor-pointer"
              >
                Apply Palette
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY SHARE MODAL */}
      {shareGalleryData && (
        <ShareModal
          title={shareGalleryData.title}
          text={shareGalleryData.text}
          url={shareGalleryData.url}
          isOpen={!!shareGalleryData}
          onClose={() => setShareGalleryData(null)}
        />
      )}

    </div>
  );
}

// Inline helper for closing gift card modal
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
