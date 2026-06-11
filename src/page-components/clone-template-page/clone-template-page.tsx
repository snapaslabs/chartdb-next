"use client";
import { Spinner } from '@/components/spinner/spinner';
import React, { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Template } from '@/templates-data/templates-data';
import { convertTemplateToNewDiagram } from '@/templates-data/template-utils';
import type { Diagram } from '@/lib/domain/diagram';
import { useStorage } from '@/hooks/use-storage';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { StorageProvider } from '@/context/storage-context/storage-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';

interface CloneTemplateComponentProps {
    template: Template | undefined;
}

const CloneTemplateComponent: React.FC<CloneTemplateComponentProps> = ({
    template,
}) => {
    const router = useRouter();
    const { addDiagram, deleteDiagram } = useStorage();
    const clonedBefore = useRef<boolean>(false);

    const cloneTemplate = useCallback(async () => {
        if (!template) {
            return;
        }

        if (clonedBefore.current) {
            return;
        }

        clonedBefore.current = true;
        const diagram = convertTemplateToNewDiagram(template);

        await deleteDiagram(diagram.id);

        const now = new Date();
        const diagramToAdd: Diagram = {
            ...diagram,
            createdAt: now,
            updatedAt: now,
        };

        await addDiagram({ diagram: diagramToAdd });
        router.push(`/diagrams/${diagramToAdd.id}`);
    }, [addDiagram, deleteDiagram, router, template]);

    useEffect(() => {
        if (!template) {
            router.push('/templates');
        } else {
            cloneTemplate();
        }
    }, [template, router, cloneTemplate]);

    return (
        <section className="flex w-screen flex-col bg-background">
            <Spinner size={'large'} className="mt-20 text-pink-600" />
        </section>
    );
};

interface CloneTemplatePageProps {
    template: Template | undefined;
}

export const CloneTemplatePage: React.FC<CloneTemplatePageProps> = ({
    template,
}) => (
    <LocalConfigProvider>
        <StorageProvider>
            <ThemeProvider>
                <CloneTemplateComponent template={template} />
            </ThemeProvider>
        </StorageProvider>
    </LocalConfigProvider>
);
