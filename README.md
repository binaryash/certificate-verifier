# Certificate Verifier dApp

> A hybrid Web2 + Web3 system for issuing, storing, and verifying certificates on the Ethereum blockchain.

![License](https://img.shields.io/badge/license-ISC-blue)
![Node](https://img.shields.io/badge/node-%3E%3D22.5-green)
![Solidity](https://img.shields.io/badge/solidity-0.8.28-purple)
![Hardhat](https://img.shields.io/badge/hardhat-v3-yellow)

---

## What It Does

Certificates are expensive to fake and hard to verify at scale. This dApp solves that by:

- **Hashing** certificate files (PDF, image) with SHA-256
- **Anchoring** that hash on Ethereum — immutable, timestamped, issuer-signed
- **Storing** human-readable metadata (name, student, notes) in SQLite off-chain
- **Verifying** any certificate in seconds by re-hashing and checking the chain

No central authority can silently alter or delete records.

---

## Screenshots

> **Dashboard** — view all issued certificates

```
┌─────────────────────────────────────────────────────┐
│ ⛓ CertVerifier     Dashboard  Register  Verify      │
├─────────────────────────────────────────────────────┤
│ Certificates                      [ + Register New ] │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Blockchain Workshop 2026    — Alice Smith  [Revoke]│
│ │ Issuer: Tech Institute   File: cert.pdf          │ │
│ │ Registered: 20 Jun 2026                          │ │
│ │ Hash: 0x3f4a9c...                                │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ AI Fundamentals Course     — Bob Kumar    [Revoke]│
│ │ Issuer: DataAcademy   Registered: 19 Jun 2026    │ │
│ │ Hash: 0xb72d1e...                                │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

> **Register** — issue a new certificate

```
┌─────────────────────────────────────────────────────┐
│ Register Certificate                                 │
│                                                      │
│ Certificate Name *                                   │
│ ┌──────────────────────────────────────────────────┐│
│ │ Blockchain Workshop 2026                         ││
│ └──────────────────────────────────────────────────┘│
│ Student Name                                         │
│ ┌──────────────────────────────────────────────────┐│
│ │ Alice Smith                                      ││
│ └──────────────────────────────────────────────────┘│
│ Issuer Organization                                  │
│ ┌──────────────────────────────────────────────────┐│
│ │ Tech Institute                                   ││
│ └──────────────────────────────────────────────────┘│
│ Upload Certificate File (optional)                   │
│ ┌──────────────────────────────────────────────────┐│
│ │ certificate.pdf                                  ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│ [ Register Certificate ]  [ Cancel ]                 │
└─────────────────────────────────────────────────────┘
```

> **Verify** — check any certificate's authenticity

```
┌─────────────────────────────────────────────────────┐
│ Verify Certificate                                   │
│                                                      │
│ Upload File ─────────────────────────────────────── │
│ ┌──────────────────────────────┐  [ Verify ]        │
│ │ certificate.pdf              │                     │
│ └──────────────────────────────┘                     │
│                                                      │
│ Verify by Hash ──────────────────────────────────── │
│ ┌──────────────────────────────┐  [ Verify ]        │
│ │ 0x3f4a9c...                  │                     │
│ └──────────────────────────────┘                     │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Blockchain Workshop 2026              [ Valid ✓ ]│ │
│ │ Student:  Alice Smith                            │ │
│ │ Issuer:   Tech Institute                         │ │
│ │ On-chain: 0xf39Fd6...                            │ │
│ │ Issued:   20 Jun 2026, 14:32                     │ │
│ │ Hash:     0x3f4a9c8d...                          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│              (Vite · Dashboard · Register · Verify)          │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP /api/*
┌──────────────────────────▼───────────────────────────────────┐
│                      Express Backend                         │
│                     (Node.js · Multer)                       │
├────────────────────────┬─────────────────────────────────────┤
│   SQLite (node:sqlite) │         Ethers.js                   │
│   Off-chain metadata   │   On-chain hash + revocation        │
│   name, student, notes │   issuer, timestamp, revoked        │
└────────────────────────┴──────────────┬──────────────────────┘
                                        │ JSON-RPC
                         ┌──────────────▼──────────────┐
                         │    Ethereum (local/testnet)   │
                         │    CertificateVerifier.sol    │
                         └──────────────────────────────┘
```

**What goes where:**

| Data | Storage | Why |
|------|---------|-----|
| Certificate hash | Ethereum | Immutable, tamper-proof |
| Issuer address | Ethereum | Cryptographically signed |
| Issue timestamp | Ethereum | Block-verified |
| Revoked status | Ethereum | Cannot be hidden off-chain |
| Certificate name | SQLite | Human-readable, searchable |
| Student name | SQLite | Mutable metadata |
| Issuer org name | SQLite | Display only |
| Notes | SQLite | Flexible |
| Original filename | SQLite | Reference |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.28 |
| Dev Chain | Hardhat v3 + hardhat-ethers |
| Backend | Express.js + Node.js |
| Database | SQLite (built-in `node:sqlite`) |
| File Handling | Multer |
| Blockchain Client | Ethers.js v6 |
| Frontend | React 18 + Vite 5 |

---

## Project Structure

```
cert-verifier/
├── contracts/
│   └── CertificateVerifier.sol   # On-chain hash registry
├── scripts/
│   └── deploy.ts                 # Deploy + write deployed.json
├── backend/
│   ├── server.js                 # Express API (6 routes)
│   ├── db.js                     # SQLite schema + connection
│   ├── contract.js               # Ethers.js connector
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Nav + routing
│   │   ├── api.js                # Fetch wrappers
│   │   ├── index.css             # Dark theme
│   │   └── pages/
│   │       ├── Dashboard.jsx     # List + revoke
│   │       ├── Register.jsx      # Issue certificate
│   │       └── Verify.jsx        # Verify by file or hash
│   └── package.json
├── hardhat.config.ts
├── tsconfig.json
└── README.md
```

---

## Setup

### Prerequisites

- Node.js >= 22.5
- npm

### 1 — Install root dependencies

```bash
npm install
```

### 2 — Install backend dependencies

```bash
cd backend && npm install && cd ..
```

### 3 — Install frontend dependencies

```bash
cd frontend && npm install && cd ..
```

---

## Running

You need **4 terminals**.

### Terminal 1 — Start local blockchain

```bash
npx hardhat node
```

Leave this running. It prints 20 funded test accounts.

### Terminal 2 — Deploy the contract

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

This writes `deployed.json` with the contract address.  
Re-run any time you restart the chain.

### Terminal 3 — Start the backend

```bash
cd backend
node server.js
```

Runs on **http://localhost:3001**

### Terminal 4 — Start the frontend

```bash
cd frontend
npm run dev
```

Opens at **http://localhost:5173**

---

## Smart Contract

`contracts/CertificateVerifier.sol`

```solidity
function registerCertificate(bytes32 hash) public
function revokeCertificate(bytes32 hash) public
function getCertificate(bytes32 hash) public view
    returns (bool exists, address issuer, uint256 issuedAt, bool revoked)
function verifyCertificate(bytes32 hash) public view returns (bool)
```

Emits `CertificateRegistered` and `CertificateRevoked` events.  
Only the original issuer can revoke.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/certificates` | List all certificates |
| `POST` | `/api/certificates` | Register certificate (+ optional file) |
| `GET` | `/api/certificates/:hash` | Get metadata + chain status |
| `PATCH` | `/api/certificates/:id` | Update off-chain metadata |
| `POST` | `/api/certificates/:hash/revoke` | Revoke on chain |
| `POST` | `/api/verify` | Verify by file upload |

### Register certificate

```bash
# Text-only
curl -X POST http://localhost:3001/api/certificates \
  -H "Content-Type: application/json" \
  -d '{"name":"Blockchain Workshop","student_name":"Alice","issuer_name":"Tech Institute"}'

# With file
curl -X POST http://localhost:3001/api/certificates \
  -F "name=Blockchain Workshop" \
  -F "student_name=Alice" \
  -F "file=@certificate.pdf"
```

### Verify by hash

```bash
curl http://localhost:3001/api/certificates/0x3f4a9c...
```

Response:
```json
{
  "metadata": { "name": "Blockchain Workshop", "student_name": "Alice", ... },
  "chain": {
    "exists": true,
    "issuer": "0xf39Fd6...",
    "issuedAt": "2026-06-20T14:32:00.000Z",
    "revoked": false,
    "valid": true
  }
}
```

---

## How Verification Works

1. User uploads a certificate file
2. Backend computes `SHA-256(file)` → `bytes32` hash
3. Hash is looked up on the Ethereum contract
4. If `exists=true` and `revoked=false` → **Valid**
5. If `revoked=true` → **Revoked**
6. If `exists=false` → **Not Found** (never issued or tampered)

Any modification to the file — even one byte — produces a completely different hash, making forgery detectable.

---

## License

ISC
