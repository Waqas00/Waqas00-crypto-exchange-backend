const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const marketData = await axios.get('https://api.coingecko.com/api/v3/global');
    const coinData = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: true
      }
    });

    res.json({
      total_market_cap: marketData.data.data.total_market_cap.usd,
      total_volume: marketData.data.data.total_volume.usd,
      btc_dominance: marketData.data.data.market_cap_percentage.btc,
      coins: coinData.data
    });
  } catch (error) {
    console.error('Market API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

module.exports = router;