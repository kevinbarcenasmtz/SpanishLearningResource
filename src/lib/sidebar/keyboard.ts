/**
 * Keyboard Navigation
 * 
 * Implements roving tabindex pattern for sidebar navigation.
 * - Only one item is tabbable at a time (tabindex="0")
 * - Arrow keys move focus between items
 * - Home/End jump to first/last
 * - Left/Right collapse/expand sections
 */

import { collapseCurrentSection, expandCurrentSection } from './collapsible';

let currentFocusedItem: HTMLElement | null = null;
let globalKeydownHandler: ((e: KeyboardEvent) => void) | null = null;
let navKeydownHandler: ((e: KeyboardEvent) => void) | null = null;
let currentNav: Element | null = null;

export function initKeyboardNavigation(searchInputId: string = 'sidebar-search'): void {
  const searchInput = document.getElementById(searchInputId) as HTMLInputElement;
  const nav = searchInput?.closest('.sidebar-content')?.querySelector('.sidebar-nav');
  
  if (!nav) return;

  // Remove previous listeners if they exist (prevents duplicates on navigation)
  if (globalKeydownHandler) {
    document.removeEventListener('keydown', globalKeydownHandler);
  }
  if (navKeydownHandler && currentNav) {
    currentNav.removeEventListener('keydown', navKeydownHandler as EventListener);
  }

  currentNav = nav;

  // Set up roving tabindex - only active item or first item is tabbable
  const items = getVisibleNavItems(nav);
  const activeItem = nav.querySelector('.nav-item.active') as HTMLElement;
  
  items.forEach((item) => {
    item.setAttribute('tabindex', '-1');
  });
  
  if (activeItem) {
    activeItem.setAttribute('tabindex', '0');
    currentFocusedItem = activeItem;
  } else if (items[0]) {
    items[0].setAttribute('tabindex', '0');
    currentFocusedItem = items[0];
  }

  // Create and store handlers
  globalKeydownHandler = handleGlobalKeydown;
  navKeydownHandler = handleNavKeydown;

  // Add listeners
  document.addEventListener('keydown', globalKeydownHandler);
  nav.addEventListener('keydown', navKeydownHandler as EventListener);
}

function handleGlobalKeydown(e: KeyboardEvent): void {
  // Skip if user is typing in an input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return;
  }

  if (e.key === '/') {
    e.preventDefault();
    const searchInput = document.querySelector('[id^="sidebar-search-"]') as HTMLInputElement;
    searchInput?.focus();
  }
}

function handleSectionHeaderKeydown(e: KeyboardEvent, target: HTMLElement): void {
  const section = target.closest('.nav-section');
  
  if (e.key === 'ArrowRight' && section && !section.classList.contains('expanded')) {
    e.preventDefault();
    target.click();
  } else if (e.key === 'ArrowLeft' && section && section.classList.contains('expanded')) {
    e.preventDefault();
    target.click();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (section?.classList.contains('expanded')) {
      const firstItem = section.querySelector('.nav-item') as HTMLElement;
      if (firstItem) {
        setFocusedItem(firstItem);
        return;
      }
    }
    const allHeaders = Array.from(document.querySelectorAll('.nav-section-header')) as HTMLElement[];
    const currentIndex = allHeaders.indexOf(target);
    if (currentIndex < allHeaders.length - 1) {
      allHeaders[currentIndex + 1].focus();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const allHeaders = Array.from(document.querySelectorAll('.nav-section-header')) as HTMLElement[];
    const currentIndex = allHeaders.indexOf(target);
    if (currentIndex > 0) {
      allHeaders[currentIndex - 1].focus();
    } else {
      // Move to last static link before sections
      const nav = target.closest('.sidebar-nav');
      const staticLinks = nav?.querySelectorAll(':scope > div:first-child .nav-item');
      const lastStatic = staticLinks?.[staticLinks.length - 1] as HTMLElement;
      if (lastStatic) setFocusedItem(lastStatic);
    }
  }
}

function handleNavKeydown(e: KeyboardEvent): void {
  const target = e.target as HTMLElement;
  
  // Handle section header keyboard interaction
  if (target.classList.contains('nav-section-header')) {
    handleSectionHeaderKeydown(e, target);
    return;
  }
  
  // Handle nav item keyboard interaction
  if (!target.hasAttribute('data-nav-item')) return;

  const nav = target.closest('.sidebar-nav');
  if (!nav) return;

  const items = getVisibleNavItems(nav);
  const currentIndex = items.indexOf(target);

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (currentIndex < items.length - 1) {
        setFocusedItem(items[currentIndex + 1]);
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      if (currentIndex > 0) {
        setFocusedItem(items[currentIndex - 1]);
      } else {
        // Move to section header
        const section = target.closest('.nav-section');
        const header = section?.querySelector('.nav-section-header') as HTMLElement;
        if (header) header.focus();
      }
      break;

    case 'ArrowLeft':
      e.preventDefault();
      collapseCurrentSection(target);
      // Move focus to section header
      const sectionLeft = target.closest('.nav-section');
      const headerLeft = sectionLeft?.querySelector('.nav-section-header') as HTMLElement;
      if (headerLeft) headerLeft.focus();
      break;

    case 'ArrowRight':
      e.preventDefault();
      expandCurrentSection(target);
      break;

    case 'Home':
      e.preventDefault();
      if (items[0]) {
        setFocusedItem(items[0]);
      }
      break;

    case 'End':
      e.preventDefault();
      if (items[items.length - 1]) {
        setFocusedItem(items[items.length - 1]);
      }
      break;

    case 'Enter':
    case ' ':
      // Let the default link behavior work
      break;
  }
}

function getVisibleNavItems(container: Element): HTMLElement[] {
  // Get ALL nav items, not just those in expanded sections
  // This includes static links (Home, About) and section items
  const allItems = Array.from(
    container.querySelectorAll('[data-nav-item]:not(.hidden)')
  ) as HTMLElement[];
  
  // Filter to only include items that are visible (not in collapsed sections)
  return allItems.filter((item) => {
    const section = item.closest('.nav-section');
    // If not in a section (static links), always include
    if (!section) return true;
    // If in a section, only include if section is expanded
    return section.classList.contains('expanded');
  });
}

function setFocusedItem(item: HTMLElement): void {
  // Remove tabindex from previous item
  if (currentFocusedItem) {
    currentFocusedItem.setAttribute('tabindex', '-1');
    currentFocusedItem.removeAttribute('data-focused');
  }

  // Set tabindex on new item and focus it
  item.setAttribute('tabindex', '0');
  item.setAttribute('data-focused', 'true');
  item.focus();
  currentFocusedItem = item;

  // Scroll into view if needed
  item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// Clean up on blur
document.addEventListener('focusout', (e) => {
  const target = e.target as HTMLElement;
  if (target.hasAttribute('data-nav-item')) {
    target.removeAttribute('data-focused');
  }
});
