import React, { useState } from 'react';

export default function QuickTradePanel({ coin, balance }) {
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(20);

  const handleTrade = (direction) => {
    alert(`Placed ${direction} trade for $${amount} on ${coin.name} with ${leverage}% leverage.`);
  };

  return (
    <div style={{ background: '#fdf5ce', borderRadius: 12, padding: 16 }}>
      <h4>Quick Trade</h4>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <div style={{ display: 'flex', gap: '8px', marginBottom: 12 }}>
        {[20, 40, 60].map(p => (
          <button
            key={p}
            onClick={() => setLeverage(p)}
            style={{
              flex: 1,
              padding: '10px 0',
              background: p === leverage ? '#ffd54f' : '#eee',
              border: '1px solid #ccc',
              borderRadius: 8
            }}
          >
            {p}%<br /><small>{p * 3}s</small>
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <strong>Your Balance:</strong> ${balance}
      </div>
      <div>
        <strong>{coin.name} Price:</strong> ${coin.current_price}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => handleTrade('Buy Up')} style={{ width: '100%', padding: 10, background: 'green', color: 'white', border: 'none', borderRadius: 8, marginBottom: 8 }}>↑ Buy Up</button>
        <button onClick={() => handleTrade('Buy Down')} style={{ width: '100%', padding: 10, background: 'red', color: 'white', border: 'none', borderRadius: 8 }}>↓ Buy Down</button>
      </div>
    </div>
  );
}