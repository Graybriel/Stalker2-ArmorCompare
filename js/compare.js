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
        const num = Math.ceil(rawVal);
        return { text: num.toFixed(0), num, hasNumber: true };
    }

    const parsed = parseFloat(String(rawVal).replace(/[^0-9.-]+/g, ''));
    if (!isNaN(parsed)) {
        const num = Math.ceil(parsed);
        return { text: num.toFixed(0), num, hasNumber: true };
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

    // Determine if this is a split view (head/chest with DIFFERENT pieces) or single view
    // Full body pieces have both head and body but they're the same piece, so treat as single
    const isSplitView = !!(headArmor && bodyArmor && headArmor.id !== bodyArmor.id);

    // Create header based on view type
    const headerRow = document.createElement("div");
    headerRow.className = isSplitView ? "stat-row stat-header stat-row-split" : "stat-row stat-header stat-row-single";
    if (isSplitView) {
        headerRow.innerHTML = `
            <span class="stat-label"></span>
            <span class="stat-value">Head</span>
            <span class="stat-value">Body</span>
            <span class="stat-value">Combined</span>
        `;
    } else {
        headerRow.innerHTML = `
            <span class="stat-label"></span>
            <span class="stat-value">Value</span>
        `;
    }
    container.appendChild(headerRow);

    orderedKeys.forEach(stat => {
        const row = document.createElement("div");
        row.className = isSplitView ? "stat-row stat-row-split" : "stat-row stat-row-single";

        const headBase = formatStatValue(headStats[stat]);
        const headUpgraded = formatStatValue(headDisplay[stat]);
        const bodyBase = formatStatValue(bodyStats[stat]);
        const bodyUpgraded = formatStatValue(bodyDisplay[stat]);

        if (isSplitView) {
            // Show head, body, and combined
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

            // Combined (head + body), but exclude physical
            let combinedText = "-";
            if (stat !== "physical") {
                const totalBase = (headBase.num ?? 0) + (bodyBase.num ?? 0);
                const totalUpgraded = (headUpgraded.num ?? 0) + (bodyUpgraded.num ?? 0);
                const hasNumbers = headBase.hasNumber || bodyBase.hasNumber || headUpgraded.hasNumber || bodyUpgraded.hasNumber;
                if (hasNumbers) {
                    if (includeUpgrades && (headBase.num !== headUpgraded.num || bodyBase.num !== bodyUpgraded.num)) {
                        combinedText = `${Math.ceil(totalBase)} -> ${Math.ceil(totalUpgraded)}`;
                    } else {
                        combinedText = Math.ceil(totalUpgraded).toFixed(0);
                    }
                }
            } else {
                // For physical, show only asterisk
                row.innerHTML = `
                    <span class="stat-label">${stat}</span>
                    <span class="stat-value">${headText}</span>
                    <span class="stat-value">${bodyText}</span>
                    <span class="stat-value">*</span>
                `;
                container.appendChild(row);
                return;
            }

            row.innerHTML = `
                <span class="stat-label">${stat}</span>
                <span class="stat-value">${headText}</span>
                <span class="stat-value">${bodyText}</span>
                <span class="stat-value">${combinedText}</span>
            `;
        } else {
            // Show only one value (head or body, whichever is available)
            const base = headArmor ? headBase : bodyBase;
            const upgraded = headArmor ? headUpgraded : bodyUpgraded;

            const valueText = base.hasNumber || upgraded.hasNumber
                ? (includeUpgrades && base.hasNumber && upgraded.hasNumber && base.num !== upgraded.num
                    ? `${base.text} -> ${upgraded.text}`
                    : upgraded.text)
                : "-";

            row.innerHTML = `
                <span class="stat-label">${stat}</span>
                <span class="stat-value">${valueText}</span>
            `;
        }

        container.appendChild(row);
    });

    // Add footnote for split view
    if (isSplitView) {
        const footnote = document.createElement("div");
        footnote.className = "stat-footnote";
        footnote.innerHTML = `* Physical protection is per-location and doesn't stack between head and body.`;
        container.appendChild(footnote);
    }
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

    // Determine if we're in split view (head/chest comparison) for each column
    const isSplitViewA = !!(headA && bodyA && headA.id !== bodyA.id);
    const isSplitViewB = !!(headB && bodyB && headB.id !== bodyB.id);
    const isSplitView = isSplitViewA || isSplitViewB;

    // Update legend based on what's actually displayed
    const legendDiv = document.querySelector('.comparison-legend');
    if (legendDiv) {
        const legendItems = [];
        
        if (isSplitViewA) {
            legendItems.push({ color: '#4dd0e1', label: 'Armor A Head' });
            legendItems.push({ color: '#00acc1', label: 'Armor A Body' });
        } else if (headA && !bodyA) {
            legendItems.push({ color: '#4dd0e1', label: 'Armor A Head' });
        } else if (bodyA && !headA) {
            legendItems.push({ color: '#00acc1', label: 'Armor A Body' });
        } else if (headA && bodyA && headA.id === bodyA.id) {
            // Full body - non-physical stats use combined color, physical still shows separately
            legendItems.push({ color: '#26a69a', label: 'Armor A (Full Body)' });
        }
        
        if (isSplitViewB) {
            legendItems.push({ color: '#ff8a65', label: 'Armor B Head' });
            legendItems.push({ color: '#f4511e', label: 'Armor B Body' });
        } else if (headB && !bodyB) {
            legendItems.push({ color: '#ff8a65', label: 'Armor B Head' });
        } else if (bodyB && !headB) {
            legendItems.push({ color: '#f4511e', label: 'Armor B Body' });
        } else if (headB && bodyB && headB.id === bodyB.id) {
            // Full body
            legendItems.push({ color: '#e64a19', label: 'Armor B (Full Body)' });
        }
        
        legendDiv.innerHTML = legendItems.map(item => `
            <span class="legend-item">
                <span class="legend-swatch" style="background: ${item.color}"></span>
                ${item.label}
            </span>
        `).join('');
    }

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

        // Create separate groups for each armor to keep them on same line
        const groupA = document.createElement("div");
        groupA.className = "comparison-bar-group";
        
        const groupB = document.createElement("div");
        groupB.className = "comparison-bar-group";

        const headABase = getNumeric(headAStats[stat]);
        const headAVal = getNumeric(headAAdjusted[stat]);
        const bodyABase = getNumeric(bodyAStats[stat]);
        const bodyAVal = getNumeric(bodyAAdjusted[stat]);
        const headBBase = getNumeric(headBStats[stat]);
        const headBVal = getNumeric(headBAdjusted[stat]);
        const bodyBBase = getNumeric(bodyBStats[stat]);
        const bodyBVal = getNumeric(bodyBAdjusted[stat]);

        const isPhysical = stat === "physical";
        
        // Build entries based on stat type
        const itemsA = [];
        const itemsB = [];
        
        if (isPhysical) {
            // Physical: always show Head and Body separately (doesn't stack)
            if (headA) {
                itemsA.push({ label: 'Head', base: headABase, val: headAVal, color: '#4dd0e1' });
            }
            if (bodyA) {
                itemsA.push({ label: 'Body', base: bodyABase, val: bodyAVal, color: '#00acc1' });
            }
            if (headB) {
                itemsB.push({ label: 'Head', base: headBBase, val: headBVal, color: '#ff8a65' });
            }
            if (bodyB) {
                itemsB.push({ label: 'Body', base: bodyBBase, val: bodyBVal, color: '#f4511e' });
            }
        } else {
            // Non-physical: show as a single value for each armor (matching stats display)
            if (isSplitViewA) {
                // Split view for A: sum head + body
                const combinedABase = headABase + bodyABase;
                const combinedAVal = headAVal + bodyAVal;
                itemsA.push({ base: combinedABase, val: combinedAVal, color: '#26a69a' });
            } else {
                // Single view for A: show single piece (whether head or body or full body)
                if (headA && bodyA && headA.id === bodyA.id) {
                    // Full body piece - show only once
                    itemsA.push({ base: headABase, val: headAVal, color: '#26a69a' });
                } else if (headA) {
                    itemsA.push({ base: headABase, val: headAVal, color: '#4dd0e1' });
                } else if (bodyA) {
                    itemsA.push({ base: bodyABase, val: bodyAVal, color: '#00acc1' });
                }
            }
            
            if (isSplitViewB) {
                // Split view for B: sum head + body
                const combinedBBase = headBBase + bodyBBase;
                const combinedBVal = headBVal + bodyBVal;
                itemsB.push({ base: combinedBBase, val: combinedBVal, color: '#e64a19' });
            } else {
                // Single view for B: show single piece (whether head or body or full body)
                if (headB && bodyB && headB.id === bodyB.id) {
                    // Full body piece - show only once
                    itemsB.push({ base: headBBase, val: headBVal, color: '#e64a19' });
                } else if (headB) {
                    itemsB.push({ base: headBBase, val: headBVal, color: '#ff8a65' });
                } else if (bodyB) {
                    itemsB.push({ base: bodyBBase, val: bodyBVal, color: '#f4511e' });
                }
            }
        }
        
        // Render items
        itemsA.forEach(entry => {
            let max = 100.0;
            if (stat === "weight") { max = 20; }
            if (stat === "slots" || stat === "physical") { max = 5; }

            const basePct = (entry.base / max) * 100;
            const pct = (entry.val / max) * 100;

            const item = document.createElement('div');
            item.className = 'comparison-bar-item';

            if (entry.label) {
                const itemLabel = document.createElement('div');
                itemLabel.className = 'comparison-bar-item-label';
                itemLabel.textContent = entry.label;
                item.appendChild(itemLabel);
            } else {
                // Add empty spacer to maintain grid layout
                const spacer = document.createElement('div');
                item.appendChild(spacer);
            }

            const bar = makeBar(basePct, pct, entry.color, stat !== "weight");
            bar.title = `Base: ${Math.ceil(entry.base)} -> Upgraded: ${Math.ceil(entry.val)}`;

            item.appendChild(bar);
            groupA.appendChild(item);
        });

        itemsB.forEach(entry => {
            let max = 100.0;
            if (stat === "weight") { max = 20; }
            if (stat === "slots" || stat === "physical") { max = 5; }

            const basePct = (entry.base / max) * 100;
            const pct = (entry.val / max) * 100;

            const item = document.createElement('div');
            item.className = 'comparison-bar-item';

            if (entry.label) {
                const itemLabel = document.createElement('div');
                itemLabel.className = 'comparison-bar-item-label';
                itemLabel.textContent = entry.label;
                item.appendChild(itemLabel);
            } else {
                // Add empty spacer to maintain grid layout
                const spacer = document.createElement('div');
                item.appendChild(spacer);
            }

            const bar = makeBar(basePct, pct, entry.color, stat !== "weight");
            bar.title = `Base: ${Math.ceil(entry.base)} -> Upgraded: ${Math.ceil(entry.val)}`;

            item.appendChild(bar);
            groupB.appendChild(item);
        });

        row.appendChild(groupA);
        row.appendChild(groupB);
        comparisonDiv.appendChild(row);
    }
}