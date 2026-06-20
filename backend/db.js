import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(join(__dirname, "certs.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    student_name TEXT,
    issuer_name TEXT,
    notes TEXT,
    filename TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
