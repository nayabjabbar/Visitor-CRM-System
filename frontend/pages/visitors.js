import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../lib/api";

const EMPTY_FORM = { name: "", phone: "", personToMeet: "", purpose: "" };

export default function Visitors() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);

  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const { data } = await api.get("/visitors/history", {
        params: { search, page, limit: 8 },
      });
      setVisitors(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setPageError("Could not load visitor history. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Visitor name is required.";
    if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone)) errors.phone = "Enter a valid phone number.";
    if (!form.personToMeet.trim()) errors.personToMeet = "Person to meet is required.";
    if (!form.purpose.trim()) errors.purpose = "Purpose of visit is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCheckIn(e) {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    if (!validateForm()) return;

    setCheckingIn(true);
    try {
      await api.post("/visitors/checkin", form);
      setForm(EMPTY_FORM);
      setSuccessMsg(`${form.name} checked in successfully.`);
      setPage(1);
      fetchHistory();
    } catch (err) {
      setFormError(err.response?.data?.error || "Could not check in visitor.");
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleCheckOut(visitor) {
    try {
      await api.put(`/visitors/${visitor._id}/checkout`);
      fetchHistory();
    } catch (err) {
      setPageError("Could not check out visitor.");
    }
  }

  return (
    <Layout title="Visitors">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Check-in form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card">
            <h2 className="font-bold text-ink dark:text-white">Check in a visitor</h2>
            <form onSubmit={handleCheckIn} className="mt-4 space-y-4" noValidate>
              <Field label="Visitor name" error={formErrors.name}>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Phone" error={formErrors.phone}>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                  placeholder="0300-1234567"
                />
              </Field>
              <Field label="Person to meet" error={formErrors.personToMeet}>
                <input
                  value={form.personToMeet}
                  onChange={(e) => setForm({ ...form, personToMeet: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Purpose of visit" error={formErrors.purpose}>
                <input
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="input"
                  placeholder="Meeting, Interview, Delivery…"
                />
              </Field>

              {formError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-900 px-3.5 py-2.5 text-sm text-teal-700 dark:text-teal-400">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={checkingIn}
                className="w-full rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold py-2.5 text-sm"
              >
                {checkingIn ? "Checking in…" : "Check in"}
              </button>
            </form>
          </div>
        </div>

        {/* History table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-ink dark:text-white">Visitor history</h2>
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by visitor or host…"
              className="w-56 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {pageError && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {pageError}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">Visitor</th>
                    <th className="text-left px-4 py-3">Meeting</th>
                    <th className="text-left px-4 py-3">Check-in</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loading && visitors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        No visitors yet.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    visitors.map((v) => (
                      <tr key={v._id} className="text-ink dark:text-slate-200">
                        <td className="px-4 py-3">
                          <div className="font-medium">{v.name}</div>
                          <div className="text-xs text-slate-500">{v.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          <div>{v.personToMeet}</div>
                          <div className="text-xs">{v.purpose}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(v.checkInTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {v.checkOutTime ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Checked out
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              Checked in
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!v.checkOutTime && (
                            <button
                              onClick={() => handleCheckOut(v)}
                              className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Check out
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(203 213 225);
          padding: 0.5rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
        }
        .dark .input {
          border-color: rgb(51 65 85);
          background-color: rgb(15 23 42);
          color: white;
        }
        .input:focus {
          border-color: #14b8a6;
          box-shadow: 0 0 0 1px #14b8a6;
        }
      `}</style>
    </Layout>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink dark:text-slate-200 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
