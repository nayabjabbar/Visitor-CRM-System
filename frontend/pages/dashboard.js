import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import api from "../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: null,
    activeCustomers: null,
    visitorsToday: null,
    checkedInVisitors: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const [customerRes, visitorRes] = await Promise.all([
          api.get("/customers/stats"),
          api.get("/visitors/stats"),
        ]);
        setStats({
          totalCustomers: customerRes.data.totalCustomers,
          activeCustomers: customerRes.data.activeCustomers,
          visitorsToday: visitorRes.data.visitorsToday,
          checkedInVisitors: visitorRes.data.checkedInVisitors,
        });
      } catch (err) {
        setError("Could not load dashboard stats. Is the backend running?");
      }
    }
    loadStats();
  }, []);

  return (
    <Layout title="Dashboard">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={stats.totalCustomers ?? "—"} accent="navy" />
        <StatCard label="Active Customers" value={stats.activeCustomers ?? "—"} accent="teal" />
        <StatCard label="Visitors Today" value={stats.visitorsToday ?? "—"} accent="amber" />
        <StatCard label="Checked-In Visitors" value={stats.checkedInVisitors ?? "—"} accent="rose" />
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card">
        <h2 className="font-bold text-ink dark:text-white">Quick links</h2>
        <p className="mt-1 text-sm text-slate-500">
          Head to Customers to manage accounts, or Visitors to check someone in
          at the front desk.
        </p>
      </div>
    </Layout>
  );
}
