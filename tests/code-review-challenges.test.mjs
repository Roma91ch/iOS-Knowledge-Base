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

test('every clean snippet has a distinct inline-comment version', () => {
  for (const challenge of challenges) {
    assert.ok(challenge.title);
    assert.ok(challenge.context);
    assert.ok(challenge.prompt);
    assert.ok(challenge.cleanCode);
    assert.ok(challenge.annotatedCode);
    assert.notEqual(challenge.cleanCode, challenge.annotatedCode, challenge.id);
    assert.doesNotMatch(challenge.cleanCode, /\/\/ ⚠️|\/\/ Fix:/, challenge.id);
    assert.match(challenge.annotatedCode, /\/\/ ⚠️/, challenge.id);
    assert.match(challenge.annotatedCode, /\/\/ Fix:/, challenge.id);
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

test('landing page and module page are wired together with relative paths', async () => {
  const [landing, modulePage] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../modules/code-review-challenges/index.html', import.meta.url), 'utf8')
  ]);

  assert.match(landing, /href="modules\/code-review-challenges\/"/);
  assert.match(modulePage, /src="\.\.\/\.\.\/assets\/app\.js"/);
  assert.match(modulePage, /src="challenges\.js"/);
  assert.match(modulePage, /src="app\.js"/);
});

test('the interaction exposes accessible toggle and filter state', async () => {
  const [modulePage, appSource] = await Promise.all([
    readFile(new URL('../modules/code-review-challenges/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../modules/code-review-challenges/app.js', import.meta.url), 'utf8')
  ]);

  assert.match(modulePage, /aria-live="polite"/);
  assert.match(modulePage, /role="group" aria-label="Filter challenges by topic"/);
  assert.match(appSource, /setAttribute\('aria-pressed'/);
  assert.match(appSource, /textContent = annotated \? 'Hide inline comments' : 'Show inline comments'/);
});
