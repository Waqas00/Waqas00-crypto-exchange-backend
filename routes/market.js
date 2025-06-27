// routes/market.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Fetch top assets from CoinCap
    const { data } = await axios.get(
      "https://rest.coincap.io/v3/assets",
      {
        headers: {
          Authorization: `Bearer ${process.env.COINCAP_API_KEY}`
        }
      }
    );

    // Map and sanitize coin data (no sparkline here)
    const coins = data.data.slice(0, 15).map(c => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      price: parseFloat(c.priceUsd || 0),
      changePercent24Hr: parseFloat(c.changePercent24Hr || 0),
      marketCapUsd: parseFloat(c.marketCapUsd || 0),
      volumeUsd24Hr: parseFloat(c.volumeUsd24Hr || 0)
    }));

    // Compute totals
    const total_market_cap = coins.reduce((sum, x) => sum + x.marketCapUsd, 0);
    const total_volume = coins.reduce((sum, x) => sum + x.volumeUsd24Hr, 0);
    const btc = coins.find(x => x.symbol === 'BTC');
    const btc_dominance = btc ? (btc.marketCapUsd / total_market_cap) * 100 : 0;

    // Respond
    res.json({
      coins,
      total_market_cap,
      total_volume,
      btc_dominance
    });
  } catch (err) {
    console.error("Error in /api/market:", err.message);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

module.exports = router;