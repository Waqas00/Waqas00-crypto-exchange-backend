// routes/proxy.js (Express)
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/sparkline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      { params: { vs_currency: 'usd', days: 1, interval: 'hourly' } }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch sparkline' });
  }
});

module.exports = router;