import React from 'react';

export default function AuthErrorPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Authentication Error</h1>
      <p style={{ fontSize: 18, color: '#c00' }}>
        Sorry, something went wrong during sign-in.<br />
        Please try again or contact support if the problem persists.
      </p>
      <a href="/auth/signin" style={{ marginTop: 24, fontSize: 16, color: '#0070f3', textDecoration: 'underline' }}>
        Back to Sign In
      </a>
    </div>
  );
} 