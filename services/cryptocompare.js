// services/cryptocompare.js
const axios = require('axios');

const COINS = [
  'BTC','ETH','BNB','SOL','XRP','DOGE','ADA','AVAX','LINK','TRX',
  'DOT','MATIC','SHIB','LTC','BCH','UNI','ICP','FIL','ATOM','ETC'
];

let priceCache = {};   // { symbol: { ... } }
let candleCache = {};  // { symbol: [ <close>, ... ] }

async function updatePrices() {
  try {
    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${COINS.join(',')}&tsyms=USD`;
    const { data } = await axios.get(url);
    for (let symbol of COINS) {
      const coin = data.RAW?.[symbol]?.USD;
      if (coin) {
        priceCache[symbol] = {
          symbol,
          name: symbol,
          price: coin.PRICE,
          change: coin.CHANGEPCT24HOUR,
          marketCap: coin.MKTCAP,
          volume: coin.TOTALVOLUME24H
        };
      }
    }
  } catch (err) { console.error('Price update error', err.message); }
}

async function updateCandles() {
  for (let symbol of COINS) {
    try {
      const url = `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${symbol}&tsym=USD&limit=60`;
      const { data } = await axios.get(url);
      candleCache[symbol] = data.Data.Data.map(c => c.close);
    } catch (err) { /* Candle error not fatal */ }
  }
}

setInterval(updatePrices, 10000);  // 10s for prices
setInterval(updateCandles, 60000); // 1min for candles
updatePrices();
updateCandles();

module.exports = { priceCache, candleCache, COINS };
