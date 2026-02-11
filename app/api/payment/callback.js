import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const data = req.body;
  
  // Ideally, you should verify the signature here using your Server Key to prevent fraud.
  
  const orderId = data.cart_id;
  const transactionRef = data.tran_ref;
  const status = data.payment_result?.response_status; // "A" = Authorized/Success

  console.log(`Received PayTabs callback for Order ${orderId}: ${status}`);

  try {
    if (status === "A") {
      // Payment Successful
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "paid",
          transactionRef: transactionRef,
          orderStatus: "processing" // Automatically move to processing
        },
      });
    } else {
      // Payment Failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "failed",
          transactionRef: transactionRef,
        },
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Callback Error:", error);
    res.status(500).send("Error updating order");
  }
}