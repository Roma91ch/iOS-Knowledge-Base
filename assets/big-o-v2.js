(() => {
  const style = document.createElement('style');
  style.textContent = `
    .app { color: var(--text); }
    #theme:checked ~ .app { color: var(--text); }
    .app h1, .app h2, .app h3, .app b, .app strong, .app summary { color: var(--text); }
    #theme:checked ~ .app .hero,
    #theme:checked ~ .app .scene,
    #theme:checked ~ .app .axis-card,
    #theme:checked ~ .app .complexity-card,
    #theme:checked ~ .app .machine-card,
    #theme:checked ~ .app .lab-result,
    #theme:checked ~ .app .formula-card,
    #theme:checked ~ .app .space-card,
    #theme:checked ~ .app .case-card,
    #theme:checked ~ .app .check,
    #theme:checked ~ .app .review-card,
    #theme:checked ~ .app .quiz {
      color: var(--text);
    }
    .mini-axis { overflow: hidden; }
    .big-o-chart { width: 100%; height: 100%; display: block; overflow: visible; }
    .big-o-chart path { fill: none; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
    .big-o-chart .o1 { stroke: var(--green); }
    .big-o-chart .olog { stroke: color-mix(in srgb, var(--green) 65%, var(--accent)); }
    .big-o-chart .on { stroke: var(--yellow); }
    .big-o-chart .onlogn { stroke: var(--orange); }
    .big-o-chart .on2 { stroke: color-mix(in srgb, var(--red) 75%, var(--orange)); }
    .big-o-chart .o2n { stroke: var(--red); }
    .chart-legend { display: flex; flex-wrap: wrap; gap: 7px 10px; margin-top: 14px; }
    .chart-key { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: .7rem; font-weight: 780; }
    .chart-key::before { content: ''; width: 16px; height: 3px; border-radius: 999px; background: var(--key); }
    .chart-key.o1 { --key: var(--green); }
    .chart-key.olog { --key: color-mix(in srgb, var(--green) 65%, var(--accent)); }
    .chart-key.on { --key: var(--yellow); }
    .chart-key.onlogn { --key: var(--orange); }
    .chart-key.on2 { --key: color-mix(in srgb, var(--red) 75%, var(--orange)); }
    .chart-key.o2n { --key: var(--red); }
  `;
  document.head.appendChild(style);

  const axis = document.querySelector('.mini-axis');
  if (!axis) return;

  const width = 360;
  const height = 220;
  const padX = 8;
  const padTop = 10;
  const padBottom = 12;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padTop - padBottom;
  const yMax = 100;
  const samples = 80;

  const functions = [
    ['o1', () => 1],
    ['olog', n => Math.log2(n)],
    ['on', n => n],
    ['onlogn', n => n * Math.log2(n)],
    ['on2', n => n * n],
    ['o2n', n => 2 ** n]
  ];

  const pathFor = fn => {
    const points = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const n = 1 + t * 9;
      const raw = Math.min(yMax, fn(n));
      const x = padX + t * plotWidth;
      const y = padTop + plotHeight - (raw / yMax) * plotHeight;
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return points.join(' ');
  };

  axis.innerHTML = `
    <svg class="big-o-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Growth curves for common Big O complexity classes">
      ${functions.map(([name, fn]) => `<path class="${name}" d="${pathFor(fn)}"></path>`).join('')}
    </svg>`;

  const card = axis.closest('.axis-card');
  if (card && !card.querySelector('.chart-legend')) {
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.innerHTML = `
      <span class="chart-key o1">O(1)</span>
      <span class="chart-key olog">O(log N)</span>
      <span class="chart-key on">O(N)</span>
      <span class="chart-key onlogn">O(N log N)</span>
      <span class="chart-key on2">O(N²)</span>
      <span class="chart-key o2n">O(2ᴺ)</span>`;
    card.appendChild(legend);
  }
})();
