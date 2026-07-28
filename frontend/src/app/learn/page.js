'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function LearnPage() {
  const [modules, setModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, [activeCategory]);

  const loadModules = async () => {
    try {
      const data = await api.getModules(activeCategory || undefined);
      setModules(data.modules);
      setCategories(data.categories);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const difficultyColors = { beginner: 'bg-success/10 text-success', intermediate: 'bg-tertiary-container/20 text-tertiary', advanced: 'bg-error-container/20 text-error' };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-secondary-container/30 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">school</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">Financial Literacy Hub</h1>
            <p className="text-on-surface-variant max-w-xl mx-auto">Interactive learning modules to help you recognize and avoid financial scams. Build your safety knowledge step by step.</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center animate-fade-in-up delay-100">
            <button onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${!activeCategory ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-primary-fixed/20'}`}>All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === cat ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-primary-fixed/20'}`}>{cat}</button>
            ))}
          </div>

          {/* Modules Grid */}
          {loading ? (
            <div className="flex justify-center py-20"><span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod, i) => {
                const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];
                return (
                  <div key={mod.id} className={`bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 animate-fade-in-up ${delays[Math.min(i, 4)]} relative overflow-hidden`}>
                    {mod.userProgress?.completed && (
                      <div className="absolute top-4 right-4"><span className="material-symbols-outlined text-success icon-fill">check_circle</span></div>
                    )}
                    <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-2xl text-primary">{mod.icon}</span>
                    </div>
                    <h3 className="text-base font-bold mb-2 text-on-surface">{mod.title}</h3>
                    <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{mod.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${difficultyColors[mod.difficulty]}`}>{mod.difficulty}</span>
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-xs">schedule</span>{mod.duration_minutes} min</span>
                    </div>
                    {mod.userProgress?.completed && (
                      <div className="flex items-center gap-2 text-xs text-success font-semibold mb-3">
                        <span className="material-symbols-outlined text-sm">emoji_events</span>
                        Score: {mod.userProgress.score}%
                      </div>
                    )}
                    <Link href={`/learn/${mod.id}`} className="w-full bg-primary text-on-primary py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">{mod.userProgress?.completed ? 'replay' : 'play_arrow'}</span>{mod.userProgress?.completed ? 'Retake Module' : 'Start Module'}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FAB />
    </div>
  );
}
