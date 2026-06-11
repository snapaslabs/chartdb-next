'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    useOthers,
    useMyPresence,
    useBroadcastEvent,
    useEventListener,
    type Presence,
    type RoomEvent,
} from '@/lib/liveblocks/liveblocks.config';
import { useUser } from '@/context/user-context/use-user';
import { useChartDB } from '@/hooks/use-chartdb';
import type { Diagram } from '@/lib/domain/diagram';

export type CursorState = Omit<Presence, 'cursor'> & {
    x: number;
    y: number;
};

export function useDiagramRealtime() {
    const { user } = useUser();
    const { currentDiagram, applyRemoteUpdate } = useChartDB();
    const broadcast = useBroadcastEvent();
    const others = useOthers();
    const [, updateMyPresence] = useMyPresence();
    const broadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    // Receive diagram updates from collaborators.
    // diagram arrives as JsonObject (Date fields are ISO strings after JSON transit).
    useEventListener(({ event }: { event: RoomEvent }) => {
        if (event.type === 'DIAGRAM_UPDATE' && event.senderId !== user?.id) {
            applyRemoteUpdate(event.diagram as unknown as Diagram);
        }
    });

    // Broadcast local diagram changes, debounced 500ms
    useEffect(() => {
        if (!user?.id || !currentDiagram?.updatedAt) return;
        clearTimeout(broadcastTimeoutRef.current ?? undefined);
        broadcastTimeoutRef.current = setTimeout(() => {
            broadcast({
                type: 'DIAGRAM_UPDATE',
                senderId: user.id,
                // Cast needed because Diagram has Date fields; they serialize
                // to ISO strings over the wire and are cast back on receive.
                diagram:
                    currentDiagram as unknown as import('@liveblocks/client').JsonObject,
            });
        }, 500);
        return () => clearTimeout(broadcastTimeoutRef.current ?? undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDiagram?.updatedAt, user?.id]);

    // Map others' presence into the CursorState shape the canvas expects
    const collaboratorCursors = useMemo(() => {
        const cursors: Record<string, CursorState> = {};
        for (const other of others) {
            const p = other.presence;
            if (p.cursor) {
                cursors[p.userId] = {
                    userId: p.userId,
                    userName: p.userName,
                    color: p.color,
                    x: p.cursor.x,
                    y: p.cursor.y,
                };
            }
        }
        return cursors;
    }, [others]);

    const updateCursor = useCallback(
        (x: number, y: number) => {
            updateMyPresence({ cursor: { x, y } });
        },
        [updateMyPresence]
    );

    return { collaboratorCursors, updateCursor };
}
