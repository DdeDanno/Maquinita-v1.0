let data;
let META = 2800;
const PREMIOS_ORDEN = ["vale","dulcesticker","chico","medio","bueno","alto","mayor"];
let alertPremioMayorMostrado = false;

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

function registrarDinero() {
    if (!data) { alert("Datos no cargados aún"); return; }
    const val = Number(document.getElementById("dineroInput").value);
    if (isNaN(val) || val <= 0) { alert("Ingrese un valor válido mayor a 0"); return; }

    data.dinero.push(val);
    document.getElementById("dineroInput").value = "";

    // Actualizamos el faltante del premio mayor
    if (!data.faltantePremioMayor) {
        data.faltantePremioMayor = META - val; // si no existía, iniciamos
    } else {
        data.faltantePremioMayor -= val; // restamos el dinero recién ingresado
    }

    guardar();
}

function salioPremio() {
    if (!data) { alert("Datos no cargados aún"); return; }
    const tipo = document.getElementById("premioTipo").value;
    const cant = Number(document.getElementById("cantidadPremio").value);
    if (isNaN(cant) || cant <= 0) { alert("Ingrese una cantidad válida mayor a 0"); return; }
    if (!data.premios[tipo]) { alert("Tipo de premio inválido"); return; }

    const disponibles = data.premios[tipo].inicial - data.premios[tipo].salieron;
    const registrar = Math.min(cant, disponibles);

    // Aumenta la cantidad de premios salidos
    data.premios[tipo].salieron += registrar;

    // Sumar al faltante premio mayor el valor de los premios salidos
    // (faltante = META - dinero recaudado + costo premios salidos)
    if (!data.faltantePremioMayor) data.faltantePremioMayor = META - data.dinero.reduce((a,b)=>a+b,0);
    data.faltantePremioMayor += registrar * data.premios[tipo].valor;

    document.getElementById("cantidadPremio").value = "";
    guardar(true); // solo render
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

    // Faltante premio mayor: si no existe, se calcula, si existe, lo usamos
    let faltante = data.faltantePremioMayor ?? Math.max(0, META - dinero);

    // Capsulas y alertas
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
        alert("🎉 FELICIDADES: Ingresar el premio mayor!");
        alertPremioMayorMostrado = true;
    }
}

async function alertasResueltas() {
    for (let p in data.premios) {
        data.premios[p].salieron = 0;
    }
    guardar(true); // solo render, no afecta dinero ni faltante
}

async function reiniciarSistema() {
    const nuevaMeta = prompt("Meta a recaudar", META);
    if (nuevaMeta) META = Number(nuevaMeta);

    if (!confirm("Esto reiniciará TODO el ciclo ¿Continuar?")) return;

    data.dinero = [];
    data.faltantePremioMayor = undefined;
    for (let p in data.premios) {
        data.premios[p].salieron = 0;
    }
    alertPremioMayorMostrado = false;
    guardar();
}

cargar();