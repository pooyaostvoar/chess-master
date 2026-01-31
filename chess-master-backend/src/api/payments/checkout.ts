import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { createCheckoutSession } from "../../services/payment";
import { AppDataSource } from "../../database/datasource";
import { Payment } from "../../database/entity/payment";

export const router = Router();

router.post("/checkout-session", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { eventId } = req.body;

    const session = await createCheckoutSession(eventId, userId);

    res.json({
      status: "success",
      url: session.url,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(400).json({
      error: (err as Error).message,
    });
  }
});

router.get(
  "/session/:sessionId",
  isAuthenticated, // optional but recommended
  async (req, res) => {
    try {
      const { sessionId } = req.params;

      const repo = AppDataSource.getRepository(Payment);

      const payment = await repo.findOne({
        where: { stripeSessionId: sessionId },
        relations: ["slot", "user"],
      });

      if (!payment) {
        return res.status(404).json({
          error: "Payment not found",
        });
      }

      // optional: ensure user owns it
      if (payment.user.id !== (req.user as any).id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json({
        status: "success",
        payment,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  }
);
