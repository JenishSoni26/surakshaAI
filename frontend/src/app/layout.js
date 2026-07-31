import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { LanguageProvider } from '@/lib/i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: 'SurakshaPayAI - Protect Your Money with AI',
  description: 'AI-powered financial security platform. Detect scams, verify UPI payments, scan QR codes, and learn financial safety.',
};

export default function RootLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="en">
      <body className="bg-background text-on-background min-h-screen font-sans antialiased">
        <GoogleOAuthProvider clientId={googleClientId}>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
