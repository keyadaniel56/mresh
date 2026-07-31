import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Quote, ThumbsUp, Loader, Heart } from 'lucide-react';
import { Review, Service } from '../types';
import { getApiUrl } from '../lib/api';

interface ReviewsSectionProps {
  token: string | null;
  services: Service[];
  onOpenLogin: () => void;
}

export default function ReviewsSection({ token, services, onOpenLogin }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/reviews'));
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onOpenLogin();
      return;
    }

    if (!reviewText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl('/api/reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          text: reviewText,
          serviceId: selectedServiceId || undefined
        })
      });

      if (res.ok) {
        setReviewText('');
        setSelectedServiceId('');
        setRating(5);
        fetchReviews(); // refresh
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit review');
      }
    } catch (e) {
      console.error('Error submitting review:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <div id="reviews-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Left Column: Rating Summaries */}
      <div className="bg-[#121214] border border-zinc-900 p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="font-serif text-xl text-white tracking-tight">Guest Experiences</h3>
          <p className="text-xs text-zinc-400 mt-1">Real feedback from verified clients at Mresh Salon</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-4xl font-serif font-medium text-white tracking-tight">{averageRating}</div>
          <div>
            <div className="flex gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-4 h-4 fill-current ${Number(averageRating) >= s ? 'text-amber-500' : 'text-zinc-800'}`} 
                />
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Based on {reviews.length} completed appointments</p>
          </div>
        </div>

        {/* Rating Bars */}
        <div className="space-y-2 pt-2">
          {[
            { stars: 5, pct: '85%' },
            { stars: 4, pct: '12%' },
            { stars: 3, pct: '3%' },
            { stars: 2, pct: '0%' },
            { stars: 1, pct: '0%' },
          ].map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="w-3 text-right font-medium">{bar.stars}</span>
              <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full rounded-full" style={{ width: bar.pct }}></div>
              </div>
              <span className="w-8 text-zinc-500 text-right">{bar.pct}</span>
            </div>
          ))}
        </div>

        {/* Form to Write a Review */}
        <div className="border-t border-zinc-900 pt-6">
          <h4 className="font-semibold text-[10px] text-zinc-400 mb-3 tracking-widest uppercase">Add Your Experience</h4>
          
          {token ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star selector */}
              <div>
                <label className="text-[11px] text-zinc-450 block mb-1">Your Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 fill-current ${rating >= star ? 'text-amber-500' : 'text-zinc-800'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Service tags */}
              <div>
                <label className="text-[11px] text-zinc-450 block mb-1">Service received</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                >
                  <option className="bg-[#121214]" value="">Choose service (Optional)</option>
                  {services.map(s => (
                    <option className="bg-[#121214]" key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Text review */}
              <div>
                <label className="text-[11px] text-zinc-450 block mb-1">Your review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your blowout, nails design, or glowing facial treatment..."
                  rows={3}
                  className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none placeholder:text-zinc-500 text-zinc-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-3 font-semibold uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow"
              >
                {submitting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl text-center space-y-2.5">
              <p className="text-[11px] text-zinc-450">Only verified clients can leave reviews. Please sign in to write yours.</p>
              <button
                onClick={onOpenLogin}
                className="text-xs bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2 rounded-lg font-semibold transition"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Reviews Grid */}
      <div className="lg:col-span-2 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-zinc-400 gap-2">
            <Loader className="w-5 h-5 animate-spin text-rose-500" />
            <span className="text-xs">Gathering verified reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 border border-zinc-900 rounded-2xl bg-[#121214]">
            <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No reviews posted yet.</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Be the first to share your glam salon experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => {
              const service = services.find(s => s.id === rev.serviceId);
              return (
                <div 
                  key={rev.id} 
                  className="bg-[#121214] border border-zinc-900/80 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition duration-200 relative group text-zinc-200"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-rose-950/20 -scale-x-100 group-hover:scale-x-100 transition-transform duration-300" />
                  
                  <div className="space-y-2.5">
                    {/* Stars */}
                    <div className="flex gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 fill-current ${rev.rating >= star ? 'text-amber-500' : 'text-zinc-800'}`} 
                        />
                      ))}
                    </div>

                    {/* Text content */}
                    <p className="text-xs text-zinc-300 leading-relaxed italic pr-4">
                      "{rev.text}"
                    </p>
                  </div>

                  {/* Profile info footer */}
                  <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-4">
                    <div>
                      <div className="font-semibold text-xs text-zinc-100">{rev.clientName}</div>
                      {service && (
                        <span className="inline-block bg-rose-950/40 text-rose-400 border border-rose-900/20 text-[9px] font-medium px-2 py-0.5 rounded-full mt-1">
                          {service.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-500">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
