import { useState, useEffect, useCallback } from "react";
import { listCertificates, revokeCertificate } from "../api.js";

export default function Dashboard({ onRegister }) {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revoking, setRevoking] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listCertificates();
      setCerts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRevoke(hash) {
    if (!confirm(`Revoke certificate ${hash.slice(0, 10)}...?`)) return;
    setRevoking(hash);
    try {
      await revokeCertificate(hash);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setRevoking(null);
    }
  }

  if (loading) return <p style={{ color: "#64748b" }}>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2>Certificates</h2>
        <button className="btn" onClick={onRegister}>+ Register New</button>
      </div>

      {certs.length === 0 ? (
        <div className="empty">
          <p>No certificates yet.</p>
          <button className="btn" style={{ marginTop: "1rem" }} onClick={onRegister}>Register your first certificate</button>
        </div>
      ) : (
        certs.map((cert) => (
          <div key={cert.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <strong style={{ fontSize: "1rem" }}>{cert.name}</strong>
                {cert.student_name && <span style={{ color: "#94a3b8", marginLeft: "0.75rem", fontSize: "0.9rem" }}>— {cert.student_name}</span>}
              </div>
              <button
                className="btn danger"
                style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
                onClick={() => handleRevoke(cert.hash)}
                disabled={revoking === cert.hash}
              >
                {revoking === cert.hash ? "Revoking..." : "Revoke"}
              </button>
            </div>
            <div className="meta-grid">
              {cert.issuer_name && <><span>Issuer</span><span>{cert.issuer_name}</span></>}
              {cert.filename && <><span>File</span><span>{cert.filename}</span></>}
              {cert.notes && <><span>Notes</span><span>{cert.notes}</span></>}
              <span>Registered</span><span>{new Date(cert.created_at).toLocaleDateString()}</span>
            </div>
            <p className="hash" style={{ marginTop: "0.75rem" }}>Hash: {cert.hash}</p>
          </div>
        ))
      )}
    </>
  );
}
