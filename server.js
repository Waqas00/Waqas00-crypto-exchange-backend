require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your shared Binance WebSocket/cache logic
const { startBinanceWS, priceCache, candleCache, SYMBOLS } = require('./services/binance_ws');

// Import your routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const marketRoutes = require('./routes/market');
const binanceRoutes = require('./routes/binance');
const proxyRouter = require('./routes/proxy');

// Start Binance WebSocket/caching service (one connection per symbol only)
startBinanceWS();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS } });

// Middleware
app.use(cors({ origin: process.env.CORS }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// REST endpoints (user/admin/auth/history etc)
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/binance', binanceRoutes);
app.use('/api/sparkline', proxyRouter);

// SOCKET.IO: One connection per client, NO per-client Binance logic!
io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  // Subscribe to all tickers (Home page)
  socket.on('subscribeAllTickers', () => {
    const coins = SYMBOLS.map(symbol => priceCache[symbol] || { symbol });
    socket.emit('tickers', coins);
  });

  // Subscribe to a single ticker (for MarketCard/details)
  socket.on('subscribeTicker', ({ symbol }) => {
    if (priceCache[symbol]) {
      socket.emit('ticker', priceCache[symbol]);
    }
  });

  // Subscribe to 1m candles (for charts, sparklines, etc)
  socket.on('subscribeCandles', ({ symbol, interval = '1m' }) => {
    if (interval !== '1m') return; // Only 1m supported by default
    if (candleCache[symbol]) {
      socket.emit('candle', { symbol, candles: candleCache[symbol] });
    }
  });

  // You can add unsubscribe events as needed, but they're not strictly necessary for this pattern.
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
