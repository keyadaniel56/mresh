import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Sparkles, Heart, Award, Check, RefreshCw, ChevronRight, HelpCircle } from 'lucide-react';

interface StyleQuizProps {
  onBookRecommended: () => void;
  isAdmin?: boolean;
}

export default function StyleQuiz({ onBookRecommended, isAdmin }: StyleQuizProps) {
  const [step, setStep] = useState<number>(0); // 0 = start, 1 = Q1, 2 = Q2, 3 = Q3, 4 = loading, 5 = result
  const [answers, setAnswers] = useState({
    goal: '',
    vibe: '',
    timeline: ''
  });

  const handleStart = () => {
    setStep(1);
  };

  const handleSelectGoal = (goal: string) => {
    setAnswers(prev => ({ ...prev, goal }));
    setStep(2);
  };

  const handleSelectVibe = (vibe: string) => {
    setAnswers(prev => ({ ...prev, vibe }));
    setStep(3);
  };

  const handleSelectTimeline = (timeline: string) => {
    setAnswers(prev => ({ ...prev, timeline }));
    setStep(4);
    // Simulate smart calculation
    setTimeout(() => {
      setStep(5);
    }, 1800);
  };

  const handleReset = () => {
    setAnswers({ goal: '', vibe: '', timeline: '' });
    setStep(0);
  };

  // Recommendations mapping
  const getRecommendation = () => {
    const { goal, vibe } = answers;
    if (goal === 'hair') {
      if (vibe === 'boho') {
        return {
          title: 'Fulani Tribal Braids & Afro',
          desc: 'Adorned with gorgeous shells, beads, and authentic Bohemian parts.',
          image: '/src/assets/images/fulani_braids_afro_1784461381991.jpg',
          price: 'KES 3,500',
          match: '98% Style Match'
        };
      }
      if (vibe === 'bold') {
        return {
          title: 'Signature Butterfly Locs',
          desc: 'Distressed Bohemian texture designed to hold body, bounce, and attitude.',
          image: '/src/assets/images/butterfly_locs_1784461341414.jpg',
          price: 'KES 2,800',
          match: '95% Style Match'
        };
      }
      return {
        title: 'Chic Knotless Box Braids',
        desc: 'Tension-free, pristine parts with a sleek and lightweight natural weight.',
        image: '/src/assets/images/knotless_braids_1784461356341.jpg',
        price: 'KES 1,400',
        match: '92% Style Match'
      };
    } else if (goal === 'nails') {
      if (vibe === 'red-carpet' || vibe === 'minimal') {
        return {
          title: 'French-Tip Floral Acrylics',
          desc: 'Elegant, hand-painted floral details paired with standard crisp French lines.',
          image: '/src/assets/images/pink_flower_nails_1784461367686.jpg',
          price: 'KES 1,000',
          match: '96% Style Match'
        };
      }
      return {
        title: 'Ombre Sculpted Nail Extensions',
        desc: 'Luxury customized ombre transitions sculpted over clean forms.',
        image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=600',
        price: 'KES 1,800',
        match: '94% Style Match'
      };
    } else if (goal === 'skincare') {
      return {
        title: 'Brightening Hydrafacial Session',
        desc: 'Three-step painless vacuum extraction and customized premium antioxidant infusion.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
        price: 'KES 3,500',
        match: '97% Style Match'
      };
    } else {
      return {
        title: 'Signature Soft Glam Makeup',
        desc: 'Weightless luxury base, soft-blended eyes, and custom-sculpted brow definition.',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600',
        price: 'KES 500',
        match: '93% Style Match'
      };
    }
  };

  const rec = step === 5 ? getRecommendation() : null;

  return (
    <div className="bg-[#121214] border border-zinc-900 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient glowing lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.25em] font-mono">Interactive Style Finder</span>
            <Sparkles className="w-4 h-4 text-rose-400" />
          </div>
          <h2 className="font-serif italic text-2xl md:text-3xl text-white tracking-tight">
            Discover Your Signature Aesthetic
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Take our 30-second personality quiz to unlock a recommended treatment combo and a 15% discount code!
          </p>
        </div>

        {/* Content Stages */}
        <div className="min-h-[280px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* Stage 0: Start Card */}
            {step === 0 && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="text-center space-y-6 w-full max-w-md py-6"
              >
                <div className="bg-zinc-950 p-4 rounded-3xl border border-zinc-900 w-fit mx-auto shadow-lg">
                  <HelpCircle className="w-10 h-10 text-rose-400 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Unsure what style suits you best?</h3>
                  <p className="text-xs text-zinc-400">Our smart algorithm combines your beauty focus, timeline, and aesthetic vibes to craft the ultimate Mresh recommendation.</p>
                </div>
                <button
                  onClick={handleStart}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition duration-200 active:scale-95 shadow-lg shadow-rose-950/20"
                >
                  Start Style Quiz
                </button>
              </motion.div>
            )}

            {/* Stage 1: Goal selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-5"
              >
                <div className="text-center">
                  <span className="text-[10px] font-bold text-zinc-500 font-mono">QUESTION 1 OF 3</span>
                  <h3 className="font-serif italic text-lg text-white mt-1">What is your primary beauty focus today?</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                  {[
                    { id: 'hair', label: 'Exquisite Hair Styling', desc: 'Silk presses, dreadlocks, custom braids', icon: <Scissors className="w-4 h-4 text-rose-400" /> },
                    { id: 'nails', label: 'Premium Nail Artistry', desc: 'Sleek extensions, gel overlays, flower tips', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
                    { id: 'skincare', label: 'Clinical Skin Wellness', desc: 'Vacuum hydrafacials, exfoliation, hydration', icon: <Heart className="w-4 h-4 text-emerald-400" /> },
                    { id: 'makeup', label: 'Red Carpet Makeup Glam', desc: 'Soft glams, microblading, eyelashes sets', icon: <Award className="w-4 h-4 text-purple-400" /> }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectGoal(opt.id)}
                      className="bg-zinc-950 border border-zinc-900 hover:border-rose-500/40 p-4 rounded-2xl text-left transition duration-300 group flex items-start gap-3 cursor-pointer"
                    >
                      <div className="bg-[#121214] p-2.5 rounded-xl border border-zinc-900 group-hover:bg-rose-950/10 transition-colors">
                        {opt.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-rose-400 transition-colors">{opt.label}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stage 2: Aesthetic vibes selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-5"
              >
                <div className="text-center">
                  <span className="text-[10px] font-bold text-zinc-500 font-mono font-semibold">QUESTION 2 OF 3</span>
                  <h3 className="font-serif italic text-lg text-white mt-1">Which aesthetic matches your styling soul?</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                  {[
                    { id: 'minimal', label: 'Minimalist & Clean', desc: 'Simple, neat, organic and highly sophisticated' },
                    { id: 'bold', label: 'Bold & Creative', desc: 'Statement colors, 3D accents, customized parts' },
                    { id: 'boho', label: 'Bohemian & Textured', desc: 'Natural braids, shells, beads, tribal roots' },
                    { id: 'red-carpet', label: 'Polished Luxury Glow', desc: 'Highly refined glams, dramatic wedding aesthetic' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectVibe(opt.id)}
                      className="bg-zinc-950 border border-zinc-900 hover:border-rose-500/40 p-4 rounded-2xl text-left transition duration-300 group cursor-pointer"
                    >
                      <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-rose-400 transition-colors">{opt.label}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stage 3: Timeline */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-5"
              >
                <div className="text-center">
                  <span className="text-[10px] font-bold text-zinc-500 font-mono">QUESTION 3 OF 3</span>
                  <h3 className="font-serif italic text-lg text-white mt-1">When do you desire to get pampered in Kilimani?</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                  {[
                    { id: 'urgent', label: 'This Week', desc: 'I need urgent glow' },
                    { id: 'planned', label: 'This Month', desc: 'Planning my lookbook' },
                    { id: 'exploring', label: 'Just Browsing', desc: 'Exploring salon trends' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectTimeline(opt.id)}
                      className="bg-zinc-950 border border-zinc-900 hover:border-rose-500/40 p-4 rounded-2xl text-center transition duration-300 group cursor-pointer"
                    >
                      <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-rose-400 transition-colors">{opt.label}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stage 4: Calculating */}
            {step === 4 && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-rose-400 absolute animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-widest animate-pulse font-mono">Styling Analysis Engine</p>
                  <p className="text-[11px] text-zinc-400">Curating the perfect luxury treatment and matching offer...</p>
                </div>
              </motion.div>
            )}

            {/* Stage 5: Results panel */}
            {step === 5 && rec && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
              >
                {/* Result Image */}
                <div className="md:col-span-4 aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img src={rec.image} alt={rec.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                {/* Result Info */}
                <div className="md:col-span-8 space-y-4 text-left">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{rec.match}</span>
                    <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Estimated: {rec.price}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif italic font-semibold text-white text-xl">{rec.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{rec.desc}</p>
                  </div>

                  {/* Coupon Box */}
                  <div className="bg-gradient-to-r from-rose-950/20 to-zinc-950/20 border border-rose-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-semibold text-rose-400 uppercase tracking-widest font-mono">15% FIRST-TIME VISIT OFFER</span>
                      <p className="text-[10px] text-zinc-400">Apply code at check-in or booking notes</p>
                    </div>
                    <div className="bg-rose-500/10 border border-dashed border-rose-500/30 font-mono text-xs font-bold text-rose-400 px-3.5 py-2 rounded-lg select-all tracking-wider">
                      MRESHFIRST15
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={onBookRecommended}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition duration-200 active:scale-95 shadow-md shadow-rose-950/20 cursor-pointer"
                    >
                      {isAdmin ? 'Owner Catalog View' : 'Book This Look Now'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-semibold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retake Quiz
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
