// src/routes/binance.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Initialize Binance WebSocket client and in-memory ticker cache
const client = Binance();
const tickerCache = {};

// Subscribe to all USDT ticker updates via WebSocket
client.ws.tickerAll(tickers => {
  tickers.forEach(t => {
    if (t.symbol.endsWith('USDT')) {
      tickerCache[t.symbol] = {
        lastPrice: parseFloat(t.lastPrice),
        priceChangePercent: parseFloat(t.priceChangePercent),
      };
    }
  });
});

// 1) List USDT base assets
router.get('/symbols', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    const coins = data.symbols
      .filter(s => s.quoteAsset === 'USDT')
      .map(s => ({ id: s.baseAsset.toLowerCase(), symbol: s.baseAsset }));
    return res.json(coins);
  } catch (err) {
    console.error('Binance symbols error:', err.response?.data || err.message);
    // Fallback: return empty list so frontend can still render
    return res.json([]);
  }
});

// 2) 24h ticker statistics via WebSocket cache (fast)
router.get('/stats/:symbol', (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const cached = tickerCache[sym];
  if (cached) {
    return res.json({
      symbol: sym,
      lastPrice: cached.lastPrice,
      priceChangePercent: cached.priceChangePercent,
    });
  }
  // REST fallback if cache miss or just-started
  axios.get('https://api.binance.com/api/v3/ticker/24hr', { params: { symbol: sym } })
    .then(({ data }) => {
      res.json({
        symbol: data.symbol,
        lastPrice: parseFloat(data.lastPrice),
        priceChangePercent: parseFloat(data.priceChangePercent),
      });
    })
    .catch(err => {
      console.error(`Binance stats REST fallback error for ${sym}:`, err.response?.data || err.message);
      res.json({ symbol: sym, lastPrice: 0, priceChangePercent: 0 });
    });
});

// 3) Order book (top 50) remains REST
router.get('/orderbook/:symbol', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.binance.com/api/v3/depth', {
      params: { symbol: req.params.symbol.toUpperCase(), limit: 50 }
    });
    res.json(data);
  } catch (err) {
    console.error(`Binance depth error for ${req.params.symbol}:`, err.response?.data || err.message);
    res.json({ bids: [], asks: [] });
  }
});

module.exports = router;
