"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { userContext } from './user-context';
import { createClient } from '@/lib/supabase/client';
import { SUPABASE_CONFIGURED } from '@/lib/env';

export const UserProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    // When Supabase is not configured there is no auth — resolve immediately.
    const [authLoading, setAuthLoading] = useState(SUPABASE_CONFIGURED);
    const supabaseRef = useRef<SupabaseClient | null>(null);

    function getSupabase(): SupabaseClient {
        if (!supabaseRef.current) {
            supabaseRef.current = createClient();
        }
        return supabaseRef.current;
    }

    useEffect(() => {
        if (!SUPABASE_CONFIGURED) return;

        const supabase = getSupabase();

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signIn = useCallback(async (provider: 'google' | 'github') => {
        if (!SUPABASE_CONFIGURED) return;
        await getSupabase().auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signOut = useCallback(async () => {
        if (!SUPABASE_CONFIGURED) return;
        await getSupabase().auth.signOut();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <userContext.Provider value={{ user, session, authLoading, signIn, signOut }}>
            {children}
        </userContext.Provider>
    );
};
