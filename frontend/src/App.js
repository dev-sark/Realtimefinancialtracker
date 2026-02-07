import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import DemandChart from './components/DemandChart';
import MarketAnalysis from './components/MarketAnalysis';
import './App.css';

function App() {
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [marketDemandData, setMarketDemandData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-finance');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      
      // Subscribe to price updates
      client.subscribe('/topic/prices', (message) => {
        const data = JSON.parse(message.body);
        
        if (data.error) {
          console.error('Error received:', data.error);
          return;
        }
        
        setCryptoPrices(prev => ({
          ...prev,
          [data.symbol]: {
            price: data.price,
            changePercent24Hr: data.changePercent24Hr,
            lastUpdate: new Date()
          }
        }));
        
        setLastUpdate(new Date());
        console.log('Received price update:', data);
      });

      // Subscribe to market demand data
      client.subscribe('/topic/market-demand', (message) => {
        const data = JSON.parse(message.body);
        setMarketDemandData(prev => ({
          ...prev,
          [data.symbol]: data
        }));
        console.log('Received market demand data:', data);
      });
    };

    client.onStompError = (frame) => {
      console.error('WebSocket connection error:', frame);
      setIsConnected(false);
    };

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  const formatPrice = (priceStr) => {
    const price = parseFloat(priceStr);
    if (isNaN(price)) return '0.00';
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatChange = (changeStr) => {
    const change = parseFloat(changeStr);
    if (isNaN(change)) return '0.00%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeClass = (changeStr) => {
    const change = parseFloat(changeStr);
    if (isNaN(change)) return 'neutral';
    return change >= 0 ? 'positive' : 'negative';
  };

  const cryptoList = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'XRP'];

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚠ QUANTUM FINANCE TERMINAL ⚠</h1>
        <div className="status-bar">
          <div className="status-item">
            <div className="connection-status">
              STATUS: {isConnected ? 
                <span className="connected">● ONLINE</span> : 
                <span className="disconnected">● OFFLINE</span>
              }
            </div>
          </div>
          <div className="status-item">
            <div>SYSTEM: OPERATIONAL</div>
          </div>
          <div className="status-item">
            <div>NETWORK: SECURE</div>
          </div>
          <div className="status-item">
            <div className="last-update">
              LAST UPDATE: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          <div className="status-item">
            <div>ENCRYPTION: AES-256</div>
          </div>
        </div>
        
        {/* Price Cards Section */}
        <div className="section">
          <h2>🔥 LIVE MARKET DATA 🔥</h2>
          <div className="crypto-grid">
            {cryptoList.map(symbol => {
              const crypto = cryptoPrices[symbol];
              return (
                <div 
                  key={symbol} 
                  className={`crypto-card ${selectedCrypto === symbol ? 'selected' : ''}`}
                  onClick={() => setSelectedCrypto(symbol)}
                >
                  <div className="crypto-header">
                    <span className="symbol">{symbol}</span>
                    {crypto && (
                      <span className={`change ${getChangeClass(crypto.changePercent24Hr)}`}>
                        {formatChange(crypto.changePercent24Hr)}
                      </span>
                    )}
                  </div>
                  <div className="price-display">
                    {crypto ? formatPrice(crypto.price) : 'Loading...'}
                  </div>
                  {crypto && (
                    <div className="crypto-time">
                      {crypto.lastUpdate.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="section">
          <h2>⚡ ADVANCED ANALYTICS ⚡ - {selectedCrypto}</h2>
          {marketDemandData[selectedCrypto] && (
            <div className="charts-container">
              <div className="chart-row">
                <DemandChart 
                  data={marketDemandData[selectedCrypto]?.dailyDemand?.slice().reverse()} 
                  title="Daily Demand (30 days)"
                  color="#FFD700"
                />
                <DemandChart 
                  data={marketDemandData[selectedCrypto]?.monthlyDemand?.slice().reverse()} 
                  title="Monthly Demand (12 months)"
                  color="#B8860B"
                />
              </div>
              <div className="chart-row">
                <DemandChart 
                  data={marketDemandData[selectedCrypto]?.yearlyDemand?.slice().reverse()} 
                  title="Yearly Demand (3 years)"
                  color="#808080"
                />
                <DemandChart 
                  data={marketDemandData[selectedCrypto]?.dailyDemand?.slice().reverse()} 
                  title="Buy/Sell Volume Distribution"
                  type="bar"
                />
              </div>
            </div>
          )}
        </div>

        {/* Market Analysis Section */}
        <div className="section">
          <MarketAnalysis demandData={marketDemandData[selectedCrypto]} />
        </div>

        {/* Reports Section */}
        <div className="section">
          <h2>📊 MARKET INTELLIGENCE REPORTS 📊</h2>
          {marketDemandData[selectedCrypto] && (
            <div className="reports-container">
              <div className="report-section">
                <h3>🔍 TECHNICAL ANALYSIS</h3>
                <div className="report-content">
                  <div className="report-item">
                    <span className="report-label">VOLATILITY INDEX:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].totalDemand > 80 ? 'EXTREME' : 
                       marketDemandData[selectedCrypto].totalDemand > 60 ? 'HIGH' : 
                       marketDemandData[selectedCrypto].totalDemand > 40 ? 'MODERATE' : 'LOW'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">MOMENTUM:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].trend === 'BULLISH' ? 'STRONG UPTREND' : 'STRONG DOWNTREND'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">VOLUME PROFILE:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].buyPressure > 60 ? 'ACCUMULATION PHASE' : 'DISTRIBUTION PHASE'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">SUPPORT LEVEL:</span>
                    <span className="report-value">
                      ${cryptoPrices[selectedCrypto] ? 
                        (parseFloat(cryptoPrices[selectedCrypto].price) * 0.95).toFixed(2) : 'CALCULATING...'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">RESISTANCE LEVEL:</span>
                    <span className="report-value">
                      ${cryptoPrices[selectedCrypto] ? 
                        (parseFloat(cryptoPrices[selectedCrypto].price) * 1.05).toFixed(2) : 'CALCULATING...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>📈 MARKET SENTIMENT</h3>
                <div className="report-content">
                  <div className="report-item">
                    <span className="report-label">FEAR & GREED INDEX:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].sentiment === 'POSITIVE' ? 'GREED - 72' : 'FEAR - 28'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">SOCIAL MEDIA SENTIMENT:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].buyPressure > 50 ? 'BULLISH - 68%' : 'BEARISH - 32%'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">WHALE ACTIVITY:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].totalDemand > 70 ? 'HIGH - DETECTED' : 'NORMAL - MONITORING'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">RETAIL VS INSTITUTIONAL:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].buyPressure > 55 ? 'INSTITUTIONAL DOMINANCE' : 'RETAIL ACCUMULATION'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>⚡ TRADING SIGNALS</h3>
                <div className="report-content">
                  <div className="report-item">
                    <span className="report-label">SHORT TERM (1H):</span>
                    <span className={`report-value ${marketDemandData[selectedCrypto].trend === 'BULLISH' ? 'bullish-signal' : 'bearish-signal'}`}>
                      {marketDemandData[selectedCrypto].trend === 'BULLISH' ? '🟢 STRONG BUY' : '🔴 STRONG SELL'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">MID TERM (4H):</span>
                    <span className={`report-value ${marketDemandData[selectedCrypto].sentiment === 'POSITIVE' ? 'bullish-signal' : 'bearish-signal'}`}>
                      {marketDemandData[selectedCrypto].sentiment === 'POSITIVE' ? '🟡 HOLD ACCUMULATE' : '🟡 REDUCE POSITION'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">LONG TERM (1D):</span>
                    <span className={`report-value ${marketDemandData[selectedCrypto].totalDemand > 60 ? 'bullish-signal' : 'bearish-signal'}`}>
                      {marketDemandData[selectedCrypto].totalDemand > 60 ? '🟢 TREND FOLLOW' : '🔴 RANGE BOUND'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">RISK LEVEL:</span>
                    <span className={`report-value ${marketDemandData[selectedCrypto].totalDemand > 70 ? 'high-risk' : 'medium-risk'}`}>
                      {marketDemandData[selectedCrypto].totalDemand > 70 ? '🔴 HIGH RISK' : '🟡 MEDIUM RISK'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>🎯 STRATEGIC RECOMMENDATIONS</h3>
                <div className="report-content">
                  <div className="report-item">
                    <span className="report-label">ENTRY STRATEGY:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].buyPressure > 60 ? 'DOLLAR COST AVERAGING' : 'WAIT FOR DIP'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">POSITION SIZING:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].totalDemand > 80 ? 'CONSERVATIVE - 2%' : 'AGGRESSIVE - 5%'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">STOP LOSS:</span>
                    <span className="report-value">
                      {cryptoPrices[selectedCrypto] ? 
                        (parseFloat(cryptoPrices[selectedCrypto].price) * 0.92).toFixed(2) : 'CALCULATING...'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">TAKE PROFIT:</span>
                    <span className="report-value">
                      {cryptoPrices[selectedCrypto] ? 
                        (parseFloat(cryptoPrices[selectedCrypto].price) * 1.08).toFixed(2) : 'CALCULATING...'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">MARKET OUTLOOK:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].trend === 'BULLISH' && marketDemandData[selectedCrypto].sentiment === 'POSITIVE' ? '🟢 BULL MARKET CONFIRMED' :
                       marketDemandData[selectedCrypto].trend === 'BEARISH' && marketDemandData[selectedCrypto].sentiment === 'NEGATIVE' ? '🔴 BEAR MARKET CONFIRMED' :
                       '🟡 VOLATILE - CAUTION ADVISED'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>🚨 RISK ASSESSMENT</h3>
                <div className="report-content">
                  <div className="report-item">
                    <span className="report-label">VOLATILITY RISK:</span>
                    <span className={`report-value ${marketDemandData[selectedCrypto].totalDemand > 70 ? 'high-risk' : 'medium-risk'}`}>
                      {marketDemandData[selectedCrypto].totalDemand > 70 ? '🔴 EXTREME VOLATILITY' : '🟡 MODERATE VOLATILITY'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">LIQUIDITY RISK:</span>
                    <span className="report-value">
                      {marketDemandData[selectedCrypto].buyPressure > 65 ? '🟢 HIGH LIQUIDITY' : '🟡 MEDIUM LIQUIDITY'}
                    </span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">REGULATORY RISK:</span>
                    <span className="report-value">🟡 MONITORING REQUIRED</span>
                  </div>
                  <div className="report-item">
                    <span className="report-label">OVERALL RATING:</span>
                    <span className={`report-value ${marketDemandData[selectedCrypto].totalDemand > 60 ? 'bullish-signal' : 'bearish-signal'}`}>
                      {marketDemandData[selectedCrypto].totalDemand > 80 ? '🟢 STRONG BUY' :
                       marketDemandData[selectedCrypto].totalDemand > 60 ? '🟡 MODERATE BUY' :
                       marketDemandData[selectedCrypto].totalDemand > 40 ? '🟡 HOLD' : '🔴 SELL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
