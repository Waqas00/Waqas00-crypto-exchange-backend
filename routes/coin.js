const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.coincap.io/v2/assets/${req.params.id}`);
    const coin = data.data;
    res.json({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      current_price: parseFloat(coin.priceUsd),
      market_cap: parseFloat(coin.marketCapUsd),
      total_volume: parseFloat(coin.volumeUsd24Hr),
      high_24h: null,
      low_24h: null
    });
  } catch (err) {
    console.error('CoinCap coin error:', err.message);
    res.status(500).json({ error: 'Failed to fetch coin info' });
  }
});

module.exports = router;