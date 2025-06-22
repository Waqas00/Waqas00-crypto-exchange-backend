import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MarketCard from '../components/MarketCard';
import Header from '../components/Header';
import MarketOverview from '../components/MarketOverview';

export default function Home() {
  const [coins, setCoins] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('https://crypto-exchange-backend-yd8j.onrender.com/api/market')
      .then(res => {
        setCoins(res.data.coins);
        setStats({
          total_market_cap: res.data.total_market_cap,
          total_volume: res.data.total_volume,
          btc_dominance: res.data.btc_dominance
        });
      })
      .catch(err => console.error('Market fetch error:', err));
  }, []);

  const filtered = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: 70 }}>
      <Header searchTerm={search} onSearchChange={e => setSearch(e.target.value)} />
      <MarketOverview stats={stats} />
      <div style={{
        display: 'grid',
        gap: '12px',
        padding: '12px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }}>
        {filtered.map(coin => (
          <MarketCard key={coin.id} coin={coin} />
        ))}
      </div>
    </div>
  );
}