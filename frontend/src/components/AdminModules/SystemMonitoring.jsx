import React, { useState, useEffect } from 'react';
import '../../styles/AdminModules.css';

const SystemMonitoring = () => {
  const [metrics, setMetrics] = useState({
    uptime: 99.9,
    apiResponseTime: 125,
    databaseConnections: 24,
    activeUsers: 156,
    totalRequests: 52000,
    errorRate: 0.5,
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'High database load detected', timestamp: new Date() },
    { id: 2, type: 'info', message: 'Backup completed successfully', timestamp: new Date(Date.now() - 3600000) }
  ]);

  return (
    <div className="admin-module-container">
      <div className="module-header">
        <h2>🏥 System Monitoring</h2>
        <button className="btn btn-primary">🔄 Refresh</button>
      </div>

      <div className="monitoring-grid">
        <div className="monitoring-card">
          <div className="metric-label">Uptime</div>
          <div className="metric-value">{metrics.uptime}%</div>
          <div className="metric-status">Excellent</div>
        </div>
        <div className="monitoring-card">
          <div className="metric-label">API Response Time</div>
          <div className="metric-value">{metrics.apiResponseTime}ms</div>
          <div className="metric-status">Good</div>
        </div>
        <div className="monitoring-card">
          <div className="metric-label">Database Connections</div>
          <div className="metric-value">{metrics.databaseConnections}</div>
          <div className="metric-status">Normal</div>
        </div>
        <div className="monitoring-card">
          <div className="metric-label">Active Users</div>
          <div className="metric-value">{metrics.activeUsers}</div>
          <div className="metric-status">Online</div>
        </div>
        <div className="monitoring-card">
          <div className="metric-label">Total Requests</div>
          <div className="metric-value">{metrics.totalRequests.toLocaleString()}</div>
          <div className="metric-status">Today</div>
        </div>
        <div className="monitoring-card">
          <div className="metric-label">Error Rate</div>
          <div className="metric-value">{metrics.errorRate}%</div>
          <div className="metric-status">Healthy</div>
        </div>
      </div>

      <div className="alerts-section">
        <h3>📢 System Alerts</h3>
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.type}`}>
              <span className="alert-icon">
                {alert.type === 'warning' && '⚠️'}
                {alert.type === 'info' && 'ℹ️'}
                {alert.type === 'error' && '❌'}
              </span>
              <div className="alert-content">
                <p>{alert.message}</p>
                <small>{new Date(alert.timestamp).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;
