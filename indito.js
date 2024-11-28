const http = require('http');
const fs = require('fs');
const path = require('path');

// MIME típusok meghatározásatesztteszt
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
};

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
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                // Egyéb hiba
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
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
    console.log(`Server is running at http://localhost:${PORT}`);
});
