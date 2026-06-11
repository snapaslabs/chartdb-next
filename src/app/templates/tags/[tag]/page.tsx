import { TemplatesPageNoSSR } from '../../templates-no-ssr';
import { getTemplatesAndAllTags } from '@/templates-data/template-utils';

interface Props {
    params: Promise<{ tag: string }>;
}

export default async function Page({ params }: Props) {
    const { tag } = await params;
    const { templates, tags } = await getTemplatesAndAllTags({
        tag: tag.replace(/-/g, ' '),
    });
    return <TemplatesPageNoSSR templates={templates} allTags={tags} />;
}
