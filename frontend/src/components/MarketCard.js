import React from 'react';
import CoinChart from './CoinChart';

export default function MarketCard({ coin }) {
  return (
    <div style={{ padding: 12, background: '#fff3cd', borderRadius: 12 }}>
      <h4>{coin.name} ({coin.symbol.toUpperCase()})</h4>
      <p>Price: ${coin.current_price}</p>
      <p style={{ color: coin.price_change_percentage_24h >= 0 ? 'green' : 'red' }}>
        {coin.price_change_percentage_24h.toFixed(2)}%
      </p>
      <CoinChart sparkline={coin.sparkline_in_7d.price} />
    </div>
  );
}