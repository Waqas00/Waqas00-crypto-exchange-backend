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
    res.json(coins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch symbols' });
  }
});

// 2) 24h ticker statistics
router.get('/stats/:symbol', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.binance.com/api/v3/ticker/24hr',
      { params: { symbol: req.params.symbol } }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 3) Order book (top 50)
router.get('/orderbook/:symbol', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.binance.com/api/v3/depth',
      { params: { symbol: req.params.symbol, limit: 50 } }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

module.exports = router;