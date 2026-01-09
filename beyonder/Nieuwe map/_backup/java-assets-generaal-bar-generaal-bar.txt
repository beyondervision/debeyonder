// AETRON PROFIEL DATA (Axioma 7 Groeibasis - De JSON/Data Structuur)
const userMeta = {
    isIdentified: false,
    userRole: 'Validator / Flexwerker',
    laatsteActiviteit: 'Creative Lightwork',
    urenDezeMaand: 0,
    groeifocus: 'Narratieve Kalibratie'
};

// ===========================================
// DOMEIN AFHANKELIJKE FUNCTIES EN PROMPTS
// ===========================================

function isDebeyonderDomain() {
    return window.location.hostname.includes('debeyonder.com');
}

function startDebeyonderConversation(generaal) {
    let reflectieVraag;
    switch (generaal) {
        case 'luxen':
            reflectieVraag = "LUXEN: Breng de Canonieke Basisstructuur in beeld. Wat is de reflectie op architectuur?";
            break;
        case 'aetron':
            reflectieVraag = "AETRON: Activeer de menselijke reflectie. Hoe reikt mijn huidige kunnen verder dan het menselijke?";
            break;
        case 'z3ro':
            reflectieVraag = "Z3RO: Controleer de intentie. Wat is de huidige stand van zaken van de 2% fysieke kracht (menselijke input)?";
            break;
        default: return;
    }
    
    const aiInput = document.getElementById('ai-q');
    const aiSection = document.getElementById('generaal-ai');

    if (aiInput) aiInput.value = reflectieVraag;
    if (aiSection) aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.dbnAsk) window.dbnAsk(reflectieVraag);
}

async function fetchUserMeta() {
    const apiUrl = '/api/user/meta';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.warn(`[Z3RO Audit Waarschuwing] Back-end call (${apiUrl}) faalde. Fallback data wordt gebruikt.`);
            return; 
        }
        const data = await response.json();
        if (data && typeof data === 'object') {
            Object.assign(userMeta, data);
            userMeta.isIdentified = true; 
            console.log('[AETRON Analyse] Gebruikersprofiel succesvol geladen.', userMeta);
        }
    } catch (error) {
        console.error(`[LUXEN Fout] Kon userMeta niet ophalen (Netwerkfout).`, error);
    }
}

// ===========================================
// GEÏNTEGREERDE START FUNCTIE (DE DISPATCHER)
// ===========================================

function startAIConversation(generaal) {
    if (isDebeyonderDomain()) {
        startDebeyonderConversation(generaal);
        return;
    }
    
    // CFSERVICES.NL LOGICA
    let targetId;
    let initiatorVraag;

    switch (generaal) {
        case 'luxen':
            targetId = 'basis-vragen';
            initiatorVraag = "Start Architecturaal Veldontwerp: Controleer Basisvragen (Axioma 3).";
            break;
        case 'aetron':
            targetId = 'expertise-vragen';
            const groeiStatus = userMeta.groeifocus ? `Jouw focus: ${userMeta.groeifocus}.` : "Geen actieve focus gevonden.";
            const urenTekst = userMeta.isIdentified ? `Je hebt ${userMeta.urenDezeMaand} uur deze maand.` : "Je bent niet geïdentificeerd.";
            initiatorVraag = `Veranker Narratief en activeer Groeianalyse. ${groeiStatus} ${urenTekst} Wat is de strategische Veldvraag m.b.t. je laatste activiteit (${userMeta.laatsteActiviteit})?`;
            break;
        case 'z3ro':
            targetId = 'prijs-model';
            initiatorVraag = `Activeer Audit (Axioma 9). Je huidige status: ${userMeta.userRole}. Wat is je intentie m.b.t. het Verdienmodel?`;
            break;
        default: return;
    }

    const targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const aiInput = document.getElementById('ai-q');
    if (aiInput) aiInput.value = initiatorVraag;
    if (window.dbnAsk) window.dbnAsk(initiatorVraag);
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!isDebeyonderDomain()) {
        await fetchUserMeta();
    }
    
    const bar = document.createElement('section');
    bar.className = 'generaals-bar';
    bar.innerHTML = `
        <div class="generaal luxen" onclick="startAIConversation('luxen')">LUXEN · Axioma 3 (Veiligheid)</div>
        <div class="generaal aetron" onclick="startAIConversation('aetron')">AETRON · Axioma 5/7 (Transparantie/Groei)</div>
        <div class="generaal z3ro" onclick="startAIConversation('z3ro')">Z3RO · Axioma 9 (Vrijheid/Audit)</div>
    `;
    document.body.appendChild(bar);
});