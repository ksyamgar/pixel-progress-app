
"use client";

import { useState, type FormEvent } from 'react';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) {
      return <div className="flex items-center justify-center min-h-screen bg-background"><AlertCircle className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (user) {
    router.push('/'); // Redirect if already logged in
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if ('code' in result) { // It's an AuthError
        switch (result.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                 setError("Invalid email or password. Please try again.");
                 break;
            case 'auth/invalid-email':
                setError("Please enter a valid email address.");
                break;
            default:
                setError(result.message || "An unexpected error occurred. Please try again.");
        }
    } else { // It's a User object
      router.push('/');
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/80 h-9" disabled={loading}>
            {loading ? <LogIn className="mr-2 h-4 w-4 animate-pulse" /> : <LogIn className="mr-2 h-4 w-4" />}
            {loading ? 'Logging In...' : 'Login'}
          </Button>
        </form>
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
