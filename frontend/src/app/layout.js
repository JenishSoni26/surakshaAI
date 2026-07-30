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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
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
