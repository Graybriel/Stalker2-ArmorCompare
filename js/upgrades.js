/*
 * Upgrade-related UI logic:
 * - Build upgrade grids for each armor section
 * - Render grids and handle selection
 * - Enforce blocking/required rules per armor column
 */

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)$/i;

function extractTextureBase(iconRef) {
    if (!iconRef) return null;
    const cleaned = String(iconRef)
        .replace(/^Texture2D['"]?/i, '')
        .replace(/['"]$/g, '')
        .trim();
    if (!cleaned) return null;
    const lastSeg = cleaned.split('/').pop() || '';
    if (!lastSeg) return null;
    return lastSeg.split('.')[0] || null;
}

function resolveIconPath(iconRef, kind) {
    if (!iconRef) return null;
    const ref = String(iconRef).trim();
    if (!ref) return null;

    // Reject obviously invalid paths
    if (ref.startsWith('/Script/') || ref.includes('/Script/')) return null;

    const lowerRef = ref.toLowerCase();
    if (lowerRef.startsWith('armor/')) {
        const trimmed = ref.replace(/^armor\//i, '');
        if (IMAGE_EXT_RE.test(trimmed)) return `assets/armor/${trimmed}`;
        const base = extractTextureBase(trimmed) || trimmed;
        return `assets/armor/${base}${IMAGE_EXT_RE.test(base) ? '' : '.png'}`;
    }
    if (lowerRef.startsWith('upgrades/')) {
        const trimmed = ref.replace(/^upgrades\//i, '');
        if (IMAGE_EXT_RE.test(trimmed)) return `assets/upgrades/${trimmed}`;
        const base = extractTextureBase(trimmed) || trimmed;
        return `assets/upgrades/${base}${IMAGE_EXT_RE.test(base) ? '' : '.png'}`;
    }

    if (IMAGE_EXT_RE.test(ref) || ref.startsWith('assets/')) return ref;

    // Handle old Texture2D format
    if (lowerRef.includes('texture2d') || lowerRef.includes('/game/')) {
        const base = extractTextureBase(ref);
        if (!base) return null;
        const folder = kind === 'armor' ? 'assets/armor' : 'assets/upgrades';
        // Try with _upgrade suffix for armor
        if (kind === 'armor') return `${folder}/${base}_upgrade.png`;
        return `${folder}/${base}.png`;
    }

    const base = extractTextureBase(ref);
    if (!base) return null;
    const folder = kind === 'armor' ? 'assets/armor' : 'assets/upgrades';
    return `${folder}/${base}.png`;
}

function getUpgradeIconRef(cell) {
    if (!cell) return null;
    return cell.image || cell.Image || cell.icon || cell.Icon || cell.values?.Image || cell.values?.Icon || cell.Values?.Image || cell.Values?.Icon || null;
}

function getArmorIconRef(armor) {
    if (!armor) return null;
    return armor.icon || armor.Icon || armor.values?.Icon || armor.Values?.Icon || null;
}

function applyArmorBackground(el, armor) {
    if (!el || !armor) return null;
    const iconRef = getArmorIconRef(armor);
    const bgPath = resolveIconPath(iconRef, 'armor');
    if (!bgPath) return null;
    // Use ../ prefix because CSS custom properties resolve relative to the CSS file in /css/
    el.style.setProperty('--armor-image', `url("../${encodeURI(bgPath)}")`);
    el.classList.add('has-armor-image');
    return bgPath;
}

function toZoneClass(sectionName) {
    return String(sectionName || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
}

function positionConnectors(canvas) {
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const anchors = canvas.querySelectorAll('.upgrade-anchor');

    anchors.forEach(anchor => {
        const section = Array.from(anchor.classList)
            .find(cls => cls.startsWith('anchor-'))
            ?.replace('anchor-', '');
        if (!section) return;

        const zone = canvas.querySelector(`.zone-${section}`);
        if (!zone) return;

        let connector = canvas.querySelector(`.upgrade-connector[data-section="${section}"]`);
        if (!connector) {
            connector = document.createElement('div');
            connector.className = 'upgrade-connector';
            connector.dataset.section = section;
            canvas.appendChild(connector);
        }

        const anchorRect = anchor.getBoundingClientRect();
        const zoneRect = zone.getBoundingClientRect();

        const startX = anchorRect.left + anchorRect.width / 2 - canvasRect.left;
        const startY = anchorRect.top + anchorRect.height / 2 - canvasRect.top;

        const zoneLeft = zoneRect.left - canvasRect.left;
        const zoneTop = zoneRect.top - canvasRect.top;
        const zoneRight = zoneLeft + zoneRect.width;
        const zoneBottom = zoneTop + zoneRect.height;

        // Nearest point on zone rectangle to anchor center
        const endX = Math.min(Math.max(startX, zoneLeft), zoneRight);
        const endY = Math.min(Math.max(startY, zoneTop), zoneBottom);

        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        connector.style.left = `${startX}px`;
        connector.style.top = `${startY}px`;
        connector.style.width = `${length}px`;
        connector.style.transform = `rotate(${angle}deg)`;
    });
}

function scheduleConnectors(canvas) {
    if (!canvas) return;
    requestAnimationFrame(() => positionConnectors(canvas));
    setTimeout(() => positionConnectors(canvas), 100);
}

window.refreshUpgradeConnectors = () => {
    document.querySelectorAll('.armor-upgrade-canvas').forEach(scheduleConnectors);
};

// Render a single grid (e.g., Head/Neck/Shoulder) into a container.
// Each cell may hold an upgrade, or be blank.
function renderGrid(grid, container, pieceId = null) {
    container.innerHTML = ""; // clear previous content

    grid.forEach((row, rowIdx) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "upgrade-row";

        row.forEach((cell, colIdx) => {
            const cellDiv = document.createElement("div");
            cellDiv.className = "upgrade-cell";
            
            // Create a unique ID for this cell to track selection state
            const cellId = `cell-${rowIdx}-${colIdx}`;
            cellDiv.id = cellId;

            if (cell) {
                // Use the upgrade's id as a stable selection key (consistent across re-render)
                const upgradeId = cell.id || `${cellId}-upg`;
                cellDiv.dataset.upgradeId = upgradeId;

                // Store the upgrade object data on the cell element for later lookup
                cellDiv.dataset.upgrade = JSON.stringify(cell);

                // Attach piece id (if rendering multi-piece grids like head + chest)
                if (pieceId) cellDiv.dataset.pieceId = pieceId;

                // Expose blocking/required lists for availability computation
                const blockingList = cell.blocking || cell.BlockingUpgradePrototypeSIDs || [];
                const requiredList = cell.required || cell.RequiredUpgradePrototypeSIDs || [];
                if (blockingList && blockingList.length) cellDiv.dataset.blocking = blockingList.join(",");
                if (requiredList && requiredList.length) cellDiv.dataset.required = requiredList.join(",");
                
                // If already selected (check across possible selection key formats), mark state
                if (window.selectedUpgrades) {
                    for (const key of window.selectedUpgrades) {
                        if (String(key).endsWith(`:${upgradeId}`) || String(key) === upgradeId) {
                            cellDiv.classList.add("selected");
                            break;
                        }
                    }
                }

                // Build label from each effect: "Strike Protection 20%"
                const effectLabels = cell.effects?.map(e => {
                    if (isNaN(e.max)) return `${e.text}`;
                    const val = Number.isFinite(e.max) ? e.max : parseFloat(e.max);
                    const formatted = Number.isFinite(val) && Number.isInteger(val) ? val : val;
                    const suffix = e.isPercent ? '%' : '';
                    return `${e.text} ${formatted}${suffix}`.trim();
                }).filter(Boolean) || [];

                // Fallback if no effects exist
                let label = effectLabels.length > 0
                    ? effectLabels.join(" / ")
                    : cell.id;

                // Override label for common quest upgrade
                if (upgradeId === 'FaustPsyResist_Quest_1_1') {
                    label = 'Psy defence 5%';
                }

                const iconRef = getUpgradeIconRef(cell);
                const iconPath = resolveIconPath(iconRef, 'upgrade');

                const indicatorDiv = document.createElement('div');
                indicatorDiv.className = 'upgrade-indicator';

                const imageDiv = document.createElement('div');
                imageDiv.className = 'upgrade-card-image';
                if (iconPath) {
                    const safePath = encodeURI(iconPath);
                    imageDiv.style.backgroundImage = `url("${safePath}")`;
                    cellDiv.dataset.imagePath = iconPath;
                } else {
                    imageDiv.classList.add('no-image');
                }
                imageDiv.setAttribute('aria-hidden', 'true');

                const labelDiv = document.createElement('div');
                labelDiv.className = 'upgrade-card-label';
                labelDiv.textContent = label;

                cellDiv.appendChild(indicatorDiv);
                cellDiv.appendChild(imageDiv);
                cellDiv.appendChild(labelDiv);
                cellDiv.classList.add("has-upgrade");
                
                // Add click handler to toggle selection
                // Use upgradeId + armorCol + optional pieceId to disambiguate
                cellDiv.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (!window.selectedUpgrades) window.selectedUpgrades = new Set();

                    // Ensure availability state is up-to-date before acting
                    if (window.updateUpgradeAvailability) window.updateUpgradeAvailability();

                    // If this cell is blocked or requires other upgrades, show a quick hint and don't toggle
                    if (cellDiv.classList.contains('blocked')) {
                        flashCell(cellDiv, 'blocked');
                        return;
                    }
                    if (cellDiv.classList.contains('requires')) {
                        flashCell(cellDiv, 'requires');
                        return;
                    }

                    // Determine which armorCol this cell belongs to by walking up DOM
                    let ancestor = cellDiv;
                    let col = null;
                    while (ancestor && ancestor !== document) {
                        if (ancestor.id === 'upgradeContainerA') { col = 'A'; break; }
                        if (ancestor.id === 'upgradeContainerB') { col = 'B'; break; }
                        ancestor = ancestor.parentNode;
                    }
                    if (!col) col = 'A'; // fallback

                    const pieceSeg = cellDiv.dataset.pieceId ? `${cellDiv.dataset.pieceId}:` : '';
                    const selectionKey = `${col}:${pieceSeg}${upgradeId}`;
                    cellDiv.dataset.selectionKey = selectionKey;

                    const selectedSet = window.selectedUpgrades;
                    if (selectedSet.has(selectionKey)) {
                        // Before deselecting, ensure no other selected upgrade requires this one
                        const container = document.getElementById(`upgradeContainer${col}`);
                        if (container) {
                            const selectedCells = Array.from(container.querySelectorAll('.upgrade-cell.selected'));
                            const requiredBy = selectedCells.filter(other => {
                                if (other === cellDiv) return false;
                                const req = (other.dataset.required || '').split(',').filter(Boolean);
                                return req.includes(upgradeId);
                            });

                            if (requiredBy.length > 0) {
                                // Block deselection if another selected upgrade depends on this
                                flashCell(cellDiv, 'requires');
                                return;
                            }
                        }

                        selectedSet.delete(selectionKey);
                        cellDiv.classList.remove("selected");
                    } else {
                        selectedSet.add(selectionKey);
                        cellDiv.classList.add("selected");
                    }

                    // Recompute availability and update stats
                    if (window.updateUpgradeAvailability) window.updateUpgradeAvailability();
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

// Build upgrade grids per section (Head/Neck/Shoulder/Chest/Hip).
function buildUpgradeGrids(armor) {
    if (!armor || !armor.upgrades) return {};

    // Mapping from raw upgrade part type to UI section label
    const bodyPartMap = {
        "EUpgradeTargetPartType::Stock": "Head",
        "EUpgradeTargetPartType::Barrel": "Neck",
        "EUpgradeTargetPartType::Handguard": "Shoulder",
        "EUpgradeTargetPartType::Body": "Chest",
        "EUpgradeTargetPartType::PistolGrip": "Hip"
    };

    // Alternate mapping for head armor types
    const helmetPartMap = {
        "EUpgradeTargetPartType::Stock": "Crown",
        "EUpgradeTargetPartType::Barrel": "Chin",
        "EUpgradeTargetPartType::Handguard": "Eyebrow",
        "EUpgradeTargetPartType::Body": "Nose",
        "EUpgradeTargetPartType::PistolGrip": "Cheek"
    };

    const partMap = armor.type === "head"
        ? helmetPartMap
        : bodyPartMap;

    // Create an empty grid skeleton based on armor type and section
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

// Render upgrades for a single armor selection into the column container.
function renderUpgradesForArmor(armor, armorCol) {
    // Clear any previous selections when rendering new armor
    window.selectedUpgrades = new Set();
    
    // Clear grids if no armor selected
    if (!armor) {
        const container = document.getElementById(`upgradeContainer${armorCol}`);
        if (container) container.innerHTML = "";
        if (window.syncUpgradeContainerHeights) window.syncUpgradeContainerHeights();
        if (window.updateUpgradeAvailability) window.updateUpgradeAvailability();
        return;
    }

    const grids = buildUpgradeGrids(armor);
    if (Object.keys(grids).length === 0) return;

    const container = document.getElementById(`upgradeContainer${armorCol}`);
    if (!container) return;

    container.innerHTML = '';

    // Insert upgrade cost summary at the top of the container
    const costDiv = document.createElement('div');
    costDiv.className = 'upgrade-cost';
    costDiv.id = `upgradeCost${armorCol}`;
    costDiv.textContent = 'Upgrade Cost: 0';
    container.appendChild(costDiv);

    const pieceSection = document.createElement('div');
    pieceSection.className = 'armor-piece-section';

    const title = document.createElement('h3');
    title.className = 'piece-title';
    title.textContent = `${armor.name} (${armor.type})`;
    pieceSection.appendChild(title);

    // Create armor canvas with centered image and upgrade zones
    const canvas = document.createElement('div');
    canvas.className = 'armor-upgrade-canvas';
    canvas.classList.add(`armor-type-${String(armor.type || '').replace(/\s+/g, '-')}`);

    // Central armor image
    const armorImgContainer = document.createElement('div');
    armorImgContainer.className = 'armor-center-image';
    applyArmorBackground(armorImgContainer, armor);
    canvas.appendChild(armorImgContainer);

    // Zone order for body
    const zoneOrder = armor.type === 'head'
        ? ['Crown', 'Nose', 'Chin', 'Eyebrow', 'Cheek']
        : ['Head', 'Neck', 'Shoulder', 'Chest', 'Hip'];

    // Each section gets an anchor + grid
    zoneOrder.forEach(section => {
        const grid = grids[section];
        if (!grid) return;
        const hasUpgrades = grid.some(row => row.some(cell => !!cell));
        if (!hasUpgrades) return;

        // Create anchor point on armor
        const anchor = document.createElement('div');
        anchor.className = `upgrade-anchor anchor-${toZoneClass(section)}`;
        canvas.appendChild(anchor);

        const sectionDiv = document.createElement('div');
        sectionDiv.className = `upgrade-section upgrade-zone zone-${toZoneClass(section)}`;
        sectionDiv.dataset.section = section;
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'section-title';
        titleDiv.textContent = section;
        sectionDiv.appendChild(titleDiv);

        const gridDiv = document.createElement('div');
        gridDiv.className = 'upgrade-grid';
        renderGrid(grid, gridDiv, armor.id);
        sectionDiv.appendChild(gridDiv);

        canvas.appendChild(sectionDiv);
    });

    pieceSection.appendChild(canvas);
    container.appendChild(pieceSection);

    scheduleConnectors(canvas);

    if (window.syncUpgradeContainerHeights) window.syncUpgradeContainerHeights();
    if (window.updateUpgradeAvailability) window.updateUpgradeAvailability();
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
        if (window.updateUpgradeAvailability) window.updateUpgradeAvailability();
        return;
    }

    container.innerHTML = "";

    // Insert upgrade cost summary at the top of the container
    const costDiv = document.createElement('div');
    costDiv.className = 'upgrade-cost';
    costDiv.id = `upgradeCost${armorCol}`;
    costDiv.textContent = 'Upgrade Cost: 0';
    container.appendChild(costDiv);

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

        // Create armor canvas with centered image and upgrade zones
        const canvas = document.createElement('div');
        canvas.className = 'armor-upgrade-canvas';
        canvas.classList.add(`armor-type-${String(armor.type || '').replace(/\s+/g, '-')}`);

        // Central armor image
        const armorImgContainer = document.createElement('div');
        armorImgContainer.className = 'armor-center-image';
        applyArmorBackground(armorImgContainer, armor);
        canvas.appendChild(armorImgContainer);

        // Zone order
        const zoneOrder = armor.type === 'head'
            ? ['Crown', 'Nose', 'Chin', 'Eyebrow', 'Cheek']
            : ['Head', 'Neck', 'Shoulder', 'Chest', 'Hip'];

        // Build upgrade grids for this piece
        const grids = buildUpgradeGrids(armor);

        // Render each upgrade section (skip empty sections)
        zoneOrder.forEach(sectionName => {
            const grid = grids[sectionName];
            if (!grid) return;
            const hasUpgrades = grid.some(row => row.some(cell => !!cell));
            if (!hasUpgrades) return;

            // Create anchor point on armor
            const anchor = document.createElement('div');
            anchor.className = `upgrade-anchor anchor-${toZoneClass(sectionName)}`;
            canvas.appendChild(anchor);

            const sectionDiv = document.createElement("div");
            sectionDiv.className = `upgrade-section upgrade-zone zone-${toZoneClass(sectionName)}`;
            sectionDiv.dataset.section = sectionName;

            const sectionTitle = document.createElement("h4");
            sectionTitle.className = "section-title";
            sectionTitle.textContent = sectionName;
            sectionDiv.appendChild(sectionTitle);

            const gridDiv = document.createElement("div");
            gridDiv.className = "upgrade-grid";
            renderGrid(grid, gridDiv, armor.id);
            sectionDiv.appendChild(gridDiv);

            canvas.appendChild(sectionDiv);
        });

        pieceSection.appendChild(canvas);
        container.appendChild(pieceSection);

        scheduleConnectors(canvas);
    });

    if (!window._upgradeConnectorResizeBound) {
        window._upgradeConnectorResizeBound = true;
        window.addEventListener('resize', () => {
            document.querySelectorAll('.armor-upgrade-canvas').forEach(scheduleConnectors);
        });
    }

    if (window.syncUpgradeContainerHeights) window.syncUpgradeContainerHeights();
    if (window.updateUpgradeAvailability) window.updateUpgradeAvailability();
}

// Parse position suffix from upgrade id (fallback for grid placement)
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
        return {};
    }

    const totalEffects = {};

    // Iterate through all selection keys of the form "<col>:<upgradeId>"
    window.selectedUpgrades.forEach(selectionKey => {
        const parts = String(selectionKey).split(":");
        let col = 'A';
        let upgradeId = null;
        if (parts.length === 3) {
            col = parts[0];
            upgradeId = parts[2];
        } else if (parts.length === 2) {
            col = parts[0];
            upgradeId = parts[1];
        } else {
            upgradeId = parts[0];
        }

        // Look for the matching element inside the appropriate column container
        const container = document.getElementById(`upgradeContainer${col}`);
        const cellElement = container ? container.querySelector(`[data-upgrade-id="${upgradeId}"]`) : null;

        if (!cellElement) {
            // Clean up stale selection
            window.selectedUpgrades.delete(selectionKey);
            return;
        }

        if (!cellElement.dataset.upgrade) {
            // Clean up stale selection
            window.selectedUpgrades.delete(selectionKey);
            return;
        }

        try {
            const upgrade = JSON.parse(cellElement.dataset.upgrade);
            if (!upgrade.effects || upgrade.effects.length === 0) {
                return;
            }

            // Add each effect to the total (separating percent vs absolute)
            upgrade.effects.forEach(effect => {
                // Only aggregate effects that target a known stat name
                const key = effect.effectedStat;
                if (!key) {
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
        let col = 'A';
        let upgradeId = null;
        if (parts.length === 3) {
            col = parts[0];
            upgradeId = parts[2];
        } else if (parts.length === 2) {
            col = parts[0];
            upgradeId = parts[1];
        } else {
            upgradeId = parts[0];
        }

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

// Flash helper used to briefly indicate why a cell couldn't be selected
function flashCell(el, type) {
    if (!el) return;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 700);

    const originalTitle = el.getAttribute('data-original-title') || el.title || '';
    if (!el.getAttribute('data-original-title')) el.setAttribute('data-original-title', originalTitle);

    if (type === 'blocked') el.title = el.title || 'Blocked by selected upgrade(s)';
    if (type === 'requires') el.title = el.title || 'Requires other upgrade(s)';

    setTimeout(() => {
        if (el.getAttribute('data-original-title')) el.title = el.getAttribute('data-original-title');
    }, 1200);
}

// Helper: return a human-friendly label for an upgrade id (falls back to id)
function getUpgradeDisplayLabel(upgradeId) {
    if (!upgradeId) return String(upgradeId);
    if (upgradeId === 'FaustPsyResist_Quest_1_1') return 'Psy defence 5%';
    // Look for any cell that has this id
    const el = document.querySelector(`[data-upgrade-id="${upgradeId}"]`);
    if (!el) return upgradeId;

    try {
        const up = JSON.parse(el.dataset.upgrade);
        // Build label similar to renderGrid
        const effectLabels = (up.effects || []).map(e => {
            if (isNaN(e.max)) return `${e.text}`;
            const val = Number.isFinite(e.max) ? e.max : parseFloat(e.max);
            const formatted = Number.isFinite(val) && Number.isInteger(val) ? val : val;
            const suffix = e.isPercent ? '%' : '';
            return `${e.text} ${formatted}${suffix}`.trim();
        }).filter(Boolean);
        if (effectLabels.length > 0) return effectLabels.join(' / ');
        return up.id || up.SID || upgradeId;
    } catch (e) {
        return upgradeId;
    }
}

// Update availability for all upgrade cells based on currently selected upgrades (per armorCol)
function updateUpgradeAvailability() {
    const selectedByCol = { A: new Set(), B: new Set() };
    if (window.selectedUpgrades) {
        window.selectedUpgrades.forEach(selectionKey => {
            const parts = String(selectionKey).split(":");
            let armorCol = 'A';
            let upgradeId = null;
            if (parts.length === 3) {
                armorCol = parts[0];
                upgradeId = parts[2];
            } else if (parts.length === 2) {
                armorCol = parts[0];
                upgradeId = parts[1];
            } else {
                upgradeId = parts[0];
            }
            if (upgradeId && selectedByCol[armorCol]) selectedByCol[armorCol].add(upgradeId);
        });
    }

    const blockedMapByCol = { A: {}, B: {} };
    if (window.selectedUpgrades) {
        window.selectedUpgrades.forEach(selectionKey => {
            const parts = String(selectionKey).split(":");
            let armorCol = 'A';
            let upgradeId = null;
            if (parts.length === 3) {
                armorCol = parts[0];
                upgradeId = parts[2];
            } else if (parts.length === 2) {
                armorCol = parts[0];
                upgradeId = parts[1];
            } else {
                upgradeId = parts[0];
            }
            if (!upgradeId || !blockedMapByCol[armorCol]) return;

            const container = document.getElementById(`upgradeContainer${armorCol}`);
            if (!container) return;

            container.querySelectorAll(`[data-upgrade-id="${upgradeId}"]`).forEach(selEl => {
                const blocks = (selEl.dataset.blocking || '').split(',').filter(Boolean);
                blocks.forEach(b => {
                    if (!blockedMapByCol[armorCol][b]) blockedMapByCol[armorCol][b] = [];
                    blockedMapByCol[armorCol][b].push(upgradeId);
                });
            });
        });
    }

    // Apply block/require rules within each armorCol independently
    ['A', 'B'].forEach(armorCol => {
        const container = document.getElementById(`upgradeContainer${armorCol}`);
        if (!container) return;

        const selectedIds = selectedByCol[armorCol];
        const blockedMap = blockedMapByCol[armorCol] || {};

        container.querySelectorAll('[data-upgrade-id]').forEach(cell => {
            const id = cell.dataset.upgradeId;
            const requiredList = (cell.dataset.required || '').split(',').filter(Boolean);

            const blockingBy = blockedMap[id] || [];
            const isBlocked = blockingBy.length > 0;
            // OR logic: if any required upgrade is selected, this is unlocked
            const hasAnyRequired = requiredList.length === 0
                ? true
                : requiredList.some(r => selectedIds.has(r));

            if (isBlocked) {
                cell.classList.add('blocked');
                if (cell.classList.contains('selected')) {
                    if (window.selectedUpgrades) {
                        for (const key of Array.from(window.selectedUpgrades)) {
                            if (String(key).startsWith(`${armorCol}:`) && String(key).endsWith(`:${id}`)) {
                                window.selectedUpgrades.delete(key);
                            }
                        }
                    }
                    cell.classList.remove('selected');
                }
                const blockerLabels = blockingBy.map(getUpgradeDisplayLabel).filter(Boolean);
                cell.title = blockerLabels.length > 0 ? `Blocked by: ${blockerLabels.join(', ')}` : 'Blocked by selected upgrade(s)';
            } else {
                cell.classList.remove('blocked');
            }

            if (!hasAnyRequired) {
                cell.classList.add('requires');
                const requiredLabels = requiredList.map(getUpgradeDisplayLabel).filter(Boolean);
                cell.title = requiredLabels.length > 0
                    ? `Requires one of: ${requiredLabels.join(', ')}`
                    : `Requires one of: ${requiredList.join(', ')}`;
            } else {
                cell.classList.remove('requires');
                if (!cell.classList.contains('blocked')) cell.title = '';
            }

            cell.classList.remove('selectable');
            if (!isBlocked && hasAnyRequired && !cell.classList.contains('selected')) {
                cell.classList.add('selectable');
            }
        });
    });

    if (window.DEBUG_UPGRADE_AVAILABILITY) {
        const selectedIds = new Set([...selectedByCol.A, ...selectedByCol.B]);
        const blockedMap = { ...blockedMapByCol.A, ...blockedMapByCol.B };
        showAvailabilityOverlay(selectedIds, blockedMap);
    }

    // Ensure stats and cost reflect current selections after availability changes
    if (typeof updateStatsWithSelectedUpgrades === 'function') updateStatsWithSelectedUpgrades();
    updateUpgradeCost('A');
    updateUpgradeCost('B');
}

// Transient visual overlay for debugging availability
function showAvailabilityOverlay(selectedIds, blockedMap) {
    let el = document.getElementById('upgradeDebugOverlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'upgradeDebugOverlay';
        el.className = 'upgrade-debug-overlay';
        document.body.appendChild(el);
    }

    const sel = Array.from(selectedIds).join(', ') || '(none)';
    const blocks = Object.keys(blockedMap).length === 0 ? '(none)' : Object.entries(blockedMap)
        .map(([k, v]) => `${k}: [${v.join(', ')}]`).join('\n');

    el.textContent = `Selected: ${sel}\nBlocked: ${blocks}`;
    el.style.display = 'block';

    // auto-hide after 3000ms
    if (el._timeout) clearTimeout(el._timeout);
    el._timeout = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

window.updateUpgradeAvailability = updateUpgradeAvailability;

// Compute and display total upgrade cost per column.
function updateUpgradeCost(armorCol) {
    const costEl = document.getElementById(`upgradeCost${armorCol}`);
    if (!costEl || !window.selectedUpgrades) return;

    let total = 0;
    window.selectedUpgrades.forEach(selectionKey => {
        const parts = String(selectionKey).split(':');
        const keyCol = parts.length >= 2 ? parts[0] : 'A';
        const upgradeId = parts.length === 3 ? parts[2] : (parts.length === 2 ? parts[1] : parts[0]);
        if (keyCol !== armorCol) return;

        const container = document.getElementById(`upgradeContainer${armorCol}`);
        const el = container ? container.querySelector(`[data-upgrade-id="${upgradeId}"]`) : null;
        if (!el || !el.dataset.upgrade) return;

        try {
            const upgrade = JSON.parse(el.dataset.upgrade);
            const vals = upgrade.values || upgrade.Values || {};
            const rawCost = vals.BaseCost ?? vals.baseCost ?? vals.Cost ?? vals.cost ?? 0;
            const cost = parseFloat(String(rawCost).replace(/[^0-9.-]+/g, '')) || 0;
            total += cost;
        } catch (e) {
            // ignore parse errors
        }
    });

    costEl.textContent = `Upgrade Cost: ${Math.round(total)}`;
}