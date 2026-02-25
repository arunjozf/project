import React, { useState, useEffect } from "react";
import { bookingAPI, getToken } from "../utils/api";

const RazorpayPayment = ({ bookingId, amount, booking, onPaymentSuccess, onPaymentFail }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Login required");
      const id = bookingId || booking?.id;
      const res = await bookingAPI.createPaymentOrder(id, token);
      const data = res.data || res;
      if (data?.order_id) {
        setTimeout(() => openCheckout(data), 100);
      } else throw new Error("Order failed");
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const openCheckout = (data) => {
    if (!data.key_id || !data.order_id || !data.amount) {
      setError("Payment info missing");
      return;
    }
    const options = {
      key: data.key_id,
      amount: data.amount,
      currency: "INR",
      name: "AutoNexus",
      order_id: data.order_id,
      handler: handleSuccess,
      theme: { color: "#D40000" },
      modal: { ondismiss: () => setError("Cancelled") }
    };
    try {
      if (!window.Razorpay) throw new Error("SDK not loaded");
      new window.Razorpay(options).open();
      setLoading(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSuccess = async (res) => {
    try {
      setLoading(true);
      const token = getToken();
      const id = bookingId || booking?.id;
      const verify = await bookingAPI.verifyPayment(id, {
        razorpay_order_id: res.razorpay_order_id,
        razorpay_payment_id: res.razorpay_payment_id,
        razorpay_signature: res.razorpay_signature
      }, token);
      const result = verify.data || verify;
      if (result?.id) {
        onPaymentSuccess?.(result);
      } else throw new Error("Verification failed");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createPaymentOrder();
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "8px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>💳 Payment</h2>
        {error ? (
          <div>
            <div style={{ background: "#fee", color: "#c00", padding: "12px", borderRadius: "4px", marginBottom: "15px" }}>{error}</div>
            <button onClick={createPaymentOrder} style={{ background: "#007bff", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "10px" }}>Retry</button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>⏳</div>
            <p>Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayPayment;
