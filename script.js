let data;
let META = 2800;
const PREMIOS_ORDEN = ["vale","dulcesticker","chico","medio","bueno","alto","mayor"];
let alertPremioMayorMostrado = false;

// -------------------- MODALES --------------------
function showModal(message, onConfirm=null) {
    let modal = document.getElementById("modal");
    if(!modal) {
        modal = document.createElement("div");
        modal.id = "modal";
        modal.style = `
            position: fixed; top: 0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.5); display:flex;
            align-items:center; justify-content:center; z-index:1000;
        `;
        modal.innerHTML = `<div id="modalContent" style="background:#fff;padding:20px;border-radius:8px;min-width:300px;">
            <div id="modalMsg"></div>
            <button id="modalOk">OK</button>
        </div>`;
        document.body.appendChild(modal);
        modal.querySelector("#modalOk").onclick = () => {
            modal.style.display = "none";
            if(onConfirm) onConfirm();
        };
    }
    modal.querySelector("#modalMsg").innerHTML = message;
    modal.style.display = "flex";
}

// Modal para pedir input
function promptModal(message, defaultValue="", callback) {
    let modal = document.getElementById("modal");
    if(!modal) {
        modal = document.createElement("div");
        modal.id = "modal";
        modal.style = `
            position: fixed; top: 0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.5); display:flex;
            align-items:center; justify-content:center; z-index:1000;
        `;
        modal.innerHTML = `<div id="modalContent" style="background:#fff;padding:20px;border-radius:8px;min-width:300px;">
            <div id="modalMsg"></div>
            <input id="modalInput" style="width:100%;margin-top:10px;" />
            <div style="margin-top:10px; text-align:right;">
                <button id="modalCancel">Cancelar</button>
                <button id="modalOk">OK</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    }
    modal.querySelector("#modalMsg").innerHTML = message;
    const input = modal.querySelector("#modalInput");
    input.value = defaultValue;
    modal.style.display = "flex";

    modal.querySelector("#modalCancel").onclick = () => modal.style.display = "none";
    modal.querySelector("#modalOk").onclick = () => {
        const val = input.value;
        modal.style.display = "none";
        callback(val);
    };
}

// Modal confirm
function confirmModal(message, callback) {
    let modal = document.getElementById("modal");
    if(!modal) {
        modal = document.createElement("div");
        modal.id = "modal";
        modal.style = `
            position: fixed; top: 0; left:0; width:100%; height:100%;
            background: rgba(0,0,0,0.5); display:flex;
            align-items:center; justify-content:center; z-index:1000;
        `;
        modal.innerHTML = `<div id="modalContent" style="background:#fff;padding:20px;border-radius:8px;min-width:300px;">
            <div id="modalMsg"></div>
            <div style="margin-top:10px; text-align:right;">
                <button id="modalCancel">No</button>
                <button id="modalOk">Sí</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    }
    modal.querySelector("#modalMsg").innerHTML = message;
    modal.style.display = "flex";

    modal.querySelector("#modalCancel").onclick = () => { modal.style.display = "none"; callback(false); };
    modal.querySelector("#modalOk").onclick = () => { modal.style.display = "none"; callback(true); };
}

// -------------------- CARGAR Y GUARDAR --------------------
async function cargar() {
    const res = await fetch("/data");
    data = await res.json();
    if (data.meta) META = data.meta;
    render();
}

async function guardar(soloRender = false) {
    if (!soloRender) data.meta = META;
    await fetch("/save", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });
    render();
}

// -------------------- FUNCIONES PRINCIPALES --------------------
function registrarDinero() {
    if (!data) { showModal("Datos no cargados aún"); return; }
    const val = Number(document.getElementById("dineroInput").value);
    if (isNaN(val) || val <= 0) { showModal("Ingrese un valor válido mayor a 0"); return; }

    data.dinero.push(val);
    document.getElementById("dineroInput").value = "";

    if (!data.faltantePremioMayor) data.faltantePremioMayor = META - val;
    else data.faltantePremioMayor -= val;

    guardar();
}

function salioPremio() {
    if (!data) { showModal("Datos no cargados aún"); return; }
    const tipo = document.getElementById("premioTipo").value;
    const cant = Number(document.getElementById("cantidadPremio").value);
    if (isNaN(cant) || cant <= 0) { showModal("Ingrese una cantidad válida mayor a 0"); return; }
    if (!data.premios[tipo]) { showModal("Tipo de premio inválido"); return; }

    const disponibles = data.premios[tipo].inicial - data.premios[tipo].salieron;
    const registrar = Math.min(cant, disponibles);

    data.premios[tipo].salieron += registrar;

    if (!data.faltantePremioMayor) data.faltantePremioMayor = META - data.dinero.reduce((a,b)=>a+b,0);
    data.faltantePremioMayor += registrar * data.premios[tipo].valor;

    document.getElementById("cantidadPremio").value = "";
    guardar(true);
}

function render() {
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";

    let notas = "";
    let capsulas = 0;

    PREMIOS_ORDEN.forEach(p => {
        const pr = data.premios[p];
        const restantes = pr.inicial - pr.salieron;
        capsulas += restantes;
        if (pr.salieron > 0) notas += `Rellenar ${p} ${pr.salieron} veces<br>`;
        tbody.innerHTML += `<tr><td>${p}</td><td>${pr.valor}</td><td>${pr.inicial}</td><td>${pr.salieron}</td><td>${restantes}</td></tr>`;
    });

    const dinero = data.dinero.reduce((a,b)=>a+b,0);
    let faltante = data.faltantePremioMayor ?? Math.max(0, META - dinero);

    const totalInicialCapsulas = PREMIOS_ORDEN.reduce((acc, p) => acc + data.premios[p].inicial, 0);
    let aviso = "";
    if (capsulas < Math.floor(totalInicialCapsulas / 2)) aviso = "⚠ Rellenar cápsulas";
    if (capsulas > totalInicialCapsulas) aviso = "❌ ERROR cápsula extra";

    document.getElementById("estado").innerHTML = `
Dinero recaudado: $${dinero} <br>
Faltante premio mayor: $${faltante} <br>
Cápsulas en máquina: ${capsulas} <br>
<b>${aviso}</b>
`;

    const dineroServicio = (dinero*0.2).toFixed(2);
    const dineroMigda = (dinero*0.4).toFixed(2);
    const dineroDani = (dinero*0.4).toFixed(2);

    document.getElementById("ganancias").innerHTML = `
<hr>
<div>
<strong>Mini desglose de dinero:</strong><br>
Dinero para servicio: $${dineroServicio} <br>
Dinero Migda: $${dineroMigda} <br>
Dinero Dani: $${dineroDani} <br>
</div>
`;

    document.getElementById("notas").innerHTML = `<div style="background-color:#fff8a6;padding:5px;">${notas}</div>`;

    if (faltante <= 0 && !alertPremioMayorMostrado) {
        showModal("🎉 FELICIDADES: Ingresar el premio mayor!");
        alertPremioMayorMostrado = true;
    }
}

async function alertasResueltas() {
    for (let p in data.premios) {
        data.premios[p].salieron = 0;
    }
    guardar(true);
}

async function reiniciarSistema() {
    promptModal("Meta a recaudar", META, (nuevaMeta) => {
        if(!nuevaMeta) return;
        META = Number(nuevaMeta);

        confirmModal("Esto reiniciará TODO el ciclo ¿Continuar?", (ok) => {
            if(!ok) return;

            data.dinero = [];
            data.faltantePremioMayor = undefined;
            for(let p in data.premios) data.premios[p].salieron = 0;
            alertPremioMayorMostrado = false;
            guardar();
        });
    });
}

// -------------------- BOTONES --------------------
document.addEventListener("DOMContentLoaded", () => {
    cargar();
    document.getElementById("btnReiniciar").onclick = reiniciarSistema;
    document.getElementById("btnAlertasResueltas").onclick = alertasResueltas;
    document.getElementById("btnRegistrarDinero").onclick = registrarDinero;
    document.getElementById("btnSalioPremio").onclick = salioPremio;
});