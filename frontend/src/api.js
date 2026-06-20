const BASE = "/api";

export async function listCertificates() {
  const res = await fetch(`${BASE}/certificates`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function registerCertificate(formData) {
  const res = await fetch(`${BASE}/certificates`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed");
  return data;
}

export async function getCertificate(hash) {
  const res = await fetch(`${BASE}/certificates/${hash}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function revokeCertificate(hash) {
  const res = await fetch(`${BASE}/certificates/${hash}/revoke`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed");
  return data;
}

export async function updateCertificate(id, body) {
  const res = await fetch(`${BASE}/certificates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed");
  return data;
}

export async function verifyFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/verify`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed");
  return data;
}
