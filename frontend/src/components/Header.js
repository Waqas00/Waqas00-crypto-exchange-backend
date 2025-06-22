import React from 'react';

export default function Header({ searchTerm, onSearchChange }) {
  return (
    <div style={{
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff3cd',
      borderBottom: '1px solid #eee'
    }}>
      <h2 style={{ margin: 0 }}>🚀 AI Boosted <span style={{ color: '#f5a623' }}>Crypto</span></h2>
      <input
        type="text"
        placeholder="Search cryptocurrencies..."
        value={searchTerm}
        onChange={onSearchChange}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          width: '200px'
        }}
      />
    </div>
  );
}