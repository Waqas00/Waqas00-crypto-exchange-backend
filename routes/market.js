const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log("Fetching CoinCap data...");
    const [coinRes, globalRes] = await Promise.all([
      axios.get('https://api.coincap.io/v2/assets?limit=20'),
      axios.get('https://api.coincap.io/v2/global')
    ]);

    const coins = coinRes.data.data;
    const global = globalRes.data.data;

    console.log("Received CoinCap data:", {
      globalMarketCap: global.totalMarketCapUsd,
      topCoin: coins[0]?.id
    });

    const btc = coins.find(c => c.id === 'bitcoin');
    const btcDominance = btc ? (parseFloat(btc.marketCapUsd) / parseFloat(global.totalMarketCapUsd)) * 100 : 0;

    res.json({
      total_market_cap: parseFloat(global.totalMarketCapUsd),
      total_volume: parseFloat(global.total24HrVolumeUsd),
      btc_dominance: btcDominance,
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
    console.error('CoinCap /api/market error:', err.message);
    res.status(500).json({ error: 'CoinCap market data fetch failed', detail: err.message });
  }
});

module.exports = router;