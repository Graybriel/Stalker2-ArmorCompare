function renderStats(container, armor) {
    container.innerHTML = "";

    for (const stat in armor.base_stats) {
        const row = document.createElement("div");
        row.className = "stat-row";

        row.innerHTML = `
            <span>${stat}</span>
            <span>${armor.base_stats[stat]}</span>
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

    if (!A || !B) return;

    const comparisonDiv = document.getElementById("comparisonBars");
    comparisonDiv.innerHTML = "";

    for (const stat in A.base_stats) {
        const aVal = A.base_stats[stat];
        const bVal = B.base_stats[stat];

        const max = Math.max(aVal, bVal);
        const aPct = (aVal / max) * 100;
        const bPct = (bVal / max) * 100;

        const row = document.createElement("div");
        row.className = "comparison-bar";

        row.innerHTML = `
            <div>${stat}</div>
            <div class="bar">
                <div class="bar-fill" style="width:${aPct}%; background:#4caf50"></div>
            </div>
            <div class="bar">
                <div class="bar-fill" style="width:${bPct}%; background:#f44336"></div>
            </div>
        `;

        comparisonDiv.appendChild(row);
    }
}