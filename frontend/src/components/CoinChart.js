import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function CoinChart({ sparkline }) {
  const data = {
    labels: sparkline.map((_, i) => i),
    datasets: [{
      data: sparkline,
      fill: false,
      borderColor: '#ffa500',
      borderWidth: 2,
      pointRadius: 0
    }]
  };
  return <Line data={data} options={{ scales: { x: { display: false }, y: { display: false } }, plugins: { legend: { display: false } } }} height={60} />;
}