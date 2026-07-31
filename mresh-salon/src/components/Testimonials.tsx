import React, { useEffect, useState } from 'react';
import { Star, Quote, Heart, Loader } from 'lucide-react';
import { Review, Service } from '../types';
import { getApiUrl } from '../lib/api';

const AVATARS = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1523825036634-aab3cce05919?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200'
];

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, servicesRes] = await Promise.all([
          fetch(getApiUrl('/api/reviews')),
          fetch(getApiUrl('/api/services'))
        ]);

        if (reviewsRes.ok) {
          const revs = await reviewsRes.json();
          setReviews(revs.slice(0, 3));
        }

        if (servicesRes.ok) {
          const servs = await servicesRes.json();
          setServices(servs);
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left border-b border-zinc-900 pb-3">
        <h2 className="font-serif text-2xl text-white tracking-tight">Verified Guest Testimonials</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Real reviews from our beautiful community of clients</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 text-zinc-500">
          <Loader className="w-5 h-5 animate-spin text-rose-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 text-xs">
          No guest reviews published yet. Be the first to share your experience!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((t, idx) => {
            const matchedService = services.find(s => s.id === t.serviceId);
            const avatarUrl = AVATARS[idx % AVATARS.length];

            return (
              <div 
                key={t.id}
                className="bg-[#121214] border border-zinc-900/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 relative group hover:border-rose-500/20 transition-all duration-300"
              >
                {/* Quote Icon decorative */}
                <Quote className="w-8 h-8 text-rose-500/5 absolute top-4 right-4 pointer-events-none group-hover:text-rose-500/10 transition-colors" />

                <div className="space-y-3">
                  {/* Stars */}
                  <div className="flex text-amber-500 gap-0.5">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-zinc-350 leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>

                {/* Author Profile */}
                <div className="flex items-center gap-3 pt-3.5 border-t border-zinc-900/60">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-rose-500/30 flex-shrink-0 shadow-sm">
                    <img 
                      src={avatarUrl} 
                      alt={t.clientName} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-zinc-100 truncate">{t.clientName}</span>
                      <span className="text-[8px] text-zinc-500 font-medium flex-shrink-0">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-rose-400 font-mono font-medium truncate">
                        {matchedService?.name || 'Verified Treatment'}
                      </span>
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded flex items-center gap-0.5 font-bold uppercase tracking-wider flex-shrink-0">
                        <Heart className="w-2 h-2 fill-current" /> Verified
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
