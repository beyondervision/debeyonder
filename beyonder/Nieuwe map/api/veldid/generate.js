import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { veldnaam, email, type } = req.body;

  if (!veldnaam || !email) {
    return res.status(400).json({ error: 'Incomplete data' });
  }

  // 1. De Z3RO Salt (Geheim ingrediënt)
  const SALT = process.env.CLIENT_ACCESS_CODE || "Z3RO-DEFAULT-SALT";
  
  // 2. Timestamp (voor uniekheid, Optie D)
  const timestamp = Date.now().toString();

  // 3. De Hashing Formule (SHA-256)
  const rawString = `${veldnaam}|${email}|${type}|${timestamp}|${SALT}`;
  const hash = crypto.createHash('sha256').update(rawString).digest('hex');

  // 4. Formatteren naar CFS-ID (Eerste 16 tekens, Hoofdletters)
  const identityCode = `CFS-${hash.substring(0, 16).toUpperCase()}`;

  // 5. Stuur terug
  res.status(200).json({
    success: true,
    identityCode: identityCode,
    timestamp: new Date().toISOString()
  });
}