import { TemplatesPageNoSSR } from './templates-no-ssr';
import { getTemplatesAndAllTags } from '@/templates-data/template-utils';

export default async function Page() {
    const { templates, tags } = await getTemplatesAndAllTags();
    return <TemplatesPageNoSSR templates={templates} allTags={tags} />;
}
