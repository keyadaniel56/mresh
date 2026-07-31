import React, { useState } from 'react';
import { Share2, Copy, Check, X, ExternalLink, MessageCircle, Send } from 'lucide-react';

interface ShareModalProps {
  title: string;
  text?: string;
  url?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ title, text, url, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const shareText = text || `Check out "${title}" at Mresh Salon, Nairobi!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: shareText,
        url: shareUrl,
      }).catch((err) => console.log('Share canceled or failed', err));
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 p-2 rounded-full transition cursor-pointer"
          title="Close"
          id="close-share-modal-btn"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pr-6">
          <div className="flex items-center gap-2 text-rose-400">
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">Share Look or Article</span>
          </div>
          <h3 className="font-serif italic text-lg text-white font-bold line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Quick Native Share if supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow cursor-pointer"
            id="native-device-share-btn"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share via Device Apps
          </button>
        )}

        {/* Social Platforms Grid */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
            Social Platforms
          </label>
          <div className="grid grid-cols-2 gap-2.5 text-xs font-medium">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-700/60 transition cursor-pointer"
              id="share-whatsapp-btn"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp</span>
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-850 hover:border-zinc-700 transition cursor-pointer"
              id="share-twitter-btn"
            >
              <ExternalLink className="w-4 h-4 text-sky-400 shrink-0" />
              <span>X / Twitter</span>
            </a>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-blue-300 hover:bg-blue-900/50 hover:border-blue-700/60 transition cursor-pointer"
              id="share-facebook-btn"
            >
              <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Facebook</span>
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-sky-950/40 border border-sky-800/40 text-sky-300 hover:bg-sky-900/50 hover:border-sky-700/60 transition cursor-pointer"
              id="share-telegram-btn"
            >
              <Send className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Telegram</span>
            </a>
          </div>
        </div>

        {/* Copy Link field */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-900">
          <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold">
            Direct Link
          </label>
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-850 rounded-2xl p-1.5 pl-3">
            <span className="text-xs text-zinc-400 truncate flex-1 font-mono">{shareUrl}</span>
            <button
              onClick={handleCopyLink}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750'
              }`}
              id="copy-share-url-btn"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
