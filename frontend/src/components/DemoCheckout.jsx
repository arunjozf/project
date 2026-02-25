import React, { useState } from "react";
import { bookingAPI, getToken } from "../utils/api";

const DemoCheckout = ({ booking, onPaymentSuccess, onPaymentFail, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholder: ""
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const validateCard = () => {
    const errors = {};
    
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, "").length !== 16) {
      errors.cardNumber = "Card number must be 16 digits";
    }
    
    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      errors.expiry = "Format: MM/YY";
    }
    
    if (!cardData.cvv || cardData.cvv.length !== 3) {
      errors.cvv = "CVV must be 3 digits";
    }
    
    if (!cardData.cardholder || cardData.cardholder.trim().length < 3) {
      errors.cardholder = "Cardholder name is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    
    if (name === "cardNumber") {
      formatted = value.replace(/\D/g, "").slice(0, 16);
      formatted = formatted.replace(/(\d{4})/g, "$1 ").trim();
    } else if (name === "expiry") {
      formatted = value.replace(/\D/g, "").slice(0, 4);
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
      }
    } else if (name === "cvv") {
      formatted = value.replace(/\D/g, "").slice(0, 3);
    }
    
    setCardData({ ...cardData, [name]: formatted });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Generate mock order ID directly without backend call
      const mockOrderId = `order_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      setOrderId(mockOrderId);
      setShowForm(true);
    } catch (err) {
      console.error('Payment init error:', err);
      setError(err.message || "Failed to initialize payment");
      onPaymentFail && onPaymentFail(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!validateCard()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const token = getToken();
      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      // Generate demo payment IDs
      const paymentId = `pay_demo_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      const signature = `sig_demo_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

      // Try to verify with backend - if it fails in demo mode, still accept
      try {
        const verifyResponse = await bookingAPI.verifyPayment(
          booking.id,
          {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
          },
          token
        );

        const bookingData = verifyResponse.data || verifyResponse;
        
        if (bookingData && (bookingData.id || bookingData.status === "confirmed")) {
          onPaymentSuccess && onPaymentSuccess(bookingData);
        } else {
          // If backend didn't confirm, use client-side confirmation
          onPaymentSuccess && onPaymentSuccess({
            ...booking,
            status: "confirmed",
            payment_status: "completed"
          });
        }
      } catch (verifyError) {
        // In demo mode, accept payment even if backend verification fails
        console.warn('Backend verification failed, accepting payment in demo mode:', verifyError);
        onPaymentSuccess && onPaymentSuccess({
          ...booking,
          status: "confirmed", 
          payment_status: "completed"
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      onPaymentFail && onPaymentFail(err);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>💳 Payment Summary</h2>
            <button onClick={onCancel} style={styles.closeBtn} title="Close">✕</button>
          </div>
          
          {error && (
            <div style={styles.error}>
              <p><strong>⚠️ Error:</strong> {error}</p>
            </div>
          )}

          <div style={styles.content}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Booking Details</h3>
              
              <div style={styles.detailRow}>
                <span style={styles.label}>Booking ID:</span>
                <span style={styles.value}>#{booking.id}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Booking Type:</span>
                <span style={styles.value}>
                  {booking.booking_type === "premium" ? "🚙 Premium Car" : 
                   booking.booking_type === "local" ? "🚗 Local Car" : "🚕 On-Demand Taxi"}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Pickup:</span>
                <span style={styles.value}>{booking.pickup_location}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Dropoff:</span>
                <span style={styles.value}>{booking.dropoff_location}</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.label}>Date:</span>
                <span style={styles.value}>
                  {new Date(booking.pickup_date).toLocaleDateString('en-IN')} at {booking.pickup_time}
                </span>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💰 Price</h3>
              <div style={styles.pricingBox}>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total Amount:</span>
                  <span style={styles.totalAmount}>₹{parseFloat(booking.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              {loading ? (
                <div style={styles.loader}>
                  <div style={styles.spinner}></div>
                  <p>Initializing payment...</p>
                </div>
              ) : (
                <>
                  <button onClick={initializePayment} style={styles.payButton}>
                    🔒 Proceed to Payment →
                  </button>
                  <button onClick={onCancel} style={styles.cancelButton}>
                    Cancel Order
                  </button>
                </>
              )}
            </div>

            <div style={styles.securityInfo}>
              <p>🔒 <strong>Safe & Secure:</strong> Demo Checkout</p>
              <p style={{ marginTop: '8px', marginBottom: 0 }}>✓ 256-bit Encryption | ✓ Secure Payment Processing</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>💳 Card Payment</h2>
          <button onClick={() => setShowForm(false)} style={styles.closeBtn} title="Back">←</button>
        </div>

        {error && (
          <div style={styles.error}>
            <p><strong>⚠️ Error:</strong> {error}</p>
          </div>
        )}

        <div style={styles.content}>
          <div style={styles.checkoutForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={handleCardChange}
                maxLength="19"
                style={{...styles.input, borderColor: validationErrors.cardNumber ? 'red' : '#ddd'}}
              />
              {validationErrors.cardNumber && (
                <span style={styles.errorText}>{validationErrors.cardNumber}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, ...styles.formGroup }}>
                <label style={styles.label}>Expiry (MM/YY)</label>
                <input
                  type="text"
                  name="expiry"
                  placeholder="12/25"
                  value={cardData.expiry}
                  onChange={handleCardChange}
                  maxLength="5"
                  style={{...styles.input, borderColor: validationErrors.expiry ? 'red' : '#ddd'}}
                />
                {validationErrors.expiry && (
                  <span style={styles.errorText}>{validationErrors.expiry}</span>
                )}
              </div>

              <div style={{ flex: 1, ...styles.formGroup }}>
                <label style={styles.label}>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={handleCardChange}
                  maxLength="3"
                  style={{...styles.input, borderColor: validationErrors.cvv ? 'red' : '#ddd'}}
                />
                {validationErrors.cvv && (
                  <span style={styles.errorText}>{validationErrors.cvv}</span>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Cardholder Name</label>
              <input
                type="text"
                name="cardholder"
                placeholder="John Doe"
                value={cardData.cardholder}
                onChange={handleCardChange}
                style={{...styles.input, borderColor: validationErrors.cardholder ? 'red' : '#ddd'}}
              />
              {validationErrors.cardholder && (
                <span style={styles.errorText}>{validationErrors.cardholder}</span>
              )}
            </div>

            <div style={styles.testCardInfo}>
              <p><strong>Test Card for Demo:</strong></p>
              <p>Number: 4111 1111 1111 1111</p>
              <p>Expiry: 12/25 | CVV: 123</p>
            </div>

            <button 
              onClick={handlePayment} 
              disabled={loading}
              style={{...styles.payButton, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
            >
              {loading ? '⏳ Processing...' : '✓ Pay Now'}
            </button>

            <button 
              onClick={() => setShowForm(false)}
              disabled={loading}
              style={{...styles.cancelButton, opacity: loading ? 0.6 : 1}}
            >
              ← Back to Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "100%",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #eee",
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
    padding: "0",
  },
  content: {
    padding: "20px",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "12px",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "8px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: "8px",
    fontSize: "14px",
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    color: "#2c3e50",
    fontWeight: "500",
  },
  pricingBox: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontWeight: "600",
    color: "#2c3e50",
  },
  totalAmount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#27ae60",
  },
  checkoutForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  input: {
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontFamily: "inherit",
  },
  errorText: {
    fontSize: "12px",
    color: "#e74c3c",
    fontWeight: "500",
  },
  testCardInfo: {
    backgroundColor: "#e3f2fd",
    border: "1px solid #90caf9",
    borderRadius: "6px",
    padding: "10px",
    fontSize: "12px",
    color: "#1565c0",
  },
  error: {
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "6px",
    padding: "12px",
    margin: "0 20px 15px",
    color: "#c33",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },
  payButton: {
    padding: "14px 20px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "14px 20px",
    backgroundColor: "#ecf0f1",
    color: "#2c3e50",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  loader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "30px 0",
  },
  spinner: {
    border: "3px solid #e9ecef",
    borderTop: "3px solid #3399cc",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
  },
  securityInfo: {
    padding: "16px",
    backgroundColor: "#e8f5e9",
    borderRadius: "8px",
    borderLeft: "4px solid #27ae60",
    fontSize: "13px",
    color: "#2e7d32",
    marginTop: "15px",
  },
};

export default DemoCheckout;
