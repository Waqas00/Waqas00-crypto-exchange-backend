// src/routes/proxy.js
const express    = require('express');
const axios      = require('axios');
const NodeCache  = require('node-cache');

// cache each batch request for 1 minute
const cache = new NodeCache({ stdTTL: 60 });

const router = express.Router();

// GET /api/sparkline?ids=bitcoin,ethereum,xrp
router.get('/', async (req, res) => {
  const ids = req.query.ids;
  if (!ids) {
    return res.status(400).json({ error: 'Missing query parameter: ids' });
  }

  const key = `sparkline-batch-${ids}`;
  const cached = cache.get(key);
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          ids: ids,         // comma-separated list of coin IDs
          sparkline: true
        }
      }
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