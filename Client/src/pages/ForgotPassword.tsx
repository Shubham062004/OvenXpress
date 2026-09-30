import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: 'Valid email required',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      setSubmitted(true);
      if (res.data?.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
      toast({
        title: 'Request sent',
        description: res.data?.message || 'Password reset instructions have been sent.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to process request.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-soft border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Forgot Password
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a password reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Check Your Email</h3>
              <p className="text-sm text-muted-foreground">
                If an account with that email exists, we have sent instructions to reset your password.
              </p>

              {devToken && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs space-y-2 text-amber-800">
                  <p className="font-semibold">Development Mode Token:</p>
                  <p className="font-mono break-all">{devToken}</p>
                  <Button
                    size="sm"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs mt-2"
                    onClick={() => navigate(`/reset-password?token=${devToken}`)}
                  >
                    Go to Reset Password with Token
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/login')}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
