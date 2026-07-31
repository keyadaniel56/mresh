import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, User, Scissors, Loader, Shield, Radio } from 'lucide-react';
import { ChatMessage } from '../types';
import { getApiUrl, getWsUrl } from '../lib/api';

interface ChatPanelProps {
  token: string | null;
  onOpenLogin: () => void;
}

export default function ChatPanel({ token, onOpenLogin }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [recipientMode, setRecipientMode] = useState<'owner' | 'ai-bot'>('owner');
  const [hasWorkingAi, setHasWorkingAi] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Check if server has working external Gemini API configured
  useEffect(() => {
    fetch(getApiUrl('/api/chat/status'))
      .then(res => res.json())
      .then(data => {
        if (data && data.hasAi) {
          setHasWorkingAi(true);
        } else {
          setHasWorkingAi(false);
          setRecipientMode('owner');
        }
      })
      .catch(() => {
        setHasWorkingAi(false);
        setRecipientMode('owner');
      });
  }, []);

  const fetchChats = async () => {
    if (!token) return;
    try {
      const res = await fetch(getApiUrl('/api/chat'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Error fetching chat history:', e);
    }
  };

  // Setup WebSocket connection when token exists
  useEffect(() => {
    if (!token) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
      return;
    }

    const wsUrl = getWsUrl();
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      // Authenticate with server
      socket.send(JSON.stringify({ type: 'auth', token }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'auth_success') {
          setWsConnected(true);
        } else if (data.type === 'new_message') {
          const newMsg: ChatMessage = data.message;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setLoading(false);
        }
      } catch (e) {
        console.error('Error parsing WS message in ChatPanel:', e);
      }
    };

    socket.onerror = (e) => {
      console.warn('Chat WebSocket connection error, relying on REST fallback:', e);
      setWsConnected(false);
    };

    socket.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [token]);

  useEffect(() => {
    if (token && isOpen) {
      fetchChats();
    }
  }, [token, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    if (!token) {
      onOpenLogin();
      return;
    }

    setInputText('');
    setLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'current-user',
      senderName: 'You',
      text,
      recipientId: recipientMode,
      isFromAi: false,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // Send via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && wsConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        recipientId: recipientMode,
        text
      }));
      setLoading(false);
    } else {
      // REST fallback
      try {
        const res = await fetch(getApiUrl('/api/chat'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text, recipientId: recipientMode })
        });

        if (res.ok) {
          fetchChats();
        }
      } catch (e) {
        console.error('Network error during chat:', e);
      } finally {
        setLoading(false);
      }
    }
  };

  const quickPrompts = [
    "Do you offer knotless braids?",
    "What nail art options do you have?",
    "Tell me about Hydrafacials.",
    "Can I pay with M-Pesa?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="chat-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-4 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group"
        aria-label="Open support chat"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-out font-medium text-sm whitespace-nowrap">
          Chat with Mresh Salon
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          id="chat-window"
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[540px] bg-[#121214] rounded-2xl shadow-2xl border border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 text-zinc-100"
        >
          {/* Header */}
          <div className="bg-zinc-950 border-b border-zinc-900 text-white px-4 py-3 flex flex-col gap-2 shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-rose-950/40 border border-rose-900/30 p-1.5 rounded-lg">
                  <Scissors className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-serif italic text-sm text-white">
                    {recipientMode === 'owner' ? 'Mresh Salon Customer Desk' : 'Mresh Beauty Consultant'}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {wsConnected ? 'Real-Time WebSocket Active' : 'HTTP Sync'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900 p-1 rounded transition"
                id="close-chat-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Switcher (ONLY displayed if working external Gemini API is linked) */}
            {hasWorkingAi && (
              <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px] font-medium">
                <button
                  onClick={() => setRecipientMode('owner')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${recipientMode === 'owner' ? 'bg-rose-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                  id="switch-chat-owner-btn"
                >
                  <Shield className="w-3 h-3" />
                  Salon Desk
                </button>
                <button
                  onClick={() => setRecipientMode('ai-bot')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${recipientMode === 'ai-bot' ? 'bg-rose-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                  id="switch-chat-ai-btn"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Stylist
                </button>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c0c0e]" ref={scrollRef}>
            {messages.length === 0 && !loading && (
              <div className="text-center py-8 space-y-4">
                <div className="bg-rose-950/30 p-3.5 rounded-full w-fit mx-auto border border-rose-900/10">
                  <Sparkles className="w-8 h-8 text-rose-400 animate-bounce" />
                </div>
                <div className="max-w-[240px] mx-auto space-y-1">
                  <p className="text-xs font-serif italic text-white">
                    {recipientMode === 'owner' ? 'Message Salon Support directly' : 'How can we assist you today?'}
                  </p>
                  <p className="text-[10px] text-zinc-550 leading-relaxed">
                    {recipientMode === 'owner'
                      ? 'Chat live with our salon reception for custom requests, bridal inquiries, or appointment updates.'
                      : 'Ask our AI Stylist about hair tips, nail art, facial treatments, prices, or gift cards.'}
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderId !== 'ai-bot' && msg.senderId !== 'u-admin' && !msg.senderName.includes('Desk') && msg.senderName !== 'Admin';
              const isDeskMsg = msg.senderId === 'u-admin' || msg.senderName.includes('Desk') || msg.senderName.includes('Owner') || msg.senderName.includes('Faith');

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold ${
                      isMe 
                        ? 'bg-rose-600 text-white' 
                        : isDeskMsg 
                          ? 'bg-amber-600 text-white border border-amber-500' 
                          : 'bg-zinc-900 text-rose-400 border border-zinc-800'
                    }`}>
                      {isMe ? <User className="w-3.5 h-3.5" /> : isDeskMsg ? 'S' : 'M'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[9px] text-zinc-400 font-bold">
                          {isMe ? 'You' : (msg.senderName.includes('Owner') || msg.senderName.includes('Faith') ? 'Mresh Salon Desk' : msg.senderName)}
                        </span>
                        {isDeskMsg && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded font-mono">DESK</span>
                        )}
                      </div>
                      <div className={`px-3 py-2 text-xs rounded-2xl leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-rose-600 text-white rounded-tr-none' 
                          : isDeskMsg
                            ? 'bg-zinc-900 border border-amber-500/40 text-amber-100 rounded-tl-none'
                            : 'bg-zinc-900 text-zinc-200 border border-zinc-850 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-zinc-600 block mt-1 ml-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-rose-400 border border-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-semibold">
                    <Loader className="w-3 h-3 animate-spin text-rose-400" />
                  </div>
                  <div className="bg-zinc-900 text-zinc-400 border border-zinc-850 px-3 py-2 text-xs rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                    <span className="text-[10px] font-medium">Sending real-time message</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Recommend Prompt Chips */}
          <div className="px-3 py-2 border-t border-zinc-900 bg-zinc-950 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[10px] bg-zinc-900 hover:bg-[#121214] text-rose-400 border border-zinc-850 hover:border-zinc-800 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors duration-150 shrink-0 font-semibold active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-zinc-900 bg-[#121214] flex gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputText);
              }}
              placeholder={token ? (recipientMode === 'owner' ? "Message Salon Support directly..." : "Ask AI Stylist a question...") : "Login to chat with Mresh Salon"}
              disabled={!token}
              className="flex-1 text-xs bg-zinc-950 border border-zinc-850 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 rounded-xl px-3 py-2.5 text-zinc-100 placeholder:text-zinc-500 disabled:bg-zinc-900 disabled:text-zinc-600"
              id="chat-input-field"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || !token}
              className="bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-900 disabled:text-zinc-600 text-white rounded-xl px-3.5 flex items-center justify-center transition-colors duration-200 shadow cursor-pointer"
              id="send-chat-msg-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

