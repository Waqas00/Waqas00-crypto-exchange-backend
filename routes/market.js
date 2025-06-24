const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [coins, global] = await Promise.all([
      axios.get('https://api.coincap.io/v2/assets?limit=20'),
      axios.get('https://api.coincap.io/v2/global')
    ]);

    const result = {
      total_market_cap: parseFloat(global.data.data.totalMarketCapUsd),
      total_volume: parseFloat(global.data.data.total24HrVolumeUsd),
      btc_dominance: parseFloat(coins.data.data.find(c => c.id === 'bitcoin')?.marketCapUsd || 0) /
                      parseFloat(global.data.data.totalMarketCapUsd) * 100,
      coins: coins.data.data.map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        price: parseFloat(c.priceUsd),
        changePercent24Hr: parseFloat(c.changePercent24Hr),
        marketCapUsd: parseFloat(c.marketCapUsd),
        volumeUsd24Hr: parseFloat(c.volumeUsd24Hr)
      }))
    };

    res.json(result);
  } catch (err) {
    console.error('CoinCap market API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

module.exports = router;