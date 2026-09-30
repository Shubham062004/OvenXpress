import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type UnknownError = unknown;

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function extractErrorMessage(err: UnknownError): string {
  // axios error shape often: { response: { data: { message }}, message }
  if (!isPlainObject(err)) {
    return typeof err === 'string' ? err : 'Unknown error';
  }
  const maybeResponse = err['response'];
  if (isPlainObject(maybeResponse)) {
    const data = maybeResponse['data'];
    if (isPlainObject(data)) {
      const m = data['message'];
      if (typeof m === 'string' && m.length) return m;
    }
  }
  const topMessage = err['message'];
  if (typeof topMessage === 'string') return topMessage;
  return 'Network or server error';
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: 'Validation Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        toast({ title: 'Signed in', description: 'Welcome back!' });
        navigate('/', { replace: true });
      } else {
        toast({ title: 'Login failed', description: 'Invalid credentials or server error', variant: 'destructive' });
      }
    } catch (err: UnknownError) {
      const message = extractErrorMessage(err);
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4">
            <img
              src="/oven-express-logo.png"
              alt="Oven Xpress"
              className="h-12 w-auto mx-auto"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Oven Xpress account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-warm-orange hover:text-warm-orange/90 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-warm-orange hover:bg-warm-orange/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-warm-orange hover:text-warm-orange/90 font-medium">Sign up</Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Home</Link>
          </div>

          <div className="mt-6 p-3 bg-muted rounded-md text-xs text-muted-foreground text-center">
            <p className="font-medium text-foreground">Welcome to Oven Xpress Customer Ordering</p>
            <p className="mt-0.5">Discover our freshly baked oven delights delivered to your doorstep.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
