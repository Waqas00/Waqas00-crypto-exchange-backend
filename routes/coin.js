const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&sparkline=false`;
    const { data } = await axios.get(url);

    const coin = {
      id: data.id,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      current_price: data.market_data.current_price.usd,
      market_cap: data.market_data.market_cap.usd,
      total_volume: data.market_data.total_volume.usd,
      high_24h: data.market_data.high_24h.usd,
      low_24h: data.market_data.low_24h.usd,
    };

    res.json(coin);
  } catch (err) {
    console.error('Coin fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch coin info' });
  }
});

module.exports = router;
