const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get("https://rest.coincap.io/v3/assets", {
      headers: {
        Authorization: `Bearer ${process.env.COINCAP_API_KEY}`
      }
    });

    const coins = data.data.slice(0, 10);

    const result = {
      coins: coins.map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        price: parseFloat(c.priceUsd || 0),
        changePercent24Hr: parseFloat(c.changePercent24Hr || 0),
        marketCapUsd: parseFloat(c.marketCapUsd || 0),
        volumeUsd24Hr: parseFloat(c.volumeUsd24Hr || 0)
      })),
      total_market_cap: coins.reduce((sum, c) => sum + parseFloat(c.marketCapUsd || 0), 0),
      total_volume: coins.reduce((sum, c) => sum + parseFloat(c.volumeUsd24Hr || 0), 0),
      btc_dominance: 48.5
    };

    res.json(result);
  } catch (error) {
    console.error("CoinCap market fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

module.exports = router;