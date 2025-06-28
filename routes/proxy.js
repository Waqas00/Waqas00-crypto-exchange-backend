// src/routes/proxy.js
// Simple in-memory caching to avoid too many Coingecko calls
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cache holder for default top50 request
let top50Cache = null;
let top50Timestamp = 0;
const TTL_MS = 60 * 1000; // 60 seconds

// GET /api/sparkline?ids=bitcoin,ethereum,xrp
router.get('/', async (req, res) => {
  const { ids } = req.query;
  const now = Date.now();

  // Build query params
  const params = { vs_currency: 'usd', sparkline: true };
  if (ids) {
    params.ids = ids;
  } else {
    params.order = 'market_cap_desc';
    params.per_page = 50;
    params.page = 1;
  }

  // If default top50 and cache valid, return it
  if (!ids && top50Cache && now - top50Timestamp < TTL_MS) {
    return res.json(top50Cache);
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      { params }
    );
    const data = response.data;

    // Update cache for default top50
    if (!ids) {
      top50Cache = data;
      top50Timestamp = Date.now();
    }

    return res.json(data);
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