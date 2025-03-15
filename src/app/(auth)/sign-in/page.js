'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from "next/head";
import { signIn } from 'next-auth/react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const isRegistered = searchParams.get('registered') === 'true';
  const isVerified = searchParams.get('verified') === 'true';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isRegistered) {
      setStatusMessage('Akun berhasil dibuat. Silakan login.');
    } else if (isVerified) {
      setStatusMessage('Email berhasil diverifikasi. Silakan login.');
    }
  }, [isRegistered, isVerified]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      
      if (result.error) {
        throw new Error(result.error === "CredentialsSignin" ? "Email atau password tidak valid" : result.error);
      }
      
      router.push("/");
      
    } catch (error) {
      setApiError(error.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <>
      <Head>
        <title>Login | TIF Store</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 relative">
        {/* Decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"></div>
        </div>
        
        {/* Animated shapes */}
        <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-primary/5 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-accent/5 animate-pulse delay-700"></div>
        <div className="absolute top-1/3 -left-5 w-16 h-16 rounded-full bg-secondary/5 animate-pulse delay-300"></div>
        
        <div className="w-full max-w-lg z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-primary text-primary-foreground h-14 w-14 rounded-full mb-4 shadow-lg">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,6H3A2,2 0 0,0 1,8V16A2,2 0 0,0 3,18H21A2,2 0 0,0 23,16V8A2,2 0 0,0 21,6M21,16H3V8H21M6,15H8V13H10V11H8V9H6V11H4V13H6M14,15H19V13H14V11H19V9H14A2,2 0 0,0 12,11V13A2,2 0 0,0 14,15Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Login ke TIF Store</h1>
            <p className="text-muted-foreground mt-2">Masuk untuk menikmati semua fitur TIF Store</p>
          </div>

          <Card className="border-border/40 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Login</CardTitle>
              <CardDescription>
                Masukkan email dan password untuk login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusMessage && (
                <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm border border-green-300">
                  {statusMessage}
                </div>
              )}
              
              {apiError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {apiError}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                      Lupa password?
                    </Link>
                  </div>
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sedang Memproses...
                    </>
                  ) : "Login"}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Atau login dengan</span>
                </div>
              </div>
              
              {/* Social Login Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-2 px-4 rounded-md border hover:bg-gray-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Login dengan Google
              </button>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center w-full">
                <p className="text-sm text-muted-foreground">
                  Belum punya akun?{" "}
                  <Link 
                    href="/register" 
                    className="text-primary hover:underline font-medium"
                  >
                    Daftar
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}