const express = require('express');
const axios = require('axios');
const router = express.Router();

const apiKey = process.env.COINCAP_API_KEY;
const baseUrl = 'https://rest.coincap.io/v3';

router.get('/', async (req, res) => {
  try {
    const response = await axios.get(\`\${baseUrl}/assets?limit=20&apiKey=\${apiKey}\`);
    const coins = response.data.data;

    res.json({
      coins: coins.map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        price: parseFloat(c.priceUsd),
        changePercent24Hr: parseFloat(c.changePercent24Hr),
        marketCapUsd: parseFloat(c.marketCapUsd),
        volumeUsd24Hr: parseFloat(c.volumeUsd24Hr)
      }))
    });
  } catch (err) {
    console.error('CoinCap v3 /api/market error:', err.message);
    res.status(500).json({ error: 'Market data fetch failed', detail: err.message });
  }
});

module.exports = router;