import { useState } from "react";
import { registerCertificate } from "../api.js";

export default function Register({ onDone }) {
  const [form, setForm] = useState({ name: "", student_name: "", issuer_name: "", notes: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.name.trim()) { setError("Name is required"); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("student_name", form.student_name);
      fd.append("issuer_name", form.issuer_name);
      fd.append("notes", form.notes);
      if (file) fd.append("file", file);

      const cert = await registerCertificate(fd);
      setSuccess(`Registered! Hash: ${cert.hash}`);
      setTimeout(onDone, 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Register Certificate</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Certificate Name *</label>
            <input type="text" value={form.name} onChange={set("name")} placeholder="Blockchain Workshop 2026" />
          </div>
          <div>
            <label>Student Name</label>
            <input type="text" value={form.student_name} onChange={set("student_name")} placeholder="Alice Smith" />
          </div>
          <div>
            <label>Issuer Organization</label>
            <input type="text" value={form.issuer_name} onChange={set("issuer_name")} placeholder="Tech Institute" />
          </div>
          <div>
            <label>Notes</label>
            <textarea value={form.notes} onChange={set("notes")} placeholder="Optional notes..." />
          </div>
          <div>
            <label>Upload Certificate File (optional — hash will be computed)</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} />
            {file && <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "0.3rem" }}>Selected: {file.name}</p>}
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Registering on chain..." : "Register Certificate"}
            </button>
            <button type="button" className="btn" style={{ background: "#334155" }} onClick={onDone}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
