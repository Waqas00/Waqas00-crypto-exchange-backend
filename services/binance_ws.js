const WebSocket = require('ws');

// 1. Hardcoded Binance USDT pairs (expand as needed)
const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'TRXUSDT'
];

// 2. Price and candle caches
const priceCache = {};   // { symbol: { price, ... } }
const candleCache = {};  // { symbol: [{ open, close, ... }, ...] }

function startBinanceWS() {
  // Stream all ticker prices (use !ticker@arr for all market tickers, but filter to SYMBOLS)
  const priceWS = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
  priceWS.on('message', (data) => {
    const arr = JSON.parse(data);
    arr.forEach(tick => {
      if (SYMBOLS.includes(tick.s)) {
        priceCache[tick.s] = {
          symbol: tick.s,
          price: Number(tick.c),
          change: Number(tick.P),
          volume: Number(tick.v),
          quoteVolume: Number(tick.q)
        };
      }
    });
  });

  // Stream 1m candles for each symbol
  const klineStreams = SYMBOLS.map(s => `${s.toLowerCase()}@kline_1m`).join('/');
  const candleWS = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${klineStreams}`);
  candleWS.on('message', (data) => {
    const parsed = JSON.parse(data);
    const k = parsed.data.k;
    if (k && k.x) { // Only store closed candles
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

module.exports = {
  priceCache,
  candleCache,
  startBinanceWS,
  SYMBOLS
};
