
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/shared/glass-card";
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogIn, AlertCircle, Gamepad2 } from 'lucide-react';
import type { AuthError } from 'firebase/auth';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957272V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29H0.957272C0.347727 8.55 0 10.26 0 12C0 13.74 0.347727 15.45 0.957272 16.71L3.96409 10.71Z" fill="#FBBC05"/>
    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34545C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957272 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/'); 
    }
  }, [user, authLoading, router]);

  const handleEmailPasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result && 'code' in result) { 
        switch (result.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                 setError("Invalid email or password. Please try again.");
                 break;
            case 'auth/invalid-email':
                setError("Please enter a valid email address.");
                break;
            case 'auth/configuration-not-found':
                setError("Firebase authentication configuration is not found. Please check your Firebase setup.");
                break;
            default:
                setError(result.message || "An unexpected error occurred. Please try again.");
        }
    } else {
      // Successful login, router.push('/') will be handled by useEffect
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (result && 'code' in result) {
      switch (result.code) {
        case 'auth/popup-closed-by-user':
          setError("Sign-in process was cancelled. Please try again.");
          break;
        case 'auth/cancelled-popup-request':
          setError("Multiple sign-in attempts. Please try again.");
          break;
        case 'auth/account-exists-with-different-credential':
          setError("An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.");
          break;
        case 'auth/configuration-not-found':
          setError("Firebase authentication configuration is not found. Please check your Firebase setup, ensure Google Sign-In is enabled.");
          break;
        default:
          setError(result.message || "Google Sign-In failed. Please try again.");
      }
    } else {
       // Successful login, router.push('/') will be handled by useEffect
    }
  };
  
  if (authLoading && !user) { // Show loader only if not yet authenticated and loading
      return <div className="flex items-center justify-center min-h-screen bg-background"><AlertCircle className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (user && !authLoading) { // If user is defined and auth is not loading, useEffect handles redirect
    return <div className="flex items-center justify-center min-h-screen bg-background"><p className="text-primary-foreground">Redirecting...</p></div>;
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 font-mono">
      <GlassCard className="w-full max-w-sm p-6 md:p-8 space-y-6">
        <div className="text-center">
          <Gamepad2 className="mx-auto h-12 w-12 text-primary mb-2" />
          <h1 className="text-2xl font-pixel text-primary">Login to Pixel Progress</h1>
          <p className="text-muted-foreground text-sm">Welcome back, adventurer!</p>
        </div>

        {error && (
          <Alert variant="destructive" className="text-xs">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-xs text-primary-foreground/80">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-card/50 border-primary/30 focus:border-accent h-9 text-sm"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs text-primary-foreground/80">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-card/50 border-primary/30 focus:border-accent h-9 text-sm"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/80 h-9" disabled={loading || authLoading}>
            {loading ? <LogIn className="mr-2 h-4 w-4 animate-pulse" /> : <LogIn className="mr-2 h-4 w-4" />}
            {loading ? 'Logging In...' : 'Login'}
          </Button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full h-9 border-primary/30 hover:bg-primary/10 text-sm" onClick={handleGoogleLogin} disabled={loading || authLoading}>
          <GoogleIcon /> 
          <span className="ml-2">Google</span>
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          New to Pixel Progress?{' '}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
