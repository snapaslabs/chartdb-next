"use client";
import dynamic from 'next/dynamic';

const EditorPage = dynamic(
    () =>
        import('@/page-components/editor-page/editor-page').then(
            (m) => m.EditorPage
        ),
    { ssr: false }
);

export function EditorClient() {
    return <EditorPage />;
}
