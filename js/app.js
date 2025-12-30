let armorData = [];

async function loadArmorData() {
    const response = await fetch("data/armor.json");
    armorData = await response.json();

    populateDropdown("armorSelectA");
    populateDropdown("armorSelectB");
}

function populateDropdown(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = "";

    armorData.forEach(armor => {
        const option = document.createElement("option");
        option.value = armor.id;
        option.textContent = armor.name;
        select.appendChild(option);
    });

    select.addEventListener("change", () => updateStats(selectId));
}

function updateStats(selectId) {
    const armorId = document.getElementById(selectId).value;
    const armor = armorData.find(a => a.id === armorId);

    const statsDiv = document.getElementById(
        selectId === "armorSelectA" ? "statsA" : "statsB"
    );

    renderStats(statsDiv, armor);
    updateComparison();
}

loadArmorData();