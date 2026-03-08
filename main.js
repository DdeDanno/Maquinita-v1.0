const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'script.js') // si usas preload
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Express server para tus datos
const server = express();
server.use(express.json());

const fs = require('fs');
let dataPath = path.join(__dirname, 'data.json');

server.get('/data', (req, res) => {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({ dinero: [], premios: {}, meta: 2800 }));
    const data = JSON.parse(fs.readFileSync(dataPath));
    res.json(data);
});

server.post('/save', (req, res) => {
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

server.listen(3000, () => console.log('Servidor escuchando en http://localhost:3000'));