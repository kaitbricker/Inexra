"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h1>Login</h1>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
} 