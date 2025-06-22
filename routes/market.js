const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 6,
        page: 1,
        sparkline: true
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

module.exports = router;
