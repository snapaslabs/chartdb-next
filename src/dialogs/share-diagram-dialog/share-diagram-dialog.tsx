'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useDialog } from '@/hooks/use-dialog';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useChartDB } from '@/hooks/use-chartdb';
import { useUser } from '@/context/user-context/use-user';
import { Trash2 } from 'lucide-react';

interface Collaborator {
    id: string;
    email: string;
    user_id: string | null;
}

export interface ShareDiagramDialogProps extends BaseDialogProps {}

export const ShareDiagramDialog: React.FC<ShareDiagramDialogProps> = ({
    dialog,
}) => {
    const { closeShareDiagramDialog } = useDialog();
    const { currentDiagram } = useChartDB();
    const { session } = useUser();
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [addError, setAddError] = useState('');

    const diagramId = currentDiagram?.id;
    const token = session?.access_token;

    const fetchCollaborators = useCallback(async () => {
        if (!diagramId || !token) return;
        const res = await fetch(`/api/diagrams/${diagramId}/collaborators`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = (await res.json()) as Collaborator[];
            setCollaborators(data);
        }
    }, [diagramId, token]);

    useEffect(() => {
        if (!dialog.open) return;
        fetchCollaborators();
    }, [dialog.open, fetchCollaborators]);

    const handleAdd = async () => {
        if (!email.trim() || !diagramId || !token) return;
        setAddError('');
        setLoading(true);
        const res = await fetch(`/api/diagrams/${diagramId}/collaborators`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: email.trim() }),
        });
        if (res.ok) {
            setEmail('');
            await fetchCollaborators();
        } else {
            const data = (await res.json()) as { error?: string };
            setAddError(data.error ?? 'Failed to add collaborator');
        }
        setLoading(false);
    };

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

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) closeShareDiagramDialog();
            }}
        >
            <DialogContent className="flex flex-col gap-4" showClose>
                <DialogHeader>
                    <DialogTitle>Share Diagram</DialogTitle>
                    <DialogDescription>
                        Add collaborators by email. They can view and edit this
                        diagram.
                    </DialogDescription>
                </DialogHeader>

                {collaborators.length > 0 && (
                    <ul className="flex flex-col gap-1">
                        {collaborators.map((c) => (
                            <li
                                key={c.id}
                                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                            >
                                <span className="text-foreground">
                                    {c.email}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemove(c)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}

                <Input
                    type="email"
                    placeholder="collaborator@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-h-10"
                    required
                />

                {addError && (
                    <p className="text-sm text-destructive">{addError}</p>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                    <Button
                        disabled={loading || !email.trim()}
                        onClick={handleAdd}
                    >
                        {loading ? 'Adding…' : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
