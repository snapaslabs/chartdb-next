"use client";
import dynamic from 'next/dynamic';

const ExamplesPage = dynamic(
    () =>
        import('@/page-components/examples-page/examples-page').then(
            (m) => m.ExamplesPage
        ),
    { ssr: false }
);

export default function Page() {
    return <ExamplesPage />;
}
