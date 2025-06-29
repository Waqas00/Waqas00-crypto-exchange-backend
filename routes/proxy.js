// routes/proxy.js
const express = require('express');
const router = express.Router();
const { candleCache } = require('../services/binance_ws');

// GET /api/sparkline?ids=bitcoin,ethereum,...
router.get('/', async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: 'Missing ids param' });

  const nameToSymbol = {
    bitcoin: 'BTCUSDT',
    ethereum: 'ETHUSDT',
    bnb: 'BNBUSDT',
    solana: 'SOLUSDT',
    xrp: 'XRPUSDT',
    dogecoin: 'DOGEUSDT',
    cardano: 'ADAUSDT',
    avalanche: 'AVAXUSDT',
    chainlink: 'LINKUSDT',
    tron: 'TRXUSDT'
    // Extend this map as needed!
  };
  const idsArr = ids.split(',').map(id => id.trim().toLowerCase());

  const result = {};
  for (let id of idsArr) {
    const sym = nameToSymbol[id];
    result[id] = candleCache[sym] ? candleCache[sym].map(c => Number(c.close)) : [];
  }
  res.json(result);
});

module.exports = router;
