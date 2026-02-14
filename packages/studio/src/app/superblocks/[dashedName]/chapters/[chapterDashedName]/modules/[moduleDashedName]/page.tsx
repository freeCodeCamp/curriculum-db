'use client';

import { use } from 'react';
import { ModuleDetailPage } from '@/components/module-detail-page';

export default function NestedModuleDetailRoute({
  params,
}: {
  params: Promise<{
    dashedName: string;
    chapterDashedName: string;
    moduleDashedName: string;
  }>;
}) {
  const { dashedName, chapterDashedName, moduleDashedName } = use(params);

  return (
    <ModuleDetailPage
      superblockDashedName={dashedName}
      chapterDashedName={chapterDashedName}
      moduleDashedName={moduleDashedName}
    />
  );
}
