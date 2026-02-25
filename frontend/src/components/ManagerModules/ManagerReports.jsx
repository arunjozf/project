import React, { useState, useEffect } from 'react';
import '../../styles/ManagerModules.css';

const ManagerReports = () => {
  const [stats, setStats] = useState({
    totalRentals: 0,
    totalRevenue: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    averageRating: 0,
    monthlyTrend: [],
    topCars: [],
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/manager/reports/?range=${dateRange}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 404) {
        // Reports endpoint not implemented - show placeholder
        console.log('[ManagerReports] Reports endpoint not available (404)');
        setStats({
          totalRentals: 0,
          totalRevenue: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          averageRating: 0,
          monthlyTrend: [],
          topCars: [],
        });
      }
    } catch (error) {
      console.error('[ManagerReports] Error fetching reports:', error);
      // Fallback to empty stats on error
      setStats({
        totalRentals: 0,
        totalRevenue: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        averageRating: 0,
        monthlyTrend: [],
        topCars: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      generated: new Date().toLocaleString(),
      period: dateRange,
      stats,
    };
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2)));
    element.setAttribute('download', `report_${new Date().getTime()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>📈 Reports & Analytics</h2>
        <div className="report-controls">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last 12 Months</option>
          </select>
          <button className="btn btn-secondary" onClick={handleExportReport}>
            📥 Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Generating report...</p>
      ) : (
        <>
          <div className="report-cards">
            <div className="report-card">
              <div className="report-icon">📅</div>
              <div className="report-content">
                <h4>Total Rentals</h4>
                <p className="report-value">{stats.totalRentals}</p>
              </div>
            </div>
            <div className="report-card">
              <div className="report-icon">💰</div>
              <div className="report-content">
                <h4>Total Revenue</h4>
                <p className="report-value">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="report-card">
              <div className="report-icon">✅</div>
              <div className="report-content">
                <h4>Completed</h4>
                <p className="report-value">{stats.completedBookings}</p>
              </div>
            </div>
            <div className="report-card">
              <div className="report-icon">❌</div>
              <div className="report-content">
                <h4>Cancelled</h4>
                <p className="report-value">{stats.cancelledBookings}</p>
              </div>
            </div>
            <div className="report-card">
              <div className="report-icon">⭐</div>
              <div className="report-content">
                <h4>Avg Rating</h4>
                <p className="report-value">{stats.averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </div>

          <div className="report-sections">
            <div className="report-section">
              <h3>Monthly Trend</h3>
              <div className="chart-placeholder">
                <p>Revenue trend chart will be displayed here</p>
                {stats.monthlyTrend?.length > 0 && (
                  <div className="trend-list">
                    {stats.monthlyTrend.map((month, idx) => (
                      <div key={idx} className="trend-item">
                        <span>{month.month}</span>
                        <span className="trend-value">₹{month.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="report-section">
              <h3>Top Performing Cars</h3>
              <div className="top-cars-list">
                {stats.topCars?.length > 0 ? (
                  stats.topCars.map((car, idx) => (
                    <div key={idx} className="top-car-item">
                      <div className="rank">{idx + 1}</div>
                      <div className="car-info">
                        <p className="car-name">{car.name}</p>
                        <p className="car-stats">{car.bookings} bookings • ₹{car.revenue.toLocaleString()} revenue</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">No car data available</p>
                )}
              </div>
            </div>
          </div>

          <div className="report-footer">
            <p>📊 Report generated on {new Date().toLocaleString()}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerReports;
