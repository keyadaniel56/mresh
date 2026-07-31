import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, ChevronRight, PenSquare, ArrowLeft, Loader, Share2 } from 'lucide-react';
import { BlogPost } from '../types';
import { getApiUrl } from '../lib/api';
import ShareModal from './ShareModal';

interface BlogSectionProps {
  isAdmin: boolean;
  token: string | null;
}

export default function BlogSection({ isAdmin, token }: BlogSectionProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; text?: string; url?: string } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Hair Care');
  const [image, setImage] = useState('');
  const [readTime, setReadTime] = useState('3 min read');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/blogs'));
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (e) {
      console.error('Error fetching blogs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isAdmin) return;

    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl('/api/blogs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          category,
          image: image || undefined,
          readTime
        })
      });

      if (res.ok) {
        setTitle('');
        setExcerpt('');
        setContent('');
        setCategory('Hair Care');
        setImage('');
        setReadTime('3 min read');
        setShowAddForm(false);
        fetchBlogs(); // refresh
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create blog post');
      }
    } catch (e) {
      console.error('Error creating blog:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedBlog) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 text-zinc-100">
        <button
          onClick={() => setSelectedBlog(null)}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold group transition"
          id="back-to-blog-list-btn"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Journal
        </button>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Cover image */}
          <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden shadow border border-zinc-900">
            <img 
              src={selectedBlog.image} 
              alt={selectedBlog.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-4">
            <span className="inline-block bg-rose-950/40 text-rose-400 border border-rose-900/25 font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
              {selectedBlog.category}
            </span>
            <h2 className="font-serif italic tracking-tight text-2xl md:text-3xl text-white">
              {selectedBlog.title}
            </h2>

            {/* Metadata row & Share Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400 border-y border-zinc-900 py-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{selectedBlog.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(selectedBlog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedBlog.readTime}</span>
                </div>
              </div>

              <button
                onClick={() => setShareData({
                  title: selectedBlog.title,
                  text: selectedBlog.excerpt,
                  url: window.location.href
                })}
                className="flex items-center gap-1.5 text-xs bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
                id="share-full-blog-btn"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Article
              </button>
            </div>
          </div>

          {/* Article content */}
          <div className="text-zinc-300 text-sm leading-relaxed space-y-4 whitespace-pre-line font-sans">
            {selectedBlog.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-zinc-100">
      
      {/* Blog header section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-white">Mresh Beauty Journal</h3>
          <p className="text-xs text-zinc-400 mt-1">Salon news, expert styling tips, and clinical skincare guidelines</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-xs bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2.5 rounded-xl transition font-semibold shadow"
            id="admin-toggle-blog-form"
          >
            <PenSquare className="w-4 h-4" />
            {showAddForm ? 'Cancel Post' : 'New Article'}
          </button>
        )}
      </div>

      {/* Add New Blog Form (Admin only) */}
      {showAddForm && isAdmin && (
        <form onSubmit={handleSubmitBlog} className="bg-[#121214] border border-zinc-900 p-6 rounded-2xl max-w-2xl mx-auto space-y-4 animate-in slide-in-from-top-4 duration-300 text-zinc-200">
          <h4 className="font-serif italic text-sm text-white">Create New Beauty Article</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Article Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 5 Rules for flawless summer skin"
                className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                required
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
              >
                <option className="bg-[#121214]" value="Hair Care">Hair Care</option>
                <option className="bg-[#121214]" value="Nail Art">Nail Art</option>
                <option className="bg-[#121214]" value="Skin Wellness">Skin Wellness</option>
                <option className="bg-[#121214]" value="Glam Makeup">Glam Makeup</option>
                <option className="bg-[#121214]" value="Salon News">Salon News</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Excerpt (Short description)</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Give a catchphrase summary of the article..."
              className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Cover Image URL (Optional)</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Unsplash image link or leave blank"
                className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Read Time estimate</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g., 4 min read"
                className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none text-zinc-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Full Article Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full beauty tip details..."
              rows={8}
              className="w-full text-xs bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-none placeholder:text-zinc-500 text-zinc-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="text-xs bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 text-white px-6 py-2.5 rounded-xl transition font-semibold uppercase tracking-wider shadow"
          >
            {submitting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Publish Article'}
          </button>
        </form>
      )}

      {/* Blogs list view */}
      {loading ? (
        <div className="flex justify-center py-16 text-zinc-400 gap-2">
          <Loader className="w-5 h-5 animate-spin text-rose-500" />
          <span className="text-xs">Opening journal entries...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 border border-zinc-900 rounded-2xl bg-[#121214]">
          <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-xs text-zinc-400 font-medium">No blog posts available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <article 
              key={blog.id} 
              className="bg-[#121214] border border-zinc-900 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-zinc-800 hover:shadow-md transition duration-200 group text-zinc-100"
            >
              <div>
                <div className="aspect-[16/10] w-full bg-zinc-900 overflow-hidden relative">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 bg-[#121214] border border-rose-950/50 text-rose-400 text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
                    {blog.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareData({
                        title: blog.title,
                        text: blog.excerpt,
                        url: window.location.href
                      });
                    }}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-rose-600 text-white p-2 rounded-full border border-white/20 transition cursor-pointer shadow-md"
                    title="Share Article"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <span>{blog.readTime}</span>
                    <span>•</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 className="font-serif italic text-base text-zinc-100 group-hover:text-rose-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <button
                  onClick={() => setSelectedBlog(blog)}
                  className="flex-1 text-xs bg-zinc-900 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-zinc-200 hover:text-rose-400 font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1 group/btn cursor-pointer"
                >
                  Read Article
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => setShareData({
                    title: blog.title,
                    text: blog.excerpt,
                    url: window.location.href
                  })}
                  className="px-3 text-xs bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-850 rounded-xl transition flex items-center justify-center cursor-pointer"
                  title="Share Article"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareData && (
        <ShareModal
          title={shareData.title}
          text={shareData.text}
          url={shareData.url}
          isOpen={!!shareData}
          onClose={() => setShareData(null)}
        />
      )}

    </div>
  );
}
