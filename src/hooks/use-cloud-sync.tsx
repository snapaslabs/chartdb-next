'use client';
import { useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/context/user-context/use-user';
import { useChartDB } from '@/hooks/use-chartdb';
import { useStorage } from '@/hooks/use-storage';
import type { Diagram } from '@/lib/domain/diagram';

export function useCloudSync() {
    const { user, session } = useUser();
    const { currentDiagram, applyRemoteUpdate } = useChartDB();
    const db = useStorage();
    const supabaseRef = useRef<SupabaseClient | null>(null);
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevUserIdRef = useRef<string | null>(null);

    function getSupabase(): SupabaseClient {
        if (!supabaseRef.current) supabaseRef.current = createClient();
        return supabaseRef.current;
    }

    // Persist a diagram to Supabase. For existing diagrams (owned or shared),
    // UPDATE only the content columns — never owner_id. Only INSERT when the
    // row doesn't exist yet (i.e. a new diagram created by this user).
    async function persistDiagram(diagram: Diagram, userId: string) {
        const supabase = getSupabase();

        const { data: updated, error: updateError } = await supabase
            .from('diagrams')
            .update({
                data: diagram,
                updated_at: diagram.updatedAt,
            })
            .eq('id', diagram.id)
            .select('id');

        if (updateError) {
            console.error('[useCloudSync] update failed:', updateError);
            return;
        }

        if (!updated || updated.length === 0) {
            // Row doesn't exist yet — INSERT as a new diagram owned by this user
            const { error: insertError } = await supabase
                .from('diagrams')
                .insert({
                    id: diagram.id,
                    owner_id: userId,
                    data: diagram,
                    updated_at: diagram.updatedAt,
                    created_at: diagram.createdAt,
                });

            if (insertError) {
                console.error('[useCloudSync] insert failed:', insertError);
            }
        }
    }

    // Debounced persist — 2s after any diagram change
    useEffect(() => {
        if (!user?.id || !session || !currentDiagram?.id) return;
        clearTimeout(syncTimeoutRef.current ?? undefined);
        syncTimeoutRef.current = setTimeout(() => {
            void persistDiagram(currentDiagram, user.id);
        }, 2000);

        return () => clearTimeout(syncTimeoutRef.current ?? undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDiagram?.updatedAt, user?.id]);

    // Startup sync — run once per sign-in session
    useEffect(() => {
        if (!user?.id || !session || prevUserIdRef.current === user.id) return;
        prevUserIdRef.current = user.id;

        async function syncOnSignIn() {
            if (!user) return;
            const supabase = getSupabase();

            const { data: cloudRows, error: fetchError } = await supabase
                .from('diagrams')
                .select('id, data, updated_at');

            if (fetchError) {
                console.error('[useCloudSync] failed to fetch cloud diagrams:', fetchError);
                return;
            }

            const localDiagrams = await db.listDiagrams();
            const localById = Object.fromEntries(
                localDiagrams.map((d) => [d.id, d])
            );

            for (const row of cloudRows ?? []) {
                const cloudUpdatedAt = new Date(row.updated_at as string);
                const local = localById[row.id];

                if (!local || cloudUpdatedAt > new Date(local.updatedAt)) {
                    if (row.id === currentDiagram?.id) {
                        applyRemoteUpdate(row.data as Diagram);
                    } else {
                        await db.addDiagram({ diagram: row.data as Diagram });
                    }
                }
            }

            // Push local-only diagrams to cloud
            const cloudIds = new Set(
                (cloudRows ?? []).map((r) => r.id as string)
            );
            for (const local of localDiagrams) {
                if (cloudIds.has(local.id)) continue;
                const full = await db.getDiagram(local.id, {
                    includeRelationships: true,
                    includeTables: true,
                    includeDependencies: true,
                    includeAreas: true,
                    includeCustomTypes: true,
                    includeNotes: true,
                });
                if (!full) continue;
                await persistDiagram(full, user.id);
            }
        }

        syncOnSignIn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);
}
