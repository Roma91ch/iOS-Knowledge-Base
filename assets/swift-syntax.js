(() => {
  const keywords = new Set([
    'actor', 'any', 'as', 'associatedtype', 'async', 'await', 'borrowing',
    'break', 'case', 'catch', 'class', 'consuming', 'continue', 'convenience',
    'copy', 'default', 'defer', 'deinit', 'didSet', 'distributed', 'do',
    'dynamic', 'else', 'enum', 'extension', 'fallthrough', 'false', 'fileprivate',
    'final', 'for', 'func', 'get', 'guard', 'if', 'import', 'in', 'indirect',
    'infix', 'init', 'inout', 'internal', 'is', 'isolated', 'lazy', 'let',
    'macro', 'mutating', 'nil', 'nonisolated', 'nonmutating', 'open', 'operator',
    'optional', 'override', 'postfix', 'precedencegroup', 'prefix', 'private',
    'protocol', 'public', 'repeat', 'required', 'rethrows', 'return', 'self',
    'sending', 'set', 'some', 'static', 'struct', 'subscript', 'super', 'switch',
    'throws', 'throw', 'true', 'try', 'typealias', 'unowned', 'var', 'weak',
    'where', 'while', 'willSet'
  ]);

  const builtInTypes = new Set([
    'Any', 'AnyObject', 'Array', 'Bool', 'Character', 'Collection', 'Data',
    'Date', 'Decimal', 'Dictionary', 'Double', 'Duration', 'Error', 'Float',
    'Identifiable', 'Int', 'Int8', 'Int16', 'Int32', 'Int64', 'MainActor',
    'Never', 'NSObject', 'Optional', 'Result', 'Sendable', 'Set', 'String',
    'Task', 'UInt', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'URL', 'UUID', 'Void'
  ]);

  const declarationKeywords = new Set([
    'actor', 'associatedtype', 'class', 'enum', 'extension', 'func', 'macro',
    'protocol', 'struct', 'typealias'
  ]);

  const identifierStart = /[A-Za-z_]/;
  const identifierPart = /[A-Za-z0-9_]/;

  function pushToken(tokens, kind, text) {
    if (!text) return;
    const previous = tokens.at(-1);
    if (previous?.kind === kind) {
      previous.text += text;
    } else {
      tokens.push({ kind, text });
    }
  }

  function previousSignificantToken(tokens) {
    for (let index = tokens.length - 1; index >= 0; index -= 1) {
      if (tokens[index].text.trim()) return tokens[index];
    }
    return undefined;
  }

  function nextNonWhitespace(source, start) {
    let index = start;
    while (index < source.length && /\s/.test(source[index])) index += 1;
    return source[index];
  }

  function readQuotedString(source, start) {
    const triple = source.startsWith('"""', start);
    const delimiter = triple ? '"""' : '"';
    let index = start + delimiter.length;

    while (index < source.length) {
      if (!triple && source[index] === '\\') {
        index += 2;
        continue;
      }
      if (source.startsWith(delimiter, index)) {
        return index + delimiter.length;
      }
      index += 1;
    }

    return source.length;
  }

  function tokenize(source) {
    const tokens = [];
    let index = 0;

    while (index < source.length) {
      if (source.startsWith('//', index)) {
        const end = source.indexOf('\n', index);
        const stop = end === -1 ? source.length : end;
        pushToken(tokens, 'comment', source.slice(index, stop));
        index = stop;
        continue;
      }

      if (source.startsWith('/*', index)) {
        const end = source.indexOf('*/', index + 2);
        const stop = end === -1 ? source.length : end + 2;
        pushToken(tokens, 'comment', source.slice(index, stop));
        index = stop;
        continue;
      }

      if (source[index] === '"') {
        const stop = readQuotedString(source, index);
        pushToken(tokens, 'string', source.slice(index, stop));
        index = stop;
        continue;
      }

      if (source[index] === '@' && identifierStart.test(source[index + 1] || '')) {
        let stop = index + 2;
        while (stop < source.length && identifierPart.test(source[stop])) stop += 1;
        pushToken(tokens, 'attribute', source.slice(index, stop));
        index = stop;
        continue;
      }

      if (source[index] === '#' && identifierStart.test(source[index + 1] || '')) {
        let stop = index + 2;
        while (stop < source.length && identifierPart.test(source[stop])) stop += 1;
        pushToken(tokens, 'directive', source.slice(index, stop));
        index = stop;
        continue;
      }

      if (/\d/.test(source[index])) {
        let stop = index + 1;
        while (stop < source.length && /[\dA-Fa-f_xXbBoO.]/.test(source[stop])) stop += 1;
        pushToken(tokens, 'number', source.slice(index, stop));
        index = stop;
        continue;
      }

      if (identifierStart.test(source[index])) {
        let stop = index + 1;
        while (stop < source.length && identifierPart.test(source[stop])) stop += 1;

        const word = source.slice(index, stop);
        const previous = previousSignificantToken(tokens);
        const previousCharacter = source.slice(0, index).trimEnd().at(-1);
        const followsDeclaration = previous?.kind === 'keyword' && declarationKeywords.has(previous.text);
        let kind = 'plain';

        if (keywords.has(word)) {
          kind = 'keyword';
        } else if (followsDeclaration && previous.text === 'func') {
          kind = 'function';
        } else if (builtInTypes.has(word) || /^[A-Z]/.test(word) || followsDeclaration) {
          kind = 'type';
        } else if (previousCharacter === '.') {
          kind = 'member';
        } else if (nextNonWhitespace(source, stop) === '(') {
          kind = 'function';
        }

        pushToken(tokens, kind, word);
        index = stop;
        continue;
      }

      pushToken(tokens, 'plain', source[index]);
      index += 1;
    }

    return tokens;
  }

  function appendTokens(container, source) {
    const fragment = document.createDocumentFragment();

    tokenize(source).forEach(token => {
      if (token.kind === 'plain') {
        fragment.appendChild(document.createTextNode(token.text));
        return;
      }

      const span = document.createElement('span');
      span.className = `swift-token ${token.kind}`;
      span.textContent = token.text;
      fragment.appendChild(span);
    });

    container.appendChild(fragment);
  }

  function render(container, source) {
    container.replaceChildren();
    container.classList.add('swift-code');
    appendTokens(container, source);
  }

  const highlightedSources = new WeakMap();

  function shouldHighlight(code) {
    return !code.hasAttribute('data-manual-swift-highlight') &&
      !code.closest('[data-no-swift-highlight]') &&
      !code.closest('pre.tree');
  }

  function highlight(code) {
    if (!shouldHighlight(code)) return;
    const source = code.textContent;
    if (highlightedSources.get(code) === source) return;
    highlightedSources.set(code, source);
    render(code, source);
  }

  function highlightWithin(root) {
    if (root instanceof Element && root.matches('pre > code')) highlight(root);
    root.querySelectorAll?.('pre > code').forEach(highlight);
  }

  function startAutoHighlighting() {
    highlightWithin(document);

    const pending = new Set();
    let scheduled = false;
    const flush = () => {
      scheduled = false;
      pending.forEach(node => highlightWithin(node));
      pending.clear();
    };

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        const target = mutation.target.nodeType === Node.ELEMENT_NODE
          ? mutation.target
          : mutation.target.parentElement;
        const code = target?.closest?.('pre > code');
        if (code) pending.add(code);
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) pending.add(node);
        });
      });

      if (!scheduled && pending.size) {
        scheduled = true;
        queueMicrotask(flush);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  globalThis.SWIFT_SYNTAX = Object.freeze({ appendTokens, render, tokenize });

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startAutoHighlighting, { once: true });
    } else {
      startAutoHighlighting();
    }
  }
})();
