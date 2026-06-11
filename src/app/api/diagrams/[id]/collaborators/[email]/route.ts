import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

function getToken(req: NextRequest): string | null {
    const auth = req.headers.get('authorization') ?? '';
    return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; email: string }> }
) {
    const { id, email: encodedEmail } = await params;
    const email = decodeURIComponent(encodedEmail);

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

    const { error } = await supabase
        .from('diagram_collaborators')
        .delete()
        .eq('diagram_id', id)
        .eq('email', email);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
