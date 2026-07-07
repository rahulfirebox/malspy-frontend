"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Checking payment...");

  useEffect(() => {
    const orderId = params.get("order_id");

    if (!orderId) {
      setStatus("Invalid order ❌");
      return;
    }

    fetch(`/api/verify-payment?order_id=${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("Subscription Activated ✅");
        } else {
          setStatus("Payment Failed ❌");
        }
      })
      .catch(() => {
        setStatus("Error verifying payment");
      });

  }, [params]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>{status}</h1>
    </div>
  );
}