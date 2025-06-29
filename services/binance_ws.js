// services/binance_ws.js
const WebSocket = require('ws');

// List of 24 major Binance USDT pairs (expand as needed)
const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'TRXUSDT',
  'DOTUSDT', 'MATICUSDT', 'SHIBUSDT', 'LTCUSDT', 'BCHUSDT',
  'UNIUSDT', 'ICPUSDT', 'FILUSDT', 'ATOMUSDT', 'ETCUSDT',
  'OPUSDT', 'NEARUSDT', 'ARBUSDT', 'XMRUSDT', 'AAVEUSDT'
];

// Caches
const priceCache = {};   // { symbol: { price, ... } }
const candleCache = {};  // { symbol: [{ open, close, ... }, ...] }

function startBinanceWS() {
  // --- Live tickers ---
  const priceWS = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
  priceWS.on('message', data => {
    const arr = JSON.parse(data);
    arr.forEach(tick => {
      if (SYMBOLS.includes(tick.s)) {
        priceCache[tick.s] = {
          symbol: tick.s,
          price: Number(tick.c),
          change: Number(tick.P),
          volume: Number(tick.v),
          quoteVolume: Number(tick.q),
          name: tick.s // You can map names elsewhere if needed
        };
      }
    });
  });

  // --- Live 1m candles ---
  const klineStreams = SYMBOLS.map(s => `${s.toLowerCase()}@kline_1m`).join('/');
  const candleWS = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${klineStreams}`);
  candleWS.on('message', data => {
    const parsed = JSON.parse(data);
    const k = parsed.data.k;
    if (k && k.x) {
      const arr = candleCache[k.s] || [];
      arr.push({
        open: k.o,
        high: k.h,
        low: k.l,
        close: k.c,
        time: k.t,
        volume: k.v
      });
      if (arr.length > 60) arr.shift();
      candleCache[k.s] = arr;
    }
  });
}

module.exports = { priceCache, candleCache, startBinanceWS, SYMBOLS };
