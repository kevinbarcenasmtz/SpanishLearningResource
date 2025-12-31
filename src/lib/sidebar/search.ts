/**
 * Search Functionality
 *
 * Handles search filtering and text highlighting
 */

export function initSearch(searchInputId: string = 'sidebar-search'): void {
  const searchInput = document.getElementById(searchInputId) as HTMLInputElement;
  const navItems = document.querySelectorAll('[data-nav-item]');
  const sections = document.querySelectorAll('.nav-section');
  const nav = document.querySelector('.sidebar-nav') as HTMLElement;

  if (!searchInput) return;

  // Create empty state element
  const emptyState = document.createElement('div');
  emptyState.id = 'search-empty-state';
  emptyState.className = 'hidden text-center py-8 px-4 text-secondary';
  emptyState.innerHTML = '<p class="text-sm">No matching lessons</p>';
  nav?.appendChild(emptyState);

  searchInput.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase().trim();

    // Remove previous highlights
    document.querySelectorAll('.search-highlight').forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        parent.normalize();
      }
    });

    if (!query) {
      // Show all items and sections
      navItems.forEach((item) => item.classList.remove('hidden'));
      sections.forEach((section) => section.classList.remove('hidden'));
      emptyState.classList.add('hidden');
      return;
    }

    let hasVisibleItems = false;

    // Filter and highlight nav items
    navItems.forEach((item) => {
      const textContent = item.textContent?.toLowerCase() || '';

      if (textContent.includes(query)) {
        item.classList.remove('hidden');
        hasVisibleItems = true;

        // Highlight matching text
        highlightText(item as HTMLElement, query);
      } else {
        item.classList.add('hidden');
      }
    });

    // Hide empty sections
    sections.forEach((section) => {
      const visibleItems = section.querySelectorAll('[data-nav-item]:not(.hidden)');
      if (visibleItems.length === 0) {
        section.classList.add('hidden');
      } else {
        section.classList.remove('hidden');
      }
    });

    // Show/hide empty state
    if (hasVisibleItems) {
      emptyState.classList.add('hidden');
    } else {
      emptyState.classList.remove('hidden');
    }
  });
}

function highlightText(element: HTMLElement, query: string): void {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  const nodesToReplace: Array<{ node: Node; text: string }> = [];

  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent || '';
    const lowerText = text.toLowerCase();

    if (lowerText.includes(query)) {
      nodesToReplace.push({ node, text });
    }
  }

  nodesToReplace.forEach(({ node, text }) => {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(query);

    if (index === -1) return;

    const beforeText = text.substring(0, index);
    const matchText = text.substring(index, index + query.length);
    const afterText = text.substring(index + query.length);

    const fragment = document.createDocumentFragment();

    if (beforeText) fragment.appendChild(document.createTextNode(beforeText));

    const mark = document.createElement('mark');
    mark.className = 'search-highlight';
    mark.textContent = matchText;
    fragment.appendChild(mark);

    if (afterText) fragment.appendChild(document.createTextNode(afterText));

    node.parentNode?.replaceChild(fragment, node);
  });
}
