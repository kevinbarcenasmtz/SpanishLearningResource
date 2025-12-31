/**
 * Resizable Sidebar
 *
 * Handles drag-to-resize functionality for the sidebar
 */

import { STORAGE_KEYS } from './storage';

let isInitialized = false;

export function initResizable(): void {
  if (isInitialized && document.getElementById('left-sidebar-container')) {
    return;
  }

  const container = document.getElementById('left-sidebar-container') as HTMLElement;
  const handle = container?.querySelector('.resize-handle') as HTMLElement;

  const sidebar = document.getElementById('left-sidebar') as HTMLElement;
  const gridContainer = document.querySelector('.app-body') as HTMLElement;
  if (!container || !handle || !sidebar || !gridContainer) return;
  // IMPORTANT: Disable transitions during initialization to prevent flash
  sidebar.style.transition = 'none';
  gridContainer.style.transition = 'none';
  // Clear any existing inline grid styles on mobile/tablet to let CSS media queries work
  if (window.innerWidth < 1024) {
    gridContainer.style.gridTemplateColumns = '';
  }
  // Restore width from localStorage (only on desktop)
  const storedWidth = localStorage.getItem(STORAGE_KEYS.width);
  if (storedWidth && window.innerWidth >= 1024) {
    const width = parseInt(storedWidth, 10);
    const minWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-min'),
      10,
    );
    const maxWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-max'),
      10,
    );

    if (width >= minWidth && width <= maxWidth) {
      sidebar.style.width = `${width}px`;
      updateGridColumns(gridContainer, width);
    }
  }
  // Re-enable transitions after a frame (allows initial render without animation)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sidebar.style.transition = '';
      gridContainer.style.transition = '';
    });
  });

  isInitialized = true;

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    // Enable smooth resize during drag (only on grid, sidebar follows directly)
    gridContainer.style.transition = 'grid-template-columns 0.05s ease-out';

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const delta = e.clientX - startX;
    const newWidth = startWidth + delta;
    const minWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-min'),
      10,
    );
    const maxWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-max'),
      10,
    );

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebar.style.width = `${newWidth}px`;
      if (window.innerWidth >= 1024) {
        updateGridColumns(gridContainer, newWidth);
      }
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Remove transition after resize
      gridContainer.style.transition = '';
      localStorage.setItem(STORAGE_KEYS.width, sidebar.offsetWidth.toString());
    }
  });

  // Clear inline grid styles on mobile/tablet when window is resized
  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      if (window.innerWidth < 1024) {
        gridContainer.style.gridTemplateColumns = '';
      } else if (window.innerWidth >= 1024 && sidebar.style.width) {
        // Restore grid columns on desktop if sidebar has custom width
        const sidebarWidth = sidebar.offsetWidth || parseInt(sidebar.style.width, 10);
        if (sidebarWidth) {
          updateGridColumns(gridContainer, sidebarWidth);
        }
      }
    }, 100);
  });
}

function updateGridColumns(gridContainer: HTMLElement, sidebarWidth: number): void {
  // Only apply inline styles on desktop (>= 1024px)
  // On mobile/tablet, let CSS media queries handle the layout
  if (window.innerWidth < 1024) {
    gridContainer.style.gridTemplateColumns = '';
    return;
  }

  // Get the ToC width from CSS variable
  const tocWidth = getComputedStyle(document.documentElement)
    .getPropertyValue('--toc-width')
    .trim();

  // Update grid template columns: sidebar | content (1fr) | toc
  gridContainer.style.gridTemplateColumns = `${sidebarWidth}px 1fr ${tocWidth}`;
}

// Reset on Astro navigation
if (typeof document !== 'undefined') {
  document.addEventListener('astro:before-swap', () => {
    isInitialized = false;
  });
}
