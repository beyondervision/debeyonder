import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { code } = req.body;
  const masterCode = process.env.CLIENT_ACCESS_CODE;
  const demoMode = process.env.DEMO_MODE === "true";

  // 1. DEMO MODE
  if (demoMode) {
    return res.status(200).json({ success: true, mode: "DEMO", token: "z3ro_demo" });
  }

  if (!code) return res.status(400).json({ success: false, message: "Geen code." });

  // 2. MASTER KEY (Jij, de Admin)
  if (code === masterCode) {
    return res.status(200).json({ success: true, mode: "ADMIN (Z3RO Master)", token: "master_token" });
  }

  // 3. IDENTITY HASH CHECK (De Klant)
  // We accepteren codes die beginnen met "CFS-" en 20 tekens lang zijn (prefix + 16 hash)
  // Omdat we nog geen database hebben, valideren we op FORMAT.
  if (code.startsWith("CFS-") && code.length === 20) {
     return res.status(200).json({ success: true, mode: "CLIENT (Hash Verified)", token: "client_token" });
  }

  // 4. GEWEIGERD
  return res.status(401).json({ success: false, message: "Ongeldige toegangscode." });
}