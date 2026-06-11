'use client';
import React from 'react';
import { realtimeContext } from './realtime-context';
import { useDiagramRealtime } from '@/hooks/use-diagram-realtime';
import { RoomProvider } from '@/lib/liveblocks/liveblocks.config';
import { useChartDB } from '@/hooks/use-chartdb';
import { useUser } from '@/context/user-context/use-user';
import { colorForUser } from '@/lib/liveblocks/utils';
import { LIVEBLOCKS_ENABLED } from '@/lib/env';

// Inner component — must be inside RoomProvider to use Liveblocks hooks
const RealtimeContextBridge: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { collaboratorCursors, updateCursor } = useDiagramRealtime();
    return (
        <realtimeContext.Provider value={{ collaboratorCursors, updateCursor }}>
            {children}
        </realtimeContext.Provider>
    );
};

export const RealtimeProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { currentDiagram } = useChartDB();
    const { user } = useUser();

    // No diagram open, not signed in, or Liveblocks not configured — skip the room
    if (!LIVEBLOCKS_ENABLED || !currentDiagram?.id || !user) {
        return (
            <realtimeContext.Provider
                value={{ collaboratorCursors: {}, updateCursor: () => {} }}
            >
                {children}
            </realtimeContext.Provider>
        );
    }

    return (
        <RoomProvider
            id={`diagram-${currentDiagram.id}`}
            initialPresence={{
                userId: user.id,
                userName:
                    (user.user_metadata?.full_name as string | undefined) ??
                    user.email ??
                    'Anonymous',
                color: colorForUser(user.id),
                cursor: null,
            }}
        >
            <RealtimeContextBridge>{children}</RealtimeContextBridge>
        </RoomProvider>
    );
};
