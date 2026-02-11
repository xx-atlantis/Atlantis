import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-full mb-6 bg-gray-100">
        <XCircle className="w-16 h-16 text-gray-500" />
      </div>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">Payment Cancelled</h1>

      <p className="text-gray-600 max-w-md mb-8">
        You have cancelled the payment process. No charges were made to your account.
      </p>

      <Link 
        href="/checkout" 
        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
      >
        <ArrowLeft size={18} />
        Return to Checkout
      </Link>
    </div>
  );
}