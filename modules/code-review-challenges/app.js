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

  function changedLineIndexes(originalSource, nextSource) {
    const originalLines = originalSource.split('\n');
    const nextLines = nextSource.split('\n');
    const rows = originalLines.length + 1;
    const columns = nextLines.length + 1;
    const table = Array.from({ length: rows }, () => new Uint16Array(columns));

    for (let row = 1; row < rows; row += 1) {
      for (let column = 1; column < columns; column += 1) {
        table[row][column] = originalLines[row - 1] === nextLines[column - 1]
          ? table[row - 1][column - 1] + 1
          : Math.max(table[row - 1][column], table[row][column - 1]);
      }
    }

    const unchanged = new Set();
    let row = originalLines.length;
    let column = nextLines.length;

    while (row > 0 && column > 0) {
      if (originalLines[row - 1] === nextLines[column - 1]) {
        unchanged.add(column - 1);
        row -= 1;
        column -= 1;
      } else if (table[row - 1][column] >= table[row][column - 1]) {
        row -= 1;
      } else {
        column -= 1;
      }
    }

    return new Set(nextLines.map((_, index) => index).filter(index => !unchanged.has(index)));
  }

  function renderCode(codeElement, source, mode, originalSource) {
    codeElement.replaceChildren();
    codeElement.classList.add('swift-code');
    codeElement.setAttribute('data-manual-swift-highlight', '');
    const fixedLines = mode === 'fix'
      ? changedLineIndexes(originalSource, source)
      : new Set();

    source.split('\n').forEach((sourceLine, index) => {
      const line = makeElement('span', 'code-line');
      if (mode === 'problem' && sourceLine.trimStart().startsWith('//')) {
        line.classList.add('comment-line');
      }
      if (mode === 'fix' && fixedLines.has(index) && sourceLine.trim()) {
        line.classList.add('fix-line');
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
    card.dataset.mode = 'original';
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
    const codeModeLabel = makeElement('span', 'code-mode-label', 'Swift · Original');
    codeToolbar.appendChild(codeModeLabel);
    const copyButton = makeElement('button', 'copy-challenge', 'Copy');
    copyButton.type = 'button';
    copyButton.setAttribute('aria-label', `Copy code for ${challenge.title}`);
    codeToolbar.appendChild(copyButton);

    const pre = document.createElement('pre');
    pre.setAttribute('aria-label', `${challenge.title} code sample`);
    const code = document.createElement('code');
    renderCode(code, challenge.cleanCode, 'original', challenge.cleanCode);
    pre.appendChild(code);
    codeFrame.append(codeToolbar, pre);

    const actions = makeElement('div', 'challenge-actions');
    const answerState = makeElement('span', 'answer-state', 'Answer hidden');
    const answerButtons = makeElement('div', 'answer-buttons');
    const problemButton = makeElement('button', 'answer-toggle problem-toggle', 'Show problem');
    const fixButton = makeElement('button', 'answer-toggle fix-toggle', 'Show fix');
    [problemButton, fixButton].forEach(button => {
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-controls', `${challenge.id}-code`);
    });
    code.id = `${challenge.id}-code`;
    answerButtons.append(problemButton, fixButton);
    actions.append(answerState, answerButtons);

    let mode = 'original';
    const sourceForMode = () => ({
      original: challenge.cleanCode,
      problem: challenge.annotatedCode,
      fix: challenge.fixedCode
    })[mode];

    const setMode = nextMode => {
      mode = mode === nextMode ? 'original' : nextMode;
      card.dataset.mode = mode;
      problemButton.setAttribute('aria-pressed', String(mode === 'problem'));
      fixButton.setAttribute('aria-pressed', String(mode === 'fix'));
      problemButton.textContent = mode === 'problem' ? 'Hide problem' : 'Show problem';
      fixButton.textContent = mode === 'fix' ? 'Hide fix' : 'Show fix';
      answerState.textContent = ({
        original: 'Answer hidden',
        problem: 'Problem explanation visible',
        fix: 'Fix implementation visible'
      })[mode];
      codeModeLabel.textContent = ({
        original: 'Swift · Original',
        problem: 'Swift · Problem',
        fix: 'Swift · Fix'
      })[mode];
      renderCode(code, sourceForMode(), mode, challenge.cleanCode);
      status.textContent = ({
        original: `Answer hidden for ${challenge.title}.`,
        problem: `Problem explanation shown for ${challenge.title}.`,
        fix: `Fix implementation shown for ${challenge.title}.`
      })[mode];
    };

    problemButton.addEventListener('click', () => setMode('problem'));
    fixButton.addEventListener('click', () => setMode('fix'));

    copyButton.addEventListener('click', async () => {
      try {
        await copyText(sourceForMode());
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
        challenge.annotatedCode,
        challenge.fixedCode
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
