/**
 * Sidebar Storage Utilities
 *
 * Manages localStorage for sidebar state
 */

export const STORAGE_KEYS = {
  width: 'sidebar-width',
  collapsed: 'sidebar-collapsed-sections',
} as const;

export function getCollapsedSections(): string[] {
  const stored = localStorage.getItem(STORAGE_KEYS.collapsed);
  return stored ? JSON.parse(stored) : [];
}

export function addCollapsedSection(sectionId: string): void {
  const collapsed = getCollapsedSections();
  if (!collapsed.includes(sectionId)) {
    collapsed.push(sectionId);
    localStorage.setItem(STORAGE_KEYS.collapsed, JSON.stringify(collapsed));
  }
}

export function removeCollapsedSection(sectionId: string): void {
  const collapsed = getCollapsedSections().filter((id) => id !== sectionId);
  localStorage.setItem(STORAGE_KEYS.collapsed, JSON.stringify(collapsed));
}
