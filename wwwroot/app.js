console.log("JS LOADED");
let selectedIndex = null;
let saveData = null;


async function uploadSave() {
    const file = document.getElementById("saveFile").files[0];
    if (!file) return alert("Choose a save file!");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/save/load", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        alert("Failed to load save!");
        return;
    }

  
    const boxRes = await fetch("/api/save/boxes");
    const data = await boxRes.json();

    renderBoxes(data.boxes);
}


function renderBoxes(boxes) {
    const area = document.getElementById("boxesArea");
    area.innerHTML = "";

    boxes.forEach((box, b) => {
        const boxDiv = document.createElement("div");
        boxDiv.className = "box";
        boxDiv.innerHTML = `<h3>Box ${b + 1}</h3>`;

        box.forEach((pkm, s) => {
            const index = b * box.length + s;
            const slot = document.createElement("div");
            slot.className = "slot";

            if (!pkm.isEmpty) {
                const img = document.createElement("img");
                img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkm.species}.png`;
                slot.appendChild(img);

                slot.onclick = () => openEditor(pkm, index);
            }

            boxDiv.appendChild(slot);
        });

        area.appendChild(boxDiv);
    });
}


function openEditor(pkm, index) {
    selectedIndex = index;

    document.getElementById("editSpecies").value = pkm.species;
    document.getElementById("editLevel").value = pkm.level;
    document.getElementById("sprite").src =
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkm.species}.png`;
}

async function savePokemon() {
    if (selectedIndex === null) return alert("Select a Pok&eacute;mon!");

    const IVs = [...Array(6)].map((_, i) => parseInt(document.getElementById("iv"+i).value) || 0);
    const EVs = [...Array(6)].map((_, i) => parseInt(document.getElementById("ev"+i).value) || 0);
    const Moves = [...Array(4)].map((_, i) => parseInt(document.getElementById("move"+i).value) || 0);

    await fetch(`/api/save/edit/${selectedIndex}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            species: parseInt(editSpecies.value),
            level: parseInt(editLevel.value),
            shiny: document.getElementById("editShiny").checked
        })
    });

    alert("Pok&eacute;mon fully updated!");
} 


async function checkLegality() {
    if (selectedIndex === null) return alert("Select a Pokémon!");

    const res = await fetch(`/api/save/legal/${selectedIndex}`);
    const data = await res.json();

    document.getElementById("legalReport").textContent =
        (data.valid ? "LEGAL\n\n" : "ILLEGAL\n\n") + data.report;
}


async function fixPokemon() {
    const res = await fetch(`/api/save/fix/${selectedIndex}`, { method: "POST" });
    const data = await res.json();
    alert(data.message);
}

async function loadAbilities() {
    const sel = document.getElementById("editAbility");
    for (let i = 1; i <= 300; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `Ability ${i}`;
        sel.appendChild(opt);
    }
}

async function loadItems() {
    const sel = document.getElementById("editItem");
    for (let i = 1; i <= 1500; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `Item ${i}`;
        sel.appendChild(opt);
    }
}

function loadStatSliders() {
    const area = document.getElementById("stats");
    const stats = ["HP","Atk","Def","SpA","SpD","Spe"];

    stats.forEach((s,i)=>{
        area.innerHTML += `
        <div>
            ${s} IV <input type="range" id="iv${i}" min="0" max="31" value="31" 
                oninput="this.nextElementSibling.textContent=this.value">
            <span>31</span>

            ${s} EV <input type="range" id="ev${i}" min="0" max="252" value="0"
                oninput="this.nextElementSibling.textContent=this.value">
            <span>0</span>
        </div>`;
    });
}

function loadForms() {
    const sel = document.getElementById("editForm");
    for (let i = 0; i < 10; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `Form ${i}`;
        sel.appendChild(opt);
    }
}


window.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing editor UI...");
    loadAbilities();
    loadItems();
    loadForms();
    loadStatSliders();
});
