import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Clock,
  CheckCircle,
  Mail,
} from "lucide-react";

const paymentFAQs = [
  {
    question: "Why was my payment declined?",
    answer: `Payment declines usually happen for one of these reasons:

1. **Insufficient funds** - Make sure your card has enough available credit/balance
2. **Card security flags** - Your bank may have flagged this as an unusual transaction
3. **Card limits** - Your card may have a daily/monthly spending limit
4. **Incorrect details** - Double-check your card number, expiry date, and CVV
5. **3D Secure failure** - You may have missed the authentication step from your card issuer

**Solution:** Try a different card (Visa or Mastercard typically work best) or contact your bank to authorize the transaction.`,
  },
  {
    question: "My payment failed but money was deducted. What should I do?",
    answer: `This sometimes happens when the bank processes the payment but our system couldn't complete the verification.

**Immediate steps:**
1. Wait 5-10 minutes - most banks automatically refund failed transactions
2. Check your subscription status in Settings → Billing
3. If you see "Active" or "Pending", your payment actually succeeded

**If money is not refunded after 24 hours:**
1. Note the payment reference ID from the failed page
2. Contact our support team with the payment ID
3. We'll verify with Razorpay and ensure you get your subscription or refund`,
  },
  {
    question: "How do I retry a failed payment?",
    answer: `You can retry payment anytime:

1. Go to Pricing page and click Subscribe again
2. Use a different card if the same one fails repeatedly
3. Wait 30 minutes if you see "Too many attempts" error

**Tips for successful retry:**
- Clear your browser cache before retrying
- Try a Visa or Mastercard if other cards keep failing
- Make sure you complete all authentication steps (3D Secure)`,
  },
  {
    question: "Which payment methods work best?",
    answer: `We accept major credit and debit cards through our secure payment processor:

**Recommended (most reliable):**
- **Visa** - Widely accepted, high success rate
- **Mastercard** - Excellent compatibility and reliability
- **American Express** - Full support for Amex cards

**Also supported:**
- **Discover** - US-based card network
- **Other major card networks** - Most international cards work fine

**Note:** While some regional cards (like Rupay) may work, Visa, Mastercard, and American Express offer the best reliability and support. For optimal experience, we recommend using one of these major card providers.`,
  },
  {
    question: "I'm getting 'Transaction Forbidden' error. What does this mean?",
    answer: `This error means your card issuer doesn't allow this type of transaction.

**Fix:**
1. Contact your card issuer's customer support
2. Ask them to enable "online transactions" for your card
3. Most banks can enable this instantly via phone or online banking

**Alternative:** Try a different card (Visa or Mastercard have fewer restrictions).`,
  },
  {
    question: "Payment is stuck on 'processing' or 'pending'",
    answer: `Pending payments usually resolve within minutes:

**Wait 5-10 minutes:**
- Most pending payments complete automatically
- Check your billing page to see if status changed to "Active"

**If still pending after 30 minutes:**
- The payment may have failed at your bank's end
- Try again with a different payment method
- Contact support with your payment ID

**You won't lose your spot:** If you started checkout, you can resume anytime.`,
  },
  {
    question: "Can I get a refund if I change my mind?",
    answer: `Yes! We offer a 7-day money-back guarantee:

**Within 7 days of first payment:**
1. Go to Settings → Billing
2. Click "Cancel Subscription"
3. Select "Cancel immediately"
4. Email support@marketview360.io with "Refund Request" in subject

**Refund timeline:**
- Refunds are processed within 5-7 business days
- Money goes back to your original payment method
- You'll receive a confirmation email once processed`,
  },
  {
    question: "My card issuer is asking for verification but I didn't receive it",
    answer: `This is a card issuer issue. Try these steps:

1. Check if your phone number/email is registered with your card issuer
2. Wait 2-3 minutes - sometimes verification codes take time to arrive
3. Check your SMS and email for the verification code
4. If still no verification code:
   - Contact your card issuer to fix notification delivery
   - Or try a different card that has working notifications`,
  },
];

export default function PaymentHelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
            <CreditCard className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Payment Troubleshooting
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Solutions for common payment issues and how to recover failed payments
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link href="/pricing" className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand transition-colors group">
            <RefreshCw className="h-6 w-6 text-brand mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Retry Payment</span>
          </Link>
          <Link href="/settings/billing" className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand transition-colors group">
            <Clock className="h-6 w-6 text-brand mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Check Status</span>
          </Link>
          <Link href="/contact?subject=Payment%20Issue" className="flex flex-col items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand transition-colors group">
            <Mail className="h-6 w-6 text-brand mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Contact Support</span>
          </Link>
        </div>

        {/* Common Error Codes */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Common Error Codes
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="font-mono text-sm text-red-500">PAYMENT_DECLINED</p>
              <p className="text-xs text-slate-500 mt-1">Bank rejected the transaction</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="font-mono text-sm text-red-500">INSUFFICIENT_FUNDS</p>
              <p className="text-xs text-slate-500 mt-1">Not enough balance</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="font-mono text-sm text-yellow-500">TRANSACTION_FORBIDDEN</p>
              <p className="text-xs text-slate-500 mt-1">Bank blocks online payments</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="font-mono text-sm text-yellow-500">RATE_LIMIT_ERROR</p>
              <p className="text-xs text-slate-500 mt-1">Too many attempts - wait 30 min</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {paymentFAQs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-sm font-medium text-slate-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Security Note */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-300">
                Your Payment Information is Secure
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                We use Razorpay, a PCI-DSS Level 1 certified payment gateway. We never store your full card details on our servers. All transactions are encrypted and processed securely.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Issue not covered here?{" "}
            <Link href="/contact?subject=Payment%20Issue" className="text-brand hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}