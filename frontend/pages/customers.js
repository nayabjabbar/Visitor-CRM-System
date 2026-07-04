import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../lib/api";

const EMPTY_FORM = { name: "", email: "", phone: "", company: "", status: "ACTIVE" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const { data } = await api.get("/customers", {
        params: { search, page, limit: 8 },
      });
      setCustomers(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setPageError("Could not load customers. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(customer) {
    setEditingId(customer._id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company || "",
      status: customer.status,
    });
    setFormErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid email.";
    if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone)) errors.phone = "Enter a valid phone number.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
      } else {
        await api.post("/customers", form);
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.error || "Could not save customer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      setPageError("Could not delete customer.");
      setDeleteTarget(null);
    }
  }

  return (
    <Layout title="Customers">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by name or company…"
          className="w-full sm:w-72 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
        />
        <button
          onClick={openAddModal}
          className="rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2.5 text-sm whitespace-nowrap"
        >
          + Add Customer
        </button>
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
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No customers found. Add your first customer to get started.
                  </td>
                </tr>
              )}
              {!loading &&
                customers.map((c) => (
                  <tr key={c._id} className="text-ink dark:text-slate-200">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.email}</td>
                    <td className="px-4 py-3 text-slate-500">{c.phone}</td>
                    <td className="px-4 py-3 text-slate-500">{c.company || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "ACTIVE"
                            ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(c)}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="text-red-500 hover:text-red-600 font-medium"
                      >
                        Delete
                      </button>
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

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        title={editingId ? "Edit Customer" : "Add Customer"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          <Field label="Name" error={formErrors.name}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Email" error={formErrors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <Field label="Company">
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>

          {formError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold px-4 py-2.5 text-sm"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleteTarget)}
        title="Delete customer"
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-sm text-slate-500">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-5">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2.5 text-sm"
          >
            Delete
          </button>
        </div>
      </Modal>

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
