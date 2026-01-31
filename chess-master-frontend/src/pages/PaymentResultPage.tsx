import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useUser } from "../contexts/UserContext";

import { Button } from "../components/ui/button";
import { getPaymentBySession, Payment } from "../services/api/payments.api";

const PaymentResultPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // Auth guard (same as ChatPage)
  // =========================
  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/login");
    }
  }, [userLoading, user, navigate]);

  // =========================
  // Fetch payment
  // =========================
  useEffect(() => {
    if (!sessionId) {
      setError("Missing session id");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await getPaymentBySession(sessionId);
        setPayment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  if (!user) return null;

  // =========================
  // UI States
  // =========================
  let content: React.ReactNode;

  if (loading) {
    content = (
      <div className="text-gray-500 text-lg">Checking payment status...</div>
    );
  } else if (error) {
    content = <div className="text-red-600 font-medium">❌ {error}</div>;
  } else if (!payment) {
    content = <div>Payment not found</div>;
  } else {
    // =========================
    // Business logic
    // =========================
    if (payment.slot.status === "paid") {
      content = (
        <>
          <div className="text-5xl mb-4">⏳</div>

          <h2 className="text-xl font-semibold mb-2">
            Waiting for master’s approval
          </h2>

          <p className="text-gray-500 mb-6">
            Your payment was successful. The master will review and confirm your
            booking soon.
          </p>

          <Button onClick={() => navigate("/home")}>Go to home page</Button>
        </>
      );
    } else if (payment.slot.status === "booked") {
      content = (
        <>
          <div className="text-5xl mb-4">✅</div>

          <h2 className="text-xl font-semibold mb-2">
            Session booked successfully
          </h2>

          <p className="text-gray-500 mb-6">
            The master approved your session. You're all set!
          </p>

          <Button onClick={() => navigate("/home")}>Go to home page</Button>
        </>
      );
    } else if (payment.status === "pending") {
      content = (
        <>
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-2">Processing payment</h2>
          <p className="text-gray-500">
            Waiting for confirmation from Stripe...
          </p>
        </>
      );
    } else if (payment.status === "failed") {
      content = (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Payment failed</h2>
          <p className="text-gray-500 mb-6">
            Something went wrong. Please try again.
          </p>

          <Button onClick={() => navigate(-1)}>Try again</Button>
        </>
      );
    } else {
      content = <div>Unknown payment state</div>;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      {content}
    </div>
  );
};

export default PaymentResultPage;
