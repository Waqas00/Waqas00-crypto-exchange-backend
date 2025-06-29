const { startBinanceWS } = require('./services/binance_ws');
startBinanceWS(); // Start background WebSocket data stream
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Binance = require('binance-api-node').default;
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const marketRoutes = require('./routes/market');
const binanceRoutes = require('./routes/binance');
const proxyRouter = require('./routes/proxy');

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

// REST endpoints
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/binance', binanceRoutes);
app.use('/api/sparkline', proxyRouter);

// WebSocket for 1h candles
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.on('subscribeCandles', ({ symbol = 'BTCUSDT', interval = '1h' }) => {
    const clean = Binance().ws.candles(symbol, interval, candle => {
      if (candle.isFinal) {
        socket.emit('candle', {
          symbol,
          interval,
          openTime: candle.startTime,
          closeTime: candle.closeTime,
          open: parseFloat(candle.open),
          high: parseFloat(candle.high),
          low: parseFloat(candle.low),
          close: parseFloat(candle.close),
          volume: parseFloat(candle.volume)
        });
      }
    });
    socket.on('disconnect', clean);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));