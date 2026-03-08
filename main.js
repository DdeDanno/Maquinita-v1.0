const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const express = require("express");

// ----------------------
// Configuración del servidor
// ----------------------
const serverApp = express();
serverApp.use(express.json());
serverApp.use(express.static(__dirname));

const FILE = path.join(__dirname, "data.json");

// Función para cargar o crear data
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
        };
        fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    }
    return JSON.parse(fs.readFileSync(FILE));
}

// Rutas
serverApp.get("/data", (req, res) => res.json(loadData()));

serverApp.post("/save", (req, res) => {
    fs.writeFileSync(FILE, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
});

// Arranca servidor en un puerto fijo
const SERVER_PORT = 3000;
serverApp.listen(SERVER_PORT, () => {
    console.log(`Servidor en http://localhost:${SERVER_PORT}`);
});

// ----------------------
// Configuración de Electron
// ----------------------
function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Abrimos la ventana apuntando al servidor Express
    win.loadURL(`http://localhost:${SERVER_PORT}`);
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});