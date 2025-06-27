const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // 1. Fetch top 10 assets from CoinCap
    const { data: capData } = await axios.get(
      "https://rest.coincap.io/v3/assets",
      { headers: { Authorization: `Bearer ${process.env.COINCAP_API_KEY}` } }
    );
    const coins = capData.data.slice(0, 20);

    // 2. Enrich each coin with sparkline (last 24h hourly) from CoinGecko
    const coinsWithSpark = await Promise.all(
      coins.map(async c => {
        let sparkline = [];
        try {
          const cgRes = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${c.id}/market_chart`,
            { params: { vs_currency: "usd", days: 1, interval: "hourly" } }
          );
          sparkline = cgRes.data.prices.map(point => point[1]);
        } catch (err) {
          console.warn(`Sparkline error for ${c.id}:`, err.message);
        }
        return {
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          price: parseFloat(c.priceUsd || 0),
          changePercent24Hr: parseFloat(c.changePercent24Hr || 0),
          marketCapUsd: parseFloat(c.marketCapUsd || 0),
          volumeUsd24Hr: parseFloat(c.volumeUsd24Hr || 0),
          sparkline // now contains real data or []
        };
      })
    );

    // 3. Compute totals and dominance
    const total_market_cap = coinsWithSpark.reduce((sum, c) => sum + c.marketCapUsd, 0);
    const total_volume = coinsWithSpark.reduce((sum, c) => sum + c.volumeUsd24Hr, 0);
    const btc = coinsWithSpark.find(c => c.symbol === "BTC");
    const btc_dominance = btc ? (btc.marketCapUsd / total_market_cap) * 100 : 0;

    // 4. Return the enriched payload
    res.json({
      coins: coinsWithSpark,
      total_market_cap,
      total_volume,
      btc_dominance
    });
  } catch (error) {
    console.error("CoinCap market fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

module.exports = router;