import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { isLoggedIn, getUser, logout } from "../lib/auth";
import { useTheme } from "../pages/_app";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: GridIcon },
  { href: "/customers", label: "Customers", icon: UsersIcon },
  { href: "/visitors", label: "Visitors", icon: BadgeIcon },
];

export default function Layout({ children, title }) {
  const router = useRouter();
  const { dark, toggleDark } = useTheme();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
    setChecked(true);
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!checked) return null; // avoid flashing protected content

  return (
    <div className="min-h-screen flex bg-canvas dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink text-slate-300 p-5">
        <div className="flex items-center gap-2 px-1 mb-8">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-ink font-bold text-sm">
            V
          </div>
          <span className="font-bold text-white tracking-tight">Visitor CRM</span>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-slate-500 truncate px-1">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 bg-white/70 dark:bg-slate-900/50 backdrop-blur sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-ink dark:text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
            <div className="md:hidden">
              <button onClick={handleLogout} className="text-sm text-slate-500">
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 text-center py-3 text-xs font-medium ${
                  active
                    ? "text-teal-600 border-b-2 border-teal-500"
                    : "text-slate-500"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function GridIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}
function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 8a3 3 0 1 1 3.5 2.96" />
      <path d="M21 20c0-2.6-1.7-4.8-4-5.6" />
    </svg>
  );
}
function BadgeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M8.5 17c.6-1.6 2-2.5 3.5-2.5s2.9.9 3.5 2.5" />
    </svg>
  );
}
function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
