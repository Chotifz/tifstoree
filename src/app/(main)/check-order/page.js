import CheckOrderComp from "@/components/CheckOrderComp";
import { Suspense } from "react";

export default function CheckOrderPage() {
  
  return (
    <div >
    <Suspense fallback={<p>Loading...</p>}>
      <CheckOrderComp />
    </Suspense>
 
    </div>
  );
}