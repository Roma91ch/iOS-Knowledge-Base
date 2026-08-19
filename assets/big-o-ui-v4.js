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
    }
  `;
  document.head.appendChild(style);

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
