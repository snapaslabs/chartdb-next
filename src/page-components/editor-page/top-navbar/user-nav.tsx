"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/avatar/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { Button } from '@/components/button/button';

export const UserNav: React.FC = () => {
    const { user, signOut } = useUser();
    const router = useRouter();

    if (!user) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/login')}
            >
                Sign In
            </Button>
        );
    }

    const displayName: string =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email ??
        'U';
    const fallback = displayName[0].toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="size-8 cursor-pointer">
                    <AvatarImage
                        src={user.user_metadata?.avatar_url as string | undefined}
                        alt={displayName}
                    />
                    <AvatarFallback className="text-xs">
                        {fallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                    <p className="truncate font-medium leading-none">
                        {displayName}
                    </p>
                    {user.email && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
