"use client";
import { createContext } from 'react';
import { emptyFn } from '@/lib/utils';
import type { CursorState } from '@/hooks/use-diagram-realtime';

export interface RealtimeContext {
    collaboratorCursors: Record<string, CursorState>;
    updateCursor: (x: number, y: number) => void;
}

export const realtimeContext = createContext<RealtimeContext>({
    collaboratorCursors: {},
    updateCursor: emptyFn,
});
