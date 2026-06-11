import { TemplatesPageNoSSR } from '../templates-no-ssr';
import { getTemplatesAndAllTags } from '@/templates-data/template-utils';

export default async function Page() {
    const { templates, tags } = await getTemplatesAndAllTags({ featured: true });
    return <TemplatesPageNoSSR templates={templates} allTags={tags} />;
}
