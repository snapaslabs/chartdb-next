"use client";
import dynamic from 'next/dynamic';

export const TemplatesPageNoSSR = dynamic(
    () =>
        import('@/page-components/templates-page/templates-page').then(
            (m) => m.TemplatesPage
        ),
    { ssr: false }
);

export const TemplatePageNoSSR = dynamic(
    () =>
        import('@/page-components/template-page/template-page').then(
            (m) => m.TemplatePage
        ),
    { ssr: false }
);

export const CloneTemplatePageNoSSR = dynamic(
    () =>
        import(
            '@/page-components/clone-template-page/clone-template-page'
        ).then((m) => m.CloneTemplatePage),
    { ssr: false }
);
