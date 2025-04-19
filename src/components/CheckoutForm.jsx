import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckout, processGameOrder } from '@/actions/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutForm({ 
  product,
  gameData,
 email,
 validateInputs
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    const snapScript = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_SCRIPT;
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
    script.async = true;
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    if (!validateInputs()) return;
    
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await createCheckout({
        productId: product.id,
        gameData,
        customerEmail: email,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      window.snap.pay(result.token, {
        onSuccess: async function(result) {
          console.log("result", result)
         
          const orderId = await result.order_id;

          toast.success("Payment successful! Processing your order...");

          
          try {
            const orderResult = await processGameOrder(orderId);
            if (orderResult.success) {
              toast.success("Order processed successfully!");
              router.push(`/check-order/${result.order_id}`);
            } else {
              toast.error("Payment successful but order processing failed. We'll process it shortly.");
              console.log("Payment successful but order processing failed. We'll process it shortly.")
              router.push(`/check-order/${result.order_id}`);
            }
          } catch (error) {
            console.error("Error processing order:", error);
            toast.error("Payment successful but there was an issue processing your order. We'll process it shortly.");
          }
        },
        onPending: function(result) {
          toast.info("Payment pending. Please complete your payment.");
        },
        onError: function(result) {
          console.log("Payment failed. Please try again.");
          toast.error("Payment failed. Please try again.");
          setIsLoading(false);
        },
        onClose: function() {
          toast.info("Payment canceled. You can try again later.");
          setIsLoading(false);
        }
      });


    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
         {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}