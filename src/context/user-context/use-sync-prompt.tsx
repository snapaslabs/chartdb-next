"use client";
import React, { useEffect, useRef } from 'react';
import { useUser } from './use-user';
import { useChartDB } from '@/hooks/use-chartdb';
import { toast } from '@/components/toast/use-toast';
import { ToastAction } from '@/components/toast/toast';

export function useSyncPrompt() {
    const { user } = useUser();
    const { currentDiagram } = useChartDB();
    const mountedRef = useRef(false);
    const promptShownRef = useRef(false);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }
        if (user || promptShownRef.current || !currentDiagram?.id) return;

        promptShownRef.current = true;
        toast({
            title: 'Sync across devices',
            description:
                'Sign in to keep your diagrams synced across devices.',
            action: (
                <ToastAction
                    altText="Sign in"
                    onClick={() => {
                        window.location.href = '/login';
                    }}
                >
                    Sign In
                </ToastAction>
            ),
            duration: 8000,
        });
    }, [currentDiagram?.updatedAt, user, currentDiagram?.id]);
}
