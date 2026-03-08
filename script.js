let data
let META = 2800

// Orden de los premios para mostrar en la tabla
const PREMIOS_ORDEN = ["vale","dulcesticker","chico","medio","bueno","alto","mayor"]
let premioMayorAlertShown = false // para mostrar alerta una sola vez

async function cargar(){
    const res = await fetch("/data")
    data = await res.json()
    if(data.meta) META = data.meta
    render()
}

async function guardar(){
    data.meta = META
    await fetch("/save",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data)
    })
    render()
}

function registrarDinero(){
    if(!data){ alert("Datos no cargados aún"); return }
    const val = Number(document.getElementById("dineroInput").value)
    if(isNaN(val) || val <= 0){ alert("Ingrese un valor válido mayor a 0"); return }
    data.dinero.push(val)
    document.getElementById("dineroInput").value = ""
    guardar()
}

function salioPremio(){
    if(!data){ alert("Datos no cargados aún"); return }
    const tipo = document.getElementById("premioTipo").value
    const cant = Number(document.getElementById("cantidadPremio").value)
    if(isNaN(cant) || cant <= 0){ alert("Ingrese una cantidad válida mayor a 0"); return }
    if(!data.premios[tipo]){ alert("Tipo de premio inválido"); return }

    const disponibles = data.premios[tipo].inicial - data.premios[tipo].salieron
    const registrar = Math.min(cant, disponibles)
    data.premios[tipo].salieron += registrar
    document.getElementById("cantidadPremio").value = ""
    guardar()
}

function render(){
    if(!data) return

    let dinero = data.dinero.reduce((a,b)=>a+b,0)
    let costoPremios = 0
    let capsulas = 0
    let notas = ""
    let ganancias = ""

    const tbody = document.querySelector("#tabla tbody")
    tbody.innerHTML = ""

    PREMIOS_ORDEN.forEach(p => {
        const pr = data.premios[p]
        const restantes = pr.inicial - pr.salieron
        capsulas += restantes
        costoPremios += pr.salieron * pr.valor
        if(pr.salieron > 0){
            notas += `Rellenar ${p} ${pr.salieron} veces<br>`
        }
        tbody.innerHTML += `
<tr>
<td>${p}</td>
<td>${pr.valor}</td>
<td>${pr.inicial}</td>
<td>${pr.salieron}</td>
<td>${restantes}</td>
</tr>`
    })

    const efectivo = dinero - costoPremios
    const faltante = META - efectivo

    // Alertas de cápsulas
    const totalInicialCapsulas = PREMIOS_ORDEN.reduce((acc,p)=>acc+data.premios[p].inicial,0)
    let aviso = ""
    if(capsulas < Math.floor(totalInicialCapsulas/2)) aviso="⚠ Rellenar cápsulas"
    if(capsulas > totalInicialCapsulas) aviso="❌ ERROR cápsula extra"

    document.getElementById("estado").innerHTML = `
Dinero recaudado: $${dinero} <br>
Faltante premio mayor: $${faltante} <br>
Cápsulas en máquina: ${capsulas} <br>
<b>${aviso}</b>
`

    // Mostrar alerta de premio mayor solo una vez
    if(faltante <= 0 && !premioMayorAlertShown){
        premioMayorAlertShown = true
        alert("🎉 FELICIDADES: Ingresar el premio mayor")
    }

    // Mini desglose de dinero
    const dineroServicio = (dinero*0.2).toFixed(2)
    const dineroMigda = (dinero*0.4).toFixed(2)
    const dineroDani = (dinero*0.4).toFixed(2)

    document.getElementById("alertas").innerHTML = notas
    document.getElementById("ganancias").innerHTML = `
<hr>
<div>
<strong>Mini desglose de dinero:</strong><br>
Dinero para servicio: $${dineroServicio} <br>
Dinero Migda: $${dineroMigda} <br>
Dinero Dani: $${dineroDani} <br>
</div>
`
}

cargar()

async function alertasResueltas(){
    for(let p in data.premios){
        data.premios[p].salieron = 0
    }
    await guardar()
}

async function reiniciarSistema(){
    const nuevaMeta = prompt("Meta a recaudar", META)
    if(nuevaMeta) META = Number(nuevaMeta)
    if(!confirm("Esto reiniciará TODO el ciclo ¿Continuar?")) return
    data.dinero = []
    for(let p in data.premios){
        data.premios[p].salieron = 0
    }
    await guardar()
}