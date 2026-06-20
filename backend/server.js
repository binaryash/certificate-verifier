import express from "express";
import cors from "cors";
import multer from "multer";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import db from "./db.js";
import { getContract, getSigner, getProvider } from "./contract.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Hash a buffer to bytes32
function toBytes32(buffer) {
  return "0x" + createHash("sha256").update(buffer).digest("hex");
}

// GET /api/certificates — list all
app.get("/api/certificates", (req, res) => {
  const rows = db.prepare("SELECT * FROM certificates ORDER BY created_at DESC").all();
  res.json(rows);
});

// POST /api/certificates — register (with optional file upload)
app.post("/api/certificates", upload.single("file"), async (req, res) => {
  try {
    const { name, student_name, issuer_name, notes } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    let hash;
    let filename = null;

    if (req.file) {
      hash = toBytes32(req.file.buffer);
      filename = req.file.originalname;
    } else {
      // Hash from name + student + timestamp for text-only certs
      hash = toBytes32(Buffer.from(`${name}:${student_name}:${Date.now()}`));
    }

    // Register on chain
    const signer = getSigner();
    const contract = getContract(signer);
    const tx = await contract.registerCertificate(hash);
    await tx.wait();

    // Store metadata in SQLite
    const stmt = db.prepare(
      "INSERT INTO certificates (hash, name, student_name, issuer_name, notes, filename) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run(hash, name, student_name || null, issuer_name || null, notes || null, filename);

    const cert = db.prepare("SELECT * FROM certificates WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(cert);
  } catch (err) {
    if (err.message?.includes("Certificate already registered")) {
      return res.status(409).json({ error: "Certificate already registered on chain" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/certificates/:hash — get metadata + chain verification
app.get("/api/certificates/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const meta = db.prepare("SELECT * FROM certificates WHERE hash = ?").get(hash);

    const provider = getProvider();
    const contract = getContract(provider);
    const [exists, issuer, issuedAt, revoked] = await contract.getCertificate(hash);

    res.json({
      metadata: meta || null,
      chain: {
        exists,
        issuer,
        issuedAt: exists ? new Date(Number(issuedAt) * 1000).toISOString() : null,
        revoked,
        valid: exists && !revoked,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/certificates/:hash/revoke — revoke on chain
app.post("/api/certificates/:hash/revoke", async (req, res) => {
  try {
    const { hash } = req.params;
    const signer = getSigner();
    const contract = getContract(signer);
    const tx = await contract.revokeCertificate(hash);
    await tx.wait();
    res.json({ success: true, hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/certificates/:id — update metadata only
app.patch("/api/certificates/:id", (req, res) => {
  const { id } = req.params;
  const { name, student_name, issuer_name, notes } = req.body;
  const cert = db.prepare("SELECT * FROM certificates WHERE id = ?").get(id);
  if (!cert) return res.status(404).json({ error: "Not found" });

  db.prepare(
    "UPDATE certificates SET name = ?, student_name = ?, issuer_name = ?, notes = ? WHERE id = ?"
  ).run(
    name ?? cert.name,
    student_name ?? cert.student_name,
    issuer_name ?? cert.issuer_name,
    notes ?? cert.notes,
    id
  );

  const updated = db.prepare("SELECT * FROM certificates WHERE id = ?").get(id);
  res.json(updated);
});

// POST /api/verify — verify by file upload
app.post("/api/verify", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });

    const hash = toBytes32(req.file.buffer);
    const meta = db.prepare("SELECT * FROM certificates WHERE hash = ?").get(hash);

    const provider = getProvider();
    const contract = getContract(provider);
    const [exists, issuer, issuedAt, revoked] = await contract.getCertificate(hash);

    res.json({
      hash,
      metadata: meta || null,
      chain: {
        exists,
        issuer,
        issuedAt: exists ? new Date(Number(issuedAt) * 1000).toISOString() : null,
        revoked,
        valid: exists && !revoked,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
