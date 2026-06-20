import { useState } from "react";
import { verifyFile, getCertificate } from "../api.js";

export default function Verify() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileVerify(e) {
    e.preventDefault();
    if (!file) { setError("Select a file"); return; }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await verifyFile(file);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleHashVerify(e) {
    e.preventDefault();
    if (!hash.trim()) { setError("Enter a hash"); return; }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await getCertificate(hash.trim());
      setResult({ hash: hash.trim(), ...data });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function StatusBadge({ chain }) {
    if (!chain.exists) return <span className="badge unknown">Not Found</span>;
    if (chain.revoked) return <span className="badge revoked">Revoked ✗</span>;
    return <span className="badge valid">Valid ✓</span>;
  }

  return (
    <>
      <h2>Verify Certificate</h2>

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#94a3b8" }}>Upload File</h3>
        <form onSubmit={handleFileVerify} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <button type="submit" className="btn" disabled={loading}>Verify</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#94a3b8" }}>Verify by Hash</h3>
        <form onSubmit={handleHashVerify} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <input type="text" value={hash} onChange={(e) => setHash(e.target.value)} placeholder="0x..." />
          </div>
          <button type="submit" className="btn" disabled={loading}>Verify</button>
        </form>
      </div>

      {loading && <p style={{ color: "#64748b", marginTop: "1.5rem" }}>Checking blockchain...</p>}
      {error && <p className="error" style={{ marginTop: "1rem" }}>{error}</p>}

      {result && (
        <div className="card verify-result">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <strong style={{ fontSize: "1.05rem" }}>
              {result.metadata?.name || "Unknown Certificate"}
            </strong>
            <StatusBadge chain={result.chain} />
          </div>

          {result.metadata && (
            <div className="meta-grid" style={{ marginBottom: "1rem" }}>
              {result.metadata.student_name && <><span>Student</span><span>{result.metadata.student_name}</span></>}
              {result.metadata.issuer_name && <><span>Issuer</span><span>{result.metadata.issuer_name}</span></>}
              {result.metadata.filename && <><span>File</span><span>{result.metadata.filename}</span></>}
              {result.metadata.notes && <><span>Notes</span><span>{result.metadata.notes}</span></>}
            </div>
          )}

          <div className="meta-grid" style={{ marginBottom: "1rem" }}>
            <span>On-chain issuer</span>
            <span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{result.chain.issuer || "—"}</span>
            <span>Issued at</span>
            <span>{result.chain.issuedAt ? new Date(result.chain.issuedAt).toLocaleString() : "—"}</span>
          </div>

          <p className="hash">Hash: {result.hash}</p>
        </div>
      )}
    </>
  );
}
