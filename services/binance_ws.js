// services/binance_ws.js
const WebSocket = require('ws');

// Symbol map (CoinCap uses ids like 'bitcoin', Binance uses 'BTCUSDT')
const DEFAULT_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'TRXUSDT'
];

let priceCache = {};      // { BTCUSDT: { price, ... }, ... }
let candleCache = {};     // { BTCUSDT: [ { open, close, ... }, ... ] }

function startBinanceWS(symbols = DEFAULT_SYMBOLS) {
  // --- Ticker Prices (for /market.js) ---
  const priceWS = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
  priceWS.on('message', (data) => {
    try {
      const arr = JSON.parse(data);
      arr.forEach(tick => {
        if (symbols.includes(tick.s)) {
          priceCache[tick.s] = {
            symbol: tick.s,
            price: Number(tick.c),
            change: Number(tick.P),
            volume: Number(tick.v),
            quoteVolume: Number(tick.q)
          };
        }
      });
    } catch (err) {}
  });

  // --- Candles (for /proxy.js) ---
  // Aggregate into a single WS endpoint for all required symbols
  const klineSymbols = symbols.map(sym => `${sym.toLowerCase()}@kline_1m`).join('/');
  const candleWS = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${klineSymbols}`);

  candleWS.on('message', (data) => {
    try {
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
        // Only keep last 60 (1 hour) candles
        if (arr.length > 60) arr.shift();
        candleCache[k.s] = arr;
      }
    } catch (err) {}
  });
}

// Utility: Expose caches and WS starter
module.exports = {
  priceCache,
  candleCache,
  startBinanceWS,
  DEFAULT_SYMBOLS
};
