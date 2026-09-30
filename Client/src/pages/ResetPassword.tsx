import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      toast({
        title: 'Token required',
        description: 'Please provide the password reset token from your email.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.resetPassword({
        token: token.trim(),
        newPassword,
      });

      setIsSuccess(true);
      toast({
        title: 'Password reset successful',
        description: res.data?.message || 'Your password has been reset. Please sign in.',
      });
    } catch (err: any) {
      toast({
        title: 'Reset failed',
        description: err.response?.data?.message || 'Invalid or expired token.',
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
            Set New Password
          </CardTitle>
          <CardDescription>
            Enter your reset token and your new password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Password Reset Complete</h3>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully updated. You can now sign in with your new credentials.
              </p>
              <Button
                className="w-full bg-warm-orange text-white hover:bg-warm-orange/90 mt-4"
                onClick={() => navigate('/login')}
              >
                Sign In Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {!urlToken && (
                <div className="space-y-2">
                  <Label htmlFor="token">Reset Token</Label>
                  <Input
                    id="token"
                    placeholder="Paste reset token here"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
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

export default ResetPassword;
