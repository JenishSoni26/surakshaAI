'use client';
import { useState, useRef, useEffect } from 'react';
import { useFeatureAuth } from '@/lib/featureAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const quickActions = ['How do I report a scam?', 'Is this UPI ID safe?', 'What is phishing?', 'How to freeze my bank account?'];

const botResponses = {
  'report': 'To report a cyber crime or financial fraud in India:\n\n1. **Call 1930** — National Cyber Crime Helpline (24/7)\n2. **Visit cybercrime.gov.in** — File an online complaint\n3. **Contact your bank** — Call your bank\'s fraud helpline immediately\n4. **File an FIR** — Visit your nearest police station\n\nRemember to save all evidence including screenshots, messages, and transaction IDs.',
  'upi': 'To check if a UPI ID is safe:\n\n1. Go to our **UPI Guardian** tool\n2. Enter the UPI ID (e.g., name@upi)\n3. Our AI will verify it against trusted payment providers\n\n**Tips:** Verified merchants always use bank-registered handles like @ybl, @paytm, @axl. Be cautious of random UPI IDs from unknown sources.',
  'phishing': '**Phishing** is a type of cyber attack where scammers impersonate trusted entities (banks, government) to steal your personal information.\n\n**Warning Signs:**\n• Urgent language ("Act NOW!", "Account blocked!")\n• Suspicious links (bit.ly, .xyz domains)\n• Requests for OTP, PIN, or passwords\n• Grammar/spelling errors\n• Unknown sender claiming to be your bank\n\nUse our **Scam Analyzer** to check any suspicious message!',
  'freeze': 'To freeze your bank account in an emergency:\n\n1. **Call your bank\'s helpline immediately** (available 24/7)\n2. Use our **Emergency** page for quick access to all helpline numbers\n3. **SBI:** 1800-111-109\n4. **HDFC:** 1800-266-4332\n5. **ICICI:** 1800-200-3344\n\nYou can also visit our Emergency Help Center for one-tap freeze actions.',
  'default': 'I\'m your AI Security Assistant! I can help you with:\n\n• **Scam Detection** — Analyze suspicious messages\n• **UPI Safety** — Verify payment IDs\n• **Emergency Help** — Quick access to helplines\n• **Security Tips** — Learn to stay safe online\n\nWhat would you like to know?'
};

function getResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('report') || lower.includes('scam') || lower.includes('fraud')) return botResponses.report;
  if (lower.includes('upi') || lower.includes('safe')) return botResponses.upi;
  if (lower.includes('phishing') || lower.includes('what is')) return botResponses.phishing;
  if (lower.includes('freeze') || lower.includes('block') || lower.includes('account')) return botResponses.freeze;
  return botResponses.default;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your SurakshaPayAI Security Assistant. 🛡️\n\nI can help you stay safe from digital fraud. Ask me anything about scams, UPI safety, or emergency procedures!' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { requireAuth } = useFeatureAuth();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const sendMessage = requireAuth(async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    const response = getResponse(text);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setTyping(false);
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20 pb-0 flex flex-col">
        <div className="max-w-3xl mx-auto px-4 w-full flex-1 flex flex-col">
          <div className="text-center py-4">
            <h1 className="text-xl font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary icon-fill">smart_toy</span>AI Security Assistant
            </h1>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-lowest shadow-lg border border-outline-variant/10 rounded-bl-sm'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-2"><span className="material-symbols-outlined text-primary text-sm icon-fill">smart_toy</span><span className="text-[10px] font-semibold text-primary">SurakshaAI</span></div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-surface-container-lowest shadow-lg border border-outline-variant/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-1"><div className="typing-dot w-2 h-2 bg-primary rounded-full"></div><div className="typing-dot w-2 h-2 bg-primary rounded-full"></div><div className="typing-dot w-2 h-2 bg-primary rounded-full"></div></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 py-3">
            {quickActions.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-primary-fixed/30 hover:text-primary transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3 py-4 border-t border-outline-variant/10">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about scams, UPI safety, or security tips..."
              className="flex-1 bg-surface-container rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            <button onClick={() => sendMessage(input)} disabled={!input.trim()}
              className="bg-primary text-on-primary px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
