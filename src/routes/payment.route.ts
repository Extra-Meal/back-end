import { Router } from "express";
import {
  createPaymentIntent,
  createCheckoutSession,
  getPaymentIntent,
  getCheckoutSession,
  confirmPayment,
  handleWebhook,
  getPaymentMethods,
  createSetupIntent,
  getPublishableKey,
} from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
  CreatePaymentIntentSchema,
  CreateCheckoutSessionSchema,
  ConfirmPaymentSchema,
} from "../Schemas/payment.schema";

const router = Router();

// Public routes
router.get("/config", getPublishableKey);
router.post("/webhook", handleWebhook); // Webhook should be before authentication

// Protected routes (require authentication)
router.use(authMiddleware); // Apply authentication to all routes below

// Payment Intent routes
router.post("/payment-intent", validate(CreatePaymentIntentSchema), createPaymentIntent);
router.get("/payment-intent/:payment_intent_id", getPaymentIntent);

// Checkout Session routes
router.post("/checkout-session", validate(CreateCheckoutSessionSchema), createCheckoutSession);
router.get("/checkout-session/:session_id", getCheckoutSession);

// Payment confirmation
router.post("/confirm-payment", validate(ConfirmPaymentSchema), confirmPayment);

// Payment Methods routes
router.get("/payment-methods", getPaymentMethods);
router.post("/setup-intent", createSetupIntent);

export default router;
