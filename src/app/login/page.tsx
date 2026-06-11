"use client";
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { Label } from '@/components/label/label';

type Mode = 'signin' | 'signup';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') ?? '/';
    const supabaseRef = useRef<SupabaseClient | null>(null);
    const [mode, setMode] = useState<Mode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [signUpDone, setSignUpDone] = useState(false);

    function getSupabase(): SupabaseClient {
        if (!supabaseRef.current) supabaseRef.current = createClient();
        return supabaseRef.current;
    }

    useEffect(() => {
        getSupabase().auth.getSession().then(({ data: { session } }) => {
            if (session) router.replace(redirectTo);
        });
    }, [router, redirectTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = getSupabase();

        if (mode === 'signin') {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            } else {
                router.replace(redirectTo);
            }
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
            } else {
                setSignUpDone(true);
            }
        }

        setLoading(false);
    };

    if (signUpDone) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
                <h1 className="font-primary text-2xl font-semibold tracking-tight">
                    Check your email
                </h1>
                <p className="max-w-xs text-center text-sm text-muted-foreground">
                    We sent a confirmation link to{' '}
                    <span className="font-medium text-foreground">{email}</span>.
                    Click it to activate your account.
                </p>
                <button
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => {
                        setSignUpDone(false);
                        setMode('signin');
                    }}
                >
                    Back to sign in
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="font-primary text-2xl font-semibold tracking-tight">
                    {mode === 'signin' ? 'Sign in to ChartDB' : 'Create an account'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {mode === 'signin'
                        ? 'Sign in to sync your diagrams across devices'
                        : 'Sign up to sync your diagrams across devices'}
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-xs flex-col gap-4"
            >
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={
                            mode === 'signin'
                                ? 'current-password'
                                : 'new-password'
                        }
                    />
                </div>
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                        ? mode === 'signin'
                            ? 'Signing in…'
                            : 'Creating account…'
                        : mode === 'signin'
                          ? 'Sign In'
                          : 'Sign Up'}
                </Button>
            </form>

            <div className="flex flex-col items-center gap-2">
                <button
                    type="button"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => {
                        setMode(mode === 'signin' ? 'signup' : 'signin');
                        setError('');
                    }}
                >
                    {mode === 'signin'
                        ? "Don't have an account? Sign up"
                        : 'Already have an account? Sign in'}
                </button>
                <a
                    href="/"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                    Continue without signing in
                </a>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
