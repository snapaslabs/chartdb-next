'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import { useChartDB } from '@/hooks/use-chartdb';
import { useUser } from '@/context/user-context/use-user';
import { useDialog } from '@/hooks/use-dialog';
import { Trash2, UserPlus } from 'lucide-react';
import { EmptyState } from '@/components/empty-state/empty-state';
import { Separator } from '@/components/separator/separator';

interface Collaborator {
    id: string;
    email: string;
    user_id: string | null;
}

export const CollaboratorsSection: React.FC = () => {
    const { currentDiagram } = useChartDB();
    const { session, user } = useUser();
    const { openShareDiagramDialog } = useDialog();
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(false);

    const diagramId = currentDiagram?.id;
    const token = session?.access_token;

    const fetchCollaborators = useCallback(async () => {
        if (!diagramId || !token) return;
        setLoading(true);
        const res = await fetch(`/api/diagrams/${diagramId}/collaborators`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = (await res.json()) as Collaborator[];
            setCollaborators(data);
        }
        setLoading(false);
    }, [diagramId, token]);

    useEffect(() => {
        fetchCollaborators();
    }, [fetchCollaborators]);

    const handleRemove = async (collab: Collaborator) => {
        if (!diagramId || !token) return;
        await fetch(
            `/api/diagrams/${diagramId}/collaborators/${encodeURIComponent(collab.email)}`,
            {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        await fetchCollaborators();
    };

    if (!user) {
        return (
            <section className="flex flex-1 flex-col overflow-hidden p-4">
                <EmptyState
                    title="Sign in required"
                    description="Sign in to manage diagram collaborators"
                />
            </section>
        );
    }

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden"
            data-vaul-no-drag
        >
            <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold text-foreground">
                    Collaborators
                </span>
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={openShareDiagramDialog}
                >
                    <UserPlus className="size-3.5" />
                    Add
                </Button>
            </div>
            <Separator />

            {loading ? (
                <div className="flex flex-1 items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                        Loading…
                    </span>
                </div>
            ) : collaborators.length === 0 ? (
                <EmptyState
                    title="No collaborators"
                    description="Add collaborators to share this diagram"
                    className="block mt-20"
                    secondaryAction={{
                        label: 'Add Collaborator',
                        onClick: openShareDiagramDialog,
                    }}
                />
            ) : (
                <ScrollArea className="flex-1">
                    <ul className="flex flex-col gap-1 p-2">
                        {collaborators.map((c) => (
                            <li
                                key={c.id}
                                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                            >
                                <span className="truncate text-foreground">
                                    {c.email}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-1 size-6 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemove(c)}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            )}
        </section>
    );
};
