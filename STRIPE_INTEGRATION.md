# Stripe Integration Documentation

## Overview

This document describes the Stripe payment integration implemented in the backend API.

## Features Implemented

### 1. Payment Intents

- Create payment intents for one-time payments
- Retrieve payment intent details
- Support for multiple currencies

### 2. Checkout Sessions

- Create hosted checkout sessions
- Support for multiple line items
- Automatic order creation on successful payment

### 3. Payment Methods

- Save and retrieve customer payment methods
- Create setup intents for saving cards

### 4. Webhooks

- Handle Stripe webhook events
- Automatic order status updates
- Payment confirmation handling

## API Endpoints

### Authentication Required

All endpoints except `/config` and `/webhook` require authentication.

### Payment Intent Endpoints

#### Create Payment Intent

```
POST /api/payment/payment-intent
```

**Body:**

```json
{
  "amount": 29.99,
  "currency": "usd",
  "metadata": {
    "order_id": "order_123"
  }
}
```

#### Get Payment Intent

```
GET /api/payment/payment-intent/:payment_intent_id
```

### Checkout Session Endpoints

#### Create Checkout Session

```
POST /api/payment/checkout-session
```

**Body:**

```json
{
  "items": [
    {
      "product_id": "product_id_here",
      "quantity": 2,
      "price": 15.99,
      "name": "Product Name",
      "description": "Product description",
      "image": "https://example.com/image.jpg"
    }
  ],
  "success_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel",
  "customer_email": "customer@example.com"
}
```

#### Get Checkout Session

```
GET /api/payment/checkout-session/:session_id
```

### Payment Confirmation

#### Confirm Payment

```
POST /api/payment/confirm-payment
```

**Body:**

```json
{
  "payment_intent_id": "pi_xxxxx",
  "order_id": "order_id_here"
}
```

### Payment Methods

#### Get Payment Methods

```
GET /api/payment/payment-methods
```

#### Create Setup Intent

```
POST /api/payment/setup-intent
```

### Configuration

#### Get Publishable Key

```
GET /api/payment/config
```

### Webhook

```
POST /api/payment/webhook
```

**Note:** This endpoint receives raw body data for signature verification.

## Frontend Integration Examples

### 1. Payment Intent Flow (React Example)

```javascript
// Install Stripe.js
// npm install @stripe/stripe-js

import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe("your_publishable_key");

// Create payment intent
const createPaymentIntent = async (amount) => {
  const response = await fetch("/api/payment/payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: amount,
      currency: "usd",
    }),
  });

  return await response.json();
};

// Confirm payment
const confirmPayment = async (clientSecret) => {
  const stripe = await stripePromise;

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: "Customer Name",
        email: "customer@example.com",
      },
    },
  });

  if (result.error) {
    console.error("Payment failed:", result.error);
  } else {
    console.log("Payment succeeded:", result.paymentIntent);
  }
};
```

### 2. Checkout Session Flow

```javascript
// Create checkout session and redirect
const createCheckoutSession = async (items) => {
  const response = await fetch("/api/payment/checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: items,
      success_url: "https://yoursite.com/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://yoursite.com/cancel",
    }),
  });

  const session = await response.json();

  // Redirect to Stripe Checkout
  const stripe = await stripePromise;
  const result = await stripe.redirectToCheckout({
    sessionId: session.data.session_id,
  });

  if (result.error) {
    console.error("Redirect failed:", result.error);
  }
};
```

## Environment Variables Required

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Webhook Configuration

### Setting up Webhooks in Stripe Dashboard

1. Go to your Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Click "Add endpoint"
4. Enter your webhook URL: `https://yourdomain.com/api/payment/webhook`
5. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
6. Copy the webhook signing secret to your environment variables

### Webhook Events Handled

- **payment_intent.succeeded**: Updates order status to paid
- **payment_intent.payment_failed**: Updates order status to cancelled
- **checkout.session.completed**: Creates new order from session data

## Database Schema Updates

### User Model

- Added `stripeCustomerId` field to store Stripe customer ID

### Order Model

- Added `stripePaymentIntentId` field
- Added `stripeSessionId` field
- Updated status enum to include "paid"
- Updated paymentMethod enum to include "stripe"

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using Stripe signatures
2. **API Authentication**: All payment endpoints (except webhook and config) require user authentication
3. **Amount Validation**: Server-side validation ensures payment amounts match expected values
4. **Idempotency**: Payment operations are designed to be idempotent

## Testing

### Using Stripe Test Cards

```
// Successful payment
4242 4242 4242 4242

// Declined payment
4000 0000 0000 0002

// Requires authentication
4000 0025 0000 3155
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

## Support

For issues with the Stripe integration:

1. Check Stripe Dashboard logs
2. Review server logs for webhook processing
3. Verify environment variables are correctly set
4. Ensure webhook endpoints are accessible from Stripe servers
