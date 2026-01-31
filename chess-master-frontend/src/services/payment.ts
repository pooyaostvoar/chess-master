import { createCheckoutSession } from "./api/payments.api";

export const checkoutSlot = async (eventId: number): Promise<void> => {
  const res = await createCheckoutSession(eventId);

  const { url } = res;

  window.location.href = url;
};
