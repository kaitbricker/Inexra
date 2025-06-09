"use client";

import Sidebar from "@/components/Sidebar";
import { AskInexraAIProvider } from "@/components/AskInexraAIPanel";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AskInexraAIProvider>
          <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </AskInexraAIProvider>
      </body>
    </html>
  );
} 