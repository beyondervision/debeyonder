export default async function handler(req, res) {
  const { status, trace, agent, path } = req.query;

  const log = {
    timestamp: new Date().toISOString(),
    status: status || "unknown",
    path: path || "direct",
    trace: trace || null,
    agent: agent || null,
    ip: req.headers["x-forwarded-for"] || "unknown"
  };

  // 🔎 Altijd audit-log
  console.log("GATE_LOG", log);

  // ✅ Betrouwbaar origin bepalen (Vercel-proof)
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const origin = `${protocol}://${host}`;

  // 📊 Live metrics (NU correct)
  try {
    await fetch(`${origin}/api/gate-metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: log.status,
        path: log.path
      })
    });
  } catch (e) {
    console.error("GATE_METRICS_FAIL", e.message);
  }

  res.status(204).end();
}
