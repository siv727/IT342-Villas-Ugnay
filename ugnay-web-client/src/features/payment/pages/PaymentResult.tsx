import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPaymentByRequest, type PaymentConfirmResponse } from '../api';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('request_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentData, setPaymentData] = useState<PaymentConfirmResponse | null>(null);

  useEffect(() => {
    if (!requestId) {
      setStatus('failed');
      return;
    }

    confirmPaymentByRequest(requestId)
      .then((data) => {
        if (data.payment?.status === 'PAID') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
        setPaymentData(data);
      })
      .catch(() => {
        setStatus('failed');
      });
  }, [requestId]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-900">Verifying Payment...</h2>
            <p className="text-sm text-neutral-500 mt-2">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Payment Successful!</h2>
            <p className="text-sm text-neutral-500 mt-2 mb-6">
              Your delivery fee has been paid. The manufacturer will prepare your sample order for shipment.
            </p>
            {paymentData && (
              <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-500">Status</span>
                  <span className="font-semibold text-green-600">PAID</span>
                </div>
                {requestId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Request ID</span>
                    <span className="font-semibold">#{requestId}</span>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/vendor/requests')}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              View My Requests
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Payment Not Confirmed</h2>
            <p className="text-sm text-neutral-500 mt-2 mb-6">
              We couldn't verify your payment. It may still be processing — please check back in a few minutes.
            </p>
            <button
              onClick={() => navigate('/vendor/requests')}
              className="w-full py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
            >
              Back to Requests
            </button>
          </>
        )}
      </div>
    </div>
  );
}
