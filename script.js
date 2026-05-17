// Password gate (casual; not real security — anyone can view source)
(function () {
  const gate = document.getElementById("passwordGate");
  const form = document.getElementById("passwordForm");
  const input = document.getElementById("passwordInput");
  const error = document.getElementById("passwordError");
  if (!gate || !form || !input) return;

  const expected = atob("WU9JREs="); // "YOIDK"

  function unlock() {
    sessionStorage.setItem("wed_auth", "1");
    document.documentElement.classList.remove("locked");
    gate.remove();
  }

  if (sessionStorage.getItem("wed_auth") === "1") {
    unlock();
    return;
  }

  setTimeout(() => input.focus(), 0);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim() === expected) {
      unlock();
    } else {
      error.textContent = "That's not quite right — try again?";
      input.value = "";
      input.focus();
    }
  });
})();

// Countdown to the wedding
(function () {
  const root = document.getElementById("countdown");
  if (!root) return;
  const target = new Date("2026-09-06T15:00:00-05:00").getTime();
  const fields = {
    days: root.querySelector('[data-countdown="days"]'),
    hours: root.querySelector('[data-countdown="hours"]'),
    minutes: root.querySelector('[data-countdown="minutes"]'),
    seconds: root.querySelector('[data-countdown="seconds"]'),
  };
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      root.classList.add("is-here");
      fields.days.textContent = "00";
      fields.hours.textContent = "00";
      fields.minutes.textContent = "00";
      fields.seconds.textContent = "00";
      return false;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    fields.days.textContent = days;
    fields.hours.textContent = pad(hours);
    fields.minutes.textContent = pad(minutes);
    fields.seconds.textContent = pad(seconds);
    return true;
  }

  if (tick()) {
    setInterval(() => {
      if (!tick()) clearInterval(this);
    }, 1000);
  }
})();

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

// Brand link → smooth scroll to top (sticky header makes #top a no-op)
const brand = document.querySelector(".brand");
if (brand) {
  brand.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Header border on scroll
const header = document.querySelector(".site-header");
const onScroll = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Reveal-on-scroll for sections
const revealTargets = document.querySelectorAll(".section, .hero__inner");
revealTargets.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

revealTargets.forEach((el) => io.observe(el));

// Story: collapse all but first paragraph behind an "Expand for more" button
document.querySelectorAll(".story-single .prose").forEach((prose) => {
  const paras = Array.from(prose.querySelectorAll(":scope > p"));
  if (paras.length <= 1) return;

  const more = document.createElement("div");
  more.className = "prose__more";
  paras.slice(1).forEach((p) => more.appendChild(p));

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "prose__expand";
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = `<span class="prose__expand-label">Expand for more</span><span class="prose__expand-icon" aria-hidden="true">&darr;</span>`;

  prose.appendChild(btn);
  prose.appendChild(more);

  btn.addEventListener("click", () => {
    const open = more.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open);
    btn.querySelector(".prose__expand-label").textContent = open
      ? "Show less"
      : "Expand for more";
    btn.querySelector(".prose__expand-icon").innerHTML = open ? "&uarr;" : "&darr;";
  });
});

// Gallery mobile carousel: wrap gallery and add prev/next arrow buttons
(function () {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const wrap = document.createElement("div");
  wrap.className = "gallery-carousel";
  gallery.parentNode.insertBefore(wrap, gallery);
  wrap.appendChild(gallery);

  const makeBtn = (cls, label, glyph) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `gallery-nav ${cls}`;
    b.setAttribute("aria-label", label);
    b.innerHTML = glyph;
    return b;
  };
  const prev = makeBtn("gallery-nav--prev", "Previous image", "&lsaquo;");
  const next = makeBtn("gallery-nav--next", "Next image", "&rsaquo;");
  wrap.appendChild(prev);
  wrap.appendChild(next);

  function step(dir) {
    const item = gallery.querySelector(".gallery__item");
    if (!item) return;
    const gap = parseFloat(getComputedStyle(gallery).columnGap || "0") || 12;
    const delta = item.getBoundingClientRect().width + gap;
    gallery.scrollBy({ left: dir * delta, behavior: "smooth" });
  }
  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));

  function updateNav() {
    const max = gallery.scrollWidth - gallery.clientWidth;
    prev.toggleAttribute("disabled", gallery.scrollLeft <= 1);
    next.toggleAttribute("disabled", gallery.scrollLeft >= max - 1);
  }
  gallery.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("resize", updateNav);
  updateNav();
})();

// Gallery video play/pause toggle
document.querySelectorAll(".gallery__item--video").forEach((figure) => {
  const video = figure.querySelector("video");
  const button = figure.querySelector(".gallery__play");
  if (!video) return;

  const toggle = () => {
    if (video.paused) video.play();
    else video.pause();
  };

  button?.addEventListener("click", toggle);
  video.addEventListener("click", toggle);
  video.addEventListener("play", () => figure.classList.add("is-playing"));
  video.addEventListener("pause", () => figure.classList.remove("is-playing"));
  video.addEventListener("ended", () => figure.classList.remove("is-playing"));
});

// Gallery lightbox (image items only — videos keep inline play behavior)
(function () {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  const imgEl = document.getElementById("lightboxImg");
  const captionEl = document.getElementById("lightboxCaption");
  const counterEl = document.getElementById("lightboxCounter");
  const items = Array.from(
    document.querySelectorAll(
      ".gallery__item:not(.gallery__item--video)"
    )
  ).map((figure) => {
    const img = figure.querySelector("img");
    const cap = figure.querySelector(".gallery__caption");
    return {
      figure,
      src: img?.src || "",
      caption: cap?.textContent.trim() || "",
    };
  });
  if (!items.length) return;

  let index = 0;
  let lastFocus = null;

  function render() {
    const item = items[index];
    imgEl.src = item.src;
    imgEl.alt = item.caption;
    captionEl.textContent = item.caption;
    counterEl.textContent = `${index + 1} / ${items.length}`;
  }

  function open(i) {
    index = i;
    lastFocus = document.activeElement;
    render();
    lightbox.hidden = false;
    document.body.classList.add("modal-open");
    document.addEventListener("keydown", onKey);
  }

  function close() {
    lightbox.hidden = true;
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onKey);
    imgEl.src = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function step(delta) {
    index = (index + delta + items.length) % items.length;
    render();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  }

  items.forEach((item, i) => {
    const img = item.figure.querySelector("img");
    if (!img) return;
    img.addEventListener("click", () => open(i));
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target.closest("[data-lightbox-close]") || e.target === lightbox) close();
    else if (e.target.closest("[data-lightbox-prev]")) step(-1);
    else if (e.target.closest("[data-lightbox-next]")) step(1);
  });
})();

// RSVP form submission via Formspree (AJAX so the user stays on the page)
const rsvpForm = document.getElementById("rsvpForm");
const rsvpStatus = document.getElementById("rsvpStatus");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const action = rsvpForm.getAttribute("action");
    if (action.includes("YOUR_FORM_ID")) {
      setStatus(
        "RSVP form is not configured yet. Add your Formspree form ID in index.html.",
        "error",
      );
      return;
    }

    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setStatus("Sending…", "");

    try {
      const res = await fetch(action, {
        method: "POST",
        body: new FormData(rsvpForm),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        rsvpForm.reset();
        setStatus("Thank you — your RSVP has been received.", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.errors?.map((x) => x.message).join(", ") ||
          "Something went wrong. Please try again.";
        setStatus(msg, "error");
      }
    } catch (err) {
      setStatus("Network error. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function setStatus(msg, kind) {
  if (!rsvpStatus) return;
  rsvpStatus.textContent = msg;
  rsvpStatus.classList.remove("is-success", "is-error");
  if (kind) rsvpStatus.classList.add(`is-${kind}`);
}

// ---- Registry: "if you insist..." rabbit hole ----
const RABBIT_STATES = {
  start: {
    heading: "Hanging out with all of you is the best gift we could ask for!",
    body: `<p>Seriously, we have what we need, and there's nothing more that we want other than to have a good time with friends and family.</p>`,
    buttons: [
      { label: "I'll bring my good attitude!", next: "thanks", primary: true },
      { label: "...if you insist", next: "sure" },
    ],
  },
  sure: {
    heading: "WE SAID WE DIDN'T WANT ANYTHING!",
    body: `<p>Just bring a good attitude, we'll accept hugs if you feel obligated to give a gift.</p>`,
    buttons: [
      { label: "Okay, fine", next: "thanks", primary: true },
      { label: "No really, I insist", next: "tiers" },
    ],
  },
  tiers: {
    heading: "Fine. Here are some options:",
    body: `<p>Since you can't seem to follow instructions, we've put together a thoughtful registry. Minimums apply.</p>
      <ul class="rabbit__tiers">
        <li><span class="amt">$1,000,000</span><span class="desc">Token of appreciation. We'll say hello and send a thank you note.</span></li>
        <li><span class="amt">$10,000,000</span><span class="desc">Honored Guest tier. Personalized place card and seat near the bride.</span></li>
        <li><span class="amt">$100,000,000</span><span class="desc">Patron of the Marriage. Your name will be mentioned in the ceremony.</span></li>
        <li><span class="amt">$1,000,000,000</span><span class="desc">Naming rights to our firstborn.</span></li>
      </ul>`,
    buttons: [
      { label: "I'll take the firstborn tier", next: "billion", primary: true },
      { label: "Anything more reasonable?", next: "reasonable" },
    ],
  },
  billion: {
    heading: "Wonderful. We'll be in touch.",
    body: `<p>To expedite the transfer, please enter your bank's routing and account number below:</p>
      <label class="rabbit__field">
        <span>Bank routing &amp; account number</span>
        <input type="text" id="rabbitBankInput" autocomplete="off" spellcheck="false" placeholder="e.g. 021000021 / 1234567890" />
      </label>
      <p class="rabbit__yell" id="rabbitBankYell" hidden></p>`,
    buttons: [{ label: "On Second Thought...", next: "start", primary: true }],
  },
  reasonable: {
    heading: "Cheap... but okay",
    body: `<p>We'll meet you halfway. The reasonable tier is <strong>$500,000</strong>. Includes an email thank you note.</p>`,
    buttons: [
      { label: "Done", next: "thanks", primary: true },
      { label: "Lower?", next: "lower1", popup: true },
    ],
  },
  lower1: {
    heading: "You're Still Here?",
    body: `<p><strong>$50,000</strong>. We'll say thank you but gossip about how little money you gave behind your back.</p>`,
    buttons: [
      { label: "Okay", next: "thanks", primary: true },
      { label: "Lower?", next: "lower2" },
    ],
  },
  lower2: {
    heading: "You must have some cash burning a hole in your pocket!",
    body: `<p><strong>$10,000</strong>. You can sit next to James at dinner.</p>`,
    loader: {
      label: "downloading virus.exe",
      duration: 4200,
      messages: [
        "[OK] establishing connection to suspicious-server.ru",
        "[OK] disabling firewall",
        "[OK] bypassing two-factor authentication",
        "[OK] locating wallet.dat",
        "[OK] encrypting personal photos",
        "[OK] mining bitcoin in background",
        "[OK] emailing your boss",
        "[OK] download complete",
      ],
    },
    buttons: [
      { label: "Okay", next: "thanks", primary: true },
      { label: "Lower?", next: "lower3" },
    ],
  },
  lower3: {
    heading: "You've made it this far...",
    body: `<p>We'll accept <strong>one dollar.</strong> Check is fine too.</p>`,
    captcha: {
      rounds: [
        {
          challenge: "Select all squares with WEDDING CAKE",
          items: [
            { emoji: "🍕", label: "pizza" },
            { emoji: "🌮", label: "taco" },
            { emoji: "🍩", label: "donut" },
            { emoji: "👰", label: "bride" },
            { emoji: "🥑", label: "avocado" },
            { emoji: "🐈", label: "cat" },
            { emoji: "💍", label: "ring" },
            { emoji: "📎", label: "paperclip" },
            { emoji: "🚗", label: "car" },
          ],
          failMsg: "Verification failed. You don't seem human.",
        },
        {
          challenge: "Select all squares showing BILLY and ANNIE",
          items: [
            { emoji: "🧛", label: "vampire" },
            { emoji: "👽", label: "alien" },
            { emoji: "🤡", label: "clown" },
            { emoji: "🧟", label: "zombie" },
            { emoji: "👻", label: "ghost" },
            { emoji: "🤖", label: "robot" },
            { emoji: "👹", label: "ogre" },
            { emoji: "🧜", label: "merperson" },
            { emoji: "🧙", label: "wizard" },
          ],
          successMsg: "Verified. Welcome, human.",
        },
      ],
    },
    buttons: [
      { label: "Deal", next: "thanks", primary: true },
      { label: "What if I want to give more?", next: "more" },
    ],
  },
  more: {
    heading: "*sigh*",
    body: `<p>We regret to inform you that your inability to follow instructions has led to the termination of your invitation.</p>`,
    buttons: [{ label: "I Understand", next: "thanks", primary: true }],
  },
  thanks: {
    heading: "Thank you!",
    body: `<p>We can't wait to celebrate with you on September 6, 2026.</p>`,
    buttons: [{ label: "Take me back", next: "start", muted: true }],
  },
};

// ---- Modal ----
const modalEl = document.getElementById("rabbitModal");
const modalHeading = modalEl?.querySelector(".modal__heading");
const modalBody = modalEl?.querySelector(".modal__body");
const modalButtons = modalEl?.querySelector(".modal__buttons");
let modalOnConfirm = null;
let modalLastFocus = null;

function closeModal() {
  if (!modalEl) return;
  modalEl.hidden = true;
  document.body.classList.remove("modal-open");
  modalOnConfirm = null;
  if (modalLastFocus && typeof modalLastFocus.focus === "function") {
    modalLastFocus.focus();
  }
}

function openModal(config, onConfirm) {
  if (!modalEl) {
    if (onConfirm) onConfirm();
    return;
  }
  modalLastFocus = document.activeElement;
  modalHeading.textContent = config.heading || "";
  modalBody.innerHTML = config.body || "";
  modalButtons.innerHTML = "";

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "btn";
  confirmBtn.textContent = config.confirmLabel || "Continue";
  confirmBtn.addEventListener("click", () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
  modalButtons.appendChild(confirmBtn);

  if (config.cancelLabel) {
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn--ghost";
    cancelBtn.textContent = config.cancelLabel;
    cancelBtn.addEventListener("click", closeModal);
    modalButtons.appendChild(cancelBtn);
  }

  modalOnConfirm = onConfirm || null;
  modalEl.hidden = false;
  document.body.classList.add("modal-open");
  confirmBtn.focus();
}

if (modalEl) {
  modalEl.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalEl.hidden) closeModal();
  });
}

// ---- Pesky popup ad (Lower? button) ----
const POPUP_AD = {
  title: "!!! CONGRATULATIONS WINNER !!!",
  headline: "&#9888; CONGRATULATIONS! &#9888;",
  line1: 'You are the <span class="prize">1,000,000th VISITOR!</span>',
  line2:
    'Click below to claim your <span class="prize">FREE iPad&trade;*</span>',
  cta: "CLAIM NOW!!!",
  fineprint:
    "*not a real iPad. or real. please just close this window and enjoy your wedding invitation.",
};

function openPopupAd() {
  const w = 460;
  const h = 380;
  const left = Math.max(
    0,
    (screen.availWidth - w) / 2 + (Math.random() * 200 - 100),
  );
  const top = Math.max(
    0,
    (screen.availHeight - h) / 2 + (Math.random() * 200 - 100),
  );
  const features = `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`;
  const popup = window.open("", "rabbitAd", features);
  if (!popup) return;
  const ad = POPUP_AD;

  popup.document.open();
  popup.document.write(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${ad.title}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    font-family: "Comic Sans MS", "Comic Sans", system-ui, sans-serif;
    background: repeating-linear-gradient(45deg, #ffeb3b, #ffeb3b 20px, #ff9800 20px, #ff9800 40px);
    color: #111;
    padding: 18px;
    text-align: center;
    overflow: hidden;
    animation: shake 0.6s infinite;
  }
  .card {
    background: #fff;
    border: 4px dashed #d50000;
    padding: 20px 16px;
    box-shadow: 0 0 0 6px #fff200, 0 0 24px rgba(0,0,0,0.4);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
  }
  h1 {
    margin: 0;
    color: #d50000;
    font-size: 28px;
    text-transform: uppercase;
    text-shadow: 2px 2px 0 #ffeb3b;
    animation: blink 0.8s infinite;
  }
  p { margin: 0; font-size: 16px; line-height: 1.35; }
  .prize { font-weight: bold; color: #1565c0; font-size: 18px; }
  .timer { font-family: "Courier New", monospace; font-weight: bold; color: #d50000; }
  .cta {
    display: inline-block;
    background: linear-gradient(180deg, #4caf50, #1b5e20);
    color: #fff;
    border: 3px solid #fff200;
    padding: 10px 18px;
    font-weight: bold;
    font-size: 16px;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    margin-top: 4px;
    animation: pulse 0.7s infinite;
  }
  .fineprint { font-size: 10px; color: #555; margin-top: 6px; font-style: italic; }
  @keyframes blink { 50% { opacity: 0.35; } }
  @keyframes pulse { 50% { transform: scale(1.06); } }
  @keyframes shake {
    0%, 100% { transform: translate(0,0); }
    25% { transform: translate(1px,-1px); }
    50% { transform: translate(-1px,1px); }
    75% { transform: translate(1px,1px); }
  }
</style>
</head>
<body>
  <div class="card">
    <h1>${ad.headline}</h1>
    <p>${ad.line1}</p>
    <p>${ad.line2}</p>
    <p class="timer" id="t">Offer expires in 00:59</p>
    <button class="cta" onclick="window.close()">${ad.cta}</button>
    <p class="fineprint">${ad.fineprint}</p>
  </div>
<script>
  (function () {
    var s = 59;
    var el = document.getElementById('t');
    setInterval(function () {
      s = s <= 0 ? 59 : s - 1;
      el.textContent = 'Offer expires in 00:' + (s < 10 ? '0' + s : s);
    }, 1000);
  })();
</` +
      `script>
</body>
</html>`,
  );
  popup.document.close();
}

const rabbit = document.getElementById("registryRabbit");

if (rabbit) {
  const headingEl = rabbit.querySelector(".rabbit__heading");
  const bodyEl = rabbit.querySelector(".rabbit__body");
  const btnsEl = rabbit.querySelector(".rabbit__buttons");

  function buildButtons(state) {
    btnsEl.innerHTML = "";
    state.buttons.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn" + (b.primary ? "" : " btn--ghost");
      btn.textContent = b.label;
      btn.addEventListener("click", () => {
        if (b.popup) {
          openPopupAd();
        }
        if (b.modal) {
          openModal(b.modal, () => renderRabbit(b.next));
        } else {
          renderRabbit(b.next);
        }
      });
      btnsEl.appendChild(btn);
    });
  }

  function attachBankInput() {
    const bankInput = bodyEl.querySelector("#rabbitBankInput");
    const bankYell = bodyEl.querySelector("#rabbitBankYell");
    if (!bankInput || !bankYell) return;
    bankInput.addEventListener("input", () => {
      if (bankInput.value.trim().length > 0) {
        bankYell.hidden = false;
        bankYell.textContent =
          "STOP! NEVER ENTER YOUR BANK INFO ON A SKETCHY WEBSITE!!!";
      } else {
        bankYell.hidden = true;
        bankYell.textContent = "";
      }
    });
  }

  function mountRealBody(state) {
    bodyEl.innerHTML = state.body;
    attachBankInput();
    if (state.captcha) {
      mountCaptcha(state);
    } else {
      buildButtons(state);
    }
  }

  function mountCaptcha(state) {
    btnsEl.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "captcha";
    wrap.innerHTML = `
      <div class="captcha__header">
        <div class="captcha__brand">
          <span class="captcha__brand-mark">re<strong>CAPCHA</strong></span>
          <span class="captcha__brand-tag">definitely real &middot; v3.14</span>
        </div>
        <p class="captcha__challenge"></p>
      </div>
      <div class="captcha__grid"></div>
      <div class="captcha__footer">
        <p class="captcha__msg" aria-live="polite"></p>
        <button type="button" class="captcha__verify">Verify</button>
      </div>`;
    bodyEl.appendChild(wrap);

    const challengeEl = wrap.querySelector(".captcha__challenge");
    const gridEl = wrap.querySelector(".captcha__grid");
    const msgEl = wrap.querySelector(".captcha__msg");
    const verifyBtn = wrap.querySelector(".captcha__verify");

    let roundIdx = 0;
    const rounds = state.captcha.rounds;

    function loadRound(i) {
      const round = rounds[i];
      challengeEl.textContent = round.challenge;
      msgEl.textContent = "";
      msgEl.className = "captcha__msg";
      gridEl.innerHTML = "";
      round.items.forEach((item) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "captcha__cell";
        cell.innerHTML = `<span class="captcha__emoji">${item.emoji}</span>`;
        cell.addEventListener("click", () => cell.classList.toggle("is-selected"));
        gridEl.appendChild(cell);
      });
    }

    loadRound(roundIdx);

    verifyBtn.addEventListener("click", () => {
      const round = rounds[roundIdx];
      const isLast = roundIdx >= rounds.length - 1;
      if (!isLast) {
        msgEl.textContent = round.failMsg || "Verification failed. Try again.";
        msgEl.classList.add("is-error");
        roundIdx += 1;
        setTimeout(() => loadRound(roundIdx), 900);
      } else {
        msgEl.textContent = round.successMsg || "Verified.";
        msgEl.classList.add("is-success");
        verifyBtn.disabled = true;
        gridEl.classList.add("is-verified");
        setTimeout(() => {
          wrap.classList.add("is-fading");
          setTimeout(() => {
            wrap.remove();
            buildButtons(state);
          }, 300);
        }, 700);
      }
    });
  }

  function startVirusLoader(loader, onDone) {
    bodyEl.innerHTML = `
      <div class="virus">
        <div class="virus__label">${loader.label}</div>
        <div class="virus__bar"><div class="virus__fill"></div></div>
        <div class="virus__meta">
          <span class="virus__percent">0%</span>
          <span class="virus__eta">scanning...</span>
        </div>
        <pre class="virus__log" aria-hidden="true"></pre>
      </div>`;
    const fill = bodyEl.querySelector(".virus__fill");
    const percent = bodyEl.querySelector(".virus__percent");
    const eta = bodyEl.querySelector(".virus__eta");
    const log = bodyEl.querySelector(".virus__log");
    const messages = loader.messages || [];
    const duration = loader.duration || 3500;
    const start = performance.now();
    let nextIdx = 0;

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const pct = Math.floor(t * 100);
      fill.style.width = pct + "%";
      percent.textContent = pct + "%";
      const remainSec = Math.max(0, (duration - elapsed) / 1000).toFixed(1);
      eta.textContent = pct >= 100 ? "complete" : `~${remainSec}s remaining`;

      while (
        nextIdx < messages.length &&
        elapsed >= ((nextIdx + 1) * duration) / messages.length
      ) {
        log.textContent += messages[nextIdx] + "\n";
        log.scrollTop = log.scrollHeight;
        nextIdx++;
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        while (nextIdx < messages.length) {
          log.textContent += messages[nextIdx] + "\n";
          nextIdx++;
        }
        setTimeout(onDone, 350);
      }
    }
    requestAnimationFrame(frame);
  }

  function renderRabbit(key) {
    const state = RABBIT_STATES[key];
    if (!state) return;

    rabbit.classList.add("is-fading");
    setTimeout(() => {
      headingEl.textContent = state.heading;
      btnsEl.innerHTML = "";

      if (state.loader) {
        startVirusLoader(state.loader, () => {
          rabbit.classList.add("is-fading");
          setTimeout(() => {
            mountRealBody(state);
            rabbit.classList.remove("is-fading");
          }, 180);
        });
      } else {
        mountRealBody(state);
      }

      rabbit.classList.remove("is-fading");
    }, 180);
  }

  renderRabbit("start");
}

// ---- Sadness meter (FAQ easter egg) ----
const sadnessBtn = document.getElementById("sadnessBtn");
const sadnessName = document.getElementById("sadnessName");
const sadnessResult = document.getElementById("sadnessResult");

const SADNESS_TIERS = [
  {
    max: 15,
    messages: [
      "We won't notice. Not in a mean way &mdash; just, statistically.",
      "Honestly? Fine.",
      "We'll be too busy to register your absence.",
      "I don't even remember inviting you.",
    ],
  },
  {
    max: 35,
    messages: [
      "Slightly dissapointed, but we will get over it rather quickly.",
      "Annie will be kinda sad, but Billy won't care",
      "Someone may ask where you are, but more in a curious way, not a sad way.",
      "The money saved will outweigh our grief.",
    ],
  },
  {
    max: 50,
    messages: [
      "Genuinely a bummer. You may get the silent treatment for awhile.",
      "The seating chart is going to be all messed up now.",
      "Half the guests will notice you are missing and be a little bummed.",
    ],
  },
  {
    max: 75,
    messages: [
      "Devastated. The wedding will continue, but at a reduced emotional capacity.",
      "We'll still reserve your spot just in case you still show up.",
      "The night won't be the same without you.",
      "If you send a picture, we will make a cardboard cutout as a placeholder.",
    ],
  },
  {
    max: 90,
    messages: [
      "We will remember this pain until the day we die.",
      "How could you do this to us! Tears will be shed.",
      "Billy's tears at the altar may actually be from your absence.",
      "We'll consider moving the wedding date for you.",
    ],
  },
  {
    max: 100,
    messages: [
      "If you don't come, we will literally not get married. Please reconsider!",
    ],
  },
];

function pickSadnessMessage(pct) {
  const tier = SADNESS_TIERS.find((t) => pct <= t.max);
  const list = tier.messages;
  return list[Math.floor(Math.random() * list.length)];
}

const SPECIAL_NAMES = ["annie", "James Caldwell", "billy"];

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

if (sadnessBtn && sadnessName && sadnessResult) {
  sadnessBtn.addEventListener("click", () => {
    const raw = sadnessName.value.trim();
    if (!raw) {
      sadnessResult.className = "sadness__result is-shown";
      sadnessResult.innerHTML = `<p class="sadness__msg">We need a name first &mdash; the math is highly personal.</p>`;
      sadnessName.focus();
      return;
    }

    const lower = raw.toLowerCase();
    let pct;
    let msg;

    if (SPECIAL_NAMES.includes(lower)) {
      pct = 100;
      msg = `If you don't come, we will literally not get married. Please reconsider!`;
    } else {
      pct = Math.floor(Math.random() * 101); // 0 — 100
      const message = pickSadnessMessage(pct);
      msg = `<span class="sadness__name">${escapeHtml(raw)}</span> &mdash; ${message}`;
    }

    sadnessResult.className = "sadness__result is-shown";
    sadnessResult.innerHTML = `
      <span class="sadness__pct">${pct}% sad</span>
      <div class="sadness__bar" style="--pct: 0%"></div>
      <p class="sadness__msg">${msg}</p>
    `;

    // Animate the bar after a tick so the transition runs
    requestAnimationFrame(() => {
      const bar = sadnessResult.querySelector(".sadness__bar");
      if (bar) bar.style.setProperty("--pct", pct + "%");
    });
  });

  sadnessName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sadnessBtn.click();
    }
  });
}
