// src/pages/LoginPage.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

   const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  try {
    const loggedInUser = await login({ loginIdentifier, password });

    if (loggedInUser.role === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  } catch (err: any) {
    const errorData = err.response?.data;
    if (errorData?.message) {
      setError(errorData.message);
    } else if (errorData?.title) {
      setError(errorData.title);
    } else {
      setError('Login failed. Please check your credentials and try again.');
    }
  }
};

    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="loginIdentifier">Username or Email</Label>
                            <Input
                                id="loginIdentifier"
                                type="text"
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center text-sm">
                    Don't have an account? <Link to="/register" className="underline"> Sign up</Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;