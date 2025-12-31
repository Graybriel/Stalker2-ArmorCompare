function renderStats(container, armor) {
    container.innerHTML = "";

    const skipKeys = new Set(["id", "name", "type"]);
    const statKeys = Object.keys(armor).filter(k => !skipKeys.has(k));

    for (const stat of statKeys) {
        const row = document.createElement("div");
        row.className = "stat-row";

        row.innerHTML = `
            <span>${stat}</span>
            <span>${armor[stat]}</span>
        `;

        container.appendChild(row);
    }

    // Slots + weight
    container.innerHTML += `
        <div class="stat-row"><span>Slots</span><span>${armor.slots}</span></div>
        <div class="stat-row"><span>Weight</span><span>${armor.weight}</span></div>
    `;
}

function updateComparison() {
    const A = armorData.find(a => a.id === document.getElementById("armorSelectA").value);
    const B = armorData.find(a => a.id === document.getElementById("armorSelectB").value);

    //if (!A || !B) return;

    const comparisonDiv = document.getElementById("comparisonBars");
    comparisonDiv.innerHTML = "";

    const skipKeys = new Set(["id", "name", "type"]);
    const statsA = Object.fromEntries(Object.entries(A).filter(([k]) => !skipKeys.has(k)));
    const statsB = Object.fromEntries(Object.entries(B).filter(([k]) => !skipKeys.has(k)));

    const keys = new Set([...Object.keys(statsA), ...Object.keys(statsB)]);
    // compute max dynamically per-stat (handles 'weight' specially)
   
    for (const stat of keys) {
        let max = 5.0;
        if(stat === "weight") {max = 20;}
        const aVal = Number(statsA[stat] ?? 0) || 0;
        const bVal = Number(statsB[stat] ?? 0) || 0;

        const aPct = (aVal / max) * 100;
        const bPct = (bVal / max) * 100;

        const row = document.createElement("div");
        row.className = "comparison-bar";

        row.innerHTML = `
            <div>${stat}</div>
            <div class="bar">
                <div class="bar-fill" style="width:${aPct}%; background:#7B907C"></div>
            </div>
            <div class="bar">
                <div class="bar-fill" style="width:${bPct}%; background:#AA2E25"></div>
            </div>
        `;

        comparisonDiv.appendChild(row);
    }
}