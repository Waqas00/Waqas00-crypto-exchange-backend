// src/routes/proxy.js
// Backend proxy for sparklines using Binance Futures per-symbol klines (no CORS issues)
const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory per-symbol cache: { [id]: { timestamp: Number, data: number[] } }
const sparkCache = {};
const TTL_MS = 5 * 60 * 1000; // cache for 5 minutes

// GET /api/sparkline?ids=bitcoin,ethereum,xrp
// Returns: { bitcoin: [<24 hourly closes>], ethereum: [...], ... }
router.get('/', async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: 'Missing `ids` query parameter' });

  const now = Date.now();
  const symbols = ids.split(',');
  const result = {};

  await Promise.all(symbols.map(async id => {
    const cacheEntry = sparkCache[id];
    // Serve from cache
    if (cacheEntry && now - cacheEntry.timestamp < TTL_MS) {
      result[id] = cacheEntry.data;
      return;
    }

    try {
      // Determine ticker: if id looks like a CoinCap asset ID, resolve it
      let ticker = id;
      if (!/^[A-Za-z0-9]{2,5}$/.test(id)) {
        const capRes = await axios.get(`https://api.coincap.io/v2/assets/${id}`);
        ticker = capRes.data.data.symbol;
        console.log(`[Spark] Resolved ${id} to ticker ${ticker}`);
      }
      ticker = ticker.toUpperCase();
      const symbolPair = `${ticker}USDT`;
      console.log(`[Spark] Fetching Binance futures klines for ${symbolPair}`);

      // Use futures klines endpoint for perpetual contracts
      const resp = await axios.get('https://fapi.binance.com/fapi/v1/klines', {
        params: { symbol: symbolPair, interval: '1h', limit: 24 }
      });

      if (!Array.isArray(resp.data)) {
        throw new Error(`Unexpected response: ${JSON.stringify(resp.data)}`);
      }
      const closes = resp.data.map(k => parseFloat(k[4]));
      result[id] = closes;

      // Cache and timestamp
      sparkCache[id] = { data: closes, timestamp: now };
    } catch (err) {
      console.error(`[Spark] Error for ${id}:`, err.response?.data || err.message);
      // Fall back to stale cache or empty
      result[id] = cacheEntry ? cacheEntry.data : [];
    }
  }));

  res.json(result);
});

module.exports = router;
