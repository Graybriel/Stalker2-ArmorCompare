/**
 * Render the stats for a single armor object into the provided container.
 * If the armor parameter is a combined object (head+chest), numeric stats
 * will already be summed by getEffectiveArmor().
 * If includeUpgrades is true, also adds effects from selected upgrade cells.
 */
function renderStats(container, armor, includeUpgrades = false, col = null, orderedKeys = null) {
    if (!container) return;
    container.innerHTML = "";

    if (!armor) return;

    // Skip non-stat fields so we only render numeric protections/values
    const skipKeys = new Set(["id", "name", "type", "upgradeList", "upgrades"]);
    let statKeys;
    if (orderedKeys && Array.isArray(orderedKeys)) {
        // Respect caller-provided ordering but filter out any skipped keys
        statKeys = orderedKeys.filter(k => !skipKeys.has(k));
    } else {
        statKeys = Object.keys(armor).filter(k => !skipKeys.has(k));
    }

    // Create a copy of armor stats to modify with upgrade effects (no mutation of source)
    const displayStats = { ...armor };

    // If we should include selected upgrades, add their effects
    if (includeUpgrades) {
        // Prefer per-column effects if available and a column is specified
        let selectedEffects = {};
        if (col && window.getSelectedUpgradeEffectsByColumn) {
            const byCol = window.getSelectedUpgradeEffectsByColumn();
            selectedEffects = byCol[col] || {};
        } else if (window.getSelectedUpgradeEffects) {
            selectedEffects = window.getSelectedUpgradeEffects();
        }

        // Add upgrade effects to display stats.
        // The selectedEffects object uses effectedStat as the key and separates percent vs absolute.
        for (const [statKey, effect] of Object.entries(selectedEffects)) {
            const abs = effect.absolute || 0;
            const pct = effect.percent || 0;

            if (abs === 0 && pct === 0) continue;

            // Use the armor's base numeric value for percent calculations (fallback to 0)
            const baseVal = parseFloat(String(armor[statKey] ?? displayStats[statKey] ?? 0).replace(/[^0-9.-]+/g, '')) || 0;

            // Percent modifiers apply to the base stat; absolute additions are additive afterwards
            let newVal = baseVal;
            if (pct) newVal = baseVal * (1 + pct / 100);
            newVal = newVal + abs;

            displayStats[statKey] = newVal;
        }
    }

    function formatStatValue(rawVal) {
        if (typeof rawVal === 'number' && Number.isFinite(rawVal)) {
            const num = window.roundTo ? window.roundTo(rawVal, 1) : roundTo(rawVal, 1);
            return { text: num.toFixed(1), num, hasNumber: true };
        }

        const parsed = parseFloat(String(rawVal).replace(/[^0-9.-]+/g, ''));
        if (!isNaN(parsed)) {
            const num = window.roundTo ? window.roundTo(parsed, 1) : parsed;
            return { text: num.toFixed(1), num, hasNumber: true };
        }

        return { text: rawVal, num: null, hasNumber: false };
    }

    for (const stat of statKeys) {
        const row = document.createElement("div");
        row.className = "stat-row";

        const baseVal = formatStatValue(armor[stat]);
        const upgradedVal = formatStatValue(displayStats[stat]);

        let displayVal = upgradedVal.text;
        if (includeUpgrades && baseVal.hasNumber && upgradedVal.hasNumber && baseVal.num !== upgradedVal.num) {
            displayVal = `${baseVal.text} -> ${upgradedVal.text}`;
        }

        row.innerHTML = `
            <span>${stat}</span>
            <span>${displayVal}</span>
        `;

        container.appendChild(row);
    }
}

/**
 * Build comparison bars for two effective armor objects (A and B).
 * Uses window.getEffectiveArmor('A'|'B') which returns either a single
 * full-body armor or a combined head+chest object.
 */
function updateComparison() {
    const A = window.getEffectiveArmor ? window.getEffectiveArmor('A') : null;
    const B = window.getEffectiveArmor ? window.getEffectiveArmor('B') : null;

    if (!A || !B) return;

    const comparisonDiv = document.getElementById("comparisonBars");
    comparisonDiv.innerHTML = "";

    // Filter out non-stat fields before building bars
    const skipKeys = new Set(["id", "name", "type", "upgradeList", "upgrades"]);
    const statsA = Object.fromEntries(Object.entries(A).filter(([k]) => !skipKeys.has(k)));
    const statsB = Object.fromEntries(Object.entries(B).filter(([k]) => !skipKeys.has(k)));

    // Include selected upgrade effects per-column when computing comparison bars
    const effectsByCol = window.getSelectedUpgradeEffectsByColumn ? window.getSelectedUpgradeEffectsByColumn() : { A: {}, B: {} };

    // Create adjusted stats copies so we don't mutate original objects
    const statsAAdjusted = { ...statsA };
    const statsBAdjusted = { ...statsB };

    for (const [k, eff] of Object.entries(effectsByCol.A || {})) {
        // Use the original base stat when applying percent effects
        const base = parseFloat(String(statsA[k] ?? 0).replace(/[^0-9.-]+/g, '')) || 0;
        const abs = eff.absolute || 0;
        const pct = eff.percent || 0;
        let newVal = base;
        if (pct) newVal = base * (1 + pct / 100);
        newVal = newVal + abs;
        statsAAdjusted[k] = newVal;
    }
    for (const [k, eff] of Object.entries(effectsByCol.B || {})) {
        // Use the original base stat when applying percent effects
        const base = parseFloat(String(statsB[k] ?? 0).replace(/[^0-9.-]+/g, '')) || 0;
        const abs = eff.absolute || 0;
        const pct = eff.percent || 0;
        let newVal = base;
        if (pct) newVal = base * (1 + pct / 100);
        newVal = newVal + abs;
        statsBAdjusted[k] = newVal;
    }

    const keys = new Set([...Object.keys(statsAAdjusted), ...Object.keys(statsBAdjusted)]);

    // Build a deterministic ordering so stats line up across A and B
    const knownOrder = ['physical','thermal','chemical','electric','radiation','durability','weight','slots'];
    const allKeys = Array.from(keys);
    const orderedKeys = [
        ...knownOrder.filter(k => allKeys.includes(k)),
        ...allKeys.filter(k => !knownOrder.includes(k)).sort()
    ];

    // Re-render stats panes using the same ordered keys so rows line up visually
    const statsDivA = document.getElementById('statsA');
    const statsDivB = document.getElementById('statsB');
    renderStats(statsDivA, A, true, 'A', orderedKeys);
    renderStats(statsDivB, B, true, 'B', orderedKeys);

    // Compute max dynamically per-stat (handles 'weight' and 'slots' specially)
    for (const stat of orderedKeys) {
        let max = 100.0;
        if (stat === "weight") { max = 20; }
        if (stat === "slots" || stat === "physical") { max = 5; }
        const aBase = Number(statsA[stat] ?? 0) || 0;
        const bBase = Number(statsB[stat] ?? 0) || 0;
        const aVal = Number(statsAAdjusted[stat] ?? 0) || 0;
        const bVal = Number(statsBAdjusted[stat] ?? 0) || 0;

        const aBasePct = (aBase / max) * 100;
        const bBasePct = (bBase / max) * 100;
        const aPct = (aVal / max) * 100;
        const bPct = (bVal / max) * 100;
        const row = document.createElement("div");
        row.className = "comparison-bar";

        const label = document.createElement("div");
        label.textContent = stat;

        // Helper to create a bar element with a fill and optional segment overlay
        function makeBar(basePct, pct, color, segmented) {
            const bar = document.createElement("div");
            bar.className = "bar";

            const clampedBase = Math.max(0, Math.min(100, basePct));
            const clamped = Math.max(0, Math.min(100, pct));

            const baseFill = document.createElement("div");
            baseFill.className = "bar-base";
            baseFill.style.width = `${clampedBase}%`;
            baseFill.style.background = color;
            bar.appendChild(baseFill);

            if (clamped >= clampedBase) {
                const upgradeFill = document.createElement("div");
                upgradeFill.className = "bar-upgrade";
                upgradeFill.style.left = `${clampedBase}%`;
                upgradeFill.style.width = `${clamped - clampedBase}%`;
                upgradeFill.style.background = color;
                bar.appendChild(upgradeFill);
            } else {
                const fill = document.createElement("div");
                fill.className = "bar-fill";
                fill.style.width = `${clamped}%`;
                fill.style.background = color;
                bar.appendChild(fill);
            }

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

        const leftBar = makeBar(aBasePct, aPct, '#00bcd4', isSegmented);
        const rightBar = makeBar(bBasePct, bPct, '#ff5722', isSegmented);
        leftBar.title = `Base: ${aBase.toFixed(1)} -> Upgraded: ${aVal.toFixed(1)}`;
        rightBar.title = `Base: ${bBase.toFixed(1)} -> Upgraded: ${bVal.toFixed(1)}`;

        row.appendChild(label);
        row.appendChild(leftBar);
        row.appendChild(rightBar);

        comparisonDiv.appendChild(row);
    }
}