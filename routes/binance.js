const express = require('express');
const axios = require('axios');
const router = express.Router();

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
    // Fallback: fetch top assets from CoinCap
    try {
      const cc = await axios.get('https://api.coincap.io/v2/assets');
      const fallback = cc.data.data
        .slice(0, 100)
        .map(a => ({ id: a.id, symbol: a.symbol }));
      return res.json(fallback);
    } catch (e) {
      console.error('CoinCap fallback error:', e.response?.data || e.message);
      return res.json([]);
    }
  }
});

// 2) 24h ticker statistics
router.get('/stats/:symbol', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.binance.com/api/v3/ticker/24hr',
      { params: { symbol: req.params.symbol } }
    );
    return res.json({
      symbol: data.symbol,
      lastPrice: parseFloat(data.lastPrice),
      priceChangePercent: parseFloat(data.priceChangePercent)
    });
  } catch (err) {
    console.error(`Binance stats error for ${req.params.symbol}:`, err.response?.data || err.message);
    // Fallback: return zeroed stats
    return res.json({ symbol: req.params.symbol, lastPrice: 0, priceChangePercent: 0 });
  }
});

// 3) Order book (top 50)
router.get('/orderbook/:symbol', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.binance.com/api/v3/depth',
      { params: { symbol: req.params.symbol, limit: 50 } }
    );
    return res.json(data);
  } catch (err) {
    console.error(`Binance depth error for ${req.params.symbol}:`, err.response?.data || err.message);
    // Fallback: empty book
    return res.json({ bids: [], asks: [] });
  }
});

module.exports = router;