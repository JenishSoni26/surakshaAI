'use client';
import { useState, useRef, useEffect } from 'react';
import { useFeatureAuth } from '@/lib/featureAuth';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarkdownMessage from '@/components/MarkdownMessage';

export default function AssistantPage() {
  const { t, lang } = useLanguage();
  const { requireAuth } = useFeatureAuth();

  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: t('asst.welcome') }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const quickActions = [
    t('asst.q1'),
    t('asst.q2'),
    t('asst.q3'),
    t('asst.q4'),
  ];

  const sendMessage = requireAuth(async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const data = await api.chat(text, lang);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('asst.welcome') }]);
    } finally {
      setTyping(false);
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20 pb-0 flex flex-col">
        <div className="max-w-3xl mx-auto px-4 w-full flex-1 flex flex-col">
          <div className="text-center py-4">
            <h1 className="text-xl font-bold flex items-center justify-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary icon-fill">smart_toy</span>
              {t('asst.title')}
            </h1>
            <p className="text-xs text-on-surface-variant">{t('asst.subtitle')}</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-lowest shadow-lg border border-outline-variant/10 rounded-bl-sm'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="material-symbols-outlined text-primary text-sm icon-fill">smart_toy</span>
                      <span className="text-[10px] font-semibold text-primary">SurakshaAI</span>
                    </div>
                  )}
                  <MarkdownMessage content={msg.content} isUser={msg.role === 'user'} />
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-surface-container-lowest shadow-lg border border-outline-variant/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="typing-dot w-2 h-2 bg-primary rounded-full" />
                    <div className="typing-dot w-2 h-2 bg-primary rounded-full" />
                    <div className="typing-dot w-2 h-2 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 py-3">
            {quickActions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3 py-4 border-t border-outline-variant/10">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder={t('asst.placeholder')}
              className="flex-1 bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="bg-primary text-on-primary px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
