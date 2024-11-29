const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const bodyParser = require('body-parser');

// MIME típusok meghatározása
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
};

// Express alkalmazás létrehozása
const app = express();

// Body parser beállítása
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL kapcsolat
let db;

async function adatbazisCsatlakozas() {
    db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',       // A felhasználóneved
        password: '',       // A jelszavad
        database: 'web2beadando2'
    });
    console.log('Sikeresen csatlakoztál az adatbázishoz!');
}

adatbazisCsatlakozas().catch(err => console.error('Hiba a csatlakozás során:', err));

// Kapcsolatfelvételi űrlap kezelése
app.post('/contact', async (req, res) => {
    let { nev, email, uzenet } = req.body;

    // Adatok ellenőrzése
    nev = nev || null;
    email = email || null;
    uzenet = uzenet || null;

    const query = `INSERT INTO uzenet (nev, email, uzenet) VALUES (?, ?, ?)`;

    try {
        await db.execute(query, [nev, email, uzenet]);
        res.status(201).json({ message: 'Üzenet sikeresen elmentve.' });
    } catch (err) {
        console.error('Hiba történt az üzenet mentésekor:', err);
        res.status(500).json({ message: 'Hiba történt az üzenet mentésekor.' });
    }
});


// Statikus fájlok kiszolgálása (index.html, contact.html stb.)
app.use(express.static(path.join(__dirname, 'public')));

// Szerver indítása
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
