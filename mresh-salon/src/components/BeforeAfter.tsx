import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Scissors, Eye, AlertCircle } from 'lucide-react';

interface Transformation {
  id: string;
  title: string;
  category: string;
  beforeDesc: string;
  afterDesc: string;
  beforeImg: string;
  afterImg: string;
  stylist: string;
  technique: string;
}

export default function BeforeAfter() {
  const [activeId, setActiveId] = useState<string>('t-1');
  const [showAfter, setShowAfter] = useState<boolean>(true);

  const transformations: Transformation[] = [
    {
      id: 't-1',
      category: 'Hair Artistry',
      title: 'Thermic Silk Press Revival',
      beforeDesc: 'Dry, tightly coiled natural 4C textures prone to severe shrinkage and moisture loss.',
      afterDesc: 'Glass-like bounce, completely flat-ironed with a thermal protective barrier without heat damage.',
      beforeImg: '/images/black_lady_before_treatment_1785418007402.jpg', // Natural 4C afro texture Black lady before silk press
      afterImg: '/images/african_silk_press_1785327747183.jpg', // Sleek silk press straight
      stylist: 'Faith Mresh',
      technique: 'Silk Press & Organic Thermal Seal'
    },
    {
      id: 't-2',
      category: 'Nail Artistry',
      title: 'French-Tip Coffin Acrylics',
      beforeDesc: 'Uneven nail beds, broken edges and brittle natural nails resulting from frequent stress.',
      afterDesc: 'Elongated, sturdy coffin extensions decorated with hand-painted floral art and custom tips.',
      beforeImg: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=600', // Natural nails
      afterImg: '/images/pink_flower_nails_1784461367686.jpg', // Pink floral acrylic extensions
      stylist: 'Joy Wambui',
      technique: 'Form-Sculpted Acrylics & Hand Paint'
    },
    {
      id: 't-3',
      category: 'Skin Wellness',
      title: 'Vortex-Suction Hydrafacial',
      beforeDesc: 'Clogged blackheads, dry patch lines and severe surface congestion from dust and pollution.',
      afterDesc: 'Saturated glass-skin clarity with clean pores, intensive deep hydration and high-potency Vitamin serums.',
      beforeImg: '/images/black_lady_facial_before_1785418025464.jpg', // Natural bare skin Black lady before hydrafacial
      afterImg: '/images/african_hydrafacial_glow_1785327761616.jpg', // Glowing hydrafacial result
      stylist: 'Dr. Anita Mwangi',
      technique: 'Vortex Deep Extraction & Serum Infusion'
    }
  ];

  const activeTrans = transformations.find(t => t.id === activeId) || transformations[0];

  return (
    <div className="bg-[#121214] border border-zinc-900 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Interactive Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-rose-400">✨</span>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.25em] font-mono">Artistry transformations</span>
            </div>
            <h3 className="font-serif italic text-2xl md:text-3xl text-white tracking-tight">
              Artistry Transformed
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Witness the unmatched precision of Faith Mresh and her signature master stylists. Use the interactive switch to toggle the hair, nails, or skin transformation.
            </p>
          </div>

          {/* Transformation Tabs */}
          <div className="flex flex-col gap-2.5">
            {transformations.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveId(t.id);
                  setShowAfter(true); // reset to after view
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${activeId === t.id ? 'bg-zinc-950 border-rose-500/30' : 'bg-[#121214] border-zinc-900 hover:border-zinc-800'}`}
              >
                <div className="space-y-0.5">
                  <span className={`text-[9px] font-bold tracking-widest uppercase block ${activeId === t.id ? 'text-rose-400' : 'text-zinc-500'}`}>
                    {t.category}
                  </span>
                  <span className={`text-xs font-semibold ${activeId === t.id ? 'text-zinc-50' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {t.title}
                  </span>
                </div>
                <div className={`p-1.5 rounded-lg border transition ${activeId === t.id ? 'bg-rose-950/20 border-rose-800/30 text-rose-400' : 'bg-[#121214] border-zinc-900 text-zinc-500'}`}>
                  <Scissors className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>

          {/* Detail card of active transformation */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-3 text-xs leading-relaxed">
            <div className="flex justify-between items-center text-[10px] font-semibold border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">Stylist: <span className="text-zinc-100">{activeTrans.stylist}</span></span>
              <span className="text-rose-400 uppercase font-mono">{activeTrans.technique}</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              {showAfter ? (
                <span><strong className="text-rose-400 uppercase text-[9px] mr-1 inline-block border border-rose-500/20 bg-rose-500/10 px-1 py-0.5 rounded font-mono">Result:</strong> {activeTrans.afterDesc}</span>
              ) : (
                <span><strong className="text-zinc-500 uppercase text-[9px] mr-1 inline-block border border-zinc-800 bg-zinc-900 px-1 py-0.5 rounded font-mono">Initial state:</strong> {activeTrans.beforeDesc}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Interactive Image Slider/Toggle Panel */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-6">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl group">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={showAfter ? 'after' : 'before'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={showAfter ? activeTrans.afterImg : activeTrans.beforeImg}
                  alt={showAfter ? 'After Transformation' : 'Before Treatment'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>

            {/* Title Overlay Label */}
            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider font-mono">
              <div className={`w-2 h-2 rounded-full ${showAfter ? 'bg-rose-500 animate-pulse' : 'bg-zinc-500'}`}></div>
              <span className="text-white">{showAfter ? 'AFTER TREATMENT' : 'BEFORE TREATMENT'}</span>
            </div>

            {/* Interactive Switch Slide Overlay */}
            <div className="absolute inset-x-4 bottom-4 z-20 bg-black/55 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/5 gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 font-semibold block">Click to view results</span>
                <span className="text-[9px] text-rose-300 font-mono">Compare natural vs pampered state</span>
              </div>
              <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setShowAfter(false)}
                  className={`text-[10px] px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${!showAfter ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Before
                </button>
                <button
                  type="button"
                  onClick={() => setShowAfter(true)}
                  className={`text-[10px] px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${showAfter ? 'bg-rose-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  After
                </button>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
          </div>
          
          {/* Quick interactive note */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Click the <strong>Before/After</strong> buttons to view actual unretouched transformations.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
