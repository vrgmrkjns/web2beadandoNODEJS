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
        user: 'root',
        password: '',
        database: 'web2beadando2'
    });
    console.log('Sikeresen csatlakoztál az adatbázishoz!');
}

adatbazisCsatlakozas().catch(err => console.error('Hiba a csatlakozás során:', err));


//3 táblás Táblázat
app.get('/adatok', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
              gep.gyarto AS gepgyart,
              gep.tipus AS geptip,
              gep.kijelzo,
              gep.memoria,
              gep.merevlemez,
              gep.videovezerlo,
              processzor.gyarto AS procgyart,
              processzor.tipus AS proctip,
              oprendszer.nev,
              gep.ar,
              gep.db        
            FROM 
              gep
            JOIN 
              oprendszer ON gep.oprendszerid = oprendszer.id
            JOIN 
              processzor ON gep.processzorid = processzor.id
          `);

        let htmlTable = `
        <table class="table">
            <thead>
                <tr>
                    <th>
                        Gyártó
                    </th>
                    <th>
                        Típus
                    </th>
                    <th>
                        Kijelző
                    </th>
                    <th>
                        Memória
                    </th>
                    <th>
                        Merevlemez
                    </th>
                    <th>
                        Videókártya
                    </th>
                    <th>
                        Processzor
                    </th>
                    <th>
                        Rendszer
                    </th>
                    <th>
                        Ár
                    </th>
                    <th>
                        Darab
                    </th>
                </tr>
            </thead>
            <tbody>
      `;

        rows.forEach(row => {
            htmlTable += `
              <tr>
                <td>${row.gepgyart}</td>
                <td>${row.geptip}</td>
                <td>${row.kijelzo}"</td>
                <td>${row.memoria} MB</td>
                <td>${row.merevlemez} GB</td>
                <td>${row.videovezerlo}</td>
                <td>${row.procgyart} ${row.proctip}</td>
                <td>${row.nev}</td>
                <td>${row.ar}</td>
                <td>${row.db} db</td>
              </tr>
            `;
          });

        htmlTable += `
        </tbody>
        </table>
        `;

        res.send(htmlTable);
    } catch (err) {
        console.error('Hiba a lekérdezés során:', err);
        res.status(500).send('Hiba a lekérdezés során.');
    }
});


//Üzenetek tábla
app.get('/uzenetek', async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT uzenetID, nev, email, uzenet, DATE_FORMAT(ido, '%Y-%m-%d %H:%i') AS joido FROM uzenet ORDER BY joido DESC`);

        let htmlTable2 = `
        <table class="table">
            <thead>
                <tr>
                    <th>
                        #
                    </th>
                    <th>
                        Név
                    </th>
                    <th>
                        Email
                    </th>
                    <th>
                        Üzenet
                    </th>
                    <th>
                        Küldés ideje
                    </th>
                </tr>
            </thead>
            <tbody>
      `;

        rows.forEach(row => {
            htmlTable2 += `
              <tr>
                <td>${row.uzenetID}</td>
                <td>${row.nev}</td>
                <td>${row.email}</td>
                <td>${row.uzenet}</td>
                <td>${row.joido}</td>
              </tr>
            `;
          });

        htmlTable2 += `
        </tbody>
        </table>
        `;

        res.send(htmlTable2);
    } catch (err) {
        console.error('Hiba a lekérdezés során:', err);
        res.status(500).send('Hiba a lekérdezés során.');
    }
});


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
        res.status(201).json({ message: 'Üzenet sikeresen elküldve.' });
    } catch (err) {
        console.error('Hiba történt az üzenet mentésekor:', err);
        res.status(500).json({ message: 'Hiba történt az üzenet küldése során.' });
    }
});



//CRUD menü
//CREATE
app.post('/proci', async (req, res) => {
    const { gyarto, tipus } = req.body;
    try {
        const [result] = await db.execute('INSERT INTO processzor (gyarto, tipus) VALUES (?, ?)', [gyarto, tipus]);
        res.status(201).json({ id: result.insertId, gyarto, tipus });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a létrehozás során', details: err });
    }
});

//READ
app.get('/proci', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM processzor');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Hiba az adatok lekérése során', details: err });
    }
});

//UPDATE
app.put('/proci/:id', async (req, res) => {
    const { id } = req.params;
    const { gyarto, tipus } = req.body;
    try {
        const [result] = await db.execute('UPDATE processzor SET gyarto = ?, tipus = ? WHERE id = ?', [gyarto, tipus, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nem jó' });
        }
        res.json({ message: 'Adat frissítve', id });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a frissítés során', details: err });
    }
});

//DELETE
app.delete('/proci/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM processzor WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nem található' });
        }
        res.json({ message: 'Adat törölve', id });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a törlés során', details: err });
    }
});

// Statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, 'public')));

// 404-es oldal kezelése
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Szerver indítása
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
