import type {
  SidebarNavResult,
  SidebarSuperblockListItem,
} from '@/graphql/types';

type CertificationStructure = 'chaptered' | 'superblocks';

export interface SidebarModuleNode {
  id: string;
  dashedName: string;
  name: string;
  blockCount: number;
  superblockDashedName: string;
  chapterDashedName: string;
}

export interface ModuleRouteKey {
  superblockDashedName: string;
  chapterDashedName: string;
  moduleDashedName: string;
}

export interface SidebarChapterNode {
  id: string;
  dashedName: string;
  name: string;
  modules: SidebarModuleNode[];
}

export interface SidebarCertificationNode {
  id: string;
  dashedName: string;
  name: string;
  structure: CertificationStructure;
  chapters: SidebarChapterNode[];
  superblocks: SidebarSuperblockListItem[];
}

export interface SidebarTree {
  certifications: SidebarCertificationNode[];
  otherSuperblocks: SidebarSuperblockListItem[];
}

export interface FilteredSidebarChapterNode extends SidebarChapterNode {
  visibleModules: SidebarModuleNode[];
}

export interface FilteredSidebarCertificationNode extends SidebarCertificationNode {
  visibleChapters: FilteredSidebarChapterNode[];
  visibleSuperblocks: SidebarSuperblockListItem[];
}

export interface FilteredSidebarTree {
  certifications: FilteredSidebarCertificationNode[];
  otherSuperblocks: SidebarSuperblockListItem[];
}

const ACRONYMS = new Set(['api', 'css', 'html', 'json', 'sql']);

function formatDashedNameLabel(dashedName: string): string {
  const normalized = dashedName.includes('chapter-')
    ? (dashedName.split('chapter-').at(-1) ?? dashedName)
    : dashedName;

  return normalized
    .split('-')
    .filter(Boolean)
    .map((word) =>
      ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

function matchesSearch(value: string, normalizedSearch: string): boolean {
  return value.toLowerCase().includes(normalizedSearch);
}

export function getModuleHref({
  superblockDashedName,
  chapterDashedName,
  moduleDashedName,
}: ModuleRouteKey): string {
  return `/superblocks/${superblockDashedName}/chapters/${chapterDashedName}/modules/${moduleDashedName}`;
}

export function buildSidebarTree(
  data: SidebarNavResult | undefined,
  hiddenSuperblocks: ReadonlySet<string> = new Set()
): SidebarTree {
  if (!data) {
    return { certifications: [], otherSuperblocks: [] };
  }

  const superblockMap = new Map(
    data.superblocks.map((superblock) => [superblock.dashedName, superblock])
  );

  const orderedSuperblocks = data.curriculum.superblocks
    .map((dashedName) => superblockMap.get(dashedName))
    .filter(
      (superblock): superblock is SidebarSuperblockListItem =>
        superblock !== undefined &&
        !hiddenSuperblocks.has(superblock.dashedName)
    );

  const consumedSuperblocks = new Set<string>();
  const chapteredCertifications: SidebarCertificationNode[] = [];
  const superblockCertifications: SidebarCertificationNode[] = [];

  for (const certificationDashedName of data.curriculum.certifications) {
    if (hiddenSuperblocks.has(certificationDashedName)) continue;

    const certificationSuperblock = superblockMap.get(certificationDashedName);
    if (!certificationSuperblock) continue;

    if (certificationSuperblock.chapters.length > 0) {
      const chapters = certificationSuperblock.chapters
        .map((chapter) => {
          const modules = chapter.modules
            .filter((module) => !hiddenSuperblocks.has(module.dashedName))
            .map((module) => ({
              id: `${certificationSuperblock.dashedName}:${chapter.dashedName}:${module.dashedName}`,
              dashedName: module.dashedName,
              name: formatDashedNameLabel(module.dashedName),
              blockCount: module.blocks.length,
              superblockDashedName: certificationSuperblock.dashedName,
              chapterDashedName: chapter.dashedName,
            }));

          if (modules.length === 0) return null;

          return {
            id: `${certificationSuperblock.dashedName}:${chapter.dashedName}`,
            dashedName: chapter.dashedName,
            name: formatDashedNameLabel(chapter.dashedName),
            modules,
          };
        })
        .filter((chapter): chapter is SidebarChapterNode => chapter !== null);

      chapteredCertifications.push({
        id: certificationSuperblock.dashedName,
        dashedName: certificationSuperblock.dashedName,
        name: certificationSuperblock.name,
        structure: 'chaptered',
        chapters,
        superblocks: [],
      });

      consumedSuperblocks.add(certificationSuperblock.dashedName);
      continue;
    }

    superblockCertifications.push({
      id: certificationSuperblock.dashedName,
      dashedName: certificationSuperblock.dashedName,
      name: certificationSuperblock.name,
      structure: 'superblocks',
      chapters: [],
      superblocks: [certificationSuperblock],
    });

    consumedSuperblocks.add(certificationSuperblock.dashedName);
  }

  const otherSuperblocks = orderedSuperblocks.filter(
    (superblock) => !consumedSuperblocks.has(superblock.dashedName)
  );

  const certifications = [
    ...chapteredCertifications,
    ...superblockCertifications,
  ];

  return { certifications, otherSuperblocks };
}

export function filterSidebarTree(
  tree: SidebarTree,
  rawSearch: string
): FilteredSidebarTree {
  const normalizedSearch = rawSearch.trim().toLowerCase();

  if (!normalizedSearch) {
    return {
      certifications: tree.certifications.map((certification) => ({
        ...certification,
        visibleChapters: certification.chapters.map((chapter) => ({
          ...chapter,
          visibleModules: chapter.modules,
        })),
        visibleSuperblocks: certification.superblocks,
      })),
      otherSuperblocks: tree.otherSuperblocks,
    };
  }

  const certifications: FilteredSidebarCertificationNode[] = [];

  for (const certification of tree.certifications) {
    const certificationMatches =
      matchesSearch(certification.name, normalizedSearch) ||
      matchesSearch(certification.dashedName, normalizedSearch);

    if (certification.structure === 'chaptered') {
      const visibleChapters: FilteredSidebarChapterNode[] = [];

      for (const chapter of certification.chapters) {
        const chapterMatches =
          matchesSearch(chapter.name, normalizedSearch) ||
          matchesSearch(chapter.dashedName, normalizedSearch);

        const matchingModules = chapter.modules.filter(
          (module) =>
            matchesSearch(module.name, normalizedSearch) ||
            matchesSearch(module.dashedName, normalizedSearch)
        );

        if (certificationMatches || chapterMatches) {
          visibleChapters.push({
            ...chapter,
            visibleModules: chapter.modules,
          });
          continue;
        }

        if (matchingModules.length > 0) {
          visibleChapters.push({
            ...chapter,
            visibleModules: matchingModules,
          });
        }
      }

      if (!certificationMatches && visibleChapters.length === 0) continue;

      certifications.push({
        ...certification,
        visibleChapters,
        visibleSuperblocks: [],
      });
      continue;
    }

    const visibleSuperblocks = certificationMatches
      ? certification.superblocks
      : certification.superblocks.filter(
          (superblock) =>
            matchesSearch(superblock.name, normalizedSearch) ||
            matchesSearch(superblock.dashedName, normalizedSearch)
        );

    if (!certificationMatches && visibleSuperblocks.length === 0) continue;

    certifications.push({
      ...certification,
      visibleChapters: [],
      visibleSuperblocks,
    });
  }

  const otherSuperblocks = tree.otherSuperblocks.filter(
    (superblock) =>
      matchesSearch(superblock.name, normalizedSearch) ||
      matchesSearch(superblock.dashedName, normalizedSearch)
  );

  return { certifications, otherSuperblocks };
}
