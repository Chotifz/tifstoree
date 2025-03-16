import { Info } from "lucide-react";
import { Card, CardContent } from "../ui/card";

function HowToTopUp({game}) {
    return (  <Card className="border-border/40">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Cara Top Up {game.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4">
            <div className="flex">
              <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 shrink-0">1</div>
              <div>
                <p className="font-medium">Masukkan ID</p>
                <p className="text-sm text-muted-foreground">Masukkan User ID dan Server ID (jika diperlukan)</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 shrink-0">2</div>
              <div>
                <p className="font-medium">Pilih Nominal</p>
                <p className="text-sm text-muted-foreground">Pilih nominal top up yang diinginkan</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 shrink-0">3</div>
              <div>
                <p className="font-medium">Pilih Pembayaran</p>
                <p className="text-sm text-muted-foreground">Pilih metode pembayaran yang tersedia</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 shrink-0">4</div>
              <div>
                <p className="font-medium">Selesaikan Pembayaran</p>
                <p className="text-sm text-muted-foreground">Produk akan masuk otomatis ke akun</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> );
}

export default HowToTopUp;