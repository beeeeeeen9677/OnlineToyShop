import { useState, useEffect, useRef } from "react";
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import api from "../../services/api";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useSocketContext } from "../../context/socket";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Payment Modal - Webhook + WebSocket Approach
 *
 * Flow:
 * 1. User enters card details and submits
 * 2. Frontend confirms payment with Stripe API
 * 3. Payment succeeds → Frontend waits (does NOT call /confirm)
 * 4. Stripe sends webhook to backend
 * 5. Backend confirms order, emits WebSocket event to user
 * 6. Frontend receives WebSocket event → shows success
 */

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: () => void;
}

interface PaymentFormProps extends Omit<PaymentModalProps, "isOpen"> {
  canCloseRef: React.MutableRefObject<boolean>;
}

// Inner component that uses Stripe hooks
function PaymentForm({
  clientSecret,
  orderId,
  amount,
  onClose,
  onSuccess,
  canCloseRef,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const socket = useSocketContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [waitingForWebhook, setWaitingForWebhook] = useState(false);

  const { t } = useTranslation("shoppingCart");

  // Update canClose ref whenever processing/waiting state changes
  canCloseRef.current = !isProcessing && !waitingForWebhook;

  // Listen for webhook confirmation via WebSocket
  useEffect(() => {
    const handleOrderConfirmed = (data: {
      orderId: string;
      status: string;
    }) => {
      if (data.orderId === orderId && data.status === "paid") {
        console.log("Order confirmed via webhook WebSocket event");
        setPaymentSuccess(true);
        setWaitingForWebhook(false);

        // Wait a moment to show success message, then redirect to order history
        setTimeout(() => {
          onSuccess();
          //onClose();
        }, 1500);
      }
    };

    socket.on("orderConfirmed", handleOrderConfirmed);

    // Cleanup listener on unmount
    return () => {
      socket.off("orderConfirmed", handleOrderConfirmed);
    };
  }, [orderId, socket, onSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === "succeeded") {
        console.log("Waiting for webhook confirmation...");

        // Don't call confirm API - wait for webhook via WebSocket
        setWaitingForWebhook(true);

        // Timeout after 30 seconds if webhook doesn't arrive
        setTimeout(() => {
          if (!paymentSuccess) {
            setError("Confirmation timeout. Please check your order history.");
            setWaitingForWebhook(false);
            setIsProcessing(false);
          }
        }, 30000);

        // Don't set isProcessing to false - keep loading until webhook arrives
        return;
      }
    } catch (err) {
      console.error("Payment error:", err);

      // Handle different error types
      let errorMessage = "Payment failed. Please try again.";

      if (axios.isAxiosError(err)) {
        // Axios error from backend API
        errorMessage = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        // Regular Error (including Stripe errors)
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">
          {t("messages.orderSuccess")}
        </h3>
        <p className="text-gray-600">{t("messages.orderConfirmed")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
      <div>
        <h3 className="text-xl font-bold mb-2">
          {t("labels.completePayment")}
        </h3>
        <p className="text-gray-600 mb-4">
          {t("labels.amount")}:{" "}
          <span className="font-bold">${amount.toFixed(2)} HKD</span>
        </p>
      </div>

      {/* Stripe Card Element */}
      <div className="border border-gray-300 rounded-md p-4 bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Waiting for webhook message */}
      {waitingForWebhook && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span>{t("messages.processingConfirmation")}</span>
          </div>
        </div>
      )}

      {/* Test Mode Card Num */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded text-sm">
        (use 4242 4242 4242 4242 / 1234 / 123 / 00000)
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing || waitingForWebhook}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("buttons.cancel")}
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing || waitingForWebhook}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? t("buttons.processing") : t("buttons.payNow")}
        </button>
      </div>
    </form>
  );
}

// Outer component with Elements provider
export default function PaymentModal({
  isOpen,
  onClose,
  clientSecret,
  orderId,
  amount,
  onSuccess,
}: PaymentModalProps) {
  // Track whether modal can be closed (shared with PaymentForm via ref)
  const canCloseRef = useRef(true);

  const handleClose = async () => {
    // Prevent closing during payment processing or webhook wait
    if (!canCloseRef.current) {
      console.log("Cannot close modal while payment is processing");
      return;
    }

    try {
      // Cancel the pending order when user closes without paying
      await api.delete(`/orders/${orderId}`);
      console.log("Order cancelled");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      // Still close modal even if cancellation fails
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - only closeable when canClose is true */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <Elements stripe={stripePromise}>
          <PaymentForm
            clientSecret={clientSecret}
            orderId={orderId}
            amount={amount}
            onClose={handleClose}
            onSuccess={onSuccess}
            canCloseRef={canCloseRef}
          />
        </Elements>
      </div>
    </div>
  );
}
