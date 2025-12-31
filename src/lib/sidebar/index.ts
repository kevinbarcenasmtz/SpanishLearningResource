/**
 * Sidebar Initialization
 *
 * Main entry point for sidebar functionality
 */

import { initCollapsibleSections } from './collapsible';
import { initKeyboardNavigation } from './keyboard';
import { initSearch } from './search';
import { initResizable } from './resizable';

export function initSidebar(): void {
  initCollapsibleSections();
  initKeyboardNavigation('sidebar-search-mobile');
  initSearch('sidebar-search-desktop', '#left-sidebar');
  initSearch('sidebar-search-mobile', '#left-drawer');  
  initResizable();
}