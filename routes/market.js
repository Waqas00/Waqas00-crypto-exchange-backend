// routes/market.js
const express = require("express");
const router = express.Router();
const { priceCache, DEFAULT_SYMBOLS } = require("../services/binance_ws");

// Return latest ticker data for default symbols
router.get("/", async (req, res) => {
  const coins = DEFAULT_SYMBOLS.map(symbol => {
    const cached = priceCache[symbol];
    return cached ? {
      symbol: cached.symbol,
      price: cached.price,
      changePercent24Hr: cached.change,
      volume: cached.volume,
      quoteVolume: cached.quoteVolume
    } : { symbol, price: null };
  });
  res.json({ coins });
});

module.exports = router;
