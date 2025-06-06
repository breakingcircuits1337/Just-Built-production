import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Cancel() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Cancelled</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your payment was cancelled. You will be redirected back to the homepage in a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
}