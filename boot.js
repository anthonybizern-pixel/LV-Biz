// LV Coach : démarrage.
// Choisit la langue apprise (mémorisée dans le navigateur), puis charge son contenu et l'appli.
// Au tout premier lancement, un écran propose de choisir la langue.

const LANGS = [
  { code: 'en', label: 'Anglais', native: 'English', flag: '<span class="flag-uk" aria-hidden="true"></span>' },
  { code: 'ca', label: 'Catalan', native: 'Català', flag: '<span class="flag-ca" aria-hidden="true"></span>' },
  { code: 'de', label: 'Allemand', native: 'Deutsch', flag: '<span class="flag-de" aria-hidden="true"></span>' },
];
window.LANGS = LANGS; // utilisé par app.js (menu des langues, import)
const LANG_FILES = ['config', 'data', 'grammar', 'dialogues', 'sounds', 'stories', 'lexicon'];

// Hors ligne : le service worker garde l'appli en cache
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* hors ligne indisponible */ });
}

function loadLang(code) {
  // async = false : les scripts s'exécutent dans l'ordre d'ajout
  [...LANG_FILES.map(f => `lang/${code}/${f}.js`), 'app.js'].forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    document.body.appendChild(s);
  });
}

function showLangPicker() {
  let hadEnglish = false;
  try { hadEnglish = !!localStorage.getItem('english-coach-v1'); } catch (e) { /* ignore */ }
  document.getElementById('app').innerHTML = `
    <main class="page picker">
      <div class="picker-logo"><img src="icons/icon-192.png" alt="" width="96" height="96"></div>
      <h1>Bienvenue dans LV Coach</h1>
      <p class="muted">Quelle langue veux-tu apprendre ?</p>
      <div class="lang-list">
        ${LANGS.map(l => `
          <button class="lang-choice" data-code="${l.code}">
            <span class="lang-flag">${l.flag}</span>
            <span><b>${l.label}</b><span class="muted small">${l.native}</span></span>
            <span class="lang-go">›</span>
          </button>`).join('')}
      </div>
      <p class="muted small">${hadEnglish ? 'Ta progression en anglais est bien conservée. ' : ''}Tu pourras changer de langue à tout moment en touchant le drapeau en haut de l’écran. Chaque langue a sa propre progression.</p>
    </main>`;
  document.getElementById('app').addEventListener('click', function pick(e) {
    const btn = e.target.closest('[data-code]');
    if (!btn) return;
    this.removeEventListener('click', pick);
    try { localStorage.setItem('lv-lang', btn.dataset.code); } catch (err) { /* ignore */ }
    this.innerHTML = '';
    loadLang(btn.dataset.code);
  });
}

(function start() {
  let code = null;
  try { code = localStorage.getItem('lv-lang'); } catch (e) { /* ignore */ }
  if (LANGS.some(l => l.code === code)) loadLang(code);
  else showLangPicker();
})();
