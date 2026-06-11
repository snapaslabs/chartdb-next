"use client";
import React from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import { useRealtime } from '@/context/realtime-context/use-realtime';

export const CollaboratorCursors: React.FC = () => {
    const { collaboratorCursors } = useRealtime();
    const { flowToScreenPosition } = useReactFlow();
    // The ReactFlow container DOM node — used to convert viewport-relative
    // coords (from flowToScreenPosition) into container-relative coords
    // that match position: absolute inside this element.
    const domNode = useStore((s) => s.domNode);

    return (
        <>
            {Object.values(collaboratorCursors).map((cursor) => {
                // flowToScreenPosition returns viewport (client) coordinates
                const viewportPos = flowToScreenPosition({
                    x: cursor.x,
                    y: cursor.y,
                });

                // Subtract the container's own offset from the viewport origin
                // so the absolute position lands at the right spot regardless
                // of where the ReactFlow panel sits on the page.
                const rect = domNode?.getBoundingClientRect();
                const left = viewportPos.x - (rect?.left ?? 0);
                const top = viewportPos.y - (rect?.top ?? 0);

                return (
                    <div
                        key={cursor.userId}
                        className="group absolute z-50 flex cursor-default items-center gap-1"
                        style={{
                            left,
                            top,
                            transform: 'translate(-2px, -2px)',
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill={cursor.color}
                            className="pointer-events-none drop-shadow-sm"
                        >
                            <path d="M0 0 L0 12 L3.5 8.5 L6 14 L7.5 13.5 L5 7.5 L9 7.5 Z" />
                        </svg>
                        <span
                            className="pointer-events-none rounded px-1 py-0.5 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                            style={{ backgroundColor: cursor.color }}
                        >
                            {cursor.userName}
                        </span>
                    </div>
                );
            })}
        </>
    );
};
