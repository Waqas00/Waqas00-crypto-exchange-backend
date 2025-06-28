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
    // Return cached data if fresh
    if (cacheEntry && now - cacheEntry.timestamp < TTL_MS) {
      result[id] = cacheEntry.data;
      return;
    }

    try {
      // Determine Binance ticker symbol
      let symbol = id;
      if (id.length > 3) {
        // Fetch CoinCap to get correct ticker (no auth needed)
        const capRes = await axios.get(`https://api.coincap.io/v2/assets/${id}`);
        symbol = capRes.data.data.symbol;
      }
      symbol = symbol.toUpperCase();
      // Prevent overly long symbols
      if (symbol.length > 10) {
        symbol = symbol.slice(0, 10);
      }

      const symbolPair = `${symbol}USDT`;
      console.log(`Fetching Binance klines for ${symbolPair}`);

      const binanceRes = await axios.get(
        'https://api.binance.com/api/v3/klines',
        { params: { symbol: symbolPair, interval: '1h', limit: 24 } }
      );

      const closes = binanceRes.data.map(k => parseFloat(k[4]));
      result[id] = closes;
      sparkCache[id] = { data: closes, timestamp: now };

    } catch (err) {
      console.error(`Error fetching sparkline for ${id}:`, err.response ? err.response.data : err.message);
      // Fallback to stale cache or empty array
      result[id] = cacheEntry ? cacheEntry.data : [];
    }
  }));

  res.json(result);
});

module.exports = router;
