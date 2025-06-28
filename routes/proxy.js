// src/routes/proxy.js
// Ensure you’ve run in your backend folder:
// npm install node-cache
const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache batch responses for 60 seconds
const cache = new NodeCache({ stdTTL: 60 });
const router = express.Router();

// GET /api/sparkline?ids=bitcoin,ethereum,xrp
router.get('/', async (req, res) => {
  const { ids } = req.query;

  // Build Coingecko params: always ask for sparkline
  const params = { vs_currency: 'usd', sparkline: true };
  if (ids) {
    params.ids = ids;               // specific coins
  } else {
    // no ids? default to top 50 by market cap
    params.order = 'market_cap_desc';
    params.per_page = 50;
    params.page = 1;
  }

  // Cache key per-ids or 'top50'
  const key = `sparkline-${ids || 'top50'}`;
  const cached = cache.get(key);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      { params }
    );

    cache.set(key, response.data);
    return res.json(response.data);
  } catch (err) {
    if (err.response) {
      console.error('Coingecko error:', err.response.status, err.response.data);
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Proxy error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;