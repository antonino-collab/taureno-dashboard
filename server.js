'use strict';
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/sheet', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL inválida' });
  }

  if (parsed.hostname !== 'docs.google.com') {
    return res.status(403).json({ error: 'Solo se permiten URLs de docs.google.com' });
  }

  try {
    const r = await fetch(url, { headers: { Accept: 'text/csv,text/plain,*/*' } });
    if (!r.ok) return res.status(r.status).json({ error: `Error al obtener la hoja: ${r.statusText}` });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'max-age=300');
    res.send(await r.text());
  } catch (e) {
    console.error('Fetch error:', e.message);
    res.status(500).json({ error: 'Error interno al obtener los datos' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Dashboard corriendo en puerto ${PORT}`);
});
