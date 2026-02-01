/*
put all the upgrade related javascript here;  
*/

function renderGrid(grid, container) {
    container.innerHTML = ""; // clear previous content

    grid.forEach((row, rowIdx) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "upgrade-row";

        row.forEach((cell, colIdx) => {
            const cellDiv = document.createElement("div");
            cellDiv.className = "upgrade-cell";
            
            // Create unique ID for this cell to track selection
            const cellId = `cell-${rowIdx}-${colIdx}`;
            cellDiv.id = cellId;

            if (cell) {
                // Use the upgrade's id as a stable selection key
                const upgradeId = cell.id || `${cellId}-upg`;
                cellDiv.dataset.upgradeId = upgradeId;

                // Store the upgrade object data on the cell element
                cellDiv.dataset.upgrade = JSON.stringify(cell);
                
                // If already selected (by upgrade id), mark state
                if (window.selectedUpgrades && window.selectedUpgrades.has(upgradeId)) {
                    cellDiv.classList.add("selected");
                }

                // Build label from each effect: "Strike Protection 20%"
                const effectLabels = cell.effects?.map(e => {
                    const max = isNaN(e.max) ? "" : ` ${e.max}%`;
                    return `${e.text}${max}`;
                }).filter(Boolean) || [];

                // Fallback if no effects exist
                const label = effectLabels.length > 0
                    ? effectLabels.join(" / ")
                    : cell.id;

                cellDiv.textContent = label;
                cellDiv.classList.add("has-upgrade");
                
                // Add click handler to toggle selection (use upgradeId + column to disambiguate)
                cellDiv.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (!window.selectedUpgrades) window.selectedUpgrades = new Set();

                    // Determine which column this cell belongs to by walking up
                    let ancestor = cellDiv;
                    let col = null;
                    while (ancestor && ancestor !== document) {
                        if (ancestor.id === 'upgradeContainerA') { col = 'A'; break; }
                        if (ancestor.id === 'upgradeContainerB') { col = 'B'; break; }
                        ancestor = ancestor.parentNode;
                    }
                    if (!col) col = 'A'; // fallback

                    const selectionKey = `${col}:${upgradeId}`;
                    cellDiv.dataset.selectionKey = selectionKey;

                    const selectedSet = window.selectedUpgrades;
                    if (selectedSet.has(selectionKey)) {
                        selectedSet.delete(selectionKey);
                        cellDiv.classList.remove("selected");
                    } else {
                        selectedSet.add(selectionKey);
                        cellDiv.classList.add("selected");
                    }

                    // Update stats to reflect selected upgrades
                    updateStatsWithSelectedUpgrades();
                });
            } else {
                // empty cell — ensure it doesn't look clickable
                cellDiv.classList.add('blank');
            }

            rowDiv.appendChild(cellDiv);
        });

        container.appendChild(rowDiv);
    });
}

function buildUpgradeGrids(armor) {
    if (!armor || !armor.upgrades) return {};

    const bodyPartMap = {
        "EUpgradeTargetPartType::Stock": "Head",
        "EUpgradeTargetPartType::Barrel": "Neck",
        "EUpgradeTargetPartType::Handguard": "Shoulder",
        "EUpgradeTargetPartType::Body": "Chest",
        "EUpgradeTargetPartType::PistolGrip": "Hip"
    };

    const helmetPartMap = {
        "EUpgradeTargetPartType::Stock": "Crown",
        "EUpgradeTargetPartType::Barrel": "Nose",
        "EUpgradeTargetPartType::Handguard": "Forehead",
        "EUpgradeTargetPartType::Body": "Eyebrow",
        "EUpgradeTargetPartType::PistolGrip": "Cheek"
    };

    const partMap = armor.type === "head"
        ? helmetPartMap
        : bodyPartMap;

    const emptyGrid = (partName) => {
        // Head armor "Crown" has only a single upgrade slot → 1x1 grid
        if (armor.type === "head") {
            if (partName === "Crown") return [[null]];
            // other head sections use full 3x3 grid
            return [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ];
        }

        // Full body: the "Head" category only has one upgrade slot
        if (armor.type === "full body" && partName === "Head") return [[null]];

        // Chest armor has no "Head" category at all
        if (armor.type === "chest" && partName === "Head") return null;

        // Default body grids are 3x3
        return [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
    };

    // Initialize grids with keys from partMap (not hardcoded)
    const grids = {};
    Object.values(partMap).forEach(partName => {
        const g = emptyGrid(partName);
        if (g) grids[partName] = g; // skip sections that shouldn't exist for this armor type
    });

    // Group upgrades by part + column, using ID to derive column/vertical
    const byPartAndCol = {};

    armor.upgrades.forEach(upg => {
        const part = partMap[upg.values.UpgradeTargetPart];
        if (!part) return;

        // Prefer explicit position fields when present; fall back to parsing id suffix
        const vals = upg.values || upg.Values || {};

        let col = null;
        if (vals.HorizontalPosition !== undefined && vals.HorizontalPosition !== null) {
            const parsed = parseInt(vals.HorizontalPosition, 10);
            if (!Number.isNaN(parsed)) col = parsed; // HorizontalPosition is usually 0-based
        }

        let vert = null;
        if (vals.VerticalPosition) {
            const vp = String(vals.VerticalPosition);
            if (vp.includes('Top')) vert = 1;
            else if (vp.includes('Down') || vp.includes('Bottom')) vert = 2;
        }

        // Fallback to id-based parsing (id uses 1-based column/row in suffix)
        if (col === null || vert === null) {
            const parsed = parsePositionFromId(upg.id || (upg.effects?.[0]?.id ?? ""));
            if (col === null) col = parsed.col;
            if (vert === null) vert = parsed.vert;
        }

        // Ensure we have numeric defaults
        if (col === null || Number.isNaN(col)) col = 0;
        if (vert === null || Number.isNaN(vert)) vert = null;

        const key = `${part}|${col}`;

        if (!byPartAndCol[key]) byPartAndCol[key] = [];
        byPartAndCol[key].push({ upg, vert });
    });

    // For each part+column, assign rows with your rule:
    // - vert 1 = top, vert 2 = bottom
    // - if there is a top but no bottom in that column → top goes middle
    Object.entries(byPartAndCol).forEach(([key, entries]) => {
        const [part, colStr] = key.split("|");
        const col = parseInt(colStr, 10);

        const hasTop = entries.some(e => e.vert === 1);
        const hasBottom = entries.some(e => e.vert === 2);

        entries.forEach(({ upg, vert }) => {
            let row;

            if (vert === 1) {
                // top
                row = hasTop && !hasBottom ? 1 : 0; // your rule: top but no bottom → middle
            } else if (vert === 2) {
                // bottom
                row = 2;
            } else {
                // anything else (weird/missing) → middle
                row = 1;
            }

            // Clamp row to available grid rows (handles head single-row grids)
            row = Math.max(0, Math.min(row, grids[part].length - 1));

            // Clamp column to available columns for the chosen row (handles 1-col sections)
            const maxCols = grids[part][row].length;
            const colClamped = Math.max(0, Math.min(col, maxCols - 1));

            grids[part][row][colClamped] = upg;
        });
    });

    return grids;
}

function renderUpgradesForArmor(armor, armorCol) {
    // Clear any previous selections when rendering new armor
    window.selectedUpgrades = new Set();
    
    // Clear grids if no armor selected
    if (!armor) {
        const container = document.getElementById(`upgradeContainer${armorCol}`);
        if (container) container.innerHTML = "";
        if (window.syncUpgradeContainerHeights) window.syncUpgradeContainerHeights();
        return;
    }

    const grids = buildUpgradeGrids(armor);
    if (Object.keys(grids).length === 0) return;

    const container = document.getElementById(`upgradeContainer${armorCol}`);
    if (!container) return;

    container.innerHTML = '';

    Object.entries(grids).forEach(([section, grid]) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'upgrade-section';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'section-title';
        titleDiv.textContent = section;
        sectionDiv.appendChild(titleDiv);

        const gridDiv = document.createElement('div');
        gridDiv.className = 'upgrade-grid';
        renderGrid(grid, gridDiv);
        sectionDiv.appendChild(gridDiv);

        container.appendChild(sectionDiv);
    });

    if (window.syncUpgradeContainerHeights) window.syncUpgradeContainerHeights();
}

/**
 * Render upgrades for multiple armor pieces (head + chest) into a dynamic container.
 * Called when user selects head/chest type to display both pieces with their independent upgrades.
 */
function renderUpgradesForMultiplePieces(pieces, armorCol) {
    // Clear any previous selections when rendering new armor
    window.selectedUpgrades = new Set();
    
    const container = document.getElementById(`upgradeContainer${armorCol}`);
    if (!container || !pieces || pieces.length === 0) {
        if (container) container.innerHTML = "";
        if (window.syncUpgradeContainerHeights) window.syncUpgradeContainerHeights();
        return;
    }

    container.innerHTML = "";

    // For each armor piece (head, chest, full-body), create a section
    pieces.forEach(armor => {
        if (!armor) return;

        // Create a section for this piece
        const pieceSection = document.createElement("div");
        pieceSection.className = "armor-piece-section";

        // Title with armor name and type
        const title = document.createElement("h3");
        title.className = "piece-title";
        title.textContent = `${armor.name} (${armor.type})`;
        pieceSection.appendChild(title);

        // Build upgrade grids for this piece
        const grids = buildUpgradeGrids(armor);

        // Render each upgrade section
        Object.entries(grids).forEach(([sectionName, grid]) => {
            const sectionDiv = document.createElement("div");
            sectionDiv.className = "upgrade-section";

            const sectionTitle = document.createElement("h4");
            sectionTitle.className = "section-title";
            sectionTitle.textContent = sectionName;
            sectionDiv.appendChild(sectionTitle);

            const gridDiv = document.createElement("div");
            gridDiv.className = "upgrade-grid";
            renderGrid(grid, gridDiv);
            sectionDiv.appendChild(gridDiv);

            pieceSection.appendChild(sectionDiv);
        });

        container.appendChild(pieceSection);
    });

    if (window.syncUpgradeContainerHeights) window.syncUpgradeContainerHeights();
}
//function renderUpgradesForArmorPieces(pieces, armorCol) {
//    const container = document.getElementById(`upgradeSections${armorCol}`);
//    container.innerHTML = "";
//
//    pieces.forEach(piece => {
//        const sectionDiv = document.createElement("div");
//        sectionDiv.className = "upgrade-section";
//
//        const title = document.createElement("h3");
//        title.textContent = piece.displayName;
//        sectionDiv.appendChild(title);
//
//        const grids = buildUpgradeGrids(piece);
//
//        Object.entries(grids).forEach(([sectionName, grid]) => {
//            const gridDiv = document.createElement("div");
//            gridDiv.className = "upgrade-grid";
//            renderGrid(grid, gridDiv, armorCol);
//            sectionDiv.appendChild(gridDiv);
//        });
//
//        container.appendChild(sectionDiv);
//    });
//}

function parsePositionFromId(id) {
    // Expect pattern ..._<col>_<vert> at the end
    const match = id.match(/_(\d)_(\d)$/);
    if (!match) return { col: 0, vert: null };

    const col = parseInt(match[1], 10);   // 1–3
    const vert = parseInt(match[2], 10);  // 1 or 2

    return { col: isNaN(col) ? 0 : col - 1, vert: isNaN(vert) ? null : vert };
}

/**
 * Get total effects from all selected upgrades
 */
function getSelectedUpgradeEffects() {
    if (!window.selectedUpgrades || window.selectedUpgrades.size === 0) {
        console.debug('getSelectedUpgradeEffects: no selected upgrades');
        return {};
    }

    console.debug('getSelectedUpgradeEffects:selectedUpgrades', Array.from(window.selectedUpgrades));

    const totalEffects = {};

    // Iterate through all selection keys of the form "<col>:<upgradeId>"
    window.selectedUpgrades.forEach(selectionKey => {
        console.debug('checking selectionKey', selectionKey);
        const parts = String(selectionKey).split(":");
        const col = parts.length === 2 ? parts[0] : 'A';
        const upgradeId = parts.length === 2 ? parts[1] : parts[0];

        // Look for the matching element inside the appropriate column container
        const container = document.getElementById(`upgradeContainer${col}`);
        const cellElement = container ? container.querySelector(`[data-upgrade-id="${upgradeId}"]`) : null;

        if (!cellElement) {
            console.debug('no element for selectionKey', selectionKey);
            // Clean up stale selection
            window.selectedUpgrades.delete(selectionKey);
            return;
        }

        if (!cellElement.dataset.upgrade) {
            console.debug('no dataset.upgrade for', selectionKey, cellElement);
            // Clean up stale selection
            window.selectedUpgrades.delete(selectionKey);
            return;
        }

        try {
            const upgrade = JSON.parse(cellElement.dataset.upgrade);
            console.debug('parsed upgrade', upgrade);
            if (!upgrade.effects || upgrade.effects.length === 0) {
                console.debug('no effects on upgrade', upgrade);
                return;
            }

            // Add each effect to the total (separating percent vs absolute)
            upgrade.effects.forEach(effect => {
                console.debug('effect', effect);
                // Only aggregate effects that target a known stat name
                const key = effect.effectedStat;
                if (!key) {
                    console.debug('skipping effect without effectedStat', effect);
                    return;
                }

                if (!totalEffects[key]) {
                    totalEffects[key] = { text: effect.text, id: effect.id, percent: 0, absolute: 0, max: effect.max };
                }

                const value = isNaN(effect.max) ? 0 : parseFloat(effect.max);
                if (effect.isPercent) {
                    totalEffects[key].percent += value;
                } else {
                    totalEffects[key].absolute += value;
                }
            });
        } catch (e) {
            console.error("Failed to parse upgrade data", e);
        }
    });

    console.debug('totalEffects', totalEffects);
    return totalEffects;
}

// Expose function globally
window.getSelectedUpgradeEffects = getSelectedUpgradeEffects;

/**
 * Aggregate selected upgrade effects separately for Column A and Column B.
 * Returns an object: { A: { statKey: { total, ... } }, B: { ... } }
 */
function getSelectedUpgradeEffectsByColumn() {
    const result = { A: {}, B: {} };
    if (!window.selectedUpgrades || window.selectedUpgrades.size === 0) return result;

    window.selectedUpgrades.forEach(selectionKey => {
        const parts = String(selectionKey).split(":");
        const col = parts.length === 2 ? parts[0] : 'A';
        const upgradeId = parts.length === 2 ? parts[1] : parts[0];

        const container = document.getElementById(`upgradeContainer${col}`);
        if (!container) {
            // stale - remove
            window.selectedUpgrades.delete(selectionKey);
            return;
        }

        const el = container.querySelector(`[data-upgrade-id="${upgradeId}"]`);
        if (!el || !el.dataset.upgrade) {
            // stale - remove
            window.selectedUpgrades.delete(selectionKey);
            return;
        }

        try {
            const upgrade = JSON.parse(el.dataset.upgrade);
            if (!upgrade.effects) return;
            upgrade.effects.forEach(effect => {
                // Only aggregate effects that target a known stat name
                const key = effect.effectedStat;
                if (!key) return;

                const value = isNaN(effect.max) ? 0 : parseFloat(effect.max);
                if (!result[col][key]) result[col][key] = { text: effect.text, id: effect.id, percent: 0, absolute: 0, max: effect.max };
                if (effect.isPercent) {
                    result[col][key].percent += value;
                } else {
                    result[col][key].absolute += value;
                }
            });
        } catch (e) {
            console.error('Failed to parse upgrade for column aggregation', e);
        }
    });

    return result;
}

window.getSelectedUpgradeEffectsByColumn = getSelectedUpgradeEffectsByColumn;

// Ensure both upgrade containers have the same min-height so stats align across columns
function syncUpgradeContainerHeights() {
    const a = document.getElementById('upgradeContainerA');
    const b = document.getElementById('upgradeContainerB');
    if (!a || !b) return;

    // reset any previous min-height to measure true content height
    a.style.minHeight = '';
    b.style.minHeight = '';

    const aH = a.scrollHeight || 0;
    const bH = b.scrollHeight || 0;
    const maxH = Math.max(aH, bH, 120); // ensure a reasonable minimum

    a.style.minHeight = `${maxH}px`;
    b.style.minHeight = `${maxH}px`;
}

window.syncUpgradeContainerHeights = syncUpgradeContainerHeights;