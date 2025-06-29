// routes/proxy.js
const express = require('express');
const router = express.Router();
const { candleCache } = require('../services/cryptocompare');

// GET /api/sparkline?ids=btc,eth,...
router.get('/', async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: 'Missing ids param' });

  const idsArr = ids.split(',').map(id => id.trim().toUpperCase());
  const result = {};
  for (let symbol of idsArr) {
    result[symbol] = candleCache[symbol] || [];
  }
  res.json(result);
});

module.exports = router;
