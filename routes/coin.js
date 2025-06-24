const express = require('express');
const axios = require('axios');
const router = express.Router();

const apiKey = process.env.COINCAP_API_KEY;
const baseUrl = 'https://rest.coincap.io/v3';

router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(\`\${baseUrl}/assets/\${req.params.id}?apiKey=\${apiKey}\`);
    const coin = response.data.data;

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
    console.error('CoinCap v3 /api/coin/:id error:', err.message);
    res.status(500).json({ error: 'Coin data fetch failed', detail: err.message });
  }
});

module.exports = router;