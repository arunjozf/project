import React, { useState } from "react";
import { bookingAPI, getToken } from "../utils/api";

const PaymentPage = ({ paymentData, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCVV: "",
    paymentMethod: "credit-card",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.paymentMethod === "credit-card" || formData.paymentMethod === "debit-card") {
      if (!formData.cardNumber.trim()) {
        setError("Card number is required");
        return false;
      }
      if (!formData.cardName.trim()) {
        setError("Cardholder name is required");
        return false;
      }
      if (!formData.cardExpiry.trim()) {
        setError("Expiry date is required");
        return false;
      }
      if (!formData.cardCVV.trim()) {
        setError("CVV is required");
        return false;
      }
    }
    return true;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      // Simulate payment processing
      // In a real application, this would integrate with a payment gateway
      // like Stripe, Razorpay, or PayPal
      
      // Update booking with payment status
      await bookingAPI.updateBookingPayment(paymentData.bookingId, {
        payment_status: "completed",
        payment_method: formData.paymentMethod,
        total_amount: paymentData.totalAmount,
      }, token);

      setSuccess(true);
      
      // Call onComplete callback after 3 seconds
      setTimeout(() => {
        onComplete && onComplete();
      }, 3000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!paymentData?.bookingId) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <h2>Payment Information</h2>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ padding: "40px 20px" }}>
        <div style={{
          backgroundColor: "#e8f5e9",
          padding: "40px",
          borderRadius: "8px",
          border: "2px solid #4CAF50",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>✅</div>
          <h2 style={{ color: "#2e7d32", marginBottom: "10px" }}>Payment Successful!</h2>
          <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "20px" }}>
            Thank you for your payment of <strong>₹{paymentData.totalAmount}</strong>
          </p>
          <p style={{ fontSize: "0.95rem", color: "#666", marginBottom: "30px" }}>
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          <p style={{ fontSize: "0.9rem", color: "#999" }}>
            Redirecting to your dashboard in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "600px",
        margin: "40px auto",
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px" }}>
          <button 
            onClick={onCancel}
            style={{
              padding: "5px 10px",
              fontSize: "1rem",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#D40000"
            }}
          >
            ⬅ Back
          </button>
          <h1 style={{ marginTop: 0, marginBottom: 0, color: "#333" }}>Complete Payment</h1>
        </div>
        
        {/* Payment Summary */}
        <div style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          border: "1px solid #e0e0e0"
        }}>
          <h3 style={{ marginTop: 0, color: "#333" }}>Payment Summary</h3>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px"
          }}>
            <span>Booking ID:</span>
            <strong>#{paymentData.bookingId}</strong>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px"
          }}>
            <span>Service Type:</span>
            <strong>{paymentData.bookingType?.toUpperCase()} {paymentData.taxiType?.name && `- ${paymentData.taxiType.name}`}</strong>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "10px",
            borderTop: "2px solid #ddd",
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#D40000"
          }}>
            <span>Total Amount:</span>
            <span>₹{paymentData.totalAmount}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            color: "#c62828",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handlePaymentSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#333"
            }}>
              Payment Method *
            </label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {["credit-card", "debit-card", "upi", "cash"].map((method) => (
                <label key={method} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: formData.paymentMethod === method ? "#e3f2fd" : "transparent"
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={formData.paymentMethod === method}
                    onChange={handleInputChange}
                  />
                  {method === "credit-card" && "💳 Credit Card"}
                  {method === "debit-card" && "💳 Debit Card"}
                  {method === "upi" && "📱 UPI"}
                  {method === "cash" && "💵 Cash"}
                </label>
              ))}
            </div>
          </div>

          {/* Card Details */}
          {(formData.paymentMethod === "credit-card" || formData.paymentMethod === "debit-card") && (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#333"
                }}>
                  Card Number *
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#333"
                }}>
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                    color: "#333"
                  }}>
                    Expiry Date (MM/YY) *
                  </label>
                  <input
                    type="text"
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                    placeholder="12/25"
                    maxLength="5"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                    color: "#333"
                  }}>
                    CVV *
                  </label>
                  <input
                    type="text"
                    name="cardCVV"
                    value={formData.cardCVV}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="3"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* UPI */}
          {formData.paymentMethod === "upi" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#333"
              }}>
                UPI ID *
              </label>
              <input
                type="text"
                placeholder="yourname@upi"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }}
              />
            </div>
          )}

          {/* Cash */}
          {formData.paymentMethod === "cash" && (
            <div style={{
              backgroundColor: "#fff3e0",
              padding: "15px",
              borderRadius: "4px",
              marginBottom: "20px",
              border: "1px solid #ffe0b2"
            }}>
              <p style={{ margin: 0, color: "#e65100" }}>
                💵 Please pay ₹{paymentData.totalAmount} in cash to the driver upon booking confirmation.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#D40000",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              marginBottom: "10px"
            }}
          >
            {loading ? "Processing..." : `Pay ₹${paymentData.totalAmount}`}
          </button>

          <button
            type="button"
            onClick={onCancel}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#f5f5f5",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: "pointer"
            }}
          >
            Go Back to Dashboard
          </button>
        </form>

        {/* Security Info */}
        <div style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#666",
          textAlign: "center"
        }}>
          <p style={{ margin: "0 0 8px 0" }}>🔒 Your payment is secure and encrypted</p>
          <p style={{ margin: 0 }}>All transactions are protected by industry-standard security protocols</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
