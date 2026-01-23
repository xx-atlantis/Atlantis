import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-full mb-6 bg-red-100">
        <AlertTriangle className="w-16 h-16 text-red-600" />
      </div>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">Payment Failed</h1>

      <p className="text-gray-600 max-w-md mb-8">
        We could not process your payment. This might be due to insufficient funds, a declined card, or a network error.
      </p>

      <div className="flex gap-4">
        <Link 
          href="/checkout" 
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          <RotateCcw size={18} />
          Try Again
        </Link>
        
        <Link 
          href="/" 
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}