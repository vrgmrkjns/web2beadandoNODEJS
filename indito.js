const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// MIME típusok meghatározásatesztteszt
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
};

async function adatbazisCsatlakozas() {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'web2beadando2'
    });
  
    console.log('Sikeresen csatlakoztál az adatbázishoz!');
    await connection.end();
  }

  adatbazisCsatlakozas().catch(err => console.error('Hiba: ', err));

// A szerver létrehozása
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);

    // MIME típus alapú válasz
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Fájl olvasása és kiszolgálása
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Ha a fájl nem található
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Oldal nem található</h1>', 'utf-8');
            } else {
                // Egyéb hiba
                res.writeHead(500);
                res.end(`Hiba: ${err.code}`);
            }
        } else {
            // Fájl sikeres olvasása
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});





// Szerver futtatása
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`fut http://localhost:${PORT}`);
});
