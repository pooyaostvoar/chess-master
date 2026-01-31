import { apiClient, handleApiError } from "./client";

export interface CheckoutSessionResponse {
  status: string;
  url: string;
}

/**
 * Create Stripe checkout session for booking a slot
 */
export const createCheckoutSession = async (
  eventId: number
): Promise<CheckoutSessionResponse> => {
  try {
    const response = await apiClient.post("/payments/checkout-session", {
      eventId,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export interface PaymentSlot {
  id: number;
  status: "free" | "reserved" | "booked" | "paid";
  startTime?: string;
  endTime?: string;
  title?: string | null;
}

export interface Payment {
  id: number;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  stripeSessionId: string;

  // ✅ add slot
  slot: PaymentSlot;
}

export const getPaymentBySession = async (
  sessionId: string
): Promise<Payment> => {
  try {
    const res = await apiClient.get(`/payments/session/${sessionId}`);
    return res.data.payment;
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};
