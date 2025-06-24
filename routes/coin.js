const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const coinId = req.params.id;

  try {
    const { data } = await axios.get(
      `https://rest.coincap.io/v3/assets/${coinId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.COINCAP_API_KEY}`
        }
      }
    );

    const coin = data.data;

    res.json({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      current_price: parseFloat(coin.priceUsd || 0),
      market_cap: parseFloat(coin.marketCapUsd || 0),
      total_volume: parseFloat(coin.volumeUsd24Hr || 0),
      high_24h: null,
      low_24h: null
    });
  } catch (error) {
    console.error("CoinCap coin detail error:", error.message);
    res.status(500).json({ error: "Failed to fetch coin detail" });
  }
});

module.exports = router;