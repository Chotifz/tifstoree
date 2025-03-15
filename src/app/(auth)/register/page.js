"use client"

import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import axios from "axios";


export default function RegisterPage() {
 

  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      if (/[^A-Za-z0-9]/.test(value)) strength += 25;
      
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
     // Basic validation
     if (!formData.name || !formData.email || !formData.password) {
      setError('Semua field wajib diisi');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password harus minimal 8 karakter');
      return;
    }
    if (passwordStrength < 75) {
      setError("Password terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi huruf besar, angka, dan simbol.");
      return;
    }
   
    setIsLoading(true);
    setError('');
    
    try {
      // Register the user
      await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      
      // Automatically sign in the user
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      
      if (result.error) {
        setError('Registrasi berhasil, namun gagal login otomatis. Silakan login manual.');
        router.push('/login');
        return;
      }
      
      // Redirect to account page
      router.push('/account');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Daftar | TIF Store</title>
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
            <h1 className="text-2xl font-bold text-foreground">Register ke TIF Store</h1>
            <p className="text-muted-foreground mt-2">Buat akun untuk menikmati semua fitur TIF Store</p>
          </div>

          <Card className="border-border/40 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Register</CardTitle>
              <CardDescription>
                Isi data dengan lengkap untuk membuat akun baru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              
              <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input 
                       id="name"
                       name="name"
                       placeholder="John Doe"
                       value={formData.name}
                       onChange={handleChange}
                       required
                    />
                </div>             
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Handphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="08xxxxxxxxxx" 
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                       id="password"
                       name="password"
                       type="password"
                       placeholder="••••••••"
                       value={formData.password}
                       onChange={handleChange}
                       required
                  />
                  {/* Password strength indicator */}
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full ${
                        passwordStrength <= 25 ? 'bg-red-500' : 
                        passwordStrength <= 50 ? 'bg-orange-500' : 
                        passwordStrength <= 75 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Password harus memiliki minimal 8 karakter, huruf besar, angka, dan simbol
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input 
                     id="confirmPassword"
                     name="confirmPassword"
                     type="password"
                     placeholder="••••••••"
                     value={formData.confirmPassword}
                     onChange={handleChange}
                     required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" name="terms" required />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Saya setuju dengan{" "}
                    <Link href="/terms" className="text-primary hover:underline font-medium">
                      Syarat & Ketentuan
                    </Link>
                  </label>
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
                  ) : "Daftar"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center w-full">
                <p className="text-sm text-muted-foreground">
                  Sudah punya akun?{" "}
                  <Link 
                    href="/login" 
                    className="text-primary hover:underline font-medium"
                  >
                    Login
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