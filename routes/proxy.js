// src/routes/proxy.js
// Backend proxy for sparklines using Binance (no CORS issues)
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Simple in-memory per-symbol cache
// { [id]: { timestamp: Number, data: number[] } }
const sparkCache = {};
const TTL_MS = 5 * 60 * 1000; // 5 minutes

// GET /api/sparkline?ids=bitcoin,ethereum,xrp
// Returns: { bitcoin: [<24 hourly closes>], ethereum: [...], ... }
router.get('/', async (req, res) => {
  const { ids } = req.query;
  if (!ids) {
    return res.status(400).json({ error: 'Missing `ids` query parameter' });
  }

  const now = Date.now();
  const symbols = ids.split(',');
  const result = {};

  // Fetch each symbol from Binance
  await Promise.all(symbols.map(async id => {
    const symbolPair = `${id.toUpperCase()}USDT`;
    const cacheEntry = sparkCache[id];

    // Serve from cache if fresh
    if (cacheEntry && now - cacheEntry.timestamp < TTL_MS) {
      result[id] = cacheEntry.data;
      return;
    }

    try {
      const resp = await axios.get(
        'https://api.binance.com/api/v3/klines',
        {
          params: {
            symbol: symbolPair,
            interval: '1h',
            limit: 24
          }
        }
      );

      // Kline format: [ openTime, open, high, low, close, ... ]
      const closes = resp.data.map(k => parseFloat(k[4]));
      result[id] = closes;

      // Update cache
      sparkCache[id] = { data: closes, timestamp: now };
    } catch (err) {
      console.error(`Binance sparkline error for ${symbolPair}:`, err.message);
      // Fallback to stale cache if available, else empty
      result[id] = cacheEntry ? cacheEntry.data : [];
    }
  }));

  res.json(result);
});

module.exports = router;