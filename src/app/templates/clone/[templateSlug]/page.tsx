import { CloneTemplatePageNoSSR } from '../../templates-no-ssr';
import { templates } from '@/templates-data/templates-data';

interface Props {
    params: Promise<{ templateSlug: string }>;
}

export default async function Page({ params }: Props) {
    const { templateSlug } = await params;
    const template = templates.find((t) => t.slug === templateSlug);
    return <CloneTemplatePageNoSSR template={template} />;
}
