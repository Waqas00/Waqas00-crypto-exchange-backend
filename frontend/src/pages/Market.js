import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QuickTradePanel from '../components/QuickTradePanel';

export default function Market() {
  const [coin, setCoin] = useState(null);

  useEffect(() => {
    axios.get('https://crypto-exchange-backend-yd8j.onrender.com/api/coin/bitcoin')
      .then(res => setCoin(res.data))
      .catch(err => console.error('Market fetch error:', err));
  }, []);

  if (!coin) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ paddingBottom: 80 }}>
      <h2 style={{ padding: '16px 16px 0' }}>{coin.name} ({coin.symbol.toUpperCase()})</h2>
      <div style={{ padding: '0 16px' }}>
        <p><strong>Price:</strong> ${coin.current_price}</p>
        <p><strong>24h High:</strong> ${coin.high_24h}</p>
        <p><strong>24h Low:</strong> ${coin.low_24h}</p>
        <p><strong>24h Volume:</strong> ${coin.total_volume}</p>
        <p><strong>Market Cap:</strong> ${coin.market_cap}</p>
      </div>
      <div style={{ padding: '16px' }}>
        <QuickTradePanel coin={coin} balance={600} />
      </div>
    </div>
  );
}
