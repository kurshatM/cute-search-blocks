/**
 * Doodle icon library.
 * Shapes stroke with `currentColor` and take their fills from the card's
 * palette via the cb-bg / cb-soft / cb-solid classes (see styles.css), so
 * one shape serves every category.
 */

const CuteIcons = (() => {
  'use strict';

  const SHAPES = {
    terminal: '<rect class="cb-bg" x="4" y="8" width="32" height="24" rx="4"/><path d="M12 17l4 4-4 4M20 25h8"/>',
    gear: '<circle cx="20" cy="20" r="6"/><path stroke-width="2" d="M20 6v4M20 30v4M6 20h4M30 20h4M10.1 10.1l2.8 2.8M27.1 27.1l2.8 2.8M10.1 29.9l2.8-2.8M27.1 12.9l2.8-2.8"/>',
    sparkle: '<path class="cb-soft" stroke-width="2" d="M20 4l3 13 13 3-13 3-3 13-3-13L4 20l13-3z"/>',
    braces: '<path d="M15 8c-4 0-5 3-5 6v4c0 2-2 2-2 2s2 0 2 2v4c0 3 1 6 5 6M25 8c4 0 5 3 5 6v4c0 2 2 2 2 2s-2 0-2 2v4c0 3-1 6-5 6"/>',
    whisk: '<path d="M20 4v14"/><ellipse class="cb-bg" cx="20" cy="26" rx="10" ry="10"/><path stroke-width="2" d="M14 22c2 6 10 6 12 0"/>',
    chefHat: '<ellipse class="cb-soft" cx="20" cy="14" rx="12" ry="10"/><rect class="cb-bg" x="12" y="22" width="16" height="10" rx="2"/>',
    cherries: '<circle class="cb-soft" cx="14" cy="26" r="8"/><circle class="cb-soft" cx="26" cy="26" r="8"/><path stroke-width="2" d="M14 18c0-8 6-14 6-14s6 6 6 14"/>',
    heart: '<path class="cb-soft" d="M20 36s-14-8-14-18c0-6 4-10 9-10 3 0 5 2 5 2s2-2 5-2c5 0 9 4 9 10 0 10-14 18-14 18z"/>',
    bag: '<rect class="cb-bg" x="6" y="14" width="28" height="22" rx="4"/><path d="M14 14v-4a6 6 0 0112 0v4"/>',
    priceTag: '<path class="cb-soft" d="M6 6h14l14 14-14 14L6 20V6z"/><circle class="cb-solid" cx="14" cy="14" r="3"/>',
    star: '<path class="cb-soft" stroke-width="2" d="M20 4l4.5 11H36l-9 7 3.5 11L20 26l-10.5 7L13 22 4 15h11.5z"/>',
    gift: '<rect class="cb-bg" x="6" y="16" width="28" height="18" rx="3"/><rect class="cb-soft" x="4" y="12" width="32" height="8" rx="3"/><path d="M20 12v22"/><path stroke-width="2" d="M20 12c-3-6-10-6-10 0M20 12c3-6 10-6 10 0"/>',
    play: '<circle class="cb-bg" cx="20" cy="20" r="16"/><path class="cb-solid" d="M16 12l14 8-14 8z"/>',
    film: '<rect class="cb-bg" x="4" y="8" width="32" height="24" rx="4"/><g class="cb-solid"><circle cx="12" cy="14" r="2.5"/><circle cx="28" cy="14" r="2.5"/><circle cx="12" cy="26" r="2.5"/><circle cx="28" cy="26" r="2.5"/></g>',
    note: '<ellipse class="cb-soft" cx="14" cy="30" rx="6" ry="5"/><path d="M20 30V6c4 0 12 2 12 8"/>',
    controller: '<path class="cb-bg" d="M8 16c-4 6-2 14 4 14h4l2-4h4l2 4h4c6 0 8-8 4-14H8z"/><path stroke-width="2" d="M12 20v6M9 23h6"/><g class="cb-solid"><circle cx="26" cy="21" r="2"/><circle cx="30" cy="25" r="2"/></g>',
    sword: '<path d="M10 30l18-18M28 12l6-6M30 6l4 4M14 22l8 6"/>',
    potion: '<rect x="16" y="4" width="8" height="8" rx="1"/><path class="cb-soft" d="M16 12l-6 14c-1 3 1 6 4 6h12c3 0 5-3 4-6l-6-14"/>',
    book: '<path class="cb-soft" d="M6 8h14v28H10a4 4 0 01-4-4V8z"/><path class="cb-bg" d="M20 8h14v24a4 4 0 01-4 4H20V8z"/><path stroke-width="2" d="M20 8v28"/>',
    bulb: '<circle class="cb-soft" cx="20" cy="16" r="10"/><rect class="cb-bg" x="16" y="26" width="8" height="6" rx="2"/><path stroke-width="2" d="M15 16c0-3 2-5 5-5"/>',
    gradCap: '<path class="cb-soft" d="M4 16l16-8 16 8-16 8z"/><path d="M10 20v8c0 2 4 6 10 6s10-4 10-6v-8M36 16v14"/>',
    magnifier: '<circle class="cb-bg" cx="18" cy="18" r="10"/><path stroke-width="3" d="M26 26l8 8"/>',
    chat: '<path class="cb-bg" d="M6 8h28a2 2 0 012 2v16a2 2 0 01-2 2H14l-6 6v-6H6a2 2 0 01-2-2V10a2 2 0 012-2z"/><g class="cb-solid"><circle cx="14" cy="18" r="2"/><circle cx="22" cy="18" r="2"/><circle cx="30" cy="18" r="2"/></g>',
    people: '<circle class="cb-bg" cx="14" cy="14" r="5"/><circle class="cb-bg" cx="26" cy="14" r="5"/><path d="M6 32c0-6 4-10 8-10s8 4 8 10M18 32c0-6 4-10 8-10s8 4 8 10"/>',
    thumbsUp: '<path class="cb-soft" d="M12 18H8a2 2 0 00-2 2v12a2 2 0 002 2h4V18z"/><path class="cb-bg" d="M12 18l4-10c1-3 6-2 6 2v6h8a3 3 0 013 3l-2 13a3 3 0 01-3 2H12"/>',
    globe: '<circle class="cb-bg" cx="20" cy="20" r="14"/><ellipse stroke-width="2" cx="20" cy="20" rx="6" ry="14"/><path stroke-width="2" d="M6 20h28M20 6v28"/>',
    link: '<path d="M16 24l-4 4a4 4 0 005.6 5.6l4-4M24 16l4-4a4 4 0 00-5.6-5.6l-4 4M16 24l8-8"/>',
    compass: '<circle class="cb-bg" cx="20" cy="20" r="14"/><path class="cb-soft" stroke-width="2" d="M14 26l4-10 10-4-4 10z"/>',
  };

  const SETS = {
    coding: ['terminal', 'gear', 'sparkle', 'braces'],
    cooking: ['whisk', 'chefHat', 'cherries', 'heart'],
    shopping: ['bag', 'priceTag', 'star', 'gift'],
    video: ['play', 'film', 'note', 'sparkle'],
    gaming: ['controller', 'star', 'sword', 'potion'],
    learning: ['book', 'bulb', 'gradCap', 'magnifier'],
    social: ['chat', 'heart', 'people', 'thumbsUp'],
    general: ['globe', 'link', 'sparkle', 'compass'],
  };

  const toSvg = name =>
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" ' +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SHAPES[name]}</svg>`;

  // Build markup once per category.
  const MARKUP = Object.fromEntries(
    Object.entries(SETS).map(([id, names]) => [id, names.map(toSvg)])
  );

  /** @returns {string[]} SVG markup strings for the given category id. */
  function forCategory(id) {
    return MARKUP[id] || MARKUP.general;
  }

  return { forCategory };
})();
