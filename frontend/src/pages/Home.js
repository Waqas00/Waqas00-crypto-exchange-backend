import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MarketCard from '../components/MarketCard';

export default function Home() {
  const [coins, setCoins] = useState([]);
  useEffect(() => {
    axios.get('https://crypto-exchange-backend-yd8j.onrender.com/api/market')
      .then(res => setCoins(res.data))
      .catch(err => console.error('Market fetch error:', err));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Top Cryptocurrencies</h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {coins.map(coin => (
          <MarketCard key={coin.id} coin={coin} />
        ))}
      </div>
    </div>
  );
}