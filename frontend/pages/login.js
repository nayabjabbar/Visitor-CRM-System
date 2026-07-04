import { useState } from "react";
import { useRouter } from "next/router";
import api from "../lib/api";
import { saveSession, isLoggedIn } from "../lib/auth";
import { useEffect } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace("/dashboard");
  }, [router]);

  function validate() {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      next.email = "Enter a valid email address.";
    }
    if (password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.error || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-slate-100 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%">
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-teal-500 font-mono text-sm tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Front Desk
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight max-w-md">
            Every visitor and customer, logged in one place.
          </h1>
          <p className="mt-4 text-slate-400 max-w-sm">
            Check visitors in and out, manage your customer records, and see
            who&apos;s on-site right now.
          </p>
        </div>
        <div className="relative font-mono text-xs text-slate-500">
          Mini Visitor CRM System
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-canvas dark:bg-slate-950">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-ink dark:text-white">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use your dashboard credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink dark:text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="admin@crm.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink dark:text-slate-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-400 font-mono">
            Demo credentials: admin@crm.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}
