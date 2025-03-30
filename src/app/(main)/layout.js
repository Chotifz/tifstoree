
'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

export default function MainLayout({ children }) {

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"
    const  clientKey = process.env.MIDTRANS_CLIENT_KEY
  
    const script = document.createElement("script")
    script.src = snapScript
    script.setAttribute("data-client-key", clientKey)
    script.async = true
  
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)}
  
    }, []);
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}