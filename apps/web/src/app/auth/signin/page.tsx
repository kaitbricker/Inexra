"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);
    setRegisterSuccess(false);
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setRegisterError(data.error || "Registration failed.");
        setRegisterLoading(false);
        return;
      }
      setRegisterSuccess(true);
      setRegisterLoading(false);
      // Auto sign in after registration
      await signIn("credentials", { email, password, callbackUrl: "/" });
    } catch (err) {
      setRegisterError("Registration failed. Please try again.");
      setRegisterLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900">{showRegister ? "Create Your Inexra Account" : "Sign In to Inexra"}</h1>
        {!showRegister ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              const password = (form.elements.namedItem("password") as HTMLInputElement).value;
              const res = await signIn("credentials", {
                email,
                password,
                callbackUrl: "/dashboard",
                redirect: false,
              });
              setLoading(false);
              if (res?.error) {
                setError("Invalid email or password.");
              } else if (res?.ok) {
                window.location.href = "/dashboard";
              }
            }}
          >
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {registerError && <div className="text-red-600 text-sm text-center">{registerError}</div>}
            {registerSuccess && <div className="text-green-600 text-sm text-center">Account created! Redirecting...</div>}
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition disabled:opacity-60"
              disabled={registerLoading}
            >
              {registerLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}
        <div className="mt-6 text-center">
          {!showRegister ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                className="text-indigo-600 hover:underline font-semibold"
                onClick={() => setShowRegister(true)}
              >
                Create one
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                className="text-indigo-600 hover:underline font-semibold"
                onClick={() => setShowRegister(false)}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 