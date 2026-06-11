'use client';

import { createClient, type JsonObject } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

// Presence: per-user cursor state synced to all room members
export type Presence = {
    userId: string;
    userName: string;
    color: string;
    cursor: { x: number; y: number } | null;
};

// Broadcast events — must be JSON-serializable (no Date objects).
// Diagram is sent as a plain JsonObject; Date fields become ISO strings in transit.
// Cast back to Diagram with (event.diagram as unknown as Diagram) on receive.
export type RoomEvent = {
    type: 'DIAGRAM_UPDATE';
    senderId: string;
    diagram: JsonObject;
};

const client = createClient({
    authEndpoint: '/api/liveblocks-auth',
});

// Type parameters: <Presence, Storage, UserMeta, RoomEvent>
// Storage/UserMeta are unused here — defaults handle them.
export const {
    RoomProvider,
    useOthers,
    useMyPresence,
    useBroadcastEvent,
    useEventListener,
} = createRoomContext<
    Presence,
    Record<string, never>,
    Record<string, never>,
    RoomEvent
>(client);
