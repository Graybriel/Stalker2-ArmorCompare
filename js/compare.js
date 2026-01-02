/**
 * Render the stats for a single armor object into the provided container.
 * If the armor parameter is a combined object (head+chest), numeric stats
 * will already be summed by `getEffectiveArmor`.
 */
function renderStats(container, armor) {
    if (!container) return;
    container.innerHTML = "";

    const skipKeys = new Set(["id", "name", "type"]);
    const statKeys = Object.keys(armor).filter(k => !skipKeys.has(k));

    for (const stat of statKeys) {
        const row = document.createElement("div");
        row.className = "stat-row";

        const rawVal = armor[stat];
        let displayVal;
        if (typeof rawVal === 'number' && Number.isFinite(rawVal)) {
            displayVal = window.roundTo ? window.roundTo(rawVal, 1).toFixed(1) : roundTo(rawVal, 1).toFixed(1);
        } else {
            // try to parse numeric strings like "13.0 kg" -> 13.0
            const parsed = parseFloat(String(rawVal).replace(/[^0-9.-]+/g, ''));
            if (!isNaN(parsed)) {
                displayVal = (window.roundTo ? window.roundTo(parsed, 1) : parsed).toFixed(1);
            } else {
                displayVal = rawVal;
            }
        }

        row.innerHTML = `
            <span>${stat}</span>
            <span>${displayVal}</span>
        `;

        container.appendChild(row);
    }

    // Slots + weight are displayed explicitly
    const slotsRaw = armor.slots;
    const slotsNum = typeof slotsRaw === 'number' ? slotsRaw : parseFloat(String(slotsRaw).replace(/[^0-9.-]+/g, ''));
    const slotsVal = Number.isFinite(slotsNum) ? (window.roundTo ? window.roundTo(slotsNum, 1).toFixed(1) : roundTo(slotsNum, 1).toFixed(1)) : slotsRaw;

    const weightRaw = armor.weight;
    const weightNum = typeof weightRaw === 'number' ? weightRaw : parseFloat(String(weightRaw).replace(/[^0-9.-]+/g, ''));
    const weightVal = Number.isFinite(weightNum) ? (window.roundTo ? window.roundTo(weightNum, 1).toFixed(1) : roundTo(weightNum, 1).toFixed(1)) : weightRaw;
    container.innerHTML += `
        <div class="stat-row"><span>Slots</span><span>${slotsVal}</span></div>
        <div class="stat-row"><span>Weight</span><span>${weightVal}</span></div>
    `;
}

/**
 * Build comparison bars for two effective armor objects (A and B).
 * Uses `window.getEffectiveArmor('A'|'B')` which returns either a single
 * full-body armor or a combined head+chest object.
 */
function updateComparison() {
    const A = window.getEffectiveArmor ? window.getEffectiveArmor('A') : null;
    const B = window.getEffectiveArmor ? window.getEffectiveArmor('B') : null;

    if (!A || !B) return;

    const comparisonDiv = document.getElementById("comparisonBars");
    comparisonDiv.innerHTML = "";

    const skipKeys = new Set(["id", "name", "type"]);
    const statsA = Object.fromEntries(Object.entries(A).filter(([k]) => !skipKeys.has(k)));
    const statsB = Object.fromEntries(Object.entries(B).filter(([k]) => !skipKeys.has(k)));

    const keys = new Set([...Object.keys(statsA), ...Object.keys(statsB)]);

    // compute max dynamically per-stat (handles 'weight' specially)
    for (const stat of keys) {
        let max = 5.0;
        if (stat === "weight") { max = 20; }
        const aVal = Number(statsA[stat] ?? 0) || 0;
        const bVal = Number(statsB[stat] ?? 0) || 0;

        const aPct = (aVal / max) * 100;
        const bPct = (bVal / max) * 100;
        const row = document.createElement("div");
        row.className = "comparison-bar";

        const label = document.createElement("div");
        label.textContent = stat;

        // helper to create a bar element with a fill and optional segment overlay
        function makeBar(pct, color, segmented) {
            const bar = document.createElement("div");
            bar.className = "bar";

            const fill = document.createElement("div");
            fill.className = "bar-fill";
            fill.style.width = `${pct}%`;
            fill.style.background = color;
            bar.appendChild(fill);

            if (segmented) {
                const grid = document.createElement("div");
                grid.className = "bar-grid";
                // create 5 visual segments for 1-5 scale
                for (let i = 0; i < 5; i++) {
                    const seg = document.createElement("div");
                    seg.className = "bar-seg";
                    grid.appendChild(seg);
                }
                bar.appendChild(grid);
            }

            return bar;
        }

        const isSegmented = stat !== "weight"; // only non-weight stats are 1-5

        const leftBar = makeBar(aPct, '#7B907C', isSegmented);
        const rightBar = makeBar(bPct, '#AA2E25', isSegmented);

        row.appendChild(label);
        row.appendChild(leftBar);
        row.appendChild(rightBar);

        comparisonDiv.appendChild(row);
    }
}