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
            
            // Check if this cell is currently selected
            if (window.selectedUpgrades && window.selectedUpgrades.has(cellId)) {
                cellDiv.classList.add("selected");
            }

            if (cell) {
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
                
                // Add click handler to toggle selection
                cellDiv.addEventListener("click", (e) => {
                    e.stopPropagation();
                    cellDiv.classList.toggle("selected");
                    
                    if (!window.selectedUpgrades) {
                        window.selectedUpgrades = new Set();
                    }
                    
                    if (cellDiv.classList.contains("selected")) {
                        window.selectedUpgrades.add(cellId);
                    } else {
                        window.selectedUpgrades.delete(cellId);
                    }
                });
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

    const emptyGrid = () => [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    // Initialize grids with keys from partMap (not hardcoded)
    const grids = {};
    Object.values(partMap).forEach(partName => {
        grids[partName] = emptyGrid();
    });

    // Group upgrades by part + column, using ID to derive column/vertical
    const byPartAndCol = {};

    armor.upgrades.forEach(upg => {
        const part = partMap[upg.values.UpgradeTargetPart];
        if (!part) return;

        const { col, vert: row } = parsePositionFromId(upg.id || (upg.effects?.[0]?.id ?? ""));
        const key = `${part}|${col}`;

        if (!byPartAndCol[key]) byPartAndCol[key] = [];
        byPartAndCol[key].push({ upg, vert: row });
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

            grids[part][row][col] = upg;
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