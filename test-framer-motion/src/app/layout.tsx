import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Test Framer Motion',
  description: 'A minimal test for framer-motion in Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
} 