import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { products } from '../stripe-config';

interface CheckoutProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function Checkout({ onSuccess, onError }: CheckoutProps) {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (priceId: string, mode: 'payment' | 'subscription') => {
    try {
      setLoading(true);

      const { data: { session_url }, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`,
          mode
        }
      });

      if (error) {
        throw error;
      }

      if (session_url) {
        window.location.href = session_url;
      }

      onSuccess?.();
    } catch (e) {
      const error = e instanceof Error ? e : new Error('An error occurred');
      console.error('Checkout error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <div key={product.priceId} className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-600">{product.description}</p>
          <button
            onClick={() => handleCheckout(product.priceId, product.mode)}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  );
}