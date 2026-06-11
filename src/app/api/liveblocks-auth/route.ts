import { Liveblocks } from '@liveblocks/node';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { colorForUser } from '@/lib/liveblocks/utils';

export async function POST(request: Request) {
    if (!process.env.LIVEBLOCKS_SECRET_KEY) {
        return NextResponse.json(
            { error: 'Liveblocks not configured' },
            { status: 503 }
        );
    }

    const liveblocks = new Liveblocks({
        secret: process.env.LIVEBLOCKS_SECRET_KEY,
    });
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { room } = (await request.json()) as { room: string };

    const session = liveblocks.prepareSession(user.id, {
        userInfo: {
            name:
                (user.user_metadata?.full_name as string | undefined) ??
                user.email ??
                'Anonymous',
            color: colorForUser(user.id),
        },
    });

    session.allow(room, session.FULL_ACCESS);

    const { body, status } = await session.authorize();
    return new Response(body, { status });
}
