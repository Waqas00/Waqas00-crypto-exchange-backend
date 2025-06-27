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

// 11. Debugging Sparkline Fetch & Rate-Limit Handling
// Replace the parallel Promise.all with a sequential loop and delay to avoid rate limits, and add detailed logs.
router.get("/", async (req, res) => {
  try {
    const { data: capData } = await axios.get(
      "https://rest.coincap.io/v3/assets",
      { headers: { Authorization: `Bearer ${process.env.COINCAP_API_KEY}` } }
    );
    const coins = capData.data.slice(0, 15);

    const coinsWithSpark = [];
    for (const c of coins) {
      const key = c.symbol.toLowerCase();
      const geckoId = geckoMap[key] || c.id;
      console.log(`Fetching sparkline for ${c.id} (mapped to ${geckoId})`);

      let sparkline = [];
      try {
        // Use market_chart endpoint for reliable hourly data
        const chartRes = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart`,
          { params: { vs_currency: 'usd', days: 1, interval: 'hourly' } }
        );
        sparkline = chartRes.data.prices.map(p => p[1]);
        console.log(`→ received ${sparkline.length} points for ${geckoId}`);
      } catch (err) {
        console.warn(`Sparkline error for ${geckoId}:`, err.message);
      }

      coinsWithSpark.push({ ...c, sparkline });
      // small delay to respect rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    const total_market_cap = coinsWithSpark.reduce((sum, x) => sum + x.marketCapUsd, 0);
    const total_volume = coinsWithSpark.reduce((sum, x) => sum + x.volumeUsd24Hr, 0);
    const btc = coinsWithSpark.find(x => x.symbol === 'BTC');
    const btc_dominance = btc ? (btc.marketCapUsd / total_market_cap) * 100 : 0;

    res.json({ coins: coinsWithSpark, total_market_cap, total_volume, btc_dominance });
  } catch (err) {
    console.error('CoinCap market error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

module.exports = router;
