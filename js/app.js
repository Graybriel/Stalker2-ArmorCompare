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
    const response = await fetch("data/armor_full.json");
    armorData = await response.json();

    populateTypeSelects();
    // initialize columns according to default type selection
    updateColumnForType("A", document.getElementById("armorTypeA")?.value ?? "head/chest");
    updateColumnForType("B", document.getElementById("armorTypeB")?.value ?? "head/chest");
}

function getTypes() {
    //const types = Array.from(new Set(armorData.map(a => a.type).filter(Boolean)));
    //types.sort();

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

        sel.onchange = () => {
            const col = id === "armorTypeA" ? "A" : "B";
            updateColumnForType(col, sel.value);
        };
    });
}

function updateColumnForType(col, type) {
    const fullId = `armorFull${col}`;
    const headId = `armorHead${col}`;
    const chestId = `armorChest${col}`;
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
        const disp = visible ? "inline-block" : "none";
        if (el) el.style.display = disp;
        if (lbl) lbl.style.display = disp;
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
    } else {
        const statsDiv = document.getElementById(selectId.endsWith("A") ? "statsA" : "statsB");
        if (statsDiv) statsDiv.innerHTML = "<em>No items</em>";
        updateComparison();
    }
}

function updateStats(selectId) {
    // determine column by last char (A or B)
    const col = selectId.slice(-1);
    const statsDiv = document.getElementById(col === "A" ? "statsA" : "statsB");

    const armor = getEffectiveArmor(col);

    if (!armor) {
        if (statsDiv) statsDiv.innerHTML = "<em>No selection</em>";
        updateComparison();
        return;
    }

    renderStats(statsDiv, armor);
    updateComparison();
}

function getEffectiveArmor(column) {
    // column: "A" or "B"
    const typeSel = document.getElementById(`armorType${column}`);
    const selectedType = typeSel?.value ?? "all";

    if (selectedType === "full body") {
        const id = document.getElementById(`armorFull${column}`)?.value;
        return armorData.find(a => a.id === id) ?? null;
    }

    // otherwise combine head + chest
    // If the selected type explicitly requests only head or only chest, return
    // that part only (ignore any hidden/previous selection in the other part).
    if (selectedType === "head") {
        const headId = document.getElementById(`armorHead${column}`)?.value;
        return armorData.find(a => a.id === headId) || null;
    }
    if (selectedType === "chest") {
        const chestId = document.getElementById(`armorChest${column}`)?.value;
        return armorData.find(a => a.id === chestId) || null;
    }

    const headId = document.getElementById(`armorHead${column}`)?.value;
    const chestId = document.getElementById(`armorChest${column}`)?.value;

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