import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma'; // Uncomment if using Prisma

export async function POST(request) {
  try {
    const data = await request.json();
    const serverKey = process.env.PAYTABS_SERVER_KEY;

    // 1. Verify the transaction status
    // 'A' means Authorized (Success)
    const isSuccess = data.payment_result.response_status === 'A';
    const orderId = data.cart_id;
    const transactionRef = data.tran_ref;

    console.log(`Payment Callback for Order ${orderId}: ${isSuccess ? 'SUCCESS' : 'FAILED'}`);

    if (isSuccess) {
      // ✅ PAYMENT SUCCESS
      // Update your database here using Prisma
      /*
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', transactionId: transactionRef }
      });
      */
    } else {
      // ❌ PAYMENT FAILED
      /*
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'FAILED' }
      });
      */
    }

    // Always return 200 to PayTabs so they stop sending the notification
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Callback Error:", error);
    return NextResponse.json({ error: "Error processing callback" }, { status: 500 });
  }
}