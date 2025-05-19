import React from 'react';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

const stats = [
  { label: 'Messages Analyzed', value: 1200000 },
  { label: 'Seconds Saved', value: 350000 },
  { label: 'Leads Identified', value: 42000 },
];

const clients = [
  // Placeholder logos (replace with real SVGs or images)
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
];

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let incrementTime = 10;
    let step = Math.ceil(end / 100);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplay(start);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

export default function Page() {
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#0a1837] via-[#1a2747] to-[#232b3b] text-white flex flex-col">
      {/* Animated Hero Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg width="100%" height="100%" className="w-full h-full" style={{ minHeight: '100vh' }}>
          <defs>
            <radialGradient id="bg-gradient" cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0a1837" stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-gradient)" />
          {/* Abstract lines */}
          <motion.path
            d="M0 200 Q400 100 800 200 T1600 200"
            stroke="#6366f1" strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />
        </svg>
      </div>

      {/* Header */}
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
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-10 py-20 gap-16 relative z-10">
        <div className="max-w-xl space-y-8">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Unlock the Power of Conversations
          </motion.h1>
          <motion.p
            className="text-xl text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Bring clarity to your conversations. Inexra uses cutting-edge AI to turn fragmented messages into actionable insights, helping businesses connect better, respond faster, and grow smarter.
          </motion.p>
          <motion.a
            href="#get-started"
            className="inline-block px-10 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold rounded-xl shadow-xl hover:scale-105 hover:shadow-2xl transition active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-400"
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
          </motion.a>
          <div className="flex gap-8 mt-10">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-indigo-400">
                  <AnimatedCounter value={stat.value} />
                </span>
                <span className="text-sm text-gray-300 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Conversation Preview Widget */}
        <motion.div
          className="hidden md:block relative z-10"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-2xl shadow-2xl p-7 w-96 border border-indigo-700/30">
            <div className="flex items-center gap-3 mb-4">
              <FaInstagram className="text-pink-500 text-2xl" />
              <FaTwitter className="text-sky-500 text-2xl" />
              <FaLinkedin className="text-blue-700 text-2xl" />
            </div>
            <div className="mb-4">
              <div className="font-semibold text-gray-100 mb-2">Conversations</div>
              <div className="flex items-center gap-2 mb-2">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Kathryn Murphy" className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-100">Kathryn Murphy</div>
                  <div className="text-xs text-gray-400">Are you available for call?...</div>
                </div>
                <span className="text-xs text-gray-500">2h ago</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-green-200/20 text-green-400 text-xs font-semibold">Positive</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Dariene Robertson" className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-100">Dariene Robertson</div>
                  <div className="text-xs text-gray-400">Can you tell me more about your product?</div>
                </div>
                <span className="text-xs text-gray-500">Fri</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-yellow-200/20 text-yellow-400 text-xs font-semibold">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-200/20 flex items-center justify-center">
                  <span className="text-indigo-400 font-bold">MT</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-100">Message Templates</div>
                  <div className="text-xs text-gray-400">Save and reuse</div>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded bg-indigo-200/20 text-indigo-400 text-xs font-semibold">42</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Trusted by Section */}
      <section className="w-full py-10 bg-gradient-to-r from-[#101a2b] to-[#1a2747] flex flex-col items-center">
        <div className="text-gray-300 text-lg mb-4">Trusted by leading companies</div>
        <div className="flex gap-10 flex-wrap items-center justify-center">
          {clients.map((logo, i) => (
            <img key={i} src={logo} alt="Client logo" className="h-8 opacity-80 grayscale hover:opacity-100 hover:grayscale-0 transition" />
          ))}
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {[
          {
            title: 'Unified Inbox',
            desc: 'Manage all your conversations in one place.',
            icon: (
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 3h-1a2 2 0 0 0-2 2v2" /></svg>
            ),
          },
          {
            title: 'AI Analysis',
            desc: 'Summarize, classify, and detect sentiment.',
            icon: (
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M9 17v-2a4 4 0 0 1 4-4h2" /><circle cx="16" cy="16" r="12" /></svg>
            ),
          },
          {
            title: 'Message Templates',
            desc: 'Save and reuse common responses.',
            icon: (
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3h-1a2 2 0 0 0-2 2v2" /></svg>
            ),
          },
          {
            title: 'Engagement Stats',
            desc: 'Track reply rates and key metrics.',
            icon: (
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M3 3v26h26" /><rect x="7" y="7" width="18" height="18" rx="2" /></svg>
            ),
          },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-2xl shadow-xl p-8 border border-indigo-700/30 flex flex-col items-center gap-4 hover:scale-105 hover:shadow-2xl transition group"
            whileHover={{ scale: 1.05 }}
          >
            <div className="mb-2">{f.icon}</div>
            <div className="font-bold text-xl text-indigo-200 group-hover:text-indigo-400 transition bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{f.title}</div>
            <div className="text-gray-300 text-center">{f.desc}</div>
          </motion.div>
        ))}
      </section>

      {/* What is Inexra / Platform Overview */}
      <section id="overview" className="max-w-4xl mx-auto px-8 py-16">
        <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-2xl shadow-lg p-10 flex flex-col gap-6 border border-indigo-700/30">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">What is Inexra?</h2>
          <p className="text-lg text-gray-200">
            Inexra is an AI-powered digital conversation mapper that transforms fragmented business communications into structured, actionable insights. Designed for modern businesses, Inexra helps teams centralize their communication streams, identify key trends, and gain deeper understanding from customer interactions. By integrating advanced natural language processing (NLP) and sentiment analysis, Inexra turns every message into valuable context, empowering companies to make smarter, data-driven decisions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="font-bold text-lg text-indigo-400 mb-2">Platform Goals</h3>
              <ul className="list-disc list-inside text-gray-200 space-y-1">
                <li><b>Centralize Communication:</b> Aggregate conversations from multiple platforms (LinkedIn, Instagram, Twitter, Slack, Email) into a single, searchable repository.</li>
                <li><b>Enhance Understanding:</b> Use AI to extract sentiment, intent, and key insights from messages.</li>
                <li><b>Optimize Engagement:</b> Identify high-value leads, predict customer needs, and streamline response strategies.</li>
                <li><b>Accelerate Decision-Making:</b> Provide data-driven insights for faster, more informed business actions.</li>
                <li><b>Reduce Churn:</b> Improve customer retention through proactive engagement and support.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg text-indigo-400 mb-2">Why Inexra?</h3>
              <ul className="list-disc list-inside text-gray-200 space-y-1">
                {marketingPhrases.map((phrase, idx) => (
                  <li key={idx} className="italic">{phrase}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

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
      <section className="w-full flex justify-center py-20 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        >
          <svg width="100%" height="100%" className="w-full h-full">
            <defs>
              <radialGradient id="cta-gradient" cx="50%" cy="50%" r="80%">
                <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-gradient)" />
          </svg>
        </motion.div>
        <div className="text-center z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">Ready to Revolutionize Your Communication Strategy?</h2>
          <p className="text-lg text-indigo-100 mb-8">Get started with Inexra today and unlock the power of your digital communications.</p>
          <motion.a
            href="#get-started"
            className="inline-block px-12 py-5 bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:scale-105 hover:shadow-indigo-400/40 transition active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-400 animate-pulse"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
          </motion.a>
        </div>
      </section>

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
