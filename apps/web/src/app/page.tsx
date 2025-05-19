'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { HeroAnimated } from '@/components/landing/HeroAnimated';
import { FeatureHighlights } from '@/components/landing/FeatureHighlights';
import { AnimatedCTA } from '@/components/landing/AnimatedCTA';

const marketingPhrases = [
  'Turn Conversations into Clarity.',
  'AI-Powered Insights for Every Message.',
  'Unlock the Power of Digital Conversations.',
  'Understand. Engage. Grow.',
  'From Chaos to Context.',
  'Map Every Message. Master Every Interaction.',
  'Data-Driven Decisions Start Here.',
  'Transform Conversations into Actionable Intelligence.',
  'The Future of Communication is Here.',
  'Say Goodbye to Communication Silos.',
];

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#101a2b] to-[#1a2747]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101a2b] to-[#1a2747] text-white">
      <header className="flex items-center justify-between px-10 py-7 bg-transparent relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">×</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Inexra</span>
        </div>
        <nav className="flex items-center gap-10 text-gray-200 font-medium">
          <a href="#features" className="hover:text-indigo-400 transition">Features</a>
          <a href="#overview" className="hover:text-indigo-400 transition">What is Inexra?</a>
          <a href="#pricing" className="hover:text-indigo-400 transition">Pricing</a>
          <a href="#support" className="hover:text-indigo-400 transition">Support</a>
          <a href="/auth/signin" className="ml-6 px-6 py-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg hover:scale-105 hover:shadow-xl transition font-bold">Sign In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <HeroAnimated stats={[
        { label: 'Messages Analyzed', value: 1200000 },
        { label: 'Seconds Saved', value: 350000 },
        { label: 'Leads Identified', value: 42000 },
      ]} />

      {/* What is Inexra Section */}
      <section id="overview" className="w-full py-20 bg-gradient-to-r from-[#101a2b] to-[#1a2747]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What is Inexra?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Inexra is an AI-powered digital conversation mapper designed to transform fragmented business messages into clear, actionable insights. Built for modern teams, Inexra centralizes conversations across platforms, highlights critical information, and simplifies decision-making with powerful AI.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-xl p-8 border border-indigo-700/30 max-w-2xl w-full">
              <h3 className="text-2xl font-bold mb-4 text-indigo-400">Key Benefits</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400">•</span>
                  <div>
                    <strong className="text-white">Centralize Conversations:</strong>
                    <p className="text-gray-300">Aggregate messages from LinkedIn, Instagram, Twitter, Slack, Email, and more into a single, searchable hub.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400">•</span>
                  <div>
                    <strong className="text-white">Discover Hidden Insights:</strong>
                    <p className="text-gray-300">Use AI to identify trends, extract keywords, and classify sentiment for better customer understanding.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400">•</span>
                  <div>
                    <strong className="text-white">Act Faster:</strong>
                    <p className="text-gray-300">Identify high-value leads, optimize response strategies, and make data-driven decisions faster.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400">•</span>
                  <div>
                    <strong className="text-white">Reduce Noise:</strong>
                    <p className="text-gray-300">Filter out low-value conversations to focus on what truly matters.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-400">•</span>
                  <div>
                    <strong className="text-white">Streamline Communication:</strong>
                    <p className="text-gray-300">Connect conversations to outcomes, reducing response times and improving customer satisfaction.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <FeatureHighlights features={[{
        title: 'Unified Inbox',
        desc: 'Manage all your conversations in one place.',
        icon: (
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 3h-1a2 2 0 0 0-2 2v2" /></svg>
        ),
      }, {
        title: 'AI Analysis',
        desc: 'Summarize, classify, and detect sentiment.',
        icon: (
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M9 17v-2a4 4 0 0 1 4-4h2" /><circle cx="16" cy="16" r="12" /></svg>
        ),
      }, {
        title: 'Message Templates',
        desc: 'Save and reuse common responses.',
        icon: (
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3h-1a2 2 0 0 0-2 2v2" /></svg>
        ),
      }, {
        title: 'Engagement Stats',
        desc: 'Track reply rates and key metrics.',
        icon: (
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M3 3v26h26" /><rect x="7" y="7" width="18" height="18" rx="2" /></svg>
        ),
      }]} />

      {/* Expanded Features Section */}
      <section className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-xl shadow p-6 flex flex-col gap-2 border border-indigo-700/30">
          <div className="font-bold text-lg text-indigo-400 mb-1">Message Mapping</div>
          <div className="text-gray-200">Centralize and organize conversations across platforms.</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-xl shadow p-6 flex flex-col gap-2 border border-indigo-700/30">
          <div className="font-bold text-lg text-indigo-400 mb-1">AI-Powered Insights</div>
          <div className="text-gray-200">Understand customer sentiment and intent in real-time.</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-xl shadow p-6 flex flex-col gap-2 border border-indigo-700/30">
          <div className="font-bold text-lg text-indigo-400 mb-1">Lead Scoring</div>
          <div className="text-gray-200">Prioritize high-value interactions automatically.</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-xl shadow p-6 flex flex-col gap-2 border border-indigo-700/30">
          <div className="font-bold text-lg text-indigo-400 mb-1">Smart Search</div>
          <div className="text-gray-200">Find the context you need, when you need it.</div>
        </div>
        <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-xl shadow p-6 flex flex-col gap-2 border border-indigo-700/30">
          <div className="font-bold text-lg text-indigo-400 mb-1">Actionable Analytics</div>
          <div className="text-gray-200">Make data-driven decisions with powerful insights.</div>
        </div>
      </section>

      {/* Who Can Benefit Section */}
      <section className="w-full py-16 bg-gradient-to-r from-[#101a2b] to-[#1a2747] flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 text-center">Who Can Benefit from Inexra?</h2>
        <p className="text-indigo-300 text-lg mb-10 text-center">AI-Powered Communication Insights for Every Role</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl px-4">
          {/* Sales Teams */}
          <div className="rounded-2xl border border-indigo-700/40 bg-gradient-to-br from-[#1a2747] to-[#232b3b] p-6 shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
              <span className="font-bold text-lg text-white">Sales Teams</span>
            </div>
            <p className="text-gray-300">Identify high-value leads faster, track customer sentiment, and optimize follow-up strategies.</p>
          </div>
          {/* Customer Success Managers */}
          <div className="rounded-2xl border border-indigo-700/40 bg-gradient-to-br from-[#1a2747] to-[#232b3b] p-6 shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21C12 21 7 16.5 7 12.5C7 9.46243 9.46243 7 12.5 7C15.5376 7 18 9.46243 18 12.5C18 16.5 12 21 12 21Z" /><circle cx="12" cy="12" r="3" /></svg></span>
              <span className="font-bold text-lg text-white">Customer Success Managers</span>
            </div>
            <p className="text-gray-300">Reduce churn, improve response times, and track customer satisfaction.</p>
          </div>
          {/* Marketing Teams */}
          <div className="rounded-2xl border border-indigo-700/40 bg-gradient-to-br from-[#1a2747] to-[#232b3b] p-6 shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4" /><path d="M21 15v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2" /><path d="M7 7v10" /><path d="M17 7v10" /></svg></span>
              <span className="font-bold text-lg text-white">Marketing Teams</span>
            </div>
            <p className="text-gray-300">Understand audience sentiment, optimize campaigns, and track brand perception.</p>
          </div>
          {/* Founders and CEOs */}
          <div className="rounded-2xl border border-indigo-700/40 bg-gradient-to-br from-[#1a2747] to-[#232b3b] p-6 shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg></span>
              <span className="font-bold text-lg text-white">Founders and CEOs</span>
            </div>
            <p className="text-gray-300">Centralize communications, track business health, and improve team alignment.</p>
          </div>
          {/* Support Managers */}
          <div className="rounded-2xl border border-indigo-700/40 bg-gradient-to-br from-[#1a2747] to-[#232b3b] p-6 shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><rect x="7" y="7" width="10" height="10" rx="2" /></svg></span>
              <span className="font-bold text-lg text-white">Support Managers</span>
            </div>
            <p className="text-gray-300">Collect and analyze customer feedback for product improvements.</p>
          </div>
          {/* Support Teams */}
          <div className="rounded-2xl border border-indigo-700/40 bg-gradient-to-br from-[#1a2747] to-[#232b3b] p-6 shadow-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg></span>
              <span className="font-bold text-lg text-white">Support Teams</span>
            </div>
            <p className="text-gray-300">Reduce response time, identify common pain points, and improve customer experience.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="w-full py-16 bg-gradient-to-r from-[#101a2b] to-[#1a2747] flex flex-col items-center">
        <div className="text-2xl font-bold text-indigo-300 mb-8">What Our Clients Say</div>
        <div className="flex flex-wrap gap-8 justify-center">
          <div className="bg-gradient-to-br from-[#232b3b] to-[#1a2747] rounded-xl shadow-lg p-6 max-w-sm border border-indigo-700/30">
            <div className="text-gray-100 mb-2">“Inexra helped us understand our customers like never before. The AI insights are a game changer!”</div>
            <div className="text-indigo-400 font-bold">— Product Manager, TechCorp</div>
          </div>
          <div className="bg-gradient-to-br from-[#232b3b] to-[#1a2747] rounded-xl shadow-lg p-6 max-w-sm border border-indigo-700/30">
            <div className="text-gray-100 mb-2">“We saved hours every week and improved our response rates. Highly recommend Inexra!”</div>
            <div className="text-indigo-400 font-bold">— Head of CX, FinServe</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <AnimatedCTA />

      {/* Footer */}
      <footer className="w-full py-10 px-8 bg-[#101a2b] text-gray-400 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-indigo-700/30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">×</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Inexra</span>
        </div>
        <nav className="flex gap-8 text-sm">
          <a href="#case-studies" className="hover:text-indigo-400 transition">Case Studies</a>
          <a href="#resources" className="hover:text-indigo-400 transition">Resources</a>
          <a href="#support" className="hover:text-indigo-400 transition">Support</a>
        </nav>
        <div className="flex gap-4">
          <a href="#" className="hover:text-indigo-400 transition"><FaTwitter /></a>
          <a href="#" className="hover:text-indigo-400 transition"><FaLinkedin /></a>
          <a href="#" className="hover:text-indigo-400 transition"><FaInstagram /></a>
        </div>
        <div className="text-xs text-gray-500 mt-4 md:mt-0">© {new Date().getFullYear()} Inexra. All rights reserved.</div>
      </footer>
    </div>
  );
}
