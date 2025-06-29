// routes/market.js
const express = require("express");
const router = express.Router();
const { priceCache, COINS } = require("../services/cryptocompare");

router.get("/", async (req, res) => {
  const coins = COINS.map(symbol => {
    const cached = priceCache[symbol];
    return cached ? {
      symbol: cached.symbol,
      name: cached.name,
      price: cached.price,
      changePercent24Hr: cached.change,
      marketCap: cached.marketCap,
      volume: cached.volume
    } : { symbol, price: null };
  });
  res.json({ coins });
});

module.exports = router;
