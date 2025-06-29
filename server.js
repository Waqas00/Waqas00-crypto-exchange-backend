require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your CryptoCompare polling/cache logic (for coins)
const { priceCache, candleCache, COINS } = require('./services/cryptocompare');

// Auth and other routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const marketRoutes = require('./routes/market');
const proxyRouter = require('./routes/proxy');
// (Optional) If you're not using binance anymore, you can remove this:
const binanceRoutes = require('./routes/binance');

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = process.env.CORS ? process.env.CORS.split(',') : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));
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
// You can remove the next line if binance is fully replaced:
app.use('/api/binance', binanceRoutes);
app.use('/api/sparkline', proxyRouter);

app.get("/", (_, res) => res.send("Crypto Exchange API running"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
