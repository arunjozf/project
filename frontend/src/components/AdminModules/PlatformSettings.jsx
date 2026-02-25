import React, { useState } from 'react';
import '../../styles/AdminModules.css';

const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    platformName: 'TaxiHub',
    commissionRate: 15,
    supportEmail: 'support@taxihub.com',
    contactPhone: '+91-000-000-0000',
    maintenanceMode: false,
    maxBookingDays: 30,
    minBookingAmount: 500,
    pendingBookingTimeout: 3600,
    pendingPaymentTimeout: 1800,
    autoApproveBookings: false,
    autoCancelExpiredPending: true,
    pendingBookingHoldTime: 7200,
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name.includes('Rate') || name.includes('Days') || name.includes('Amount') ? Number(value) : value),
    }));
    setSaved(false);
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/bookings/admin/settings/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        alert('✅ Settings saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('[PlatformSettings] Error saving settings:', error);
      alert('❌ Failed to save settings');
    }
  };

  return (
    <div className="admin-module-container">
      <div className="module-header">
        <h2>⚙️ Platform Settings</h2>
        {saved && <span className="success-badge">✅ Saved</span>}
      </div>

      <div className="settings-form">
        <div className="settings-section">
          <h3>Platform Configuration</h3>
          <div className="form-group">
            <label>Platform Name</label>
            <input
              type="text"
              name="platformName"
              value={settings.platformName}
              onChange={handleInputChange}
              placeholder="Platform Name"
            />
          </div>
          <div className="form-group">
            <label>Support Email</label>
            <input
              type="email"
              name="supportEmail"
              value={settings.supportEmail}
              onChange={handleInputChange}
              placeholder="support@example.com"
            />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="tel"
              name="contactPhone"
              value={settings.contactPhone}
              onChange={handleInputChange}
              placeholder="+91-000-000-0000"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Commission & Pricing</h3>
          <div className="form-group">
            <label>Commission Rate (%)</label>
            <input
              type="number"
              name="commissionRate"
              value={settings.commissionRate}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.5"
            />
            <small>Platform takes {settings.commissionRate}% on each booking</small>
          </div>
          <div className="form-group">
            <label>Minimum Booking Amount (₹)</label>
            <input
              type="number"
              name="minBookingAmount"
              value={settings.minBookingAmount}
              onChange={handleInputChange}
              min="0"
              step="100"
            />
          </div>
          <div className="form-group">
            <label>Maximum Booking Duration (Days)</label>
            <input
              type="number"
              name="maxBookingDays"
              value={settings.maxBookingDays}
              onChange={handleInputChange}
              min="1"
              step="1"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>System Status</h3>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
              />
              <span>Enable Maintenance Mode</span>
            </label>
            <small>
              {settings.maintenanceMode
                ? '🔴 Platform is in maintenance mode - Users cannot book'
                : '🟢 Platform is active - Users can book normally'}
            </small>
          </div>
        </div>

        <div className="settings-section">
          <h3>⏳ Pending Bookings Configuration</h3>
          <div className="form-group">
            <label>Pending Booking Timeout (seconds)</label>
            <input
              type="number"
              name="pendingBookingTimeout"
              value={settings.pendingBookingTimeout}
              onChange={handleInputChange}
              min="300"
              step="60"
            />
            <small>How long a booking stays in pending status before automatic action (default: 3600 seconds = 1 hour)</small>
          </div>
          <div className="form-group">
            <label>Pending Payment Timeout (seconds)</label>
            <input
              type="number"
              name="pendingPaymentTimeout"
              value={settings.pendingPaymentTimeout}
              onChange={handleInputChange}
              min="300"
              step="60"
            />
            <small>How long to wait for payment completion (default: 1800 seconds = 30 minutes)</small>
          </div>
          <div className="form-group">
            <label>Pending Booking Hold Time (seconds)</label>
            <input
              type="number"
              name="pendingBookingHoldTime"
              value={settings.pendingBookingHoldTime}
              onChange={handleInputChange}
              min="600"
              step="60"
            />
            <small>How long to hold an unpaid pending booking before automatic cancellation (default: 7200 seconds = 2 hours)</small>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="autoApproveBookings"
                checked={settings.autoApproveBookings}
                onChange={handleInputChange}
              />
              <span>Auto-Approve Bookings</span>
            </label>
            <small>
              {settings.autoApproveBookings
                ? '✅ Bookings will be automatically approved after payment'
                : '⏳ Bookings require manual approval'}
            </small>
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="autoCancelExpiredPending"
                checked={settings.autoCancelExpiredPending}
                onChange={handleInputChange}
              />
              <span>Auto-Cancel Expired Pending Bookings</span>
            </label>
            <small>
              {settings.autoCancelExpiredPending
                ? '✅ Expired pending bookings will be automatically cancelled'
                : '❌ Expired pending bookings will remain in the system'}
            </small>
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="btn btn-success"
            onClick={handleSaveSettings}
          >
            💾 Save Settings
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            🔄 Reset Form
          </button>
        </div>
      </div>

      <div className="settings-info">
        <h3>ℹ️ About Platform Settings</h3>
        <ul>
          <li>Commission Rate is deducted from earnings after each successful booking</li>
          <li>Maintenance mode prevents new bookings but existing bookings continue</li>
          <li>Minimum booking amount prevents bookings below the specified threshold</li>
          <li>Maximum booking days limits the duration of individual bookings</li>
          <li><strong>Pending Booking Timeout:</strong> Controls how long a booking can stay in pending status</li>
          <li><strong>Pending Payment Timeout:</strong> Controls the grace period for payment completion</li>
          <li><strong>Pending Booking Hold Time:</strong> How long unpaid bookings are held before automatic cancellation</li>
          <li><strong>Auto-Approve:</strong> When enabled, bookings are automatically approved after successful payment</li>
          <li><strong>Auto-Cancel Expired:</strong> When enabled, bookings that exceed the hold time are automatically cancelled</li>
        </ul>
      </div>
    </div>
  );
};

export default PlatformSettings;
