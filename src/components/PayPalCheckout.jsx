import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function PayPalCheckout() {
  const appointmentId = localStorage.getItem("appointmentId");

  const handleApprove = async (details) => {
    try {
      await updateDoc(
        doc(db, "appointments", appointmentId),
        {
          paymentStatus: "paid",
          status: "confirmed",
          paypalOrderId: details.id,
          paidAt: new Date(),
        }
      );

      alert("Payment Successful!");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "ASTz3XqltnPkKofBiiO8AI95qjbP-zR_AT02tbzCgrQSgFZPsTgcu9YBmRhmgc9N36kmfknWnDbU7q27",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "auto" }}>
        <h2>Complete Payment</h2>

        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "50.00",
                  },
                  description:
                    "Medical Consultation",
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order
              .capture()
              .then(handleApprove);
          }}
          onError={(err) => {
            console.error(err);
            alert("Payment failed.");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}