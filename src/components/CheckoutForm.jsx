import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckout } from '@/actions/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CheckoutForm({ 
  product,
  gameData,
  initialEmail = '',
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(initialEmail);

  // Initialize Midtrans on component mount
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
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
      window.snap.pay(result.token);


    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // jika user sudah membayar panggil fungsi  processGameOrder()

  return (
    <Card>
      <CardContent className="p-6">
        

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address for payment receipt"
              required
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              We'll send the payment details and your receipt to this email
            </p>
          </div>

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