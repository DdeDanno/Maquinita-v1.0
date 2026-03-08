const { app, BrowserWindow } = require("electron");
const path = require("path");
const express = require("express");

// --- Servidor Node embebido ---
const server = express();
const fs = require("fs");
const DATA_FILE = path.join(__dirname, "data.json");

server.use(express.json());
server.use(express.static(__dirname)); // permite cargar index.html, scripts, etc.

server.get("/data", (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        res.json(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
    } else {
        // estructura por defecto si no existe data.json
        res.json({
            meta: 2800,
            dinero: [],
            premios: {
                vale: { inicial: 10, salieron: 0, valor: 50 },
                dulcesticker: { inicial: 10, salieron: 0, valor: 20 },
                chico: { inicial: 10, salieron: 0, valor: 30 },
                medio: { inicial: 10, salieron: 0, valor: 50 },
                bueno: { inicial: 10, salieron: 0, valor: 100 },
                alto: { inicial: 10, salieron: 0, valor: 200 },
                mayor: { inicial: 1, salieron: 0, valor: 500 }
            }
        });
    }
});

server.post("/save", (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// --- Ventana principal de Electron ---
function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // opcional
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile("index.html");
    // win.webContents.openDevTools(); // descomenta para depuración
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});