import React from 'react';

const MarketAnalysis = ({ demandData }) => {
  if (!demandData) {
    return (
      <div className="analysis-container">
        <h3>Market Analysis</h3>
        <div className="loading-analysis">Loading analysis...</div>
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    return trend === 'BULLISH' ? '📈' : '📉';
  };

  const getSentimentColor = (sentiment) => {
    return sentiment === 'POSITIVE' ? '#4ade80' : '#f87171';
  };

  const getDemandLevel = (demand) => {
    if (demand >= 80) return { level: 'Very High', color: '#FFD700' };
    if (demand >= 60) return { level: 'High', color: '#B8860B' };
    if (demand >= 40) return { level: 'Medium', color: '#808080' };
    return { level: 'Low', color: '#404040' };
  };

  const demandLevel = getDemandLevel(demandData.totalDemand);

  const generateAnalysis = (data) => {
    const { symbol, totalDemand, buyPressure, sellPressure, trend, sentiment } = data;
    
    let analysis = `${symbol} is currently experiencing `;
    
    if (totalDemand >= 70) {
      analysis += `high market demand at ${totalDemand}%. `;
    } else if (totalDemand >= 50) {
      analysis += `moderate market demand at ${totalDemand}%. `;
    } else {
      analysis += `low market demand at ${totalDemand}%. `;
    }

    if (buyPressure > sellPressure) {
      analysis += `Buy pressure dominates at ${buyPressure}% vs ${sellPressure}% sell pressure, `;
      analysis += `indicating strong accumulation. `;
    } else {
      analysis += `Sell pressure dominates at ${sellPressure}% vs ${buyPressure}% buy pressure, `;
      analysis += `suggesting distribution phase. `;
    }

    analysis += `The ${trend.toLowerCase()} trend combined with ${sentiment.toLowerCase()} market sentiment `;
    
    if (trend === 'BULLISH' && sentiment === 'POSITIVE') {
      analysis += `suggests continued upward momentum with strong investor confidence.`;
    } else if (trend === 'BULLISH' && sentiment === 'NEGATIVE') {
      analysis += `indicates potential volatility despite upward price movement.`;
    } else if (trend === 'BEARISH' && sentiment === 'POSITIVE') {
      analysis += `may signal a potential reversal or accumulation opportunity.`;
    } else {
      analysis += `points to continued downward pressure with cautious investor outlook.`;
    }

    return analysis;
  };

  return (
    <div className="analysis-container">
      <h3>Market Analysis - {demandData.symbol}</h3>
      
      <div className="analysis-metrics">
        <div className="metric-card">
          <div className="metric-label">Demand Level</div>
          <div className="metric-value" style={{ color: demandLevel.color }}>
            {demandLevel.level}
          </div>
          <div className="metric-subtitle">{demandData.totalDemand}%</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Market Trend</div>
          <div className="metric-value">
            {getTrendIcon(demandData.trend)} {demandData.trend}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Sentiment</div>
          <div className="metric-value" style={{ color: getSentimentColor(demandData.sentiment) }}>
            {demandData.sentiment}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Buy/Sell Ratio</div>
          <div className="metric-value">
            {demandData.buyPressure}/{demandData.sellPressure}
          </div>
          <div className="metric-subtitle">
            {demandData.buyPressure > demandData.sellPressure ? 'Buy Pressure' : 'Sell Pressure'}
          </div>
        </div>
      </div>
      
      <div className="analysis-text">
        <h4>Analysis Summary</h4>
        <p>{generateAnalysis(demandData)}</p>
      </div>
      
      <div className="analysis-insights">
        <h4>Key Insights</h4>
        <ul>
          <li>
            <strong>Demand Analysis:</strong> {demandData.totalDemand >= 60 ? 
              'High demand indicates strong market interest and potential price appreciation.' :
              'Lower demand suggests caution and potential price consolidation.'}
          </li>
          <li>
            <strong>Pressure Dynamics:</strong> {demandData.buyPressure > demandData.sellPressure ?
              'Buy pressure exceeds sell pressure, suggesting accumulation phase.' :
              'Sell pressure dominates, indicating distribution or profit-taking.'}
          </li>
          <li>
            <strong>Trend Alignment:</strong> {demandData.trend === demandData.sentiment ?
              'Trend and sentiment are aligned, reinforcing the current market direction.' :
              'Trend and sentiment diverge, suggesting potential market volatility ahead.'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MarketAnalysis;
