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

  await Promise.all(symbols.map(async id => {
    const cacheEntry = sparkCache[id];
    // Serve from cache if still fresh
    if (cacheEntry && now - cacheEntry.timestamp < TTL_MS) {
      result[id] = cacheEntry.data;
      return;
    }

    try {
      // Determine the Binance ticker (BTC, ETH, etc.)
      let symbol = id;
      if (id.length > 3) {
        // Fetch CoinCap asset to get its symbol
        const capRes = await axios.get(
          `https://rest.coincap.io/v3/assets/${id}`,
          { headers: { Authorization: `Bearer ${process.env.COINCAP_API_KEY}` } }
        );
        symbol = capRes.data.data.symbol.toLowerCase();
      }

      const symbolPair = `${symbol.toUpperCase()}USDT`;
      const resp = await axios.get(
        'https://api.binance.com/api/v3/klines',
        {
          params: { symbol: symbolPair, interval: '1h', limit: 24 }
        }
      );

      // Extract closing prices
      const closes = resp.data.map(k => parseFloat(k[4]));
      result[id] = closes;
      // Update cache
      sparkCache[id] = { data: closes, timestamp: now };

    } catch (err) {
      console.error(`Sparkline proxy error for ${id}:`, err.message);
      // Fallback: use stale cache or empty array
      result[id] = cacheEntry ? cacheEntry.data : [];
    }
  }));

  return res.json(result);
});

module.exports = router;
