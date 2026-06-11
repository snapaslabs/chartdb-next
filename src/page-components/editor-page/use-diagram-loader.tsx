"use client";
import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useDialog } from '@/hooks/use-dialog';
import { useFullScreenLoader } from '@/hooks/use-full-screen-spinner';
import { useRedoUndoStack } from '@/hooks/use-redo-undo-stack';
import { useStorage } from '@/hooks/use-storage';
import { useUser } from '@/context/user-context/use-user';
import type { Diagram } from '@/lib/domain/diagram';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/toast/use-toast';

const ALL_DIAGRAM_RELATIONS = {
    includeTables: true,
    includeRelationships: true,
    includeDependencies: true,
    includeAreas: true,
    includeCustomTypes: true,
    includeNotes: true,
} as const;

export const useDiagramLoader = () => {
    const [initialDiagram, setInitialDiagram] = useState<Diagram | undefined>();
    const params = useParams<{ diagramId: string }>();
    const diagramId = params?.diagramId;
    const { config } = useConfig();
    const { loadDiagram, loadDiagramFromData, currentDiagram } = useChartDB();
    const { resetRedoStack, resetUndoStack } = useRedoUndoStack();
    const { showLoader, hideLoader } = useFullScreenLoader();
    const { openCreateDiagramDialog, openOpenDiagramDialog } = useDialog();
    const { user, authLoading } = useUser();
    const router = useRouter();
    const { listDiagrams, addDiagram: saveToLocalDB, getDiagram: getLocalDiagram, deleteDiagram: deleteLocalDiagram } = useStorage();
    const supabaseRef = useRef<SupabaseClient | null>(null);
    const currentDiagramLoadingRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!config || authLoading) return;
        if (currentDiagram?.id === diagramId) return;
        if (
            currentDiagramLoadingRef.current === (diagramId ?? '') &&
            currentDiagramLoadingRef.current !== undefined
        ) return;

        currentDiagramLoadingRef.current = diagramId ?? '';

        const loadDefaultDiagram = async () => {
            if (diagramId) {
                setInitialDiagram(undefined);
                showLoader();
                resetRedoStack();
                resetUndoStack();

                if (user) {
                    await loadWithCloudPriority(diagramId, user.id);
                } else {
                    await loadLocalOnly(diagramId);
                }
                return;
            }

            // No diagramId — resolve default or prompt user
            if (config.defaultDiagramId) {
                const diagram = await loadDiagram(config.defaultDiagramId);
                if (diagram) {
                    router.push(`/diagrams/${config.defaultDiagramId}`);
                    return;
                }
            }
            const diagrams = await listDiagrams();
            if (diagrams.length > 0) {
                openOpenDiagramDialog({ canClose: false });
            } else {
                openCreateDiagramDialog();
            }
        };

        loadDefaultDiagram();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [diagramId, config, currentDiagram?.id, user, authLoading]);

    // Authenticated: Supabase is the source of truth.
    // 1. Try cloud first — always reflects the latest collaborative state.
    // 2. Fall back to IndexedDB only if the diagram is absent from Supabase
    //    (e.g. created offline and never synced), then push it back up.
    // 3. If a row exists in Supabase but RLS blocks it, the INSERT will hit a
    //    unique-violation (23505), which we surface as an access-denied error.
    async function loadWithCloudPriority(id: string, userId: string) {
        const supabase = (supabaseRef.current ??= createClient());

        const { data: cloudData, error: cloudError } = await supabase
            .from('diagrams')
            .select('data, owner_id')
            .eq('id', id)
            .maybeSingle();

        if (cloudError) {
            console.error('[useDiagramLoader] cloud fetch failed:', cloudError);
        }

        if (cloudData?.data) {
            // Cloud has it — stamp the owner so the sidebar can gate the
            // Collaborators tab on ownership, then load into editor.
            const cloudDiagram = {
                ...(cloudData.data as Diagram),
                ownerId: cloudData.owner_id as string,
            };
            loadDiagramFromData(cloudDiagram);
            setInitialDiagram(cloudDiagram);
            hideLoader();
            void saveToLocalDB({ diagram: cloudDiagram });
            return;
        }

        // Not in Supabase — check IndexedDB
        const localDiagram = await getLocalDiagram(id, ALL_DIAGRAM_RELATIONS);

        if (localDiagram) {
            // Found locally: push back to Supabase (diagram existed only offline)
            const { error: insertError } = await supabase
                .from('diagrams')
                .insert({
                    id: localDiagram.id,
                    owner_id: userId,
                    data: localDiagram,
                    updated_at: localDiagram.updatedAt,
                    created_at: localDiagram.createdAt,
                });

            if (insertError) {
                if (insertError.code === '23505') {
                    // Row exists in Supabase but RLS blocked the SELECT — stale
                    // local copy with no cloud access (e.g. collaborator removed).
                    // Delete the local copy to break the reload loop.
                    await deleteLocalDiagram(id);
                    toast({
                        title: "You don't have access to this diagram",
                        description:
                            'Ask the diagram owner to invite you as a collaborator.',
                        variant: 'destructive',
                    });
                    router.replace('/');
                    hideLoader();
                    return;
                }
                console.error(
                    '[useDiagramLoader] failed to push local diagram to cloud:',
                    insertError
                );
            }

            const ownedDiagram = { ...localDiagram, ownerId: userId };
            loadDiagramFromData(ownedDiagram);
            setInitialDiagram(ownedDiagram);
            hideLoader();
            return;
        }

        // Not found anywhere — diagram deleted or user has no access and no local copy
        toast({
            title: 'Diagram not found',
            description:
                'This diagram may have been deleted or you may not have access to it.',
            variant: 'destructive',
        });
        router.replace('/');
        hideLoader();
    }

    // Unauthenticated: IndexedDB only. Redirect to login so the user can sign in
    // and then the cloud-first path will run on return.
    async function loadLocalOnly(id: string) {
        const diagram = await loadDiagram(id);
        if (diagram) {
            setInitialDiagram(diagram);
            hideLoader();
            return;
        }
        router.replace(`/login?redirect=/diagrams/${id}`);
        hideLoader();
    }

    return { initialDiagram };
};
