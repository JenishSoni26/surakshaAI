import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill">shield_locked</span>
            SurakshaPayAI
          </div>
          <p className="text-sm text-on-surface-variant">© 2024 SurakshaPayAI. AI-Powered Financial Protection.</p>
        </div>
        <div className="md:col-span-2 flex flex-wrap justify-end gap-6 opacity-80 hover:opacity-100 transition-opacity items-start">
          <Link href="/learn" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">Security Literacy</Link>
          <Link href="/emergency" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">Emergency Contact</Link>
          <Link href="#" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
