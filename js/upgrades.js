/*
put all the upgrade related javascript here;  
*/

function renderGrid(grid, container) {
    container.innerHTML = ""; // clear previous content

    grid.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "upgrade-row";

        row.forEach(cell => {
            const cellDiv = document.createElement("div");
            cellDiv.className = "upgrade-cell";

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
            }

            rowDiv.appendChild(cellDiv);
        });

        container.appendChild(rowDiv);
    });
}

function buildUpgradeGrids(armor) {
    if (!armor || !armor.upgrades) return {};

    const partMap = {
        "EUpgradeTargetPartType::Stock": "Head",
        "EUpgradeTargetPartType::Barrel": "Neck",
        "EUpgradeTargetPartType::Handguard": "Shoulder",
        "EUpgradeTargetPartType::Body": "Chest",
        "EUpgradeTargetPartType::PistolGrip": "Hip"
    };

    const emptyGrid = () => [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    const grids = {
        "Head": emptyGrid(),
        "Neck": emptyGrid(),
        "Shoulder": emptyGrid(),
        "Chest": emptyGrid(),
        "Hip": emptyGrid()
    };

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
    // Clear grids if no armor selected
    if (!armor) {
        ["Head", "Neck", "Shoulder", "Chest", "Hip"].forEach(section => {
            const el = document.getElementById(`grid${section}${armorCol}`);
            if (el) el.innerHTML = "";
        });
        return;
    }

    const grids = buildUpgradeGrids(armor);

    // Render each section into its corresponding DOM element
    const map = {
        "Head": `gridHead${armorCol}`,
        "Neck": `gridNeck${armorCol}`,
        "Shoulder": `gridShoulder${armorCol}`,
        "Chest": `gridChest${armorCol}`,
        "Hip": `gridHip${armorCol}`
    };

    Object.entries(map).forEach(([section, elementId]) => {
        const container = document.getElementById(elementId);
        if (container) {
            renderGrid(grids[section], container);
        }
    });
}

function parsePositionFromId(id) {
    // Expect pattern ..._<col>_<vert> at the end
    const match = id.match(/_(\d)_(\d)$/);
    if (!match) return { col: 0, vert: null };

    const col = parseInt(match[1], 10);   // 1–3
    const vert = parseInt(match[2], 10);  // 1 or 2

    return { col: isNaN(col) ? 0 : col - 1, vert: isNaN(vert) ? null : vert };
}