/**
 * Collapsible Sections
 *
 * Handles expand/collapse functionality for navigation sections.
 * Note: Initial state is applied by inline script to prevent flash.
 * This module only handles click interactions.
 */

import { getCollapsedSections, addCollapsedSection, removeCollapsedSection } from './storage';

export function initCollapsibleSections(): void {
  const sections = document.querySelectorAll('.nav-section');

  sections.forEach((section) => {
    const button = section.querySelector('.nav-section-header') as HTMLButtonElement;
    const content = section.querySelector('.nav-section-content') as HTMLElement;
    const sectionId = section.getAttribute('data-section');

    if (!button || !content || !sectionId) return;

    // Remove any existing click listeners (for re-initialization on navigation)
    const newButton = button.cloneNode(true) as HTMLButtonElement;
    button.parentNode?.replaceChild(newButton, button);

    newButton.addEventListener('click', () => {
      toggleSection(section, newButton, content, sectionId);
    });
  });
}

function toggleSection(
  section: Element,
  button: HTMLButtonElement,
  content: HTMLElement,
  sectionId: string,
): void {
  const isExpanded = section.classList.contains('expanded');

  if (isExpanded) {
    section.classList.remove('expanded');
    button.setAttribute('aria-expanded', 'false');
    addCollapsedSection(sectionId);
  } else {
    section.classList.add('expanded');
    button.setAttribute('aria-expanded', 'true');
    removeCollapsedSection(sectionId);
  }
}

export function collapseCurrentSection(element: HTMLElement): void {
  const section = element.closest('.nav-section');
  if (!section) return;

  const button = section.querySelector('.nav-section-header') as HTMLButtonElement;
  const sectionId = section.getAttribute('data-section');

  if (button && sectionId && section.classList.contains('expanded')) {
    section.classList.remove('expanded');
    button.setAttribute('aria-expanded', 'false');
    addCollapsedSection(sectionId);
  }
}

export function expandCurrentSection(element: HTMLElement): void {
  const section = element.closest('.nav-section');
  if (!section) return;

  const button = section.querySelector('.nav-section-header') as HTMLButtonElement;
  const sectionId = section.getAttribute('data-section');

  if (button && sectionId && !section.classList.contains('expanded')) {
    section.classList.add('expanded');
    button.setAttribute('aria-expanded', 'true');
    removeCollapsedSection(sectionId);
  }
}
