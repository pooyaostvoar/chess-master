import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { getPaymentBySession, Payment } from "../services/api/payments.api";

const PaymentResultPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) navigate("/login");
  }, [userLoading, user, navigate]);

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

  let icon: React.ReactNode;
  let title = "";
  let description = "";
  let showHome = false;
  let showRetry = false;

  if (loading) {
    title = "Checking payment status...";
  } else if (error) {
    icon = <span className="text-[#7A2E2E] text-4xl">✕</span>;
    title = "Error";
    description = error;
  } else if (!payment) {
    title = "Payment not found";
  } else if (payment.slot.status === "paid") {
    icon = (
      <svg viewBox="0 0 45 45" className="w-12 h-12 opacity-40">
        <g fill="#B8893D">
          <rect x="21" y="3" width="3" height="9" /><rect x="17" y="6" width="11" height="3" />
          <path d="M14 14 c 0 -4 4 -7 8.5 -7 s 8.5 3 8.5 7 v 8 h-17 z" />
          <rect x="13" y="22" width="19" height="3" /><path d="M11 25 h23 l-2 9 h-19 z" />
        </g>
      </svg>
    );
    title = "Waiting for master's approval";
    description = "Your payment was successful. The master will review and confirm your booking soon.";
    showHome = true;
  } else if (payment.slot.status === "booked") {
    icon = <span className="text-[#B8893D] text-4xl">✓</span>;
    title = "Session booked successfully";
    description = "The master approved your session. You're all set!";
    showHome = true;
  } else if (payment.status === "pending") {
    title = "Processing payment";
    description = "Waiting for confirmation...";
  } else if (payment.status === "failed") {
    icon = <span className="text-[#7A2E2E] text-4xl">✕</span>;
    title = "Payment failed";
    description = "Something went wrong. Please try again.";
    showRetry = true;
  } else {
    title = "Unknown payment state";
  }

  return (
    <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center p-6">
      <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-8 sm:p-10 max-w-md w-full text-center">
        {loading ? (
          <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin mx-auto mb-4" />
        ) : (
          icon && <div className="mb-5">{icon}</div>
        )}

        <h2
          className="text-lg font-medium text-[#1F1109] mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {title}
        </h2>

        {description && (
          <p className="text-[13px] text-[#6B5640] mb-6 leading-relaxed">{description}</p>
        )}

        {showHome && (
          <button
            onClick={() => navigate("/home")}
            className="bg-[#B8893D] text-[#1F1109] rounded-lg px-6 py-2.5 text-[13px] font-medium hover:bg-[#A37728] transition-colors"
          >
            Go to home page
          </button>
        )}

        {showRetry && (
          <button
            onClick={() => navigate(-1)}
            className="bg-[#B8893D] text-[#1F1109] rounded-lg px-6 py-2.5 text-[13px] font-medium hover:bg-[#A37728] transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
