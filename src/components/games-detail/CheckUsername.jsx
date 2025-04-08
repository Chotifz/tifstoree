import { CheckCircle, Hash, Loader2, Search, User } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGameNickname } from "@/hooks/useGameNickname";

function EnhancedCheckUsername({ gameFormFields, setGameFormFields, game, setAccountVerified, setUsername, username, accountVerified }) {
  const [formErrors, setFormErrors] = useState({});
  const { nickname, isLoading, error, fetchNickname, resetNickname } = useGameNickname();
  
  // Get the game code for the provider API
  const getGameCode = (game) => {
    // Map game slugs or names to provider game codes
    const gameCodeMap = {
      'mobile-legends': 'mobile-legends',
      'free-fire': 'ff',
      'pubg-mobile': 'pubgm',
      'genshin-impact': 'gi',
      // Add more mappings as needed
    };
    
    return gameCodeMap[game.slug] || game.slug;
  };
  
  // Update form field values
  const handleFieldChange = (field, value) => {
    setGameFormFields(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset verification when user changes input
    setAccountVerified(false);
    setUsername('');
    resetNickname();
    
    // Clear error for this field if exists
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Update username when nickname is fetched
  useEffect(() => {
    if (nickname) {
      setUsername(nickname);
      setAccountVerified(true);
      toast.success(`Akun game berhasil diverifikasi: ${nickname}`);
    }
  }, [nickname, setUsername, setAccountVerified]);
  
  useEffect(() => {
    if (game) {
      // This will set default form fields based on the game type
      // You can customize this based on different game requirements
      const initialFields = {};
      
      // Most games require at least userId
      initialFields.userId = '';
      
      // Some games also need a server/zone ID
      if (game.name.toLowerCase().includes('mobile legends') || 
          game.slug === 'mobile-legends' ||
          game.name.toLowerCase().includes('mlbb')) {
        initialFields.serverId = '';
      }
      
      setGameFormFields(initialFields);
    }
  }, [game, setGameFormFields]);

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
      const gameCode = getGameCode(game);
      
      await fetchNickname({
        gameCode: gameCode,
        userId: gameFormFields.userId,
        zoneId: gameFormFields.serverId || undefined
      });
      
    } catch (error) {
      console.error('Error verifying account:', error);
      toast.error('Gagal memverifikasi akun. Silakan periksa ID yang dimasukkan.');
      setAccountVerified(false);
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
              disabled={isLoading}
              className={`mr-3 ${accountVerified ? "hidden" : ""}`}
              variant={accountVerified ? "outline" : "default"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memeriksa...
                </>
              ) : accountVerified ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
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
          
          {error && (
            <Alert className="bg-destructive/10 border-destructive/20 text-destructive mt-3">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
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

export default EnhancedCheckUsername;