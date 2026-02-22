import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useUser } from "../contexts/UserContext";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import {
  getPaymentBySession,
  Payment,
} from "../services/api/payments.api";
import { ConnectionDetailsExpectations } from "../components/booking/ConnectionDetailsExpectations";
import {
  MessageCircle,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const PaymentResultPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/login");
    }
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
        setError(err?.message || "Failed to load payment");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  if (!user) return null;

  let content: React.ReactNode;

  if (loading) {
    content = (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Checking payment status...</p>
      </div>
    );
  } else if (error) {
    content = (
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/home")}>Go to home</Button>
        </CardContent>
      </Card>
    );
  } else if (!payment) {
    content = (
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Payment not found</p>
          <Button onClick={() => navigate("/home")} className="mt-4">
            Go to home
          </Button>
        </CardContent>
      </Card>
    );
  } else if (payment.status === "failed") {
    content = (
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Payment failed</h2>
          <p className="text-muted-foreground mb-6">
            Something went wrong with your payment. No charges were made. Please
            try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)}>Try again</Button>
            <Button variant="outline" onClick={() => navigate("/masters")}>
              Browse masters
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } else if (payment.status === "pending") {
    content = (
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Processing payment</h2>
          <p className="text-muted-foreground">
            Waiting for confirmation. This usually takes a few seconds.
          </p>
        </CardContent>
      </Card>
    );
  } else if (payment.slot?.status === "paid") {
    // Payment successful — awaiting master approval
    content = (
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Clock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-1">
            Booking request submitted
          </h2>
          <p className="text-sm font-medium text-primary">Payment received</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Your request has been sent to the master. We&apos;ll notify you once
              they approve.
            </p>
            {payment.slot?.startTime && (
              <p className="text-sm font-medium">
                {formatDate(payment.slot.startTime)}
              </p>
            )}
          </div>

          <ConnectionDetailsExpectations />

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate("/bookings")}
            >
              View my bookings
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/chat")}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Messages
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/masters")}
              >
                Browse masters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } else if (payment.slot?.status === "booked") {
    // Master approved — confirmed
    content = (
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-1">Session confirmed</h2>
          <p className="text-sm font-medium text-green-600">You&apos;re all set</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            {payment.slot?.startTime && (
              <p className="text-sm font-medium">
                {formatDate(payment.slot.startTime)}
              </p>
            )}
            {payment.slot?.title && (
              <p className="text-sm text-muted-foreground">
                {payment.slot.title}
              </p>
            )}
          </div>

          <ConnectionDetailsExpectations />

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate("/chat")}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Open chat to coordinate
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/bookings")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View booking details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">Unknown payment state</p>
          <Button onClick={() => navigate("/home")}>Go to home</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      {content}
    </div>
  );
};

export default PaymentResultPage;
