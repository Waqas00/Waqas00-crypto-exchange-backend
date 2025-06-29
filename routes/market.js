// routes/market.js
const express = require("express");
const router = express.Router();
const { priceCache, SYMBOLS } = require("../services/binance_ws");

// Return latest ticker data for all tracked symbols
router.get("/", async (req, res) => {
  const coins = SYMBOLS.map(symbol => {
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
