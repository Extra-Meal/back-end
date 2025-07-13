// Frontend Integration Examples for Stripe Payment

// 1. PAYMENT INTENT FLOW - For custom payment forms
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RM9bo4Fl551OK2AVH2s6lkvlE2zW0aXUnCrpvP5Zn1wX2JBgknp8vVT4MCgBiTymrh971YkdbxV7hzZKHiz1WMS00V27tySCX"
);

// Example: React Component for Payment Intent
const PaymentIntentExample = () => {
  const handlePayment = async () => {
    try {
      // Step 1: Create payment intent
      const response = await fetch("/api/payment/payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: 29.99,
          currency: "usd",
          metadata: {
            order_id: "order_12345",
          },
        }),
      });

      const { data } = await response.json();
      const { client_secret } = data;

      // Step 2: Confirm payment with Stripe
      const stripe = await stripePromise;
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement, // This would be your card element
          billing_details: {
            name: "Customer Name",
            email: "customer@example.com",
          },
        },
      });

      if (result.error) {
        console.error("Payment failed:", result.error.message);
      } else {
        console.log("Payment succeeded!", result.paymentIntent);
        // Step 3: Confirm payment on backend
        await fetch("/api/payment/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            payment_intent_id: result.paymentIntent.id,
            order_id: "order_12345",
          }),
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return <button onClick={handlePayment}>Pay with Card</button>;
};

// 2. CHECKOUT SESSION FLOW - For hosted checkout
const CheckoutSessionExample = () => {
  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/payment/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          items: [
            {
              product_id: "product_123",
              quantity: 2,
              price: 15.99,
              name: "Delicious Meal Kit",
              description: "A complete meal kit with fresh ingredients",
              image: "https://example.com/meal.jpg",
            },
          ],
          success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/payment/cancel`,
          customer_email: "customer@example.com",
        }),
      });

      const { data } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({
        sessionId: data.session_id,
      });

      if (result.error) {
        console.error("Checkout redirect failed:", result.error.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return <button onClick={handleCheckout}>Checkout with Stripe</button>;
};

// 3. SUCCESS PAGE - Handle successful payments
const PaymentSuccessPage = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    if (sessionId) {
      // Fetch session details
      fetch(`/api/payment/checkout-session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then(({ data }) => {
          console.log("Payment successful:", data);
          // Update UI to show success
        })
        .catch((error) => {
          console.error("Error fetching session:", error);
        });
    }
  }, []);

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase.</p>
    </div>
  );
};

// 4. SAVED PAYMENT METHODS - For returning customers
const SavedPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment/payment-methods", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const { data } = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const setupNewPaymentMethod = async () => {
    try {
      const response = await fetch("/api/payment/setup-intent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const { data } = await response.json();

      const stripe = await stripePromise;
      const result = await stripe.confirmCardSetup(data.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "Customer Name",
          },
        },
      });

      if (result.error) {
        console.error("Setup failed:", result.error.message);
      } else {
        console.log("Payment method saved!");
        fetchPaymentMethods(); // Refresh the list
      }
    } catch (error) {
      console.error("Setup error:", error);
    }
  };

  return (
    <div>
      <h3>Saved Payment Methods</h3>
      {paymentMethods.map((pm) => (
        <div key={pm.id}>
          **** **** **** {pm.card.last4} ({pm.card.brand})
        </div>
      ))}
      <button onClick={setupNewPaymentMethod}>Add New Payment Method</button>
    </div>
  );
};

// 5. CONFIGURATION - Get publishable key
const getStripeConfig = async () => {
  try {
    const response = await fetch("/api/payment/config");
    const { data } = await response.json();
    return data.publishable_key;
  } catch (error) {
    console.error("Error getting Stripe config:", error);
    return null;
  }
};

export { PaymentIntentExample, CheckoutSessionExample, PaymentSuccessPage, SavedPaymentMethods, getStripeConfig };
