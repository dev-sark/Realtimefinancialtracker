import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DemandChart = ({ data, title, type = 'line', color = '#FFD700' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="loading-chart">Loading chart data...</div>
      </div>
    );
  }

  const formatXAxis = (tickItem) => {
    if (tickItem.includes('-')) {
      const parts = tickItem.split('-');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2].substring(0, 2)}`;
      } else if (parts.length === 2) {
        return parts[1];
      }
    }
    return tickItem;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{`Date: ${label}`}</p>
          <p className="tooltip-demand">{`Demand: ${payload[0].value}%`}</p>
          {payload[0].payload.buyVolume && (
            <p className="tooltip-buy">{`Buy Volume: ${payload[0].payload.buyVolume}%`}</p>
          )}
          {payload[0].payload.sellVolume && (
            <p className="tooltip-sell">{`Sell Volume: ${payload[0].payload.sellVolume}%`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#808080', fontSize: 12 }}
              tickFormatter={formatXAxis}
            />
            <YAxis 
              tick={{ fill: '#808080', fontSize: 12 }}
              label={{ value: 'Demand (%)', angle: -90, position: 'insideLeft', fill: '#808080' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="buyVolume" fill="#4ade80" name="Buy Volume" />
            <Bar dataKey="sellVolume" fill="#f87171" name="Sell Volume" />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#808080', fontSize: 12 }}
              tickFormatter={formatXAxis}
            />
            <YAxis 
              tick={{ fill: '#808080', fontSize: 12 }}
              label={{ value: 'Demand (%)', angle: -90, position: 'insideLeft', fill: '#808080' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Market Demand"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default DemandChart;
