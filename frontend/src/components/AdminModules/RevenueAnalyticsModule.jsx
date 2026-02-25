import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/api';
import './ModuleStyles.css';

const RevenueAnalyticsModule = ({ user }) => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 2500000,
    monthlyRevenue: 425000,
    weeklyRevenue: 98000,
    todayRevenue: 28000,
    completedPayments: 2455000,
    pendingPayments: 45000,
    refundedAmount: 12000,
    transactions: [],
  });

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const token = getToken();
      // API will be created: http://localhost:8000/api/admin/revenue/

      // Mock data
      setRevenueData({
        totalRevenue: 2500000,
        monthlyRevenue: 425000,
        weeklyRevenue: 98000,
        todayRevenue: 28000,
        completedPayments: 2455000,
        pendingPayments: 45000,
        refundedAmount: 12000,
        transactions: [
          { id: 'TXN001', bookingId: 101, amount: 5500, method: 'Card', date: '2024-02-15', status: 'completed' },
          { id: 'TXN002', bookingId: 102, amount: 1800, method: 'UPI', date: '2024-02-14', status: 'completed' },
          { id: 'TXN003', bookingId: 103, amount: 800, method: 'Wallet', date: '2024-02-13', status: 'completed' },
          { id: 'TXN004', bookingId: 104, amount: 3000, method: 'Card', date: '2024-02-12', status: 'pending' },
          { id: 'TXN005', bookingId: 105, amount: 1200, method: 'Card', date: '2024-02-11', status: 'refunded' },
        ],
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const getPaymentMethodStats = () => {
    const transactions = revenueData.transactions;
    const methods = {};

    transactions.forEach(t => {
      if (!methods[t.method]) {
        methods[t.method] = { count: 0, amount: 0 };
      }
      methods[t.method].count += 1;
      if (t.status === 'completed') {
        methods[t.method].amount += t.amount;
      }
    });

    return methods;
  };

  const getServiceRevenue = () => {
    return {
      rentals: 1800000,
      taxi: 400000,
      usedCars: 300000,
    };
  };

  const paymentMethods = getPaymentMethodStats();
  const serviceRevenue = getServiceRevenue();

  return (
    <div className="admin-module revenue-analytics">
      <h2>💰 Revenue Tracking & Financial Reports</h2>

      {/* Revenue Summary */}
      <div className="kpi-section">
        <h3>Revenue Summary</h3>
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-value">₹{(revenueData.totalRevenue / 100000).toFixed(1)}L</div>
            <div className="kpi-label">Total Revenue (All Time)</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">₹{(revenueData.monthlyRevenue / 1000).toFixed(0)}K</div>
            <div className="kpi-label">This Month</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">₹{(revenueData.weeklyRevenue / 1000).toFixed(0)}K</div>
            <div className="kpi-label">This Week</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">₹{revenueData.todayRevenue.toLocaleString()}</div>
            <div className="kpi-label">Today</div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="kpi-section">
        <h3>Payment Status</h3>
        <div className="kpi-row">
          <div className="kpi-card status-completed">
            <div className="kpi-value">₹{(revenueData.completedPayments / 100000).toFixed(1)}L</div>
            <div className="kpi-label">Completed Payments</div>
          </div>
          <div className="kpi-card status-pending">
            <div className="kpi-value">₹{(revenueData.pendingPayments / 1000).toFixed(0)}K</div>
            <div className="kpi-label">Pending Payments</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">₹{(revenueData.refundedAmount / 1000).toFixed(0)}K</div>
            <div className="kpi-label">Refunded Amount</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{revenueData.transactions.length}</div>
            <div className="kpi-label">Total Transactions</div>
          </div>
        </div>
      </div>

      {/* Revenue by Service */}
      <div className="kpi-section">
        <h3>Revenue by Service Type</h3>
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-value">₹{(serviceRevenue.rentals / 100000).toFixed(1)}L</div>
            <div className="kpi-label">Car Rentals</div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              {((serviceRevenue.rentals / revenueData.totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">₹{(serviceRevenue.taxi / 1000).toFixed(0)}K</div>
            <div className="kpi-label">Taxi Service</div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              {((serviceRevenue.taxi / revenueData.totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">₹{(serviceRevenue.usedCars / 1000).toFixed(0)}K</div>
            <div className="kpi-label">Used Car Sales</div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              {((serviceRevenue.usedCars / revenueData.totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="kpi-section">
        <h3>Payment Methods Used</h3>
        <div className="kpi-row">
          {Object.entries(paymentMethods).map(([method, data]) => (
            <div key={method} className="kpi-card">
              <div className="kpi-value">{data.count}</div>
              <div className="kpi-label">{method}</div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#007bff', fontWeight: 600 }}>
                ₹{data.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ marginTop: '30px' }}>
        <h3>Recent Transactions</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Booking ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.transactions.map(txn => (
                <tr key={txn.id}>
                  <td>{txn.id}</td>
                  <td>#{txn.bookingId}</td>
                  <td>₹{txn.amount.toLocaleString()}</td>
                  <td>{txn.method}</td>
                  <td>{txn.date}</td>
                  <td>
                    <span className={`status-badge status-${txn.status}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary Actions */}
      <div className="quick-actions" style={{ marginTop: '30px' }}>
        <h3>Financial Tools</h3>
        <button className="action-btn">📊 Download Revenue Report</button>
        <button className="action-btn">📈 View Analytics Charts</button>
        <button className="action-btn">💳 Pending Payments List</button>
        <button className="action-btn">🔄 Process Refunds</button>
        <button className="action-btn">📋 Audit Trail</button>
        <button className="action-btn">⚙️ Tax Settings</button>
      </div>
    </div>
  );
};

export default RevenueAnalyticsModule;
