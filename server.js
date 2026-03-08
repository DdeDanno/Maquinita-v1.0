const express = require("express")
const fs = require("fs")
const app = express()

app.use(express.json())
app.use(express.static("."))

const FILE = "data.json"

// Cargar o crear data
function loadData() {
    if (!fs.existsSync(FILE)) {
        const data = {
            dinero: [],
            premios: {
                vale: { valor: 0, inicial: 15, salieron: 0 },
                dulcesticker: { valor: 4, inicial: 30, salieron: 0 },
                chico: { valor: 10, inicial: 12, salieron: 0 },
                medio: { valor: 20, inicial: 6, salieron: 0 },
                bueno: { valor: 50, inicial: 4, salieron: 0 },
                alto: { valor: 160, inicial: 2, salieron: 0 },
                mayor: { valor: 250, inicial: 1, salieron: 0 }
            }
        }
        fs.writeFileSync(FILE, JSON.stringify(data,null,2))
    }
    return JSON.parse(fs.readFileSync(FILE))
}

// Rutas
app.get("/data", (req,res) => res.json(loadData()))

app.post("/save", (req,res) => {
    fs.writeFileSync(FILE, JSON.stringify(req.body,null,2))
    res.json({ ok: true })
})

app.listen(3000, () => console.log("Servidor en http://localhost:3000"))