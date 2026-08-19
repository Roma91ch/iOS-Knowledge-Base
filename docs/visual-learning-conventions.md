# Visual Learning Conventions

Living implementation and design conventions for the iOS Knowledge Base.

The goal of this file is to capture reusable lessons from shipped modules and fixes so new learning pages remain visually consistent, mobile-safe, accessible, and predictable on GitHub Pages.

## 1. Scope

These conventions apply to:

- the Knowledge Base landing page;
- all Visual Explorer modules;
- future Algorithms & Data Structures modules;
- future Mobile System Design case studies;
- reusable components added to this repository.

Treat this as a living document. Update it when a bug or design correction reveals a reusable rule, not for one-off content edits.

## 2. Mobile-first layout

Design for portrait mobile first. The primary validation width is approximately 390 pt / CSS px, with additional checks around 320, 430, tablet, and desktop widths.

### Header rule

On mobile portrait:

- brand/title occupies the first row;
- mode controls and theme toggle occupy the second row;
- controls must not overlap, truncate into, or sit on top of the title;
- use an explicit mobile grid/flex rule rather than hoping a desktop row wraps correctly;
- long titles must use `min-width: 0` and safe truncation where appropriate.

Desktop/tablet may use a single-row header when there is sufficient space.

## 3. Shared theme behavior

All pages use the same persisted theme state:

```text
ios-kb-theme
```

Rules:

- landing and every module must read the same key;
- switching theme on any page must affect the next page opened;
- support system preference when no saved value exists;
- test both light and dark modes before considering a module complete;
- theme variables must be applied at the same scope where components inherit `color`, `background`, `border`, and code-surface tokens;
- do not assume changing CSS variables alone is enough if an ancestor still owns a stale explicit `color` value.

## 4. Card layout

Module cards contain dynamic text and must grow naturally.

Rules:

- use normal document flow for title, description, and footer;
- do not absolutely position the footer when description length can vary;
- preferred structure is vertical flex/grid with the description in the middle and footer pushed down with `margin-top: auto`;
- preserve a clear gap between description and footer;
- decorative pseudo-elements must sit behind content and must never intercept taps;
- long copy must increase card height instead of overlapping metadata or actions.

## 5. Visibility and filtering

The landing page uses `hidden` to filter module cards.

Because cards may explicitly define `display: flex` or `display: grid`, never rely only on the browser's default hidden stylesheet.

Keep an explicit rule equivalent to:

```css
[hidden] {
  display: none !important;
}
```

When changing a component's `display` value, re-test all visibility/filter/search behavior that depends on `hidden`.

## 6. Interactive controls

Interactions must remain obvious and useful without excessive UI chrome.

Rules:

- controls need visible selected states;
- search and category filters must update immediately;
- mode switches must not create layout jumps that hide navigation unexpectedly;
- interactive examples should teach one concept at a time;
- each interaction should have a clear explanatory payoff, not exist only for animation;
- touch targets must be comfortable on iPhone;
- avoid interactions that depend on hover for understanding.

## 7. Charts and diagrams

Charts that explain technical behavior must be data-correct, not merely decorative.

Rules:

- use SVG or Canvas for mathematically meaningful charts;
- generate plotted curves from the actual functions where practical;
- do not fake complexity curves with rotated CSS borders or decorative arcs;
- labels and legend must remain readable in light and dark modes;
- charts must scale to portrait mobile without clipping;
- diagrams should communicate the mental model before surrounding prose explains it.

For Big O specifically, growth curves should be based on actual functions such as:

- `1`
- `log₂ N`
- `N`
- `N log N`
- `N²`
- `2ᴺ`

## 8. Content accuracy

Visual simplification must not introduce incorrect technical claims.

Examples already established:

- Big O is formally an asymptotic upper bound; interview shorthand often uses "Big O" when asking for worst-case complexity, but those ideas are not identical;
- "elementary operation" is better treated as a constant-time unit of primitive work, not literally one memory-slot access;
- distinguish auxiliary space from total space where the distinction matters;
- avoid absolute claims such as "O(N!) is the worst possible complexity".

If a supplied learning note contains a useful simplification that is technically imprecise, preserve the teaching intent but correct the statement in the module.

## 9. GitHub Pages and caching

This repository is a static GitHub Pages site with no build step.

Rules:

- use relative links so project-site hosting works under `/iOS-Knowledge-Base/`;
- keep `.nojekyll` in the repository;
- avoid unnecessary runtime dependencies and external CDNs;
- when Safari/GitHub Pages caching makes a changed asset difficult to invalidate, prefer a versioned filename for that asset;
- do not create new versioned files for every small edit by default; use them when cache invalidation is actually relevant;
- after deployment-sensitive fixes, verify the committed HTML references the expected asset directly.

## 10. Reusable shared behavior

Prefer one source of truth for behavior used across modules.

Examples:

- shared theme persistence;
- shared mobile-header conventions;
- common navigation back to Knowledge Base;
- accessibility and reduced-motion behavior.

However, avoid making a module depend on fragile runtime patching when a direct stylesheet/script reference is clearer and more reliable.

## 11. Accessibility and resilience

Every module should:

- support `prefers-reduced-motion`;
- use semantic buttons/links for controls;
- provide meaningful `aria-label`s where visible text is insufficient;
- maintain readable contrast in both themes;
- support keyboard focus on desktop;
- avoid horizontal overflow at supported mobile widths;
- keep core learning content understandable even if decorative motion is disabled.

## 12. Pre-deploy validation checklist

Before considering a new module or reusable UI change complete, verify:

### Mobile portrait

- approximately 390 px width;
- header title and controls do not overlap;
- no horizontal scrolling;
- cards grow correctly with long text;
- charts/diagrams fit their containers;
- fixed Knowledge Base navigation does not cover essential content.

### Themes

- landing light mode;
- landing dark mode;
- module light mode;
- module dark mode;
- theme persists across navigation.

### Interactions

- landing search;
- every landing category filter;
- module mode switches;
- theme switch;
- interactive exercises/sliders/buttons;
- back navigation.

### Static hosting

- all relative asset paths resolve under GitHub Pages project URL;
- no accidental localhost/build-tool dependencies;
- new assets are committed;
- temporary GitHub Actions workflows used for one-time repository edits are removed afterward.

## 13. When to update this document

Add or revise a convention when:

- the same type of bug could reasonably affect another module;
- a fix establishes a better reusable implementation pattern;
- a visual or accessibility rule becomes part of the product language;
- a hosting/browser constraint affects future work;
- a technical-content correction should influence similar educational pages.

Do not add rules for typo fixes, one-off copy edits, or purely local content changes.

## 14. Current design philosophy

The Knowledge Base should feel like a visual learning system rather than a textbook or generic dashboard.

Prefer:

- mental models before definitions;
- flows, timelines, architecture maps, state diagrams, and meaningful charts;
- concise explanations paired with interaction;
- organic rounded surfaces consistent with existing Visual Explorer pages;
- mobile usability equal to desktop usability;
- standalone static pages with minimal dependencies.

The target experience is: open a topic, understand the shape of the idea quickly, interact with it, then return later for fast review.
