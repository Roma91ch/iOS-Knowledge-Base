(() => {
  const style = document.createElement('style');
  style.textContent = `
    /* Big O UI v4 */
    .chart-card img {
      cursor: zoom-in;
      width: 100%;
      height: auto;
      object-fit: contain;
    }
    .big-o-lightbox {
      position: fixed;
      inset: 0;
      z-index: 200;
      display: grid;
      place-items: center;
      padding: max(18px, env(safe-area-inset-top)) max(18px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(18px, env(safe-area-inset-left));
      background: rgba(3, 8, 18, .94);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .big-o-lightbox[hidden] { display: none !important; }
    .big-o-lightbox-inner {
      position: relative;
      width: min(100%, 1180px);
      height: min(92dvh, 1400px);
      display: grid;
      place-items: center;
    }
    .big-o-lightbox img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 30px 90px rgba(0,0,0,.45);
    }
    .big-o-lightbox-close {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
      width: 46px;
      height: 46px;
      border: 0;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,.94);
      color: #111827;
      font-size: 1.55rem;
      line-height: 1;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 30px rgba(0,0,0,.24);
    }
    .chart-card::after {
      content: 'Tap to view full screen';
      display: block;
      padding: 2px 9px 9px;
      color: #087fc2;
      font-size: .72rem;
      font-weight: 760;
    }
    .quiz-options button.answer-correct {
      border-color: var(--green) !important;
      background: color-mix(in srgb, var(--green) 82%, var(--solid)) !important;
      color: #07150f !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--green) 28%, transparent);
    }
    :root[data-theme='dark'] .quiz-options button.answer-correct { color: #06130d !important; }
    .quiz-options button.answer-wrong {
      border-color: var(--red) !important;
      background: color-mix(in srgb, var(--red) 82%, var(--solid)) !important;
      color: #210707 !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--red) 28%, transparent);
    }
    .quiz-options button.answer-reveal {
      border-color: var(--green) !important;
      box-shadow: inset 0 0 0 2px var(--green);
    }
    .quiz-feedback.feedback-correct { color: var(--green) !important; }
    .quiz-feedback.feedback-wrong { color: var(--red) !important; }
    .quiz.correct {
      background: color-mix(in srgb, var(--green) 6%, var(--panel));
    }
    .quiz.wrong {
      background: color-mix(in srgb, var(--red) 6%, var(--panel));
    }
    .log-note {
      margin-top: 18px;
      padding: 22px;
      border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border));
      border-radius: 28px 28px 40px 28px;
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, var(--panel)), var(--panel));
    }
    .log-note-head {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 16px;
      margin-bottom: 18px;
    }
    .log-note-head h3 {
      margin: 5px 0 0;
      font-size: clamp(1.35rem, 4vw, 2rem);
      letter-spacing: -.035em;
    }
    .log-note-head p {
      margin: 0;
      max-width: 520px;
      color: var(--muted);
      line-height: 1.55;
    }
    .log-note-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .log-note-card {
      min-width: 0;
      padding: 18px;
      border: 1px solid var(--border);
      border-radius: 22px;
      background: var(--solid);
    }
    .log-note-card b {
      display: block;
      margin-bottom: 10px;
      color: var(--accent);
      font-size: .78rem;
      letter-spacing: .09em;
      text-transform: uppercase;
    }
    .log-formula {
      font: 850 clamp(1.35rem, 5vw, 2.1rem)/1.25 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: -.04em;
    }
    .log-note-card p {
      margin: 9px 0 0;
      color: var(--muted);
      font-size: .84rem;
      line-height: 1.55;
    }
    .log-compare {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 10px;
      margin-top: 4px;
    }
    .log-compare strong {
      display: block;
      font-size: 1.45rem;
      letter-spacing: -.04em;
    }
    .log-compare span {
      color: var(--muted);
      font-size: .76rem;
    }
    .log-arrow { color: var(--accent); font-weight: 900; }
    .log-note-foot {
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 16px;
      background: color-mix(in srgb, var(--yellow) 8%, var(--solid));
      color: var(--muted);
      font-size: .8rem;
      line-height: 1.5;
    }
    .log-note-foot strong { color: var(--text); }
    @media (max-width: 720px) {
      .log-note-head { flex-direction: column; }
      .log-note-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 520px) {
      .complexity-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px;
      }
      .complexity-card {
        min-width: 0;
        min-height: 126px;
        padding: 14px;
      }
      .complexity-card b {
        font-size: 1rem;
        line-height: 1.15;
      }
      .complexity-card strong {
        font-size: 1.08rem;
        line-height: 1.2;
      }
      .log-note { padding: 18px; }
    }
  `;
  document.head.appendChild(style);

  const growthScene = document.querySelector('.complexity-grid')?.closest('.scene');
  if (growthScene && !document.querySelector('.log-note')) {
    const note = document.createElement('section');
    note.className = 'log-note';
    note.innerHTML = `
      <div class="log-note-head">
        <div>
          <div class="kicker">Logarithm · O(log N)</div>
          <h3>Кожне подвоєння input додає лише один крок.</h3>
        </div>
        <p>Для алгоритмів, що щоразу ділять problem space приблизно навпіл, зручно мислити через <strong>log₂ N</strong>.</p>
      </div>
      <div class="log-note-grid">
        <div class="log-note-card">
          <b>Definition</b>
          <div class="log-formula">log<sub>b</sub>(x) = y ⇔ b<sup>y</sup> = x</div>
          <p>Логарифм відповідає на питання: “у який степінь треба піднести base, щоб отримати x?”</p>
        </div>
        <div class="log-note-card">
          <b>Interview mental model</b>
          <div class="log-formula">log₂(N) = y ⇔ 2<sup>y</sup> = N</div>
          <div class="log-compare">
            <div><strong>N</strong><span>input</span></div>
            <div class="log-arrow">×2 →</div>
            <div><strong>+1</strong><span>step</span></div>
          </div>
        </div>
        <div class="log-note-card">
          <b>Example</b>
          <div class="log-formula">2<sup>10</sup> = 1024</div>
          <p>Тому при <strong>N ≈ 1,000</strong> logarithmic algorithm потребує приблизно <strong>10</strong> halving steps, тоді як linear algorithm — приблизно <strong>1,000</strong> units of work.</p>
        </div>
      </div>
      <div class="log-note-foot"><strong>Nuance:</strong> у Big O base логарифма зазвичай не пишуть, бо зміна base дає лише constant factor. Для binary search та інших halving algorithms природний mental model — base 2.</div>
    `;
    growthScene.insertAdjacentElement('afterend', note);
  }

  const sourceImage = document.querySelector('.chart-card img');
  if (sourceImage) {
    sourceImage.removeAttribute('loading');
    sourceImage.decoding = 'async';
    sourceImage.setAttribute('role', 'button');
    sourceImage.setAttribute('tabindex', '0');
    sourceImage.setAttribute('aria-label', 'Open Big O reference image full screen');

    const lightbox = document.createElement('div');
    lightbox.className = 'big-o-lightbox';
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <div class="big-o-lightbox-inner" role="dialog" aria-modal="true" aria-label="Big O reference image">
        <button class="big-o-lightbox-close" type="button" aria-label="Close full screen image">×</button>
        <img src="${sourceImage.currentSrc || sourceImage.src}" alt="${sourceImage.alt || 'Big O reference image'}">
      </div>
    `;
    document.body.appendChild(lightbox);

    const closeButton = lightbox.querySelector('.big-o-lightbox-close');
    const open = () => {
      lightbox.querySelector('img').src = sourceImage.currentSrc || sourceImage.src;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    };
    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      sourceImage.focus({ preventScroll: true });
    };

    sourceImage.addEventListener('click', open);
    sourceImage.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
    closeButton.addEventListener('click', close);
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) close();
    });
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !lightbox.hidden) close();
    });
  }

  document.querySelectorAll('.quiz').forEach(quiz => {
    const answer = quiz.dataset.answer;
    const buttons = [...quiz.querySelectorAll('.quiz-options button')];
    const feedback = quiz.querySelector('.quiz-feedback');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(option => option.classList.remove('answer-correct', 'answer-wrong', 'answer-reveal'));
        feedback?.classList.remove('feedback-correct', 'feedback-wrong');

        const selected = button.textContent.trim();
        const isCorrect = selected === answer;
        if (isCorrect) {
          button.classList.add('answer-correct');
          feedback?.classList.add('feedback-correct');
        } else {
          button.classList.add('answer-wrong');
          buttons.find(option => option.textContent.trim() === answer)?.classList.add('answer-reveal');
          feedback?.classList.add('feedback-wrong');
        }
      });
    });
  });
})();