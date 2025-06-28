const express = require('express');
const axios = require('axios');
const router = express.Router();

const sparkCache = {};
const TTL_MS = 5 * 60 * 1000; // 5 minutes

router.get('/', async (req, res) => {
  const { ids } = req.query;
  if (!ids) {
    return res.status(400).json({ error: 'Missing `ids` parameter' });
  }

  const now = Date.now();
  const keys = ids.split(',');
  const result = {};

  await Promise.all(keys.map(async key => {
    const cache = sparkCache[key];
    if (cache && now - cache.timestamp < TTL_MS) {
      result[key] = cache.data;
      return;
    }

    try {
      let ticker = key;
      if (!/^[A-Za-z0-9]{2,5}$/.test(key)) {
        const cap = await axios.get(`https://api.coincap.io/v2/assets/${key}`);
        ticker = cap.data.data.symbol;
      }
      ticker = ticker.toUpperCase();
      const symbol = `${ticker}USDT`;

      const { data } = await axios.get('https://api.binance.com/api/v3/klines', {
        params: { symbol, interval: '1h', limit: 24 }
      });

      const closes = data.map(c => parseFloat(c[4]));
      result[key] = closes;
      sparkCache[key] = { data: closes, timestamp: now };

    } catch (err) {
      console.error(`Spark proxy error (${key}):`, err.response?.data || err.message);
      result[key] = (sparkCache[key]?.data) || [];
    }
  }));

  res.json(result);
});

module.exports = router;