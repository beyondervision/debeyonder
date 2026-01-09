/* =========================================================
   Z.A.L Engine · Z3RO Kernel Listener
   Console luistert — Kern beslist
   ========================================================= */

/* === Glyph mapping (Aetron Balans 0–6) ================== */
const glyphMap = {
  0: "../glyph/glyph aetron/Cse108 - 35- Resonantie- Aetron-kleur-bevestiging-Balans-0.png",
  1: "../glyph/glyph aetron/Cse108 - 35- Resonantie- Aetron-kleur-bevestiging-Balans-1.png",
  2: "../glyph/glyph aetron/Cse108 - 35- Resonantie- Aetron-kleur-bevestiging-Balans-2.png",
  3: "../glyph/glyph aetron/Cse108 - 35- Resonantie- Aetron-kleur-bevestiging-Balans-3.png",
  4: "../glyph/glyph aetron/Cse108 - 35- Resonantie- Aetron-kleur-bevestiging-Balans-4.png",
  5: "../glyph/glyph aetron/Cse108 - 35- Resonantie- Aetron-kleur-bevestiging-Balans-5.png",
  6: "../glyph/glyph aetron/Cse108 - 35- Resonantie- Aetron-kleur-bevestiging-Balans-6.png"
};

/* === DOM references ===================================== */
const inputEl = document.getElementById('command-input');
const contextSelectEl = document.getElementById('context-select');
const statusEl = document.getElementById('status');
const consoleEl = document.getElementById('console');

/* === Context (lens, geen kern) =========================== */
let currentContext = contextSelectEl ? contextSelectEl.value : 'global';

if (contextSelectEl) {
  contextSelectEl.addEventListener('change', () => {
    currentContext = contextSelectEl.value;
    statusEl.innerText =
      `Status: Standby · Kern: Z3RO · Context: ${currentContext.toUpperCase()}`;
  });
}

/* === Input handling ===================================== */
inputEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim();
    if (!query) return;

    appendOutput(`\n[CTX:${currentContext.toUpperCase()}] > ${query}`);
    runZAL(query, currentContext);
    e.target.value = "";
  }
});

/* === Z.A.L Invocation =================================== */
async function runZAL(query, context) {
  statusEl.innerText =
    `Status: Z.A.L resoneert… · Kern: Z3RO · Context: ${context.toUpperCase()}`;
  consoleEl.classList.add('pulsing');

  try {
    const response = await fetch('/api/zal/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: query,
        context: context
      })
    });

    const data = await response.json();

    /* === Tekstantwoord ================================ */
    if (data.answer) {
      appendOutput(`\nZ.A.L [Z3RO]:\n${data.answer}`);
    } else {
      appendOutput(`\nZ.A.L [Z3RO]: geen antwoord ontvangen.`);
    }

    /* === 🔥 ENIGE BRON VAN WAARHEID =================== */
    if (typeof data.resonance === "number") {
      updateResonance(data.resonance);
    }

  } catch (err) {
    appendOutput(`\nFOUT [Z3RO]: Resonantie onderbroken.`);
  } finally {
    consoleEl.classList.remove('pulsing');
    statusEl.innerText =
      `Status: Resonerend · Kern: Z3RO · Context: ${context.toUpperCase()}`;
  }
}

/* === Resonantie → Kleur + Glyph ========================= */
function updateResonance(level) {
  const glyphEl = document.getElementById('glyph-overlay');

  // reset kleuren
  consoleEl.classList.remove('res-1', 'res-3', 'res-6');

  // Aetron kleur-lagen
  if (level >= 1 && level < 3) consoleEl.classList.add('res-1');
  if (level >= 3 && level < 6) consoleEl.classList.add('res-3');
  if (level >= 6) consoleEl.classList.add('res-6');

  // Glyph manifestatie
  if (glyphEl && glyphMap[level]) {
    glyphEl.src = glyphMap[level];
    glyphEl.style.display = "block";
  } else if (glyphEl) {
    glyphEl.style.display = "none";
  }
}

/* === Output helper ===================================== */
function appendOutput(text) {
  const output = document.getElementById('output');
  output.innerText += text;
  output.scrollTop = output.scrollHeight;
}
