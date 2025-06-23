export default function MarketOverview({ stats }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px', background: '#fff' }}>
      <div>
        <strong>Total Market Cap</strong>
        <p>${(stats?.total_market_cap || 0).toFixed(2)}</p>
      </div>
      <div>
        <strong>24h Volume</strong>
        <p>${(stats?.total_volume || 0).toFixed(2)}</p>
      </div>
      <div>
        <strong>BTC Dominance</strong>
        <p>{(stats?.btc_dominance || 0).toFixed(2)}%</p>
      </div>
    </div>
  );
}
