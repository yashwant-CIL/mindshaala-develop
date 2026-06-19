import { useState } from 'react';
import { ArrowLeft, Calendar, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface MySubscriptionsProps {
  onBack: () => void;
}

export function MySubscriptions({ onBack }: MySubscriptionsProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const paymentHistory = [
    {
      invoiceId: 'INV-001234',
      date: '10 Aug 2025',
      plan: 'Board Achiever Plan (1 Year)',
      amount: '₹4,999',
      status: 'Paid',
    },
    {
      invoiceId: 'INV-000982',
      date: '15 Jul 2025',
      plan: 'Monthly Trial',
      amount: '₹499',
      status: 'Paid',
    },
  ];

  const handleCancelSubscription = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    alert('Subscription cancelled. You will have access until the end of your billing period.');
    setShowCancelConfirm(false);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div>
          <h1 className="text-2xl text-gray-900">My Subscriptions</h1>
          <p className="text-sm text-gray-500">Manage your plans, billing, and invoices.</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className=" mx-auto space-y-6">
          {/* Current Plan & Next Payment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg text-gray-900 mb-1">Board Achiever Plan</h2>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Active Subscription</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Annual
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan Validity</span>
                  <span className="text-gray-900">240 days remaining</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '66%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Started: 10 Aug 2025</span>
                  <span>Expires: 10 Aug 2026</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Renew Plan
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Upgrade
                </button>
              </div>
            </div>

            {/* Next Payment */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg text-gray-900 mb-4">Next Payment</h2>
              <p className="text-sm text-gray-500 mb-6">View next billing details.</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 mb-1">Due on 10 Aug 2026</p>
                    <p className="text-xs text-gray-600 mb-2">Amount: ₹4,999</p>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle className="w-3 h-3 text-orange-600" />
                      <span className="text-orange-600">Auto-renewal is currently enabled.</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCancelSubscription}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg text-gray-900">Payment History</h2>
              <p className="text-sm text-gray-500">View and download past invoices.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs text-gray-600">Invoice ID</th>
                    <th className="text-left py-3 px-4 text-xs text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-xs text-gray-600">Plan</th>
                    <th className="text-left py-3 px-4 text-xs text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-xs text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-xs text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900">{payment.invoiceId}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{payment.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{payment.plan}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{payment.amount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 hover:text-blue-700 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plan Features */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-base text-gray-900 mb-4">Your Current Plan Includes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Unlimited practice tests</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">AI-powered doubt solving</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Personalized study plans</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Live doubt sessions</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Performance analytics</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Access to 50,000+ questions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg text-gray-900 mb-2">Cancel Subscription?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period (10 Aug 2026).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Keep Subscription
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
