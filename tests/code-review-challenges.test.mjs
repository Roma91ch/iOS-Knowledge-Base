import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const dataSource = await readFile(
  new URL('../modules/code-review-challenges/challenges.js', import.meta.url),
  'utf8'
);
const context = vm.createContext({ globalThis: {} });
vm.runInContext(dataSource, context);
const challenges = context.globalThis.CODE_REVIEW_CHALLENGES;

const syntaxSource = await readFile(
  new URL('../assets/swift-syntax.js', import.meta.url),
  'utf8'
);
const syntaxContext = vm.createContext({ globalThis: {} });
vm.runInContext(syntaxSource, syntaxContext);
const swiftSyntax = syntaxContext.globalThis.SWIFT_SYNTAX;

test('ships an interview-sized challenge deck with unique stable IDs', () => {
  assert.ok(Array.isArray(challenges));
  assert.ok(challenges.length >= 15 && challenges.length <= 20);
  assert.equal(new Set(challenges.map(challenge => challenge.id)).size, challenges.length);
});

test('covers every requested review area', () => {
  const categories = new Set(challenges.map(challenge => challenge.category));
  for (const category of ['swiftui', 'uikit', 'concurrency', 'memory', 'reliability', 'accessibility']) {
    assert.ok(categories.has(category), `missing ${category}`);
  }
});

test('every challenge has distinct problem and fix implementations', () => {
  for (const challenge of challenges) {
    assert.ok(challenge.title);
    assert.ok(challenge.context);
    assert.ok(challenge.prompt);
    assert.ok(challenge.cleanCode);
    assert.ok(challenge.annotatedCode);
    assert.ok(challenge.fixedCode);
    assert.notEqual(challenge.cleanCode, challenge.annotatedCode, challenge.id);
    assert.notEqual(challenge.cleanCode, challenge.fixedCode, challenge.id);
    assert.notEqual(challenge.annotatedCode, challenge.fixedCode, challenge.id);
    assert.doesNotMatch(challenge.cleanCode, /\/\/ ⚠️|\/\/ Fix:/, challenge.id);
    assert.match(challenge.annotatedCode, /\/\/ ⚠️/, challenge.id);
    assert.match(challenge.annotatedCode, /\/\/ Fix:/, challenge.id);
    assert.doesNotMatch(challenge.fixedCode, /\/\/ ⚠️|\/\/ Fix:/, challenge.id);
  }
});

test('Swift interpolation and key paths survive JavaScript string evaluation', () => {
  const stateChallenge = challenges.find(challenge => challenge.id === 'swiftui-input-as-state');
  const listChallenge = challenges.find(challenge => challenge.id === 'swiftui-unstable-foreach-identity');
  const observationChallenge = challenges.find(challenge => challenge.id === 'memory-observation-cycle');

  assert.match(stateChallenge.cleanCode, /\\\(count\)/);
  assert.match(listChallenge.cleanCode, /\\\.0/);
  assert.match(observationChallenge.cleanCode, /\\\.title/);
});

test('Swift syntax tokenizer preserves source and identifies Xcode-like token groups', () => {
  const source = `@MainActor\nfinal class Store {\n    let title: String = "Swift"\n    func load() async throws {\n        // Keep UI state isolated\n        try await API.fetch(page: 2)\n    }\n}`;
  const tokens = swiftSyntax.tokenize(source);

  assert.equal(tokens.map(token => token.text).join(''), source);
  assert.ok(tokens.some(token => token.kind === 'attribute' && token.text === '@MainActor'));
  assert.ok(tokens.some(token => token.kind === 'keyword' && token.text === 'class'));
  assert.ok(tokens.some(token => token.kind === 'type' && token.text === 'Store'));
  assert.ok(tokens.some(token => token.kind === 'function' && token.text === 'load'));
  assert.ok(tokens.some(token => token.kind === 'string' && token.text === '"Swift"'));
  assert.ok(tokens.some(token => token.kind === 'comment'));
  assert.ok(tokens.some(token => token.kind === 'number' && token.text === '2'));
});

test('landing page and module page are wired together with relative paths', async () => {
  const [landing, modulePage] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../modules/code-review-challenges/index.html', import.meta.url), 'utf8')
  ]);

  assert.match(landing, /href="modules\/code-review-challenges\/"/);
  assert.match(modulePage, /src="\.\.\/\.\.\/assets\/app\.js"/);
  assert.match(modulePage, /src="challenges\.js"/);
  assert.match(modulePage, /src="\.\.\/\.\.\/assets\/swift-syntax\.js"/);
  assert.match(modulePage, /href="\.\.\/\.\.\/assets\/swift-syntax\.css"/);
  assert.match(modulePage, /src="app\.js"/);
});

test('the interaction exposes accessible toggle and filter state', async () => {
  const [modulePage, appSource, styles] = await Promise.all([
    readFile(new URL('../modules/code-review-challenges/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../modules/code-review-challenges/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../modules/code-review-challenges/styles.css', import.meta.url), 'utf8')
  ]);

  assert.match(modulePage, /aria-live="polite"/);
  assert.match(modulePage, /role="group" aria-label="Filter challenges by topic"/);
  assert.match(appSource, /setAttribute\('aria-pressed'/);
  assert.match(appSource, /'Show problem'/);
  assert.match(appSource, /'Show fix'/);
  assert.match(appSource, /changedLineIndexes/);
  assert.match(appSource, /line\.classList\.add\('fix-line'\)/);
  assert.match(styles, /\.code-line\.fix-line/);
  assert.match(styles, /#16854d/);
});
