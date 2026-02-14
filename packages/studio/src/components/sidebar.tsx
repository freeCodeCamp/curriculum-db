'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from 'urql';
import { SIDEBAR_NAV_QUERY } from '@/graphql/queries';
import type {
  SidebarNavResult,
  SidebarSuperblockListItem,
} from '@/graphql/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  buildSidebarTree,
  filterSidebarTree,
  getModuleHref,
  type SidebarModuleNode,
} from '@/lib/sidebar-nav';
import { BookOpen, ChevronRight, FileText, Search } from 'lucide-react';

const HIDDEN_SUPERBLOCKS = new Set(['full-stack-open']);

export function Sidebar() {
  const [search, setSearch] = useState('');
  const [expandedCertifications, setExpandedCertifications] = useState<
    Record<string, boolean>
  >({});
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >({});
  const [result] = useQuery<SidebarNavResult>({
    query: SIDEBAR_NAV_QUERY,
  });
  const pathname = usePathname();

  const sidebarTree = useMemo(
    () => buildSidebarTree(result.data, HIDDEN_SUPERBLOCKS),
    [result.data]
  );
  const filteredTree = useMemo(
    () => filterSidebarTree(sidebarTree, search),
    [sidebarTree, search]
  );
  const normalizedSearch = search.trim().toLowerCase();

  const hasNoMatches =
    !result.fetching &&
    !result.error &&
    filteredTree.certifications.length === 0 &&
    filteredTree.otherSuperblocks.length === 0;

  const isSuperblockActive = (dashedName: string) =>
    pathname === `/superblocks/${dashedName}`;
  const isModuleActive = (module: SidebarModuleNode) =>
    pathname ===
    getModuleHref({
      superblockDashedName: module.superblockDashedName,
      chapterDashedName: module.chapterDashedName,
      moduleDashedName: module.dashedName,
    });

  const renderSuperblockLink = (
    superblock: SidebarSuperblockListItem,
    className?: string
  ) => (
    <Link
      key={superblock.dashedName}
      href={`/superblocks/${superblock.dashedName}`}
      className={cn(
        'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
        isSuperblockActive(superblock.dashedName) && 'bg-accent',
        className
      )}
    >
      <span className="truncate">{superblock.name}</span>
      {superblock.isCertification && (
        <Badge variant="secondary" className="ml-2 shrink-0">
          Cert
        </Badge>
      )}
    </Link>
  );

  const renderModuleItem = (module: SidebarModuleNode, className?: string) => (
    <Link
      key={module.id}
      href={getModuleHref({
        superblockDashedName: module.superblockDashedName,
        chapterDashedName: module.chapterDashedName,
        moduleDashedName: module.dashedName,
      })}
      className={cn(
        'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
        isModuleActive(module) && 'bg-accent',
        className
      )}
    >
      <span className="truncate">{module.name}</span>
      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
        {module.blockCount} block{module.blockCount === 1 ? '' : 's'}
      </span>
    </Link>
  );

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border bg-background">
      <div className="border-b border-border p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5" />
          Curriculum Studio
        </Link>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certifications and superblocks..."
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {result.fetching && (
          <p className="px-3 py-2 text-sm text-muted-foreground">Loading...</p>
        )}
        {result.error && (
          <p className="px-3 py-2 text-sm text-destructive">
            Failed to load superblocks
          </p>
        )}

        {filteredTree.certifications.length > 0 && (
          <>
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Certifications
            </p>
            {filteredTree.certifications.map((certification) => {
              const hasActiveDescendant =
                certification.structure === 'chaptered'
                  ? isSuperblockActive(certification.dashedName) ||
                    certification.visibleChapters.some((chapter) =>
                      chapter.visibleModules.some((module) =>
                        isModuleActive(module)
                      )
                    )
                  : certification.visibleSuperblocks.some((superblock) =>
                      isSuperblockActive(superblock.dashedName)
                    );

              const isExpanded =
                normalizedSearch.length > 0
                  ? true
                  : (expandedCertifications[certification.id] ??
                    hasActiveDescendant);

              return (
                <div key={certification.id} className="mb-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCertifications((prev) => ({
                        ...prev,
                        [certification.id]: !(
                          prev[certification.id] ?? hasActiveDescendant
                        ),
                      }))
                    }
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                      hasActiveDescendant && 'bg-accent'
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-90'
                      )}
                    />
                    <div className="min-w-0 text-left">
                      <p className="truncate font-medium">
                        {certification.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {certification.structure === 'chaptered'
                          ? 'Chapter based'
                          : 'Superblock based'}
                      </p>
                    </div>
                  </button>

                  {isExpanded && certification.structure === 'chaptered' && (
                    <div className="mt-1 space-y-1 pl-5">
                      {certification.visibleChapters.map((chapter) => {
                        const hasActiveModule = chapter.visibleModules.some(
                          (module) => isModuleActive(module)
                        );
                        const chapterExpanded =
                          normalizedSearch.length > 0
                            ? true
                            : (expandedChapters[chapter.id] ?? hasActiveModule);

                        return (
                          <div key={chapter.id} className="mb-1">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedChapters((prev) => ({
                                  ...prev,
                                  [chapter.id]: !(
                                    prev[chapter.id] ?? hasActiveModule
                                  ),
                                }))
                              }
                              className={cn(
                                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                                hasActiveModule && 'bg-accent'
                              )}
                            >
                              <ChevronRight
                                className={cn(
                                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                                  chapterExpanded && 'rotate-90'
                                )}
                              />
                              <span className="truncate text-left">
                                {chapter.name}
                              </span>
                            </button>

                            {chapterExpanded && (
                              <div className="mt-1 space-y-1 pl-5">
                                {chapter.visibleModules.map((module) =>
                                  renderModuleItem(module)
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isExpanded && certification.structure === 'superblocks' && (
                    <div className="mt-1 space-y-1 pl-5">
                      {certification.visibleSuperblocks.map((superblock) =>
                        renderSuperblockLink(superblock)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {filteredTree.otherSuperblocks.length > 0 && (
          <>
            <p className="mt-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Superblocks
            </p>
            {filteredTree.otherSuperblocks.map((superblock) =>
              renderSuperblockLink(superblock)
            )}
          </>
        )}

        {hasNoMatches && (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            No matches found
          </p>
        )}
      </nav>

      <div className="border-t border-border p-2">
        <Link
          href="/drafts"
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
            pathname === '/drafts' && 'bg-accent'
          )}
        >
          <FileText className="h-4 w-4" />
          Draft Changes
        </Link>
      </div>
    </aside>
  );
}
