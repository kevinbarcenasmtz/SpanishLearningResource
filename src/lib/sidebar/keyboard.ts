/**
 * Keyboard Navigation
 * 
 * Implements roving tabindex pattern for sidebar navigation.
 * - Single global keydown handler for both "/" search and arrow navigation
 * - Arrow keys work from anywhere on the page (focus moves to sidebar)
 * - Roving tabindex: only one item tabbable at a time
 * - Left/Right collapse/expand sections
 * - Up/Down navigate items, Home/End jump to first/last
 */

import { collapseCurrentSection, expandCurrentSection } from './collapsible';

let currentFocusedItem: HTMLElement | null = null;
let globalKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

export function initKeyboardNavigation(searchInputId: string = 'sidebar-search'): void {
  const searchInput = document.getElementById(searchInputId) as HTMLInputElement;
  const nav = searchInput?.closest('.sidebar-content')?.querySelector('.sidebar-nav');
  
  if (!nav) return;

  // Clean up previous listener to prevent duplicates
  if (globalKeydownHandler) {
    document.removeEventListener('keydown', globalKeydownHandler);
  }

  // Set up roving tabindex - only active item or first item is tabbable
  initializeTabindex(nav);

  // Create unified global handler
  globalKeydownHandler = createKeydownHandler(nav, searchInput);
  document.addEventListener('keydown', globalKeydownHandler);
}

/**
 * Initialize tabindex on all nav items
 * Only the active item (or first item if none active) gets tabindex="0"
 */
function initializeTabindex(nav: Element): void {
  const items = getVisibleNavItems(nav);
  const activeItem = nav.querySelector('.nav-item.active') as HTMLElement;
  
  // Set all to -1 first
  items.forEach((item) => {
    item.setAttribute('tabindex', '-1');
  });
  
  // Set active or first to 0
  if (activeItem) {
    activeItem.setAttribute('tabindex', '0');
    currentFocusedItem = activeItem;
  } else if (items[0]) {
    items[0].setAttribute('tabindex', '0');
    currentFocusedItem = items[0];
  }
}

/**
 * Create the main keydown handler
 */
function createKeydownHandler(nav: Element, searchInput: HTMLInputElement | null) {
  return (e: KeyboardEvent) => {
    // Skip if user is typing in an input (except for Escape)
    if (
      (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) &&
      e.key !== 'Escape'
    ) {
      return;
    }

    // "/" focuses search
    if (e.key === '/') {
      e.preventDefault();
      searchInput?.focus();
      return;
    }

    // Escape blurs search and returns to nav
    if (e.key === 'Escape' && e.target === searchInput) {
      e.preventDefault();
      searchInput?.blur();
      if (currentFocusedItem) {
        currentFocusedItem.focus();
      }
      return;
    }

    // Arrow keys and Home/End
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      return;
    }

    const target = e.target as HTMLElement;

    // Case 1: Focus is on a section header
    if (target.classList.contains('nav-section-header')) {
      handleSectionHeaderKeydown(e, target);
      return;
    }

    // Case 2: Focus is on a nav item
    if (target.hasAttribute('data-nav-item')) {
      handleNavItemKeydown(e, target);
      return;
    }

    // Case 3: Focus is elsewhere (body, main content, etc.)
    // Move focus into the sidebar
    e.preventDefault();

    // Find the visible desktop sidebar nav
    const sidebar = document.querySelector('.app-sidebar-left:not([style*="display: none"])');
    const activeNav = sidebar?.querySelector('.sidebar-nav') || document.querySelector('.sidebar-nav');
    if (!activeNav) return;

    const items = getVisibleNavItems(activeNav);
    
    if (items.length === 0) return;

    // Try to focus the active item, otherwise the stored focused item, otherwise first
    const activeItem = activeNav.querySelector('.nav-item.active') as HTMLElement;
    const targetItem = activeItem || currentFocusedItem || items[0];
    
    if (targetItem && items.includes(targetItem)) {
      setFocusedItem(targetItem);
    } else if (items[0]) {
      setFocusedItem(items[0]);
    }
  };
}

/**
 * Handle keyboard on section headers
 */
function handleSectionHeaderKeydown(e: KeyboardEvent, target: HTMLElement): void {
  // Get nav from target element, not captured variable
  const nav = target.closest('.sidebar-nav');
  if (!nav) return;

  const section = target.closest('.nav-section');
  if (!section) return;

  switch (e.key) {
    case 'ArrowRight':
      // Expand section if collapsed
      if (!section.classList.contains('expanded')) {
        e.preventDefault();
        target.click();
      }
      break;

    case 'ArrowLeft':
      // Collapse section if expanded
      if (section.classList.contains('expanded')) {
        e.preventDefault();
        target.click();
      }
      break;

    case 'ArrowDown':
      e.preventDefault();
      // If expanded, move to first item in section
      if (section.classList.contains('expanded')) {
        const firstItem = section.querySelector('.nav-item') as HTMLElement;
        if (firstItem) {
          setFocusedItem(firstItem);
          return;
        }
      }
      // Otherwise move to next section header
      const allHeaders = Array.from(nav.querySelectorAll('.nav-section-header')) as HTMLElement[];
      const currentIndex = allHeaders.indexOf(target);
      if (currentIndex < allHeaders.length - 1) {
        allHeaders[currentIndex + 1].focus();
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      const headers = Array.from(nav.querySelectorAll('.nav-section-header')) as HTMLElement[];
      const idx = headers.indexOf(target);
      if (idx > 0) {
        // Move to previous section header
        headers[idx - 1].focus();
      } else {
        // Move to last static link
        const staticLinks = nav.querySelectorAll(':scope > div:first-child [data-nav-item]');
        const lastStatic = staticLinks[staticLinks.length - 1] as HTMLElement;
        if (lastStatic) {
          setFocusedItem(lastStatic);
        }
      }
      break;

    case 'Home':
      e.preventDefault();
      const firstItem = getVisibleNavItems(nav)[0];
      if (firstItem) setFocusedItem(firstItem);
      break;

    case 'End':
      e.preventDefault();
      const items = getVisibleNavItems(nav);
      if (items[items.length - 1]) setFocusedItem(items[items.length - 1]);
      break;
  }
}

/**
 * Handle keyboard on nav items
 */
function handleNavItemKeydown(e: KeyboardEvent, target: HTMLElement): void {
  // Get nav from target element, not captured variable
  const nav = target.closest('.sidebar-nav');
  if (!nav) return;

  const items = getVisibleNavItems(nav);
  const currentIndex = items.indexOf(target);

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (currentIndex >= 0 && currentIndex < items.length - 1) {
        setFocusedItem(items[currentIndex + 1]);
      } else {
        // At last visible item (or not found) - move to first section header
        const firstHeader = nav.querySelector('.nav-section-header') as HTMLElement;
        if (firstHeader) {
          firstHeader.focus();
        }
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      if (currentIndex > 0) {
        setFocusedItem(items[currentIndex - 1]);
      } else if (currentIndex === 0) {
        // At first item - check if we're in a section
        const section = target.closest('.nav-section');
        if (section) {
          // Move to section header
          const header = section.querySelector('.nav-section-header') as HTMLElement;
          if (header) {
            header.focus();
            return;
          }
        }
        // If we're a static link at index 0, nowhere to go up
      } else {
        // currentIndex is -1 (not found), try section header
        const section = target.closest('.nav-section');
        if (section) {
          const header = section.querySelector('.nav-section-header') as HTMLElement;
          if (header) header.focus();
        }
      }
      break;

    case 'ArrowLeft':
      e.preventDefault();
      // Collapse current section and move to header
      const sectionLeft = target.closest('.nav-section');
      if (sectionLeft) {
        collapseCurrentSection(target);
        const headerLeft = sectionLeft.querySelector('.nav-section-header') as HTMLElement;
        if (headerLeft) headerLeft.focus();
      }
      break;

    case 'ArrowRight':
      e.preventDefault();
      // Expand current section (if collapsed somehow)
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
      // Let default link behavior work
      // Space on links should activate them
      if (e.key === ' ') {
        e.preventDefault();
        (target as HTMLAnchorElement).click();
      }
      break;
  }
}

/**
 * Get all visible nav items (not hidden, not in collapsed sections)
 * Includes static links (Home, About) and section items
 */
function getVisibleNavItems(container: Element): HTMLElement[] {
  const allItems = Array.from(
    container.querySelectorAll('[data-nav-item]:not(.hidden)')
  ) as HTMLElement[];
  
  return allItems.filter((item) => {
    const section = item.closest('.nav-section');
    // If not in a section (static links), always include
    if (!section) return true;
    // If in a section, only include if section is expanded
    return section.classList.contains('expanded');
  });
}

/**
 * Set focus on an item using roving tabindex pattern
 */
function setFocusedItem(item: HTMLElement): void {

  // Remove tabindex from previous item
  if (currentFocusedItem && currentFocusedItem !== item) {
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

/**
 * Clean up data-focused attribute on blur
 * Only remove if focus is moving to something outside the sidebar
 */
if (typeof document !== 'undefined') {
  document.addEventListener('focusout', (e) => {
    const target = e.target as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    // Only remove if focus is moving outside sidebar nav items
    if (target?.hasAttribute?.('data-nav-item')) {
      const isMovingToNavItem = relatedTarget?.hasAttribute?.('data-nav-item') || 
                                 relatedTarget?.closest('.sidebar-nav');
      
      // Only remove if NOT moving to another nav item
      if (!isMovingToNavItem) {
        target.removeAttribute('data-focused');
      }
    }
  });
}
