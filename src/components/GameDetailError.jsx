import { AlertTriangle, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

function GameDetailError() {
    return ( <div className="max-w-7xl mx-auto py-10 px-4 text-center">
        <Alert variant="destructive" className="mx-auto max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Game tidak ditemukan</AlertTitle>
          <AlertDescription>
            Game yang Anda cari tidak ditemukan atau telah dihapus.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          className="mt-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali ke Beranda
        </Button>
      </div> );
}

export default GameDetailError;