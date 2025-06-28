// src/routes/proxy.js
// Simple in-memory caching to avoid too many Coingecko calls
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cache holder for default top50 request
let top50Cache = null;
let top50Timestamp = 0;
// Increase TTL to 5 minutes to reduce rate-limit hits
const TTL_MS = 5 * 60 * 1000; // 5 minutes

// GET /api/sparkline?ids=bitcoin,ethereum,xrp
router.get('/', async (req, res) => {
  const { ids } = req.query;
  const now = Date.now();

  // Build query params for Coingecko
  const params = { vs_currency: 'usd', sparkline: true };
  if (ids) {
    params.ids = ids;
  } else {
    params.order = 'market_cap_desc';
    params.per_page = 50;
    params.page = 1;
  }

  // Serve from cache if valid
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
    const status = err.response?.status;
    console.error('Coingecko error:', status, err.response?.data || err.message);
    // On rate limit (429) return stale cache if available
    if (status === 429 && !ids && top50Cache) {
      console.warn('Serving stale cache due to rate limit');
      return res.json(top50Cache);
    }
    if (err.response) {
      return res.status(status).json(err.response.data);
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
