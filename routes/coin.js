const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: id
      }
    });

    if (!data || !data[0]) return res.status(404).json({ error: 'Coin not found' });
    res.json(data[0]);
  } catch (err) {
    console.error('Coin fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch coin info' });
  }
});

module.exports = router;