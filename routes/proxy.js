// routes/proxy.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/sparkline/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
      { params: { vs_currency: 'usd', days: 1 } }
    );
    return res.json(response.data);
  } catch (err) {
    if (err.response) {
      // the request was made and the server responded with a status code
      console.error('Coingecko error:', err.response.status, err.response.data);
      return res
        .status(err.response.status)
        .json(err.response.data);
    } else {
      // something else went wrong (network, DNS, etc.)
      console.error('Proxy error:', err.message);
      return res
        .status(500)
        .json({ error: err.message });
    }
  }
});

module.exports = router; = router;