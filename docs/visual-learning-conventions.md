# Visual Learning Conventions

Living implementation and design conventions for the iOS Knowledge Base.

The goal is to capture reusable lessons from shipped modules and fixes so new learning pages remain visually consistent, mobile-safe, accessible, and predictable on GitHub Pages. Update this document when a bug or design correction reveals a reusable rule, not for one-off content edits.

## 1. Scope

These conventions apply to the Knowledge Base landing page, all Visual Explorer modules, Algorithms & Data Structures modules, Mobile System Design case studies, and reusable components in this repository.

## 2. Mobile-first layout

Design for portrait mobile first. Primary validation width is approximately 390 CSS px, with additional checks around 320, 430, tablet, and desktop widths.

### Header rule

On mobile portrait:

- brand/title occupies the first row;
- mode controls and theme toggle occupy the second row;
- controls must not overlap or cover the title;
- use an explicit mobile grid/flex rule rather than relying on desktop wrapping;
- long titles use `min-width: 0` and safe truncation where appropriate.

Desktop/tablet may use a single-row header when there is enough space.

## 3. Shared theme behavior

All pages use the same persisted key:

```text
ios-kb-theme
```

Rules:

- landing and every module read/write the same key;
- use system preference only when no saved value exists;
- test both light and dark before considering a module complete;
- apply theme variables at a scope where text, backgrounds, borders, code surfaces, and decorative elements all inherit correctly;
- avoid mixing incompatible theme mechanisms inside one module;
- prefer the landing-page pattern: one explicit `data-theme` state on the document root.

## 4. Card layout

Module cards contain dynamic text and must grow naturally.

- Use normal document flow for title, description, and footer.
- Do not absolutely position a footer when description length can vary.
- Prefer vertical flex/grid with footer pushed down using `margin-top: auto`.
- Decorative pseudo-elements stay behind content and never intercept taps.
- Long copy increases card height instead of overlapping metadata/actions.

## 5. Visibility and filtering

If UI uses the HTML `hidden` attribute, keep an explicit rule:

```css
[hidden] {
  display: none !important;
}
```

A component with `display:flex` or `display:grid` can otherwise defeat the browser's default hidden styling. Re-test filtering/search whenever display behavior changes.

## 6. Interactive controls and modes

Interactions need a visible selected state, comfortable touch targets, and a clear teaching payoff.

For Learn / Review / Practice style modes:

- treat each mode as an independent layout that must be tested separately;
- do not assume a working Learn layout means Review or Practice is responsive;
- when modes contain materially different content/layouts, prefer simple explicit JavaScript state plus `hidden` panels over fragile radio-input/sibling-selector CSS state;
- changing a mode should not create unexpected horizontal overflow or leave stale content visible;
- on mobile, Practice cards default to one column unless there is clearly enough width for more.

## 7. Code presentation

Code is learning content, not decorative copy.

- Use real multiline `<pre><code>` blocks.
- Store actual line breaks in HTML/JavaScript template literals.
- Never render escaped `\n` sequences as visible text.
- Preserve indentation and use horizontal scrolling only when genuinely necessary.
- Verify every code example at mobile width.
- Interactive code examples that change must update with `.textContent` using real multiline strings.

## 8. Charts, diagrams, and supplied visuals

Technical visuals must be semantically faithful.

- If the user supplies a trusted explanatory visual that already communicates the concept well, reuse it rather than recreating an inferior pseudo-chart.
- Store supplied/reference visuals as normal repository assets when possible and reference them directly with relative paths.
- For charts that need to be generated or interactive, use real data/functions with SVG/Canvas rather than decorative CSS curves.
- Do not fake complexity curves with rotated borders or arbitrary arcs.
- Labels/legends must be readable at portrait mobile size.
- A visual should communicate the mental model before surrounding prose explains it.

For Big O, if generating a chart, plot actual functions such as `1`, `log₂ N`, `N`, `N log N`, `N²`, and `2ᴺ`.

## 9. Content accuracy

Visual simplification must not introduce incorrect technical claims.

Established examples:

- Big O is formally an asymptotic upper bound; interview shorthand often uses “Big O” when asking for worst-case complexity, but those concepts are not identical;
- “elementary operation” is better treated as a constant-time unit of primitive work, not literally one memory-slot access;
- distinguish auxiliary space from total space where relevant;
- avoid absolute claims such as “O(N!) is the worst possible complexity.”

If a supplied note is useful but technically imprecise, preserve the teaching intent while correcting the statement.

## 10. Avoid patch stacking

Repeated regressions are a signal that the underlying component should be rebuilt.

- Do not keep layering `v2`, `v3`, runtime CSS injection, and one-off JavaScript patches when the architecture itself is causing the bugs.
- After two or more related layout/state regressions, prefer a clean replacement with one state model and one responsive strategy.
- Remove obsolete patch assets/workflows after the clean implementation is committed.
- Verify the repository no longer references obsolete patch files.

## 11. GitHub Pages and caching

This is a static GitHub Pages site with no build step.

- Use relative links so project hosting works under `/iOS-Knowledge-Base/`.
- Keep `.nojekyll`.
- Avoid unnecessary external runtimes/CDNs.
- When Safari/Pages caching is genuinely the issue, version an asset or change its filename.
- Do not attribute every missing visual change to cache before verifying the committed HTML/CSS/JS first.
- After deployment-sensitive fixes, verify the exact committed asset path and file contents.

## 12. Reusable shared behavior

Prefer one source of truth for behavior used across modules, including theme persistence, mobile-header conventions, Knowledge Base navigation, accessibility, and reduced-motion behavior.

Shared behavior should not become fragile runtime patching. A direct implementation inside a self-contained module is preferable when it is clearer and less coupled.

## 13. Accessibility and resilience

Every module should:

- support `prefers-reduced-motion`;
- use semantic buttons/links;
- provide meaningful `aria-label`s where needed;
- maintain readable contrast in both themes;
- support keyboard focus on desktop;
- avoid horizontal overflow at supported mobile widths;
- remain understandable if decorative effects fail or are disabled.

## 14. Pre-deploy validation checklist

### Mobile portrait

- ~390 px width;
- title and controls do not overlap;
- no horizontal page overflow;
- cards grow with long text;
- diagrams/images fit their containers;
- code is truly multiline and readable;
- fixed Knowledge Base navigation does not cover essential content.

### Themes

- landing light/dark;
- module light/dark;
- theme persists across navigation;
- image/code surfaces remain readable in both themes.

### Interactions

- landing search;
- every landing category filter;
- every module mode/tab individually;
- theme switch;
- exercises/sliders/buttons;
- dynamic code examples;
- back navigation.

### Static hosting

- relative asset paths resolve under GitHub Pages;
- every referenced image/script/style exists in the repository;
- no accidental localhost/build-tool dependencies;
- temporary workflows and obsolete patch assets are removed.

## 15. When to update this document

Add or revise a convention when the same bug could affect another module, a fix establishes a reusable implementation pattern, a visual/accessibility rule becomes part of the product language, a hosting/browser constraint affects future work, or a content-accuracy correction applies to similar educational material.

Do not add rules for typos or one-off local copy changes.

## 16. Design philosophy

The Knowledge Base should feel like a visual learning system rather than a textbook or generic dashboard.

Prefer mental models before definitions, meaningful visuals/flows/diagrams, concise explanation paired with interaction, organic rounded surfaces consistent with existing Visual Explorer pages, mobile usability equal to desktop usability, and standalone static pages with minimal dependencies.

Target experience: open a topic, understand the shape of the idea quickly, interact with it, then return later for fast review.
