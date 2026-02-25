import React, { useState, useEffect } from 'react';
import '../../styles/AdminModules.css';

const PaymentControl = () => {
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/bookings/admin/payments/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract payments array from response - handle different API response formats
        const paymentsList = data.data || data.results || data.payments || [];
        setPayments(Array.isArray(paymentsList) ? paymentsList : []);
      }
    } catch (error) {
      console.error('[PaymentControl] Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p =>
    filterStatus === 'all' || p.status === filterStatus
  );

  return (
    <div className="admin-module-container">
      <div className="module-header">
        <h2>💳 Payment Control</h2>
        <div className="payment-stats">
          <span>Total: ₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="payment-filters">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({payments.length})
        </button>
        <button
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed ({payments.filter(p => p.status === 'completed').length})
        </button>
        <button
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({payments.filter(p => p.status === 'pending').length})
        </button>
        <button
          className={`filter-btn ${filterStatus === 'failed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('failed')}
        >
          Failed ({payments.filter(p => p.status === 'failed').length})
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading payments...</p>
      ) : filteredPayments.length === 0 ? (
        <p className="empty-text">No payments found.</p>
      ) : (
        <div className="payments-table">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Booking ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>
                    <code>{payment.razorpay_payment_id?.slice(0, 12)}...</code>
                  </td>
                  <td>{payment.user_email}</td>
                  <td>#{payment.booking_id}</td>
                  <td className="amount">₹{payment.amount?.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${payment.status}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentControl;
