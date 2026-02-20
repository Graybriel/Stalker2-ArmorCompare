const STAT_SKIP_KEYS = new Set(["id", "name", "type", "icon", "upgradeList", "upgrades"]);

function extractStats(armor, orderedKeys = null) {
    if (!armor) return {};
    const keys = orderedKeys && Array.isArray(orderedKeys)
        ? orderedKeys.filter(k => !STAT_SKIP_KEYS.has(k))
        : Object.keys(armor).filter(k => !STAT_SKIP_KEYS.has(k));

    const stats = {};
    keys.forEach(key => {
        if (armor[key] !== undefined) stats[key] = armor[key];
    });
    return stats;
}

function applyEffectsToStats(baseStats, selectedEffects) {
    const stats = { ...baseStats };
    if (!selectedEffects) return stats;

    for (const [statKey, effect] of Object.entries(selectedEffects)) {
        const abs = effect.absolute || 0;
        const pct = effect.percent || 0;

        if (abs === 0 && pct === 0) continue;

        const baseVal = parseFloat(String(baseStats[statKey] ?? stats[statKey] ?? 0).replace(/[^0-9.-]+/g, '')) || 0;
        let newVal = baseVal;
        if (pct) newVal = baseVal * (1 + pct / 100);
        newVal = newVal + abs;

        stats[statKey] = newVal;
    }

    return stats;
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

function renderSplitStats(container, headArmor, bodyArmor, headEffects, bodyEffects, orderedKeys, includeUpgrades = false) {
    if (!container) return;
    container.innerHTML = "";

    const headStats = extractStats(headArmor, orderedKeys);
    const bodyStats = extractStats(bodyArmor, orderedKeys);

    const headDisplay = includeUpgrades ? applyEffectsToStats(headStats, headEffects) : headStats;
    const bodyDisplay = includeUpgrades ? applyEffectsToStats(bodyStats, bodyEffects) : bodyStats;

    const headerRow = document.createElement("div");
    headerRow.className = "stat-row stat-header";
    headerRow.innerHTML = `
        <span class="stat-label"></span>
        <span class="stat-value">Head</span>
        <span class="stat-value">Body</span>
    `;
    container.appendChild(headerRow);

    orderedKeys.forEach(stat => {
        const row = document.createElement("div");
        row.className = "stat-row";

        const headBase = formatStatValue(headStats[stat]);
        const headUpgraded = formatStatValue(headDisplay[stat]);
        const bodyBase = formatStatValue(bodyStats[stat]);
        const bodyUpgraded = formatStatValue(bodyDisplay[stat]);

        const headText = headBase.hasNumber || headUpgraded.hasNumber
            ? (includeUpgrades && headBase.hasNumber && headUpgraded.hasNumber && headBase.num !== headUpgraded.num
                ? `${headBase.text} -> ${headUpgraded.text}`
                : headUpgraded.text)
            : "-";

        const bodyText = bodyBase.hasNumber || bodyUpgraded.hasNumber
            ? (includeUpgrades && bodyBase.hasNumber && bodyUpgraded.hasNumber && bodyBase.num !== bodyUpgraded.num
                ? `${bodyBase.text} -> ${bodyUpgraded.text}`
                : bodyUpgraded.text)
            : "-";

        row.innerHTML = `
            <span class="stat-label">${stat}</span>
            <span class="stat-value">${headText}</span>
            <span class="stat-value">${bodyText}</span>
        `;

        container.appendChild(row);
    });
}

/**
 * Build comparison bars and stat panes for head/body pieces in both columns.
 * Uses window.getArmorPieceMap('A'|'B') to resolve head/body slots.
 */
function updateComparison() {
    const pieceMapA = window.getArmorPieceMap ? window.getArmorPieceMap('A') : null;
    const pieceMapB = window.getArmorPieceMap ? window.getArmorPieceMap('B') : null;

    const hasA = !!(pieceMapA && (pieceMapA.head || pieceMapA.body));
    const hasB = !!(pieceMapB && (pieceMapB.head || pieceMapB.body));

    const comparisonDiv = document.getElementById("comparisonBars");
    if (comparisonDiv) comparisonDiv.innerHTML = "";

    const effectsByPiece = window.getSelectedUpgradeEffectsByColumnAndPiece
        ? window.getSelectedUpgradeEffectsByColumnAndPiece()
        : { A: {}, B: {} };

    function getPieceEffects(col, piece) {
        if (!piece || !effectsByPiece[col]) return {};
        return effectsByPiece[col][piece.id] || {};
    }

    const headA = pieceMapA?.head || null;
    const bodyA = pieceMapA?.body || null;
    const headB = pieceMapB?.head || null;
    const bodyB = pieceMapB?.body || null;

    const headAStats = extractStats(headA);
    const bodyAStats = extractStats(bodyA);
    const headBStats = extractStats(headB);
    const bodyBStats = extractStats(bodyB);

    const keys = new Set([
        ...Object.keys(headAStats),
        ...Object.keys(bodyAStats),
        ...Object.keys(headBStats),
        ...Object.keys(bodyBStats)
    ]);

    const knownOrder = ['physical', 'thermal', 'chemical', 'electric', 'radiation', 'psi', 'weight', 'slots', 'cost'];
    const allKeys = Array.from(keys);
    const orderedKeys = [
        ...knownOrder.filter(k => allKeys.includes(k)),
        ...allKeys.filter(k => !knownOrder.includes(k)).sort()
    ];

    const statsDivA = document.getElementById('statsA');
    const statsDivB = document.getElementById('statsB');
    if (statsDivA) {
        renderSplitStats(statsDivA, headA, bodyA, getPieceEffects('A', headA), getPieceEffects('A', bodyA), orderedKeys, true);
    }
    if (statsDivB) {
        renderSplitStats(statsDivB, headB, bodyB, getPieceEffects('B', headB), getPieceEffects('B', bodyB), orderedKeys, true);
    }

    if (!hasA || !hasB || !comparisonDiv) return;

    const barExclude = new Set(['cost']);
    const barKeys = orderedKeys.filter(k => !barExclude.has(k));

    const headAAdjusted = applyEffectsToStats(headAStats, getPieceEffects('A', headA));
    const bodyAAdjusted = applyEffectsToStats(bodyAStats, getPieceEffects('A', bodyA));
    const headBAdjusted = applyEffectsToStats(headBStats, getPieceEffects('B', headB));
    const bodyBAdjusted = applyEffectsToStats(bodyBStats, getPieceEffects('B', bodyB));

    function getNumeric(val) {
        return Number(parseFloat(String(val ?? 0).replace(/[^0-9.-]+/g, ''))) || 0;
    }

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
            for (let i = 0; i < 5; i++) {
                const seg = document.createElement("div");
                seg.className = "bar-seg";
                grid.appendChild(seg);
            }
            bar.appendChild(grid);
        }

        return bar;
    }

    const typeA = pieceMapA?.type || null;
    const typeB = pieceMapB?.type || null;
    const typesMatch = typeA && typeB && typeA === typeB;

    let showHeadBars = !!(headA || headB);
    let showBodyBars = !!(bodyA || bodyB);

    if (typesMatch && (typeA === 'chest' || typeA === 'full body')) {
        showHeadBars = false;
    }
    if (typesMatch && typeA === 'head') {
        showBodyBars = false;
    }

    for (const stat of barKeys) {
        const row = document.createElement("div");
        row.className = "comparison-bar";

        const label = document.createElement("div");
        label.textContent = stat;
        row.appendChild(label);

        const group = document.createElement("div");
        group.className = "comparison-bar-group";

        const entries = [];
        if (showHeadBars) {
            entries.push(
                { label: 'Armor A Head', base: getNumeric(headAStats[stat]), val: getNumeric(headAAdjusted[stat]), color: '#4dd0e1' },
                { label: 'Armor B Head', base: getNumeric(headBStats[stat]), val: getNumeric(headBAdjusted[stat]), color: '#ff8a65' }
            );
        }
        if (showBodyBars) {
            entries.push(
                { label: 'Armor A Chest', base: getNumeric(bodyAStats[stat]), val: getNumeric(bodyAAdjusted[stat]), color: '#00acc1' },
                { label: 'Armor B Chest', base: getNumeric(bodyBStats[stat]), val: getNumeric(bodyBAdjusted[stat]), color: '#f4511e' }
            );
        }

        entries.forEach(entry => {
            let max = 100.0;
            if (stat === "weight") { max = 20; }
            if (stat === "slots" || stat === "physical") { max = 5; }

            const basePct = (entry.base / max) * 100;
            const pct = (entry.val / max) * 100;

            const item = document.createElement('div');
            item.className = 'comparison-bar-item';

            const itemLabel = document.createElement('div');
            itemLabel.className = 'comparison-bar-item-label';
            itemLabel.textContent = entry.label;

            const bar = makeBar(basePct, pct, entry.color, stat !== "weight");
            bar.title = `Base: ${entry.base.toFixed(1)} -> Upgraded: ${entry.val.toFixed(1)}`;

            item.appendChild(itemLabel);
            item.appendChild(bar);
            group.appendChild(item);
        });

        row.appendChild(group);
        comparisonDiv.appendChild(row);
    }
}