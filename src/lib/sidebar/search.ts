/**
 * Search Functionality
 *
 * Handles search filtering and text highlighting
 */

export function initSearch(searchInputId: string, containerSelector: string): void {
  const searchInput = document.getElementById(searchInputId) as HTMLInputElement;
  const container = document.querySelector(containerSelector) as HTMLElement;
  if (!searchInput || !container) return;
  // Scope all queries to this specific container
  const navItems = container.querySelectorAll('[data-nav-item]');
  const sections = container.querySelectorAll('.nav-section');
  const nav = container.querySelector('.sidebar-nav') as HTMLElement;

  // Create scoped empty state (unique per container)
  const emptyState = document.createElement('div');
  emptyState.className = 'search-empty-state hidden text-center py-8 px-4 text-secondary';
  emptyState.innerHTML = '<p class="text-sm">No matching lessons</p>';
  nav?.appendChild(emptyState);

  searchInput.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase().trim();

    document.querySelectorAll('.search-highlight').forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        parent.normalize();
      }
    });

    if (!query) {
      navItems.forEach((item) => item.classList.remove('hidden'));
      sections.forEach((section) => section.classList.remove('hidden'));
      emptyState.classList.add('hidden');
      return;
    }

    let hasVisibleItems = false;

    navItems.forEach((item) => {
      const textContent = item.textContent?.toLowerCase() || '';

      if (textContent.includes(query)) {
        item.classList.remove('hidden');
        hasVisibleItems = true;

        highlightText(item as HTMLElement, query);
      } else {
        item.classList.add('hidden');
      }
    });

    sections.forEach((section) => {
      const visibleItems = section.querySelectorAll('[data-nav-item]:not(.hidden)');
      if (visibleItems.length === 0) {
        section.classList.add('hidden');
      } else {
        section.classList.remove('hidden');
      }
    });
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
