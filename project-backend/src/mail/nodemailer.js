import { transporter } from "../../server.js";

const sendMail = async ({ to, subject, text, html }) => {
  const from = process.env.MAIL_FROM;
  return transporter.sendMail({ from, to, subject, text, html });
};

export const sendOrderConfirmationEmail = async (to, orderDetails) => {
  const subject = "Order Confirmation";
  const text = `Thank you for your order! Here are your order details:\n\n${orderDetails}`;
  const html = `<h1>Thank you for your order!</h1><p>Here are your order details:</p><pre>${orderDetails}</pre>`;

  try {
    await sendMail({ to, subject, text, html });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};
