import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";

import stripe from "../config/stripe";
import config from "../config/config";
import Order from "../models/order.model";
import { Product } from "../models/product.model";
import User from "../models/user.model";
import { successResponse, errorResponse } from "../shared/response";
import { CreatePaymentIntentInput, CreateCheckoutSessionInput, ConfirmPaymentInput } from "../Schemas/payment.schema";

// Create Payment Intent for direct payment
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { amount, currency = "usd", metadata } = req.body as CreatePaymentIntentInput;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user?._id?.toString() || "",
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    successResponse({
      res,
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      },
      message: "Payment intent created successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    errorResponse({
      res,
      message: "Failed to create payment intent",
      statusCode: 500,
    });
  }
});

// Create Checkout Session for hosted checkout
export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { items, success_url, cancel_url, customer_email, metadata } = req.body as CreateCheckoutSessionInput;
    const userId = req.user?._id?.toString();

    // Validate products exist and get current prices
    const productIds = items.map((item) => item.product_id);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      errorResponse({
        res,
        message: "One or more products not found",
        statusCode: 404,
      });
      return;
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const product = products.find((p) => p._id?.toString() === item.product_id);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.description,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: success_url || `${config.client_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${config.client_url}/payment/cancel`,
      customer_email,
      metadata: {
        userId: userId || "",
        items: JSON.stringify(items),
        ...metadata,
      },
    });

    successResponse({
      res,
      data: {
        session_id: session.id,
        url: session.url,
      },
      message: "Checkout session created successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    errorResponse({
      res,
      message: "Failed to create checkout session",
      statusCode: 500,
    });
  }
});

// Get payment intent details
export const getPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { payment_intent_id } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    successResponse({
      res,
      data: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      },
      message: "Payment intent retrieved successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Get payment intent error:", error);
    errorResponse({
      res,
      message: "Failed to retrieve payment intent",
      statusCode: 500,
    });
  }
});

// Get checkout session details
export const getCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { session_id } = req.params;

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });

    successResponse({
      res,
      data: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        customer_email: session.customer_email,
        metadata: session.metadata,
        line_items: session.line_items,
      },
      message: "Checkout session retrieved successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Get checkout session error:", error);
    errorResponse({
      res,
      message: "Failed to retrieve checkout session",
      statusCode: 500,
    });
  }
});

// Confirm payment and create order
export const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { payment_intent_id, order_id } = req.body as ConfirmPaymentInput;

    // Retrieve payment intent to verify payment
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== "succeeded") {
      errorResponse({
        res,
        message: "Payment not completed",
        statusCode: 400,
      });
      return;
    }

    // Update order status
    const order = await Order.findByIdAndUpdate(
      order_id,
      {
        isPaid: true,
        paidAt: new Date(),
        paymentMethod: "credit_card",
        status: "paid",
      },
      { new: true }
    );

    if (!order) {
      errorResponse({
        res,
        message: "Order not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      data: order,
      message: "Payment confirmed and order updated successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    errorResponse({
      res,
      message: "Failed to confirm payment",
      statusCode: 500,
    });
  }
});

// Webhook handler for Stripe events
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    errorResponse({
      res,
      message: "Webhook signature verification failed",
      statusCode: 400,
    });
    return;
  }

  try {
    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);

        // Update order if metadata contains order info
        if (paymentIntent.metadata.orderId) {
          await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
            isPaid: true,
            paidAt: new Date(),
            paymentMethod: "credit_card",
          });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);

        // Handle successful checkout session
        if (session.metadata?.userId && session.metadata?.items) {
          const items = JSON.parse(session.metadata.items);
          const userId = session.metadata.userId;

          // Create order from checkout session
          const order = new Order({
            user_id: userId,
            products: items.map((item: any) => ({
              product: item.product_id,
              quantity: item.quantity,
              priceAtPurchase: item.price,
            })),
            total: (session.amount_total || 0) / 100,
            isPaid: true,
            paidAt: new Date(),
            paymentMethod: "credit_card",
            status: "paid",
          });

          await order.save();
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);

        // Handle failed payment
        if (paymentIntent.metadata.orderId) {
          await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
            status: "cancelled",
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    successResponse({
      res,
      data: { received: true },
      message: "Webhook processed successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    errorResponse({
      res,
      message: "Webhook processing failed",
      statusCode: 500,
    });
  }
});

// Get payment methods for a customer
export const getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();

    // Find user's Stripe customer ID
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      errorResponse({
        res,
        message: "User or Stripe customer not found",
        statusCode: 404,
      });
      return;
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    successResponse({
      res,
      data: paymentMethods.data,
      message: "Payment methods retrieved successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    errorResponse({
      res,
      message: "Failed to retrieve payment methods",
      statusCode: 500,
    });
  }
});

// Create a setup intent for saving payment methods
export const createSetupIntent = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();

    // Find or create Stripe customer
    let user = await User.findById(userId);
    if (!user) {
      errorResponse({
        res,
        message: "User not found",
        statusCode: 404,
      });
      return;
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { userId: userId || "" },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    successResponse({
      res,
      data: {
        client_secret: setupIntent.client_secret,
        setup_intent_id: setupIntent.id,
      },
      message: "Setup intent created successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Create setup intent error:", error);
    errorResponse({
      res,
      message: "Failed to create setup intent",
      statusCode: 500,
    });
  }
});

// Get publishable key
export const getPublishableKey = asyncHandler(async (_req: Request, res: Response) => {
  successResponse({
    res,
    data: {
      publishable_key: config.STRIPE_PUBLISHABLE_KEY,
    },
    message: "Publishable key retrieved successfully",
    statusCode: 200,
  });
});
