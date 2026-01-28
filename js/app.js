let armorData = [];

/** Round number to given decimals and return a Number. */
function roundTo(n, decimals = 1) {
    const num = Number(n);
    if (!isFinite(num)) return NaN;
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

// expose for use in other modules
window.roundTo = roundTo;

async function loadArmorData() {
    try {
        const response = await fetch("data/armor.json");
        if (!response.ok) throw new Error(`Failed to load armor data: ${response.status}`);

        const rawData = await response.json();

        armorData = rawData.map(item => {
            // Parse upgrades safely
            const upgrades = (item.Upgrades || []).map(upg => {
                // Convert Effects object → array
                const effects = Object.values(upg.Effects || {})
                    .filter(e => e && e.SID)   // ignore null or malformed entries
                    .map(e => ({
                        id: e.SID,
                        type: e.Type,
                        text: e.Text,
                        max: parseFloat(e.Max)
                    }));

                return {
                    id: upg.Id,
                    values: upg.Values || {},
                    effectSIDs: upg.EffectPrototypeSIDs || [],
                    effects,
                    blocking: upg.BlockingUpgradePrototypeSIDs || [],
                    required: upg.RequiredUpgradePrototypeSIDs || []
                };
            });

            return {
                // Existing fields (your UI depends on these)
                id: item.Id,
                name: item.Values.DisplayName,
                type: item.Values.Type,
                thermal: parseFloat(item.Values.thermal),
                electric: parseFloat(item.Values.electric),
                chemical: parseFloat(item.Values.chemical),
                radiation: parseFloat(item.Values.radiation),
                psi: parseFloat(item.Values.psi),
                physical: parseFloat(item.Values.physical),
                weight: parseFloat(item.Values.weight),
                slots: parseInt(item.Values.slots),

                // NEW: upgrade data
                upgradeList: item.UpgradeList || [],
                upgrades
            };
        });

    } catch (err) {
        console.error(err);

        const main = document.querySelector('main');
        const msg = document.createElement('div');
        msg.style.color = 'salmon';
        msg.style.padding = '12px';
        msg.textContent = `Error: failed to load armor data. Check network or file path. ${err.message}`;
        if (main) main.insertBefore(msg, main.firstChild);

        populateTypeSelects();
        return;
    }

    // Rebuild UI
    populateTypeSelects();
    updateColumnForType("A", document.getElementById("armorTypeA")?.value ?? "head/chest");
    updateColumnForType("B", document.getElementById("armorTypeB")?.value ?? "head/chest");
}

function getTypes() {
    const types = ["full body", "head/chest", "chest", "head"];
    return types;
}

function populateTypeSelects() {
    const types = getTypes();
    const ids = ["armorTypeA", "armorTypeB"];

    ids.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = "";
        // Note: no global "All" option — use 'head/chest' to show both parts.

        types.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = t;
            sel.appendChild(opt);
        });

        // ensure a default selection is present so subsequent code can read sel.value
        if (sel.options.length > 0) sel.selectedIndex = 0;

        // initialize the column display for this select immediately
        const col = id === "armorTypeA" ? "A" : "B";
        updateColumnForType(col, sel.value);

        sel.onchange = () => {
            const col = id === "armorTypeA" ? "A" : "B";
            updateColumnForType(col, sel.value);
        };
    });
}

function updateColumnForType(armorCol, type) {
    const fullId = `armorFull${armorCol}`;
    const headId = `armorHead${armorCol}`;
    const chestId = `armorChest${armorCol}`;
    // Array holding armor objects loaded from `data/armor_full.json`.
    // Each object typically contains: id, name, type (e.g. 'head', 'chest', 'full body'),
    // numeric stats (thermal, electric, chemical, radiation, psi, physical) and weight/slots.

    const fullEl = document.getElementById(fullId);
    const headEl = document.getElementById(headId);
    const chestEl = document.getElementById(chestId);

    if (!fullEl || !headEl || !chestEl) return;
    function setDisplay(id, visible) {
        const el = document.getElementById(id);
        const lbl = document.querySelector(`label[for="${id}"]`);
        if (visible) {
            if (el) {
                el.style.display = "inline-block";
                el.style.visibility = "visible";
            }
            if (lbl) {
                lbl.style.display = "inline-block";
                lbl.style.visibility = "visible";
            }
        } else {
            if (el) {
                el.style.display = "inline-block";
                el.style.visibility = "hidden";
            }
            if (lbl) {
                lbl.style.display = "inline-block";
                lbl.style.visibility = "hidden";
            }
        }
    }

    if (type === "full body") {
        setDisplay(fullId, true);
        setDisplay(headId, false);
        setDisplay(chestId, false);

        populateArmorOptions(fullId, "full body");
    } else if (type === "head") {
        setDisplay(fullId, false);
        setDisplay(headId, true);
        setDisplay(chestId, false);

        populateArmorOptions(headId, "head");
    } else if (type === "chest") {
        setDisplay(fullId, false);
        setDisplay(headId, false);
        setDisplay(chestId, true);

        populateArmorOptions(chestId, "chest");
    } else {
        // all or any other
        setDisplay(fullId, false);
        setDisplay(headId, true);
        setDisplay(chestId, true);

        populateArmorOptions(headId, "head");
        populateArmorOptions(chestId, "chest");
    }
}

function populateArmorOptions(selectId, type = "head/chest") {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = "";

    let filtered;
    if (type === "head/chest") {
        filtered = armorData.filter(a => a.type === "head" || a.type === "chest");
    } else {
        filtered = armorData.filter(a => a.type === type);
    }

    filtered.forEach(armor => {
        const option = document.createElement("option");
        option.value = armor.id;
        option.textContent = armor.name;
        select.appendChild(option);
    });

    select.onchange = () => updateStats(selectId);

    if (select.options.length > 0) {
        select.selectedIndex = 0;
        updateStats(selectId);
    }
}

function updateStats(selectId) {
    // determine column by last char (A or B)
    const armorCol = selectId.slice(-1);
    const statsDiv = document.getElementById(armorCol === "A" ? "statsA" : "statsB");

    const armor = getEffectiveArmor(armorCol);
    const pieces = getArmorPieces(armorCol);

    // If we have multiple pieces (head + chest), render them separately
    // Otherwise render a single piece
    if (pieces && pieces.length > 1) {
        renderUpgradesForMultiplePieces(pieces, armorCol);
    } else if (armor) {
        renderUpgradesForArmor(armor, armorCol);
    } else {
        // No armor selected, clear upgrades
        const container = document.getElementById(`upgradeContainer${armorCol}`);
        if (container) container.innerHTML = "";
    }

    renderStats(statsDiv, armor);
    updateComparison();
}

/**
 * Get individual armor pieces for a column.
 * Returns an array of armor pieces based on selection type.
 * For "head/chest" type with both selected, returns [head, chest].
 * For single piece types, returns [armor].
 */
function getArmorPieces(armorCol) {
    const typeSel = document.getElementById(`armorType${armorCol}`);
    const selectedType = typeSel?.value ?? "head/chest";

    if (selectedType === "full body") {
        const id = document.getElementById(`armorFull${armorCol}`)?.value;
        const armor = armorData.find(a => a.id === id);
        return armor ? [armor] : null;
    }

    if (selectedType === "head") {
        const headId = document.getElementById(`armorHead${armorCol}`)?.value;
        const armor = armorData.find(a => a.id === headId);
        return armor ? [armor] : null;
    }

    if (selectedType === "chest") {
        const chestId = document.getElementById(`armorChest${armorCol}`)?.value;
        const armor = armorData.find(a => a.id === chestId);
        return armor ? [armor] : null;
    }

    // "head/chest" type: return both pieces separately if both selected
    const headId = document.getElementById(`armorHead${armorCol}`)?.value;
    const chestId = document.getElementById(`armorChest${armorCol}`)?.value;

    const head = armorData.find(a => a.id === headId) || null;
    const chest = armorData.find(a => a.id === chestId) || null;

    if (!head && !chest) return null;
    
    const pieces = [];
    if (head) pieces.push(head);
    if (chest) pieces.push(chest);
    
    return pieces.length > 0 ? pieces : null;
}

function getEffectiveArmor(armorCol) {
    // column: "A" or "B"
    const typeSel = document.getElementById(`armorType${armorCol}`);
    const selectedType = typeSel?.value ?? "all";

    if (selectedType === "full body") {
        const id = document.getElementById(`armorFull${armorCol}`)?.value;
        return armorData.find(a => a.id === id) ?? null;
    }

    // otherwise combine head + chest
    // If the selected type explicitly requests only head or only chest, return
    // that part only (ignore any hidden/previous selection in the other part).
    if (selectedType === "head") {
        const headId = document.getElementById(`armorHead${armorCol}`)?.value;
        return armorData.find(a => a.id === headId) || null;
    }
    if (selectedType === "chest") {
        const chestId = document.getElementById(`armorChest${armorCol}`)?.value;
        return armorData.find(a => a.id === chestId) || null;
    }

    const headId = document.getElementById(`armorHead${armorCol}`)?.value;
    const chestId = document.getElementById(`armorChest${armorCol}`)?.value;

    const head = armorData.find(a => a.id === headId) || null;
    const chest = armorData.find(a => a.id === chestId) || null;

    if (!head && !chest) return null;
    if (!head) return chest;
    if (!chest) return head;

    // merge numeric stats by summing where appropriate
    const skip = new Set(["id", "name", "type"]);
    const keys = new Set([...Object.keys(head), ...Object.keys(chest)]);

    const combined = { id: `${head.id}+${chest.id}`, name: `${head.name} + ${chest.name}`, type: 'combined' };

    keys.forEach(k => {
        if (skip.has(k)) return;
        const a = head[k];
        const b = chest[k];
        const aNum = parseFloat(String(a).replace(/[^0-9.-]+/g, ''));
        const bNum = parseFloat(String(b).replace(/[^0-9.-]+/g, ''));

        if (!isNaN(aNum) || !isNaN(bNum)) {
            const sum = (isNaN(aNum) ? 0 : aNum) + (isNaN(bNum) ? 0 : bNum);
            combined[k] = roundTo(sum, 1);
        } else {
            // non-numeric, prefer chest then head
            combined[k] = b ?? a;
        }
    });

    return combined;
}

// expose helper for compare.js
window.getEffectiveArmor = getEffectiveArmor;

loadArmorData();