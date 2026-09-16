(() => {
  const challenges = globalThis.CODE_REVIEW_CHALLENGES || [];
  const grid = document.getElementById('challengeGrid');
  const search = document.getElementById('challengeSearch');
  const filters = [...document.querySelectorAll('[data-challenge-filter]')];
  const visibleCount = document.getElementById('visibleCount');
  const empty = document.getElementById('challengeEmpty');
  const status = document.getElementById('challengeStatus');

  if (!grid) return;

  const accentByCategory = {
    swiftui: 'var(--accent)',
    uikit: 'var(--green)',
    concurrency: 'var(--violet)',
    memory: 'var(--yellow)',
    reliability: '#ff9b91',
    accessibility: 'var(--green)'
  };

  const cards = [];
  let activeCategory = 'all';

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderCode(codeElement, source, annotated) {
    codeElement.replaceChildren();
    codeElement.classList.add('swift-code');
    codeElement.setAttribute('data-manual-swift-highlight', '');

    source.split('\n').forEach(sourceLine => {
      const line = makeElement('span', 'code-line');
      if (annotated && sourceLine.trimStart().startsWith('//')) {
        line.classList.add('comment-line');
      }
      if (globalThis.SWIFT_SYNTAX) {
        globalThis.SWIFT_SYNTAX.appendTokens(line, sourceLine || ' ');
      } else {
        line.textContent = sourceLine || ' ';
      }
      codeElement.appendChild(line);
    });
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }

  challenges.forEach((challenge, index) => {
    const card = makeElement('article', 'challenge-card');
    card.dataset.category = challenge.category;
    card.dataset.annotated = 'false';
    card.style.setProperty('--challenge-accent', accentByCategory[challenge.category] || 'var(--accent)');
    card.setAttribute('aria-labelledby', `${challenge.id}-title`);

    const copy = makeElement('div', 'challenge-copy');
    const meta = makeElement('div', 'challenge-meta');
    meta.append(
      makeElement('span', 'challenge-number', String(index + 1).padStart(2, '0')),
      makeElement('span', 'challenge-category', challenge.categoryLabel)
    );

    const title = makeElement('h3', '', challenge.title);
    title.id = `${challenge.id}-title`;
    const context = makeElement('p', 'challenge-context', challenge.context);
    const prompt = makeElement('p', 'challenge-prompt', challenge.prompt);
    copy.append(meta, title, context, prompt);

    const codeFrame = makeElement('div', 'challenge-code-frame');
    const codeToolbar = makeElement('div', 'challenge-code-toolbar');
    codeToolbar.appendChild(makeElement('span', '', 'Swift'));
    const copyButton = makeElement('button', 'copy-challenge', 'Copy');
    copyButton.type = 'button';
    copyButton.setAttribute('aria-label', `Copy code for ${challenge.title}`);
    codeToolbar.appendChild(copyButton);

    const pre = document.createElement('pre');
    pre.setAttribute('aria-label', `${challenge.title} code sample`);
    const code = document.createElement('code');
    renderCode(code, challenge.cleanCode, false);
    pre.appendChild(code);
    codeFrame.append(codeToolbar, pre);

    const actions = makeElement('div', 'challenge-actions');
    const answerState = makeElement('span', 'answer-state', 'Review comments hidden');
    const toggle = makeElement('button', 'comment-toggle', 'Show inline comments');
    toggle.type = 'button';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-controls', `${challenge.id}-code`);
    code.id = `${challenge.id}-code`;
    actions.append(answerState, toggle);

    let annotated = false;
    toggle.addEventListener('click', () => {
      annotated = !annotated;
      card.dataset.annotated = String(annotated);
      toggle.setAttribute('aria-pressed', String(annotated));
      toggle.textContent = annotated ? 'Hide inline comments' : 'Show inline comments';
      answerState.textContent = annotated ? 'Review comments visible' : 'Review comments hidden';
      renderCode(code, annotated ? challenge.annotatedCode : challenge.cleanCode, annotated);
      status.textContent = annotated
        ? `Inline comments shown for ${challenge.title}.`
        : `Inline comments hidden for ${challenge.title}.`;
    });

    copyButton.addEventListener('click', async () => {
      try {
        await copyText(annotated ? challenge.annotatedCode : challenge.cleanCode);
        copyButton.textContent = 'Copied';
        status.textContent = `Code copied for ${challenge.title}.`;
      } catch {
        copyButton.textContent = 'Copy failed';
        status.textContent = `Could not copy code for ${challenge.title}.`;
      }

      window.setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 1400);
    });

    card.append(copy, codeFrame, actions);
    grid.appendChild(card);
    cards.push({
      element: card,
      searchableText: [
        challenge.title,
        challenge.context,
        challenge.prompt,
        challenge.categoryLabel,
        challenge.cleanCode,
        challenge.annotatedCode
      ].join(' ').toLocaleLowerCase()
    });
  });

  function applyFilters() {
    const query = (search?.value || '').trim().toLocaleLowerCase();
    let count = 0;

    cards.forEach(card => {
      const categoryMatches = activeCategory === 'all' || card.element.dataset.category === activeCategory;
      const queryMatches = !query || card.searchableText.includes(query);
      const isVisible = categoryMatches && queryMatches;
      card.element.hidden = !isVisible;
      if (isVisible) count += 1;
    });

    visibleCount.textContent = String(count);
    empty.hidden = count !== 0;
    status.textContent = `${count} ${count === 1 ? 'challenge' : 'challenges'} shown.`;
  }

  search?.addEventListener('input', applyFilters);

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      activeCategory = filter.dataset.challengeFilter;
      filters.forEach(candidate => {
        const selected = candidate === filter;
        candidate.classList.toggle('active', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });
      applyFilters();
    });
  });

  applyFilters();
})();
