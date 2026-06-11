'use client';
import React, { useState } from 'react';
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
import { Copy, Check } from 'lucide-react';

export interface ShareLinkDialogProps extends BaseDialogProps {}

export const ShareLinkDialog: React.FC<ShareLinkDialogProps> = ({ dialog }) => {
    const { closeShareLinkDialog } = useDialog();
    const { diagramId } = useChartDB();
    const [copied, setCopied] = useState(false);

    const diagramUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/diagrams/${diagramId}`
            : `/diagrams/${diagramId}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(diagramUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) closeShareLinkDialog();
            }}
        >
            <DialogContent className="flex flex-col gap-4" showClose>
                <DialogHeader>
                    <DialogTitle>Share Diagram Link</DialogTitle>
                    <DialogDescription>
                        Share this link with collaborators. They must be signed
                        in and added as a collaborator to view or edit this
                        diagram.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2">
                    <Input
                        value={diagramUrl}
                        readOnly
                        className="flex-1 font-mono text-xs"
                        onClick={(e) =>
                            (e.target as HTMLInputElement).select()
                        }
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <Check className="size-4 text-green-500" />
                        ) : (
                            <Copy className="size-4" />
                        )}
                    </Button>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                    <Button onClick={handleCopy}>
                        {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
