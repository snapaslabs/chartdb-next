import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

function getToken(req: NextRequest): string | null {
    const auth = req.headers.get('authorization') ?? '';
    return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: diagram } = await supabase
        .from('diagrams')
        .select('owner_id')
        .eq('id', id)
        .single();

    if (!diagram || diagram.owner_id !== userData.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: collaborators, error } = await supabase
        .from('diagram_collaborators')
        .select('id, email, user_id, added_at')
        .eq('diagram_id', id)
        .order('added_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(collaborators);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: diagram } = await supabase
        .from('diagrams')
        .select('owner_id')
        .eq('id', id)
        .single();

    if (!diagram || diagram.owner_id !== userData.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email } = (await req.json()) as { email: string };
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Look up user_id by email using admin API
    const { data: listData } = await supabase.auth.admin.listUsers();
    const matchedUser = listData?.users?.find((u) => u.email === email);

    const { error: upsertError } = await supabase
        .from('diagram_collaborators')
        .upsert(
            { diagram_id: id, email, user_id: matchedUser?.id ?? null },
            { onConflict: 'diagram_id,email' }
        );

    if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
