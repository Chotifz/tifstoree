import { CheckCircle, Hash, Loader2, Search, User } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function CheckUsername({gameFormFields, setGameFormFields, game, accountVerified, setAccountVerified, setUsername, username}) {
    const [formErrors, setFormErrors] = useState({});
    const [verifyingAccount, setVerifyingAccount] = useState(false);
    


  
    // Update form field values
    const handleFieldChange = (field, value) => {
        setGameFormFields(prev => ({
        ...prev,
        [field]: value
        }));
        
        // Reset verification when user changes input
        setAccountVerified(false);
        setUsername('');
        
        // Clear error for this field if exists
        if (formErrors[field]) {
        setFormErrors(prev => ({
            ...prev,
            [field]: ''
        }));
        }
    };
    useEffect(() => {
        if (game) {
          // This will set default form fields based on the game type
          // You can customize this based on different game requirements
          const initialFields = {};
          
          // Most games require at least userId
          initialFields.userId = '';
          
          // Some games also need a server/zone ID
          if (game.name.toLowerCase().includes('mobile legends') || 
              game.name.toLowerCase().includes('mlbb')) {
            initialFields.serverId = '';
          }
          
          setGameFormFields(initialFields);
        }
      }, [game]);



    const verifyGameAccount = async () => {
        // Validate that required fields are filled
        const errors = {};
        Object.keys(gameFormFields).forEach(field => {
          if (!gameFormFields[field] || gameFormFields[field].trim() === '') {
            errors[field] = `${field === 'userId' ? 'User ID' : 'Server ID'} harus diisi`;
          }
        });
        
        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          return;
        }
        
        try {
          setVerifyingAccount(true);
          
          // In a real implementation, you would call your backend API to verify the account
          // For this example, we'll simulate an API call with a timeout
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulate a successful response with username
          // In production, this would come from your API
          const mockUsername = `Player_${gameFormFields.userId}`;
          setUsername(mockUsername);
          setAccountVerified(true);
          toast.success(`Akun game berhasil diverifikasi: ${mockUsername}`);
        } catch (error) {
          console.error('Error verifying account:', error);
          toast.error('Gagal memverifikasi akun. Silakan periksa ID yang dimasukkan.');
          setAccountVerified(false);
        } finally {
          setVerifyingAccount(false);
        }
      };
    return (
    <Card className="border-border/40">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">1. Masukkan ID Game</h2>
          
          <div className="space-y-4">
            {Object.keys(gameFormFields).map(field => {
              // Format field label for display
              const formattedFieldName = field === 'userId' 
                ? 'User ID' 
                : field === 'serverId' 
                  ? 'Server ID' 
                  : field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              
              // Icon based on field type
              let FieldIcon = User;
              if (field.toLowerCase().includes('server')) FieldIcon = Hash;
              
              return (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="flex items-center text-sm">
                    <FieldIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formattedFieldName}
                  </Label>
                  
                  <Input 
                    id={field}
                    value={gameFormFields[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    placeholder={`Masukkan ${formattedFieldName}`}
                    className={formErrors[field] ? "border-destructive" : ""}
                  />
                  
                  {formErrors[field] && (
                    <p className="text-destructive text-xs">{formErrors[field]}</p>
                  )}
                </div>
              );
            })}
            
            <div className="flex items-center mt-4">
              <Button 
                onClick={verifyGameAccount} 
                disabled={verifyingAccount}
                className={`mr-3 ${accountVerified ? "hidden" : ""}`}
                variant={accountVerified ? "outline" : "default"}
              >
                {verifyingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memeriksa...
                  </>
                ) : accountVerified ? (
                  <>
                    <CheckCircle className="h-4 w-4  text-green-500" />
                
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Verifikasi Akun
                  </>
                )}
              </Button>
              
              {accountVerified && (
                <p className="text-sm text-green-700 dark:text-green-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Username: {username}
                </p>
              )}
            </div>
            
            {game && game.name && (
              <Alert className="bg-muted/40 border-muted mt-3">
                <AlertDescription>
                  {game.name.toLowerCase().includes('mobile legends') ? (
                    <span>
                      Untuk Mobile Legends, silakan masukkan User ID dan Server ID Anda. 
                      Anda dapat menemukannya di profil game (contoh: 12345678 (9876)).
                    </span>
                  ) : (
                    <span>
                      Pastikan Anda memasukkan User ID dengan benar untuk menghindari 
                      kesalahan transaksi.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      );
}

export default CheckUsername;