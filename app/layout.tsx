import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { Providers } from './providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { Metadata } from 'next';
import MiniAppContainer from "@/components/MiniAppContainer";

export const metadata: Metadata = {
  title: 'Tydex - Web3 Calendar',
  description: 'Your decentralized calendar app powered by OnchainKit',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
          <Providers>
            <MiniAppContainer>
              {children}
            </MiniAppContainer>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
