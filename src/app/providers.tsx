"use client";
import React, { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { UserProvider } from '@/context/user-context/user-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initialize i18n on the client
        import('@/i18n/i18n');
        // Apply polyfills and Safari compat
        import('@/polyfills');
        import('@/safari-compat');
    }, []);

    return (
        <UserProvider>
            <HelmetProvider>
                <TooltipProvider>{children}</TooltipProvider>
            </HelmetProvider>
        </UserProvider>
    );
}
