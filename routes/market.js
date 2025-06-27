const express = require("express");
const axios = require("axios");
const router = express.Router();

// 0. Build a map of CoinCap symbols/ids to CoinGecko ids
let geckoMap = {};
(async function initGeckoMap() {
  try {
    const { data: list } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/list"
    );
    // list is [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' }, ...]
    list.forEach(c => {
      geckoMap[c.symbol.toLowerCase()] = c.id;
      geckoMap[c.id.toLowerCase()] = c.id;
    });
    console.log('CoinGecko map initialized');
  } catch (err) {
    console.error('Failed to initialize CoinGecko map:', err.message);
  }
})();

router.get("/", async (req, res) => {
  try {
    // 1. Fetch CoinCap assets...
    const { data: capData } = await axios.get(
      "https://rest.coincap.io/v3/assets",
      { headers: { Authorization: `Bearer ${process.env.COINCAP_API_KEY}` } }
    );
    const coins = capData.data.slice(0, 15);

    // 2. Enrich with sparkline
    const coinsWithSpark = await Promise.all(
      coins.map(async c => {
        // Resolve to CoinGecko id via symbol or id
        const key = c.symbol.toLowerCase();
        const geckoId = geckoMap[key] || c.id;
        let sparkline = [];
        try {
          const cgRes = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${geckoId}`,
            { params: { sparkline: true } }
          );
          sparkline =
            cgRes.data.sparkline?.price ||
            cgRes.data.market_data?.sparkline_7d?.price ||
            [];
        } catch (err) {
          console.warn(`Sparkline error for ${c.id} (mapped to ${geckoId}):`, err.message);
        }
        return { ...c, sparkline };
      })
    );

    // 3. Compute totals & dominance
    const total_market_cap = coinsWithSpark.reduce((sum, x) => sum + x.marketCapUsd, 0);
    const total_volume = coinsWithSpark.reduce((sum, x) => sum + x.volumeUsd24Hr, 0);
    const btc = coinsWithSpark.find(x => x.symbol === 'BTC');
    const btc_dominance = btc ? (btc.marketCapUsd / total_market_cap) * 100 : 0;

    // 4. Return response
    res.json({ coins: coinsWithSpark, total_market_cap, total_volume, btc_dominance });
  } catch (err) {
    console.error('CoinCap market error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

module.exports = router;