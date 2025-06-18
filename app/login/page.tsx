"use client";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { signIn } from "next-auth/react";
import Head from "next/head";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (isSignUp && password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    // TODO: Implement email/password auth logic here
    setTimeout(() => {
      setLoading(false);
      setError("Email/password auth is not yet implemented.");
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Login | Inexra</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6B47FF]/60 to-[#A84FFF]/60">
        <div className="relative z-10 flex w-full max-w-4xl min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left: Brand/Story */}
          <div className="hidden md:flex flex-col justify-center items-start px-12 bg-gradient-to-br from-[#6B47FF] to-[#A84FFF] text-white w-1/2">
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">Welcome to Inexra</h1>
            <p className="text-lg mb-6 opacity-90">AI-powered messaging intelligence for marketers and CX leaders.</p>
            <ul className="space-y-2 text-sm opacity-90">
              <li>✅ Instantly label inbound messages</li>
              <li>✅ Spot trends, complaints, and collabs</li>
              <li>✅ Reply faster with AI-assisted workflows</li>
            </ul>
            <div className="mt-10 text-xs opacity-70">&copy; {new Date().getFullYear()} Inexra</div>
          </div>
          {/* Right: Auth Form */}
          <div className="flex flex-col w-full md:w-1/2 px-8 py-16 bg-white shadow-lg rounded-none md:rounded-l-none md:rounded-r-2xl max-w-md mx-auto justify-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {isSignUp ? "Create your account" : "Log in to Inexra"}
            </h2>
            <button
              className="w-full bg-white border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 mb-4 flex items-center justify-center gap-2 shadow-sm"
              onClick={() => signIn("google")}
              type="button"
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 5.1 28.1 3 22 3 11.5 3 3 11.5 3 22s8.5 19 19 19c9.5 0 18-7.5 18-19 0-1.3-.1-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 18.3 15 22 15c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 5.1 28.1 3 22 3c-7.2 0-13.2 4.1-16.2 10.1z"/><path fill="#FBBC05" d="M24 44c5.8 0 10.7-2.9 13.7-7.5l-7-5.1C29.1 36.9 26.1 38 24 38c-5.7 0-10.5-3.8-12.2-9.1l-7 5.1C6.8 41.9 14.5 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 7.5-11.7 7.5-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 5.1 28.1 3 22 3 11.5 3 3 11.5 3 22s8.5 19 19 19c9.5 0 18-7.5 18-19 0-1.3-.1-2.7-.5-4z"/></g></svg>
              Continue with Google
            </button>
            <div className="flex items-center mb-4">
              <hr className="flex-1 border-gray-300" />
              <span className="px-4 text-sm text-gray-500">or</span>
              <hr className="flex-1 border-gray-300" />
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email address"
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                disabled={loading}
              />
              {isSignUp && (
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
              )}
              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md py-2 font-semibold hover:opacity-90 transition disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? (isSignUp ? "Signing up..." : "Logging in...") : isSignUp ? "Sign Up" : "Log In"}
              </button>
            </form>
            <p className="text-sm text-center mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={() => { setIsSignUp(v => !v); setError(""); }}
                className="text-indigo-600 font-medium ml-1 underline"
                type="button"
                disabled={loading}
              >
                {isSignUp ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 