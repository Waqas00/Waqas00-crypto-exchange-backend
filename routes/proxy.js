// src/routes/proxy.js
// Backend proxy for 24h hourly closes using Binance Futures Continuous Contracts (no CORS issues)
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
    if (cacheEntry && now - cacheEntry.timestamp < TTL_MS) {
      result[id] = cacheEntry.data;
      return;
    }

    try {
      // Resolve CoinCap ID -> ticker symbol if needed
      let ticker = id;
      if (id.length > 3) {
        const capRes = await axios.get(`https://api.coincap.io/v2/assets/${id}`);
        ticker = capRes.data.data.symbol;
      }
      ticker = ticker.toUpperCase();

      // Continuous Futures endpoint parameters
      const pair = `${ticker}USDT`;
      const contractType = 'PERPETUAL';
      const interval = '1h';
      const limit = 24;

      console.log(`Fetching Binance futures continuous klines for ${pair}`);

      // Call Binance USD-M Futures Continuous Klines
      const binanceRes = await axios.get(
        'https://fapi.binance.com/fapi/v1/continuousKlines',
        { params: { pair, contractType, interval, limit } }
      );

      // Extract closing prices from each kline entry [ openTime, open, high, low, close, ... ]
      const closes = binanceRes.data.map(k => parseFloat(k[4]));
      result[id] = closes;

      // Update cache
      sparkCache[id] = { data: closes, timestamp: now };
    } catch (err) {
      console.error(`Error fetching futures sparkline for ${id}:`,
        err.response ? err.response.data : err.message
      );
      result[id] = cacheEntry ? cacheEntry.data : [];
    }
  }));

  res.json(result);
});

module.exports = router;
