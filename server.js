require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your CryptoCompare polling/cache logic
const { priceCache, candleCache, COINS } = require('./services/cryptocompare');

// Import your other routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const marketRoutes = require('./routes/market');
const binanceRoutes = require('./routes/binance'); // Optional, can be removed
const proxyRouter = require('./routes/proxy');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: process.env.CORS }));
app.use(express.json());

// MongoDB connection (unchanged)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// REST endpoints (user/admin/auth/market etc)
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/binance', binanceRoutes); // Optional
app.use('/api/sparkline', proxyRouter);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
