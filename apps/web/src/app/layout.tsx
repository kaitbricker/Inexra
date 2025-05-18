'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LogRocketProvider } from '@/components/LogRocketProvider';
import { ThemeProvider } from '@/hooks/useTheme2';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inexra - AI-Powered Digital Conversation Mapper',
  description: 'Manage your digital conversations with AI-powered insights and analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <LogRocketProvider>
            <main className="min-h-screen bg-background">
              {children}
            </main>
          </LogRocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 