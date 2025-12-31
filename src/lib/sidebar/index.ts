/**
 * Sidebar Initialization
 *
 * Main entry point for sidebar functionality
 */

import { initCollapsibleSections } from './collapsible';
import { initKeyboardNavigation } from './keyboard';
import { initSearch } from './search';
import { initResizable } from './resizable';

export function initSidebar(searchInputId: string = 'sidebar-search'): void {
  initCollapsibleSections();
  initKeyboardNavigation(searchInputId);
  initSearch(searchInputId);
  initResizable();
}
