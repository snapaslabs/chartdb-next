"use client";
import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { emptyFn } from '@/lib/utils';

export interface UserContext {
    user: User | null;
    session: Session | null;
    authLoading: boolean;
    signIn: (provider: 'google' | 'github') => Promise<void>;
    signOut: () => Promise<void>;
}

export const userContext = createContext<UserContext>({
    user: null,
    session: null,
    authLoading: true,
    signIn: emptyFn,
    signOut: emptyFn,
});
