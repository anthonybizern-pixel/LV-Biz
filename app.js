'use strict';

/* ================= Utilitaires ================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const DAY = 86400000;
const STORAGE_KEY = 'english-coach-v1';
const INTERVALS = [0, 1, 2, 4, 8, 16, 35, 70]; // jours avant la prochaine révision, selon le niveau
const MAX_BOX = INTERVALS.length - 1;
const MASTERED = 4;
const PRAISE = ['Bravo !', 'Excellent !', 'Parfait !', 'Super !', 'Bien joué !', 'Génial !', 'Impeccable !'];

const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const today = () => dayKey(Date.now());
const yesterday = () => dayKey(Date.now() - DAY);
// Mise en forme légère des textes de fiches : **gras**, *italique*, retours à la ligne
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
const fmtTime = s => s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')}`;

/* ================= Contenu ================= */
const ALL = [];
UNITS.forEach(u => {
  u.items = u.items.map((it, i) => {
    const o = { id: `${u.id}-${i}`, unit: u.id, en: it[0], fr: it[1], alts: it[2] || [] };
    ALL.push(o);
    return o;
  });
});
// Unités triées par niveau (le tri est stable : l'ordre du fichier est conservé dans un niveau)
const LEVEL_IDS = LEVELS.map(l => l.id);
// Les thèmes à la carte passent après le parcours
const unitOrder = u => u.theme ? LEVEL_IDS.length : LEVEL_IDS.indexOf(u.level);
UNITS.sort((a, b) => unitOrder(a) - unitOrder(b));
const UNIT_BY_ID = Object.fromEntries(UNITS.map(u => [u.id, u]));
const BY_ID = Object.fromEntries(ALL.map(i => [i.id, i]));
const DIALOGUE_BY_UNIT = Object.fromEntries(DIALOGUES.map(d => [d.unit, d]));

/* ================= Sauvegarde ================= */
const DEFAULT_SETTINGS = { accent: 'en-US', voice: '', rate: 0.9, dailyGoal: 30, autoplay: true, listening: true, speaking: true, sounds: true, unlockAll: false };
const EMPTY = { box: 0, seen: false, due: 0, ok: 0, ko: 0 };

function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { /* stockage indisponible */ }
  return {
    items: {}, xp: 0, streak: 0, bestStreak: 0, lastDay: null, daily: {}, lessons: 0, answers: 0, good: 0, openLevels: {}, fichesSeen: {}, dialogues: {}, custom: [], sounds: {}, badges: {}, perfects: 0, reviews: 0, flags: {},
    ...s,
    settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) },
  };
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { toast('Impossible de sauvegarder la progression'); }
}
let state = load();

/* ---------- Mes expressions (unité personnelle) ---------- */
const MY_ID = 'my';
const MY_MIN = 4; // nombre d'expressions nécessaire pour lancer une leçon

// (Re)construit l'unité « Mes expressions » à partir de state.custom
function syncCustomUnit() {
  let u = UNIT_BY_ID[MY_ID];
  if (!u) {
    u = { id: MY_ID, level: null, theme: true, custom: true, icon: '⭐', title: 'Mes expressions', desc: 'Les mots que tu ajoutes toi-même', items: [] };
    UNITS.push(u);
    UNIT_BY_ID[MY_ID] = u;
  }
  for (let k = ALL.length - 1; k >= 0; k--) {
    if (ALL[k].unit === MY_ID) { delete BY_ID[ALL[k].id]; ALL.splice(k, 1); }
  }
  u.items = (state.custom || []).map(c => ({ id: `my-${c.id}`, unit: MY_ID, en: c.en, fr: c.fr, alts: c.alts || [] }));
  u.items.forEach(o => { ALL.push(o); BY_ID[o.id] = o; });
}
syncCustomUnit();

const peek = id => state.items[id] || EMPTY;
const st = id => state.items[id] || (state.items[id] = { ...EMPTY });
const currentStreak = () => (state.lastDay === today() || state.lastDay === yesterday()) ? state.streak : 0;
const unitProgress = u => u.items.length ? u.items.reduce((s, i) => s + Math.min(peek(i.id).box, MASTERED), 0) / (MASTERED * u.items.length) : 0;
const isLevelStart = i => i === 0 || UNITS[i - 1].level !== UNITS[i].level;
const unitUnlocked = i => {
  const u = UNITS[i];
  if (u.theme) return u.items.length >= MY_MIN || !u.custom;
  if (i === 0 || state.settings.unlockAll || u.items.some(it => peek(it.id).seen)) return true;
  if (isLevelStart(i) && state.openLevels[u.level]) return true;
  return unitProgress(UNITS[i - 1]) >= 0.5;
};
const levelUnits = id => UNITS.filter(u => u.level === id && !u.theme);
const themeUnits = () => UNITS.filter(u => u.theme && !u.custom);
const levelProgress = id => { const us = levelUnits(id); return us.reduce((s, u) => s + unitProgress(u), 0) / us.length; };
const dueItems = () => ALL.filter(i => peek(i.id).seen && peek(i.id).due <= Date.now());

/* ================= Sens des mots ================= */
// Rend chaque mot anglais d'un texte cliquable (le texte est découpé avant d'être échappé)
function clickable(text) {
  return String(text).split(/([A-Za-z][A-Za-z'’-]*[A-Za-z]|[A-Za-z])/)
    .map((part, k) => k % 2 ? `<span class="w" data-action="word" data-w="${esc(part)}">${esc(part)}</span>` : esc(part))
    .join('');
}

// Cherche un mot dans le lexique, en retrouvant la forme de base des formes régulières
function lookup(word) {
  const w = word.toLowerCase().replace(/’/g, "'");
  const base = w.replace(/'s$/, '');
  const cands = [w, base];
  const add = s => { if (s && !cands.includes(s)) cands.push(s); };
  if (/ies$|ied$/.test(base)) add(base.slice(0, -3) + 'y');
  if (/s$/.test(base)) add(base.slice(0, -1));
  if (/es$/.test(base)) add(base.slice(0, -2));
  // « noted » → note avant not, « noting » → note avant not
  if (/ed$/.test(base)) { add(base.slice(0, -1)); add(base.slice(0, -2)); }
  if (/ing$/.test(base)) { add(base.slice(0, -3) + 'e'); add(base.slice(0, -3)); }
  if (/er$/.test(base)) { add(base.slice(0, -2)); add(base.slice(0, -1)); }
  if (/est$/.test(base)) add(base.slice(0, -3));
  // consonne doublée : running → run, kidding → kid
  cands.slice().forEach(c => { if (/([b-df-hj-np-tv-z])\1$/.test(c)) add(c.slice(0, -1)); });
  const key = cands.find(c => LEXICON[c]);
  return key ? { key, tr: LEXICON[key] } : null;
}

function openWord(word) {
  closeOverlays();
  const hit = lookup(word);
  const re = new RegExp(`(^|[^A-Za-z'])${word.replace(/[^A-Za-z'’-]/g, '')}([^A-Za-z']|$)`, 'i');
  const examples = ALL.filter(i => re.test(i.en)).slice(0, 3);
  const mark = en => clickable(en).replace(new RegExp(`(>)(${word})(<)`, 'gi'), '$1<mark>$2</mark>$3');
  const el = document.createElement('div');
  el.className = 'overlay sheet-wrap';
  el.innerHTML = `
    <div class="sheet-backdrop" data-action="closeOverlay"></div>
    <div class="sheet" role="dialog" aria-label="Sens du mot">
      <div class="sheet-head">
        <button class="speaker" data-action="say" data-text="${esc(word)}" title="Écouter">🔊</button>
        <div class="sheet-word">${esc(word)}${hit && hit.key !== word.toLowerCase() ? `<span class="muted small"> → ${esc(hit.key)}</span>` : ''}</div>
        <button class="icon-btn" data-action="closeOverlay" title="Fermer">✕</button>
      </div>
      <div class="sheet-tr">${hit ? esc(hit.tr) : '<span class="muted">Pas encore dans le lexique : regarde les exemples ci-dessous.</span>'}</div>
      ${examples.length ? `
        <div class="muted small">Dans le cours :</div>
        <ul class="sheet-ex">${examples.map(i => `<li><b>${mark(i.en)}</b><span class="muted">${esc(i.fr)}</span></li>`).join('')}</ul>` : ''}
    </div>`;
  document.body.appendChild(el);
  if (state.settings.autoplay) speak(word);
}

function closeOverlays() { $$('.overlay').forEach(o => o.remove()); }

/* ================= Badges ================= */
const masteredCount = () => ALL.filter(i => peek(i.id).box >= MASTERED).length;
const dialoguesDone = () => Object.values(state.dialogues).filter(x => x.done).length;
const unitsDone = ids => ids.every(id => UNIT_BY_ID[id] && unitProgress(UNIT_BY_ID[id]) >= 1);

const BADGES = [
  { id: 'first', icon: '🐣', name: 'Premiers pas', desc: 'Terminer ta première leçon', test: s => s.lessons >= 1 },
  { id: 'lessons10', icon: '📚', name: 'Studieux', desc: 'Terminer 10 leçons', test: s => s.lessons >= 10 },
  { id: 'lessons50', icon: '🎓', name: 'Assidu', desc: 'Terminer 50 leçons', test: s => s.lessons >= 50 },
  { id: 'lessons200', icon: '🏛️', name: 'Infatigable', desc: 'Terminer 200 leçons', test: s => s.lessons >= 200 },
  { id: 'streak3', icon: '🔥', name: 'Ça chauffe', desc: '3 jours d’affilée', test: s => s.bestStreak >= 3 },
  { id: 'streak7', icon: '📅', name: 'Une semaine pile', desc: '7 jours d’affilée', test: s => s.bestStreak >= 7 },
  { id: 'streak30', icon: '🌋', name: 'Inarrêtable', desc: '30 jours d’affilée', test: s => s.bestStreak >= 30 },
  { id: 'streak100', icon: '💯', name: 'Centenaire', desc: '100 jours d’affilée', test: s => s.bestStreak >= 100 },
  { id: 'xp500', icon: '⭐', name: '500 XP', desc: 'Cumuler 500 XP', test: s => s.xp >= 500 },
  { id: 'xp2000', icon: '🌟', name: '2 000 XP', desc: 'Cumuler 2 000 XP', test: s => s.xp >= 2000 },
  { id: 'xp10000', icon: '🌠', name: '10 000 XP', desc: 'Cumuler 10 000 XP', test: s => s.xp >= 10000 },
  { id: 'words25', icon: '🌱', name: 'Jeune pousse', desc: 'Maîtriser 25 expressions', test: () => masteredCount() >= 25 },
  { id: 'words100', icon: '🌳', name: 'Bien enraciné', desc: 'Maîtriser 100 expressions', test: () => masteredCount() >= 100 },
  { id: 'words300', icon: '🏔️', name: 'Vocabulaire de sommet', desc: 'Maîtriser 300 expressions', test: () => masteredCount() >= 300 },
  { id: 'perfect', icon: '🎯', name: 'Sans faute', desc: 'Réussir une leçon à 100 %', test: s => s.perfects >= 1 },
  { id: 'perfect10', icon: '🏹', name: 'Tireur d’élite', desc: '10 leçons sans faute', test: s => s.perfects >= 10 },
  { id: 'review10', icon: '🧠', name: 'Mémoire d’éléphant', desc: 'Terminer 10 séances de révision', test: s => s.reviews >= 10 },
  { id: 'unit', icon: '👑', name: 'Couronné', desc: 'Terminer une unité à 100 %', test: () => UNITS.some(u => !u.custom && unitProgress(u) >= 1) },
  ...LEVELS.map(l => ({ id: `level${l.id}`, icon: '🏅', name: `Niveau ${l.id} terminé`, desc: `Atteindre 100 % sur toutes les unités ${l.id}`, test: () => levelProgress(l.id) >= 1 })),
  { id: 'travel', icon: '✈️', name: 'Prêt à voyager', desc: 'Terminer « Voyager » et « Aéroport et hôtel »', test: () => unitsDone(['u6', 'u32']) },
  { id: 'pro', icon: '💼', name: 'Anglais pro', desc: 'Terminer « Le travail », « Téléphone et e-mails » et « Négocier au travail »', test: () => unitsDone(['u8', 'u20', 'u25']) },
  { id: 'dialog1', icon: '💬', name: 'Premier échange', desc: 'Réussir un mini-dialogue', test: () => dialoguesDone() >= 1 },
  { id: 'dialogPerfect', icon: '✨', name: 'Répartie parfaite', desc: 'Réussir un dialogue sans aucune erreur', test: s => Object.values(s.dialogues).some(x => x.done && x.best === 0) },
  { id: 'dialog10', icon: '🗣️', name: 'Bavard', desc: 'Réussir 10 mini-dialogues', test: () => dialoguesDone() >= 10 },
  { id: 'dialogAll', icon: '🎙️', name: 'Maître de la conversation', desc: 'Réussir tous les mini-dialogues', test: () => dialoguesDone() >= DIALOGUES.length },
  { id: 'ear', icon: '👂', name: 'Oreille fine', desc: 'Faire 10/10 à un entraînement de sons', test: s => Object.values(s.sounds).some(v => v >= 10) },
  { id: 'earAll', icon: '🦻', name: 'Oreille absolue', desc: 'Faire 10/10 à tous les sons difficiles', test: s => SOUNDS.every(g => s.sounds[g.id] >= 10) },
  { id: 'placement', icon: '🧭', name: 'Explorateur', desc: 'Passer le test de niveau', test: s => !!s.placement },
  { id: 'custom10', icon: '✍️', name: 'Collectionneur', desc: 'Ajouter 10 expressions perso', test: s => s.custom.length >= 10 },
  { id: 'early', icon: '🌅', name: 'Lève-tôt', desc: 'Faire une leçon avant 8 h', test: s => !!s.flags.early },
  { id: 'night', icon: '🦉', name: 'Oiseau de nuit', desc: 'Faire une leçon après 22 h', test: s => !!s.flags.night },
];

// Attribue les badges nouvellement mérités ; affiche une célébration sauf en mode silencieux
function checkBadges(silent = false) {
  const fresh = BADGES.filter(b => !state.badges[b.id] && b.test(state));
  if (!fresh.length) return;
  fresh.forEach(b => { state.badges[b.id] = today(); });
  save();
  if (!silent) setTimeout(() => celebrate(fresh), 400);
}

function celebrate(list) {
  closeOverlays();
  const el = document.createElement('div');
  el.className = 'overlay modal-wrap';
  el.innerHTML = `
    <div class="modal" role="dialog" aria-label="Nouveau badge">
      <div class="modal-burst">🎉</div>
      <div class="muted small">${list.length > 1 ? `${list.length} nouveaux badges !` : 'Nouveau badge !'}</div>
      ${list.map(b => `
        <div class="badge-big">
          <span class="badge-icon">${b.icon}</span>
          <div><b>${esc(b.name)}</b><div class="muted small">${esc(b.desc)}</div></div>
        </div>`).join('')}
      <button class="btn btn-primary wide" data-action="closeOverlay">Super !</button>
    </div>`;
  document.body.appendChild(el);
  beep(true);
}

/* ================= Comparaison des réponses ================= */
const CONTRACTIONS = {
  "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are', "he's": 'he is', "she's": 'she is',
  "it's": 'it is', "that's": 'that is', "what's": 'what is', "where's": 'where is', "there's": 'there is',
  "i've": 'i have', "you've": 'you have', "we've": 'we have', "they've": 'they have',
  "i'll": 'i will', "you'll": 'you will', "he'll": 'he will', "she'll": 'she will', "we'll": 'we will', "they'll": 'they will', "it'll": 'it will',
  "i'd": 'i would', "you'd": 'you would', "we'd": 'we would', "he'd": 'he would', "she'd": 'she would',
  "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "can't": 'can not', cannot: 'can not', "won't": 'will not',
  "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not', "hasn't": 'has not',
  "couldn't": 'could not', "wouldn't": 'would not', "shouldn't": 'should not', "let's": 'let us',
};
const NUMBERS = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen',
  19: 'nineteen', 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty', 100: 'hundred',
};

function norm(s) {
  return fold(String(s))
    .replace(/[’‘`´]/g, "'")
    .replace(/-/g, '')
    .replace(/[^a-z0-9' ]+/g, ' ')
    .split(/\s+/)
    .flatMap(w => {
      w = w.replace(/^'+|'+$/g, '');
      if (!w) return [];
      if (CONTRACTIONS[w]) return CONTRACTIONS[w].split(' ');
      if (NUMBERS[w]) return [NUMBERS[w]];
      return [w.replace(/'/g, '')];
    })
    .join(' ');
}
const accepted = item => [...new Set([item.en, ...item.alts].map(norm))];

function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

// strict : seule la phrase principale est acceptée (dictée)
function checkText(input, item, strict = false) {
  const a = norm(input);
  if (!a) return { ok: false };
  const targets = strict ? [norm(item.en)] : accepted(item);
  let best = null;
  for (const t of targets) { const d = lev(a, t); if (!best || d < best.d) best = { d, t }; }
  if (best.d === 0) return { ok: true };
  const tolerance = best.t.length <= 4 ? 0 : best.t.length <= 12 ? 1 : best.t.length <= 30 ? 2 : 3;
  return best.d <= tolerance ? { ok: true, typo: true } : { ok: false };
}

/* ================= Audio ================= */
let voices = [];
function loadVoices() { voices = window.speechSynthesis ? speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)) : []; }
if (window.speechSynthesis) {
  loadVoices();
  speechSynthesis.onvoiceschanged = () => { loadVoices(); if (screen === 'settings') render(); };
}
function chooseVoice() {
  const s = state.settings;
  if (s.voice) { const v = voices.find(v => v.name === s.voice); if (v) return v; }
  const same = voices.filter(v => v.lang.replace('_', '-').toLowerCase() === s.accent.toLowerCase());
  const pool = same.length ? same : voices;
  return pool.find(v => /natural|neural|online/i.test(v.name)) || pool.find(v => /google/i.test(v.name)) || pool[0] || null;
}
// Voix des personnages de dialogue : une autre voix anglaise que la voix principale, si possible
function altVoice() {
  const main = chooseVoice();
  const others = voices.filter(v => v !== main);
  const same = others.filter(v => v.lang.replace('_', '-').toLowerCase() === state.settings.accent.toLowerCase());
  const pool = same.length ? same : others;
  return pool.find(v => /natural|neural|online/i.test(v.name)) || pool.find(v => /google/i.test(v.name)) || pool[0] || main;
}
// queue : ne coupe pas la phrase en cours · alt : voix du personnage
function speak(text, slow = false, { queue = false, alt = false } = {}) {
  if (!window.speechSynthesis) return;
  if (!queue) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = alt ? altVoice() : chooseVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = state.settings.accent;
  // Si une seule voix est installée, on distingue le personnage par la hauteur
  if (alt && v === chooseVoice()) u.pitch = 1.25;
  u.rate = state.settings.rate * (slow ? 0.6 : 1);
  speechSynthesis.speak(u);
}

let actx;
const canVibrate = 'vibrate' in navigator && matchMedia('(pointer: coarse)').matches;
function beep(ok) {
  if (!state.settings.sounds) return;
  if (canVibrate) { try { navigator.vibrate(ok ? 18 : [40, 60, 40]); } catch (e) { /* pas de vibration */ } }
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    (ok ? [660, 880] : [220, 175]).forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.11;
      o.type = ok ? 'sine' : 'square';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(ok ? 0.2 : 0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(actx.destination);
      o.start(t);
      o.stop(t + 0.2);
    });
  } catch (e) { /* pas de son */ }
}

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const speakingOn = () => !!SR && state.settings.speaking && !(L && L.noSpeak);
const listeningOn = () => state.settings.listening && !(L && L.noListen);

/* ================= Construction des leçons ================= */
function makeExercise(item, minBox = 0) {
  const b = Math.max(peek(item.id).box, minBox);
  const long = item.en.split(' ').length >= 3;
  let types;
  if (b <= 1) types = ['mc_fr_en', 'listen_mc', 'mc_en_fr', long ? 'wordbank' : 'mc_fr_en'];
  else if (b <= 3) types = ['type_fr_en', 'dictation', long ? 'wordbank' : 'listen_mc', long ? 'wordbank' : 'mc_fr_en'];
  else types = ['type_fr_en', 'type_fr_en', 'dictation', long ? 'wordbank' : 'dictation'];
  if (b >= 1 && SR && state.settings.speaking) types.push('speak');
  return { type: pick(types), item };
}

function buildUnitLesson(unit) {
  const fresh = unit.items.filter(i => !peek(i.id).seen);
  const seen = unit.items.filter(i => peek(i.id).seen)
    .sort((a, b) => peek(a.id).box - peek(b.id).box || peek(a.id).due - peek(b.id).due);
  const newOnes = fresh.slice(0, seen.length ? 3 : 4);
  const firstTest = item => ({ type: pick(['mc_fr_en', 'listen_mc', 'mc_en_fr']), item });

  // Nouvelles expressions : présentation, puis test de la précédente (pour espacer un peu)
  const seq = [];
  newOnes.forEach((item, k) => {
    seq.push({ type: 'intro', item });
    if (k > 0) seq.push(firstTest(newOnes[k - 1]));
  });
  if (newOnes.length) seq.push(firstTest(newOnes[newOnes.length - 1]));

  const practice = [...seen.slice(0, 4), ...shuffle(seen.slice(4)).slice(0, 3)];
  const rest = practice.map(i => makeExercise(i));
  const pool = [...newOnes, ...seen];
  while (seq.length + rest.length < 12 && pool.length) rest.push(makeExercise(pick(pool), 1));
  if (pool.length >= 4) rest.push({ type: 'match', items: shuffle(pool).slice(0, 5) });
  return [...seq, ...shuffle(rest)];
}

function buildReview() {
  const now = Date.now();
  let items = ALL.filter(i => peek(i.id).seen && peek(i.id).due <= now).sort((a, b) => peek(a.id).due - peek(b.id).due).slice(0, 10);
  let review = true;
  if (!items.length) {
    review = false;
    items = shuffle(ALL.filter(i => peek(i.id).seen)).sort((a, b) => peek(a.id).box - peek(b.id).box).slice(0, 10);
  }
  const ex = items.map(i => makeExercise(i, 1));
  if (items.length >= 4) ex.push({ type: 'match', items: shuffle(items).slice(0, 5) });
  return { ex: shuffle(ex), review };
}

function buildOptions(item, key) {
  let pool = shuffle(UNIT_BY_ID[item.unit].items.filter(i => i.id !== item.id));
  // Distracteurs : d'abord la même unité, puis le même niveau, puis le reste
  const level = UNIT_BY_ID[item.unit].level;
  const others = shuffle(ALL.filter(i => i.unit !== item.unit));
  pool = pool.concat(others.filter(i => UNIT_BY_ID[i.unit].level === level), others.filter(i => UNIT_BY_ID[i.unit].level !== level));
  const opts = [item[key]];
  for (const i of pool) {
    if (opts.length >= 4) break;
    if (!opts.some(o => norm(o) === norm(i[key]))) opts.push(i[key]);
  }
  return shuffle(opts);
}

function prepWordbank(ex) {
  const clean = w => w.replace(/[.,!?;:]+$/, '');
  const words = ex.item.en.split(/\s+/).map(clean).filter(Boolean);
  const inSentence = new Set(words.map(w => w.toLowerCase()));
  const extra = [];
  for (const w of shuffle(UNIT_BY_ID[ex.item.unit].items.flatMap(i => i.en.split(/\s+/).map(clean)))) {
    const lw = w.toLowerCase();
    if (w && !inSentence.has(lw) && !extra.some(e => e.toLowerCase() === lw)) extra.push(w);
  }
  ex.bank = shuffle([...words, ...extra.slice(0, words.length >= 5 ? 3 : 2)]);
  ex.chosen = [];
}

function prep(ex) {
  if (ex.type === 'speak' && !speakingOn()) ex.type = 'type_fr_en';
  if (!listeningOn() && ex.type === 'listen_mc') ex.type = 'mc_en_fr';
  if (!listeningOn() && ex.type === 'dictation') ex.type = 'type_fr_en';
  ex.sel = null;
  ex.typo = false;
  switch (ex.type) {
    case 'mc_en_fr': case 'listen_mc':
      ex.options = buildOptions(ex.item, 'fr'); ex.correct = ex.item.fr; break;
    case 'mc_fr_en':
      ex.options = buildOptions(ex.item, 'en'); ex.correct = ex.item.en; break;
    case 'wordbank': prepWordbank(ex); break;
    case 'speak': ex.attempts = 0; break;
    case 'match':
      ex.left = shuffle(ex.items); ex.right = shuffle(ex.items);
      ex.selL = ex.selR = null; ex.done = new Set(); ex.errors = new Set(); ex.bad = null; ex.lock = false;
      break;
    case 'intro': {
      const s = st(ex.item.id);
      if (!s.seen) { s.seen = true; s.due = Date.now(); save(); }
      break;
    }
  }
}

/* ================= Déroulement d'une leçon ================= */
let screen = 'home';
let L = null;

function startLesson(kind, unitId) {
  L = { kind, unitId, touched: new Set(), retried: new Set(), mistakes: [], correct: 0, wrong: 0, combo: 0, done: 0, start: Date.now(), ex: null };
  if (kind === 'unit') {
    L.queue = buildUnitLesson(UNIT_BY_ID[unitId]);
    L.doneTitle = 'Leçon terminée !';
  } else {
    const r = buildReview();
    L.queue = r.ex;
    L.doneTitle = r.review ? 'Révision terminée !' : 'Entraînement terminé !';
  }
  if (!L.queue.length) { L = null; toast('Rien à réviser pour le moment'); return; }
  screen = 'lesson';
  next();
}

/* ================= Test de niveau ================= */
const PLACEMENT_PER_LEVEL = 4;
const PLACEMENT_PASS = 3;

function placementQuestions(li) {
  const items = shuffle(ALL.filter(i => !UNIT_BY_ID[i.unit].theme && UNIT_BY_ID[i.unit].level === LEVELS[li].id));
  // une question « phrase à reconstruire » par niveau, sur une phrase d'au moins 4 mots
  const long = items.find(i => i.en.split(' ').length >= 4);
  const picked = items.filter(i => i !== long).slice(0, PLACEMENT_PER_LEVEL - (long ? 1 : 0));
  const qs = picked.map(item => ({ type: pick(['mc_fr_en', 'mc_fr_en', 'mc_en_fr']), item, level: li }));
  if (long) qs.push({ type: 'wordbank', item: long, level: li });
  return qs;
}

function startPlacement() {
  L = {
    kind: 'placement', touched: new Set(), retried: new Set(), mistakes: [], correct: 0, wrong: 0, combo: 0, done: 0,
    start: Date.now(), ex: null, noSpeak: true, noListen: true,
    queue: placementQuestions(0), scores: LEVELS.map(() => null),
  };
  L.scores[0] = 0;
  screen = 'lesson';
  next();
}

// Fin d'un bloc de niveau : on continue seulement si le niveau est réussi
function placementContinue() {
  const li = L.ex.level;
  if (L.scores[li] >= PLACEMENT_PASS && li + 1 < LEVELS.length) {
    L.scores[li + 1] = 0;
    L.queue = placementQuestions(li + 1);
    return true;
  }
  return false;
}

function finishPlacement() {
  let passed = 0;
  while (passed < LEVELS.length && L.scores[passed] >= PLACEMENT_PASS) passed++;
  const start = Math.min(passed, LEVELS.length - 1);
  state.placement = { passed, start: LEVELS[start].id, scores: L.scores, date: today() };
  save();
  L.result = { passed, start };
  screen = 'placement';
  render();
  checkBadges();
}

function next() {
  if (!L) return;
  if (L.ex) L.done++;
  if (!L.queue.length && L.kind === 'placement' && !placementContinue()) return finishPlacement();
  if (!L.queue.length) return finishLesson();
  L.ex = L.queue.shift();
  prep(L.ex);
  L.phase = 'answer';
  render();
}

function record(item, ok) {
  const s = st(item.id), now = Date.now();
  s.seen = true;
  s.last = now;
  if (ok) {
    s.ok++;
    if (!L.touched.has(item.id)) { s.box = Math.min(MAX_BOX, s.box + 1); s.due = now + INTERVALS[s.box] * DAY; }
  } else {
    s.ko++;
    s.box = Math.max(0, s.box - 1);
    s.due = now;
  }
  L.touched.add(item.id);
}

function grade(ok, typo = false) {
  const ex = L.ex;
  L.phase = 'feedback';
  ex.ok = ok;
  ex.typo = typo;
  if (L.kind === 'placement') {
    // Le test ne touche ni aux révisions ni aux statistiques
    if (ok) L.scores[ex.level]++;
    beep(ok);
    lockExercise();
    renderFoot();
    if (state.settings.autoplay) setTimeout(() => speak(ex.item.en), 300);
    return;
  }
  if (ex.type === 'match') ex.items.forEach(it => record(it, !ex.errors.has(it.id)));
  else record(ex.item, ok);
  state.answers++;
  if (ok) { state.good++; L.correct++; L.combo++; }
  else {
    L.wrong++;
    L.combo = 0;
    if (!L.mistakes.includes(ex.item)) L.mistakes.push(ex.item);
    if (!L.retried.has(ex.item.id)) { L.retried.add(ex.item.id); L.queue.push({ type: ex.type, item: ex.item }); }
  }
  save();
  beep(ok);
  lockExercise();
  renderFoot();
  if (state.settings.autoplay && ex.item && ex.type !== 'speak') setTimeout(() => speak(ex.item.en), 300);
}

function check() {
  const ex = L.ex;
  if (L.phase !== 'answer') return;
  switch (ex.type) {
    case 'mc_en_fr': case 'mc_fr_en': case 'listen_mc':
      if (ex.sel == null) return;
      return grade(ex.options[ex.sel] === ex.correct);
    case 'type_fr_en': case 'dictation': {
      const v = $('#answer').value;
      if (!v.trim()) return;
      const r = checkText(v, ex.item, ex.type === 'dictation');
      return grade(r.ok, r.typo);
    }
    case 'wordbank': {
      if (!ex.chosen.length) return;
      return grade(accepted(ex.item).includes(norm(ex.chosen.map(i => ex.bank[i]).join(' '))));
    }
  }
}

function isReady() {
  const ex = L && L.ex;
  if (!ex || L.phase !== 'answer') return false;
  if (ex.options) return ex.sel != null;
  if (ex.type === 'wordbank') return ex.chosen.length > 0;
  const a = $('#answer');
  return !!(a && a.value.trim());
}
function updateCheck() { const b = $('#checkBtn'); if (b) b.disabled = !isReady(); }

function lockExercise() {
  const ex = L.ex;
  $$('#exercise .option, #exercise .tile, #exercise textarea, #exercise .mic').forEach(el => { el.disabled = true; });
  $$('#exercise .option').forEach((b, i) => {
    if (ex.options[i] === ex.correct) b.classList.add('correct');
    else if (i === ex.sel) b.classList.add('wrong');
  });
  const a = $('#answer');
  if (a) a.classList.add(ex.ok ? 'is-ok' : 'is-ko');
}

function finishLesson() {
  const graded = L.correct + L.wrong;
  const acc = graded ? Math.round(L.correct / graded * 100) : 100;
  const xp = L.correct * 2 + 5 + (L.wrong === 0 && graded ? 5 : 0);
  state.lessons++;
  if (graded && L.wrong === 0) state.perfects++;
  if (L.kind === 'review') state.reviews++;
  const hour = new Date().getHours();
  if (hour < 8) state.flags.early = true;
  if (hour >= 22) state.flags.night = true;
  const goalReached = addXp(xp);
  L.result = { xp, acc, time: Math.round((Date.now() - L.start) / 1000), goalReached };
  screen = 'result';
  render();
  checkBadges();
}

// Ajoute de l'XP, met à jour la série ; renvoie true si l'objectif du jour vient d'être atteint
function addXp(xp) {
  const t = today(), before = state.daily[t] || 0, goal = state.settings.dailyGoal;
  state.xp += xp;
  state.daily[t] = before + xp;
  if (state.lastDay !== t) {
    state.streak = state.lastDay === yesterday() ? state.streak + 1 : 1;
    state.lastDay = t;
  }
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  save();
  return before < goal && before + xp >= goal;
}

/* ================= Mini-dialogues ================= */
let D = null;

function startDialogue(unitId, from) {
  const d = DIALOGUE_BY_UNIT[unitId];
  if (!d) return;
  window.speechSynthesis && speechSynthesis.cancel();
  D = { d, from: from || 'home', step: 0, shown: [], drawn: 0, mistakes: 0, wrong: new Set(), why: null, choices: null, typing: false, done: false };
  screen = 'dialogue';
  render();
  advance();
}

function advance() {
  const cur = D, line = D.d.lines[D.step];
  if (!line) return finishDialogue();
  if (Array.isArray(line)) {
    // Réplique du personnage, avec une petite pause « en train d'écrire »
    D.typing = true;
    drawDialogue();
    setTimeout(() => {
      if (D !== cur) return;
      D.typing = false;
      D.shown.push({ who: 'them', en: line[0], fr: line[1] });
      D.step++;
      if (state.settings.autoplay) speak(line[0], false, { queue: true, alt: true });
      drawDialogue();
      advance();
    }, D.shown.length ? 900 : 400);
  } else {
    D.choices = shuffle([{ en: line.ok[0], ok: true }, ...line.bad.map(([en, why]) => ({ en, why }))]);
    D.wrong = new Set();
    D.why = null;
    drawDialogue();
  }
}

function reply(i) {
  if (!D || !D.choices || D.done) return;
  const c = D.choices[i], line = D.d.lines[D.step];
  if (!c) return;
  if (c.ok) {
    D.shown.push({ who: 'me', en: line.ok[0], fr: line.ok[1] });
    D.step++;
    D.choices = null;
    D.why = null;
    beep(true);
    if (state.settings.autoplay) speak(c.en);
    drawDialogue();
    advance();
  } else {
    if (!D.wrong.has(i)) { D.wrong.add(i); D.mistakes++; }
    D.why = c.why;
    beep(false);
    drawDialogue();
  }
}

function finishDialogue() {
  D.done = true;
  D.xp = 10 + (D.mistakes === 0 ? 5 : 0);
  const prev = state.dialogues[D.d.unit];
  state.dialogues[D.d.unit] = { done: true, best: prev ? Math.min(prev.best, D.mistakes) : D.mistakes };
  D.goalReached = addXp(D.xp);
  drawDialogue();
  checkBadges();
}

function handleSpeech(alts) {
  const ex = L && L.ex;
  if (!ex || ex.type !== 'speak' || L.phase !== 'answer') return;
  const targets = accepted(ex.item).map(t => t.split(' '));
  let best = 0, heard = alts[0] || '';
  for (const a of alts) {
    const w = norm(a).split(' ').filter(Boolean);
    for (const t of targets) {
      const score = 1 - lev(w, t) / Math.max(t.length, w.length);
      if (score > best) { best = score; heard = a; }
    }
  }
  if (best >= 0.75) return grade(true);
  ex.attempts++;
  if (ex.attempts >= 3) {
    // Pas de pénalité : la reconnaissance vocale n'est pas parfaite
    L.phase = 'feedback';
    ex.neutral = true;
    lockExercise();
    renderFoot();
    setTimeout(() => speak(ex.item.en), 300);
  }
  $('#heard').innerHTML = `Entendu : « ${esc(heard)} »${ex.attempts < 3 ? ' — réessaie !' : ''}`;
}

function startMic() {
  const ex = L.ex;
  if (L.phase !== 'answer' || ex.listening) return;
  let rec;
  try { rec = new SR(); } catch (e) { toast('Reconnaissance vocale indisponible'); return; }
  window.speechSynthesis && speechSynthesis.cancel();
  rec.lang = state.settings.accent;
  rec.interimResults = false;
  rec.maxAlternatives = 5;
  const btn = $('#micBtn');
  const setUI = on => { ex.listening = on; if (btn) { btn.classList.toggle('on', on); btn.querySelector('span').textContent = on ? 'Je t’écoute…' : 'Appuie pour parler'; } };
  rec.onresult = e => handleSpeech([...e.results[0]].map(r => r.transcript));
  rec.onerror = e => {
    const msg = {
      'not-allowed': 'Micro refusé : autorise le micro dans le navigateur.',
      'no-speech': 'Je n’ai rien entendu, réessaie.',
      'audio-capture': 'Aucun micro détecté.',
      network: 'La reconnaissance vocale a besoin d’Internet.',
    }[e.error] || `Erreur micro : ${e.error}`;
    $('#heard').textContent = msg;
  };
  rec.onend = () => setUI(false);
  setUI(true);
  rec.start();
}

/* ================= Rendu ================= */
function render() {
  const app = $('#app');
  $$('.sheet-wrap').forEach(o => o.remove()); // la fiche d'un mot ne survit pas à un changement d'écran
  if (screen === 'lesson') { app.innerHTML = renderLesson(); afterExercise(); }
  else if (screen === 'result') app.innerHTML = renderResult();
  else if (screen === 'placement') app.innerHTML = renderPlacementResult();
  else if (screen === 'fiche') app.innerHTML = renderFiche();
  else if (screen === 'dialogue') { app.innerHTML = renderDialogue(); drawDialogue(); }
  else if (screen === 'library') app.innerHTML = renderLibrary();
  else if (screen === 'mywords') app.innerHTML = renderMyWords();
  else if (screen === 'sounds') app.innerHTML = renderSounds();
  else if (screen === 'soundGame') app.innerHTML = renderSoundGame();
  else if (screen === 'progress') app.innerHTML = renderProgress();
  else if (screen === 'settings') app.innerHTML = renderSettings();
  else app.innerHTML = renderHome();
  if (screen !== 'lesson') window.scrollTo(0, 0);
}

const topbar = () => `
  <header class="topbar">
    <div class="brand">🗣️ English Coach</div>
    <div class="top-stats">
      <span title="Jours d'affilée">🔥 ${currentStreak()}</span>
      <span title="XP total">⭐ ${state.xp}</span>
    </div>
  </header>`;

const nav = active => `
  <nav class="bottom-nav">
    ${[['home', '🏠', 'Apprendre'], ['library', '📖', 'Bibliothèque'], ['progress', '📊', 'Progrès'], ['settings', '⚙️', 'Réglages']].map(([k, i, l]) =>
      `<button class="${active === k ? 'active' : ''}" data-action="nav" data-to="${k}"><span class="nav-icon">${i}</span>${l}</button>`).join('')}
  </nav>`;

const statTile = (icon, value, label) => `<div class="stat"><div class="stat-icon">${icon}</div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;

function renderHome() {
  const s = state.settings, xpToday = state.daily[today()] || 0;
  const pct = Math.min(100, Math.round(xpToday / s.dailyGoal * 100));
  const due = dueItems().length;
  const learned = ALL.filter(i => peek(i.id).seen).length;
  const reviewText = !learned ? 'Commence une unité pour débloquer les révisions.'
    : due ? `${due} expression${due > 1 ? 's' : ''} à revoir aujourd’hui.`
    : 'Tout est à jour ! Tu peux t’entraîner librement.';
  return `${topbar()}
  <main class="page">
    ${!learned && !state.placement ? `
      <section class="card placement-card">
        <div class="placement-icon">🧭</div>
        <div><strong>Tu as déjà des bases en anglais ?</strong>
          <p class="muted small">Fais le test de niveau (2 à 5 minutes) pour savoir par où commencer.</p></div>
        <button class="btn btn-primary" data-action="placement">Faire le test</button>
      </section>` : ''}
    <section class="card goal">
      <div class="row-between"><strong>🎯 Objectif du jour</strong><span class="muted">${xpToday} / ${s.dailyGoal} XP</span></div>
      <div class="bar"><div style="width:${pct}%"></div></div>
      ${pct >= 100 ? '<p class="small ok-text">Objectif atteint, bravo ! 🎉</p>' : ''}
    </section>
    <section class="card review-card">
      <div><strong>🧠 Révision</strong><p class="muted small">${reviewText}</p></div>
      <button class="btn ${due ? 'btn-primary' : 'btn-secondary'}" data-action="review" ${learned ? '' : 'disabled'}>${due ? 'Réviser' : 'S’entraîner'}</button>
    </section>
    <h2 class="section-title">Parcours</h2>
    ${LEVELS.map(levelSection).join('')}
    <div class="center"><button class="link" data-action="placement">🧭 ${state.placement ? 'Refaire le test de niveau' : 'Faire le test de niveau'}</button></div>
    <h2 class="section-title">Thèmes à la carte</h2>
    <p class="muted small">Accessibles à tout moment, en dehors du parcours.</p>
    <div class="path">
      ${customCard()}
      ${themeUnits().map(u => unitCard(u, UNITS.indexOf(u))).join('')}
    </div>
  </main>
  ${nav('home')}`;
}

// Niveaux repliés/dépliés manuellement pendant la session
const levelFolded = {};

function levelSection(level) {
  const units = levelUnits(level.id);
  if (!units.length) return '';
  const first = UNITS.indexOf(units[0]);
  const open = unitUnlocked(first);
  const pct = Math.round(levelProgress(level.id) * 100);
  const active = units.some(u => unitUnlocked(UNITS.indexOf(u)) && unitProgress(u) < 1);
  const expanded = level.id in levelFolded ? !levelFolded[level.id] : active;
  return `
    <details class="level ${open ? '' : 'locked'}" data-level="${level.id}" ${expanded ? 'open' : ''}>
      <summary class="level-head">
        <span class="level-badge" data-l="${level.id}">${level.id}</span>
        <span class="level-info">
          <span class="level-name">${esc(level.name)} ${pct === 100 ? '👑' : ''}</span>
          <span class="muted small">${esc(level.desc)} · ${units.length} unités</span>
          <span class="bar thin"><span style="width:${pct}%"></span></span>
        </span>
        <span class="level-pct">${pct} %</span>
      </summary>
      ${open ? '' : `
        <div class="level-unlock">
          <span class="small muted">Tu as déjà des bases ? Pas besoin de tout refaire.</span>
          <button class="btn btn-secondary" data-action="openLevel" data-level="${level.id}">🔓 Commencer au niveau ${level.id}</button>
        </div>`}
      <div class="path">${units.map(u => unitCard(u, UNITS.indexOf(u))).join('')}</div>
    </details>`;
}

function unitCard(u, i) {
  const pct = Math.round(unitProgress(u) * 100), open = unitUnlocked(i);
  const started = u.items.some(it => peek(it.id).seen);
  const label = pct === 100 ? 'Revoir' : started ? 'Continuer' : 'Commencer';
  return `
    <article class="unit ${open ? '' : 'locked'} ${pct === 100 ? 'done' : ''}">
      <div class="unit-icon">${open ? u.icon : '🔒'}</div>
      <div class="unit-body">
        <div class="unit-title">${u.theme ? `<span class="level-badge xs" data-l="${u.level}">${u.level}</span> ` : `${i + 1}. `}${esc(u.title)} ${pct === 100 ? '👑' : ''}</div>
        <div class="muted small">${open ? esc(u.desc) : isLevelStart(i) ? 'Atteins 50 % dans la dernière unité du niveau précédent' : 'Atteins 50 % dans l’unité précédente'}</div>
        <div class="bar thin"><div style="width:${pct}%"></div></div>
        ${open ? unitExtras(u) : ''}
      </div>
      <button class="btn ${open ? 'btn-primary' : 'btn-secondary'}" data-action="unit" data-unit="${u.id}" ${open ? '' : 'disabled'}>${label}</button>
    </article>`;
}

// Carte de l'unité « Mes expressions »
function customCard() {
  const u = UNIT_BY_ID[MY_ID], n = u.items.length, ready = n >= MY_MIN;
  const pct = Math.round(unitProgress(u) * 100);
  return `
    <article class="unit custom">
      <div class="unit-icon">⭐</div>
      <div class="unit-body">
        <div class="unit-title">Mes expressions</div>
        <div class="muted small">${n ? `${n} expression${n > 1 ? 's' : ''} ajoutée${n > 1 ? 's' : ''}` : 'Ajoute les mots que tu croises dans tes séries, au travail, en voyage…'}${n && !ready ? ` · encore ${MY_MIN - n} pour t’entraîner` : ''}</div>
        ${n ? `<div class="bar thin"><div style="width:${pct}%"></div></div>` : ''}
        ${n ? `<div class="unit-extras"><button class="chip" data-action="nav" data-to="mywords">✏️ Gérer</button></div>` : ''}
      </div>
      ${ready
        ? `<button class="btn btn-primary" data-action="unit" data-unit="${MY_ID}">S’entraîner</button>`
        : `<button class="btn btn-secondary" data-action="nav" data-to="mywords">＋ Ajouter</button>`}
    </article>`;
}

// Raccourcis « Fiche » et « Dialogue » d'une unité débloquée
function unitExtras(u) {
  const g = GRAMMAR[u.id], d = DIALOGUE_BY_UNIT[u.id], done = state.dialogues[u.id];
  if (!g && !d) return '';
  return `<div class="unit-extras">
    ${g ? `<button class="chip" data-action="fiche" data-unit="${u.id}">📖 Fiche</button>` : ''}
    ${d ? `<button class="chip ${done ? 'chip-done' : ''}" data-action="dialogue" data-unit="${u.id}">💬 Dialogue${done ? ' ✓' : ''}</button>` : ''}
  </div>`;
}

/* ---------- Fiche de grammaire ---------- */
let F = null; // { unit, before (avant la 1re leçon), from (écran de retour) }

function openFiche(unitId, before, from) {
  F = { unit: unitId, before, from: from || 'home' };
  state.fichesSeen[unitId] = true;
  save();
  screen = 'fiche';
  render();
}

function renderFiche() {
  const u = UNIT_BY_ID[F.unit], g = GRAMMAR[F.unit], i = UNITS.indexOf(u), open = unitUnlocked(i);
  const d = DIALOGUE_BY_UNIT[u.id];
  return `${topbar()}
  <main class="page fiche">
    <button class="link back" data-action="ficheBack">← Retour</button>
    <div class="fiche-head">
      <span class="level-badge sm" data-l="${u.level}">${u.level}</span>
      <span class="muted small">${u.theme ? 'Thème' : `Unité ${i + 1}`} · ${esc(u.title)}</span>
    </div>
    <h1>📖 ${esc(g.title)}</h1>
    ${F.before ? '<p class="muted">Avant de commencer cette unité, voici l’essentiel à savoir. Ça prend une minute !</p>' : ''}
    ${g.points.map((p, k) => `
      <section class="card fiche-point">
        <div class="fiche-num">${k + 1}</div>
        <div class="fiche-body">
          <p>${fmt(p.t)}</p>
          ${p.ex ? `<ul class="fiche-ex">${p.ex.map(([en, fr]) => `
            <li>${speakerBtn(en, 'sm')}<div><b>${clickable(en)}</b><span class="muted">${esc(fr)}</span></div></li>`).join('')}
          </ul>` : ''}
        </div>
      </section>`).join('')}
    ${g.tip ? `<section class="card fiche-tip">💡 ${fmt(g.tip)}</section>` : ''}
    <div class="btn-col">
      ${open ? `<button class="btn btn-primary wide" data-action="ficheStart">${F.before ? 'C’est parti !' : 'Faire une leçon'}</button>` : ''}
      ${open && d ? `<button class="btn btn-secondary wide" data-action="dialogue" data-unit="${u.id}">💬 Mini-dialogue : ${esc(d.title)}</button>` : ''}
    </div>
  </main>
  ${F.before ? '' : nav(F.from)}`;
}

/* ---------- Mini-dialogue ---------- */
function renderDialogue() {
  const d = D.d;
  return `
  <div class="lesson dialogue">
    <header class="lesson-top">
      <button class="icon-btn" data-action="quitDialogue" title="Quitter">✕</button>
      <div class="bar big"><div id="dlgBar" style="width:0%"></div></div>
      <span class="combo"></span>
    </header>
    <main class="lesson-body">
      <section class="card scene">
        <div class="scene-who"><span class="scene-avatar">${d.with.icon}</span><div><b>${esc(d.title)}</b><div class="muted small">avec ${esc(d.with.name)}</div></div></div>
        <p class="small">${esc(d.scene)}</p>
        <p class="muted small">Touche une bulle pour voir sa traduction.</p>
      </section>
      <div class="chat" id="chat"></div>
    </main>
    <footer class="lesson-foot" id="foot"></footer>
  </div>`;
}

function drawDialogue() {
  if (screen !== 'dialogue' || !D) return;
  const d = D.d;
  $('#dlgBar').style.width = `${D.done ? 100 : Math.round(D.step / d.lines.length * 100)}%`;
  $('#chat').innerHTML = D.shown.map((b, k) => `
    <div class="bubble-row ${b.who} ${k >= D.drawn ? 'pop' : ''}">
      ${b.who === 'them' ? `<span class="bubble-avatar">${d.with.icon}</span>` : ''}
      <div class="bubble" data-action="toggleFr" data-k="${k}">
        <div>${clickable(b.en)}</div>
        ${b.showFr ? `<div class="bubble-fr">${esc(b.fr)}</div>` : ''}
      </div>
      <button class="speaker sm" data-action="say" data-text="${esc(b.en)}" ${b.who === 'them' ? 'data-alt="1"' : ''} title="Écouter">🔊</button>
    </div>`).join('') +
    (D.typing ? `<div class="bubble-row them pop"><span class="bubble-avatar">${d.with.icon}</span><div class="bubble typing"><i></i><i></i><i></i></div></div>` : '');

  D.drawn = D.shown.length;

  let foot;
  if (D.done) {
    foot = `
      <div class="feedback ok">
        <div class="fb-text">
          <div class="fb-title">Dialogue réussi ! +${D.xp} XP</div>
          <div class="small">${D.mistakes ? `${D.mistakes} erreur${D.mistakes > 1 ? 's' : ''} en route — rejoue-le pour faire un sans-faute.` : 'Sans aucune erreur, bravo ! 🎉'}${D.goalReached ? ' · 🎯 Objectif du jour atteint !' : ''}</div>
        </div>
        <div class="fb-actions">
          <button class="btn btn-secondary" data-action="dialogueAgain">Rejouer</button>
          <button class="btn btn-primary" data-action="dialogueEnd">Continuer</button>
        </div>
      </div>`;
  } else if (D.choices) {
    const line = d.lines[D.step];
    foot = `
      <div class="reply-box">
        <div class="me-prompt">🎯 ${esc(line.me)}</div>
        ${D.why ? `<div class="why">✗ ${fmt(D.why)}</div>` : ''}
        <div class="options">${D.choices.map((c, i) => `
          <button class="option ${D.wrong.has(i) ? 'wrong' : ''}" data-action="reply" data-i="${i}" ${D.wrong.has(i) ? 'disabled' : ''}><kbd>${i + 1}</kbd><span>${esc(c.en)}</span></button>`).join('')}
        </div>
      </div>`;
  } else {
    foot = `<div class="foot-row"><span class="muted small">${esc(d.with.name)} parle…</span></div>`;
  }
  $('#foot').innerHTML = foot;
  // Garde la dernière bulle visible au-dessus des réponses
  const footH = $('#foot').offsetHeight;
  $('.dialogue .lesson-body').style.paddingBottom = `${footH + 24}px`;
  window.scrollTo(0, document.body.scrollHeight);
}

/* ---------- Bibliothèque ---------- */
function renderLibrary() {
  const doneCount = Object.values(state.dialogues).filter(x => x.done).length;
  return `${topbar()}
  <main class="page">
    <h1>Bibliothèque</h1>
    <div class="lib-tools">
      <button class="card lib-tool" data-action="nav" data-to="mywords">
        <span class="lib-tool-icon">⭐</span>
        <span><b>Mes expressions</b><span class="muted small">${state.custom.length} expression${state.custom.length > 1 ? 's' : ''} perso</span></span>
      </button>
      <button class="card lib-tool" data-action="nav" data-to="sounds">
        <span class="lib-tool-icon">👂</span>
        <span><b>Sons difficiles</b><span class="muted small">ship / sheep, think / sink…</span></span>
      </button>
    </div>
    <p class="muted">Les fiches de grammaire se lisent quand tu veux. Les mini-dialogues se débloquent avec leur unité.
      <br>💬 ${doneCount} / ${DIALOGUES.length} dialogues réussis.</p>
    ${LEVELS.map(l => `
      <section class="card lib-level">
        <div class="lib-level-head"><span class="level-badge sm" data-l="${l.id}">${l.id}</span><strong>${esc(l.name)}</strong></div>
        <ul class="lib-list">${levelUnits(l.id).map(libRow).join('')}</ul>
      </section>`).join('')}
    <section class="card lib-level">
      <div class="lib-level-head"><span class="lib-icon">🎒</span><strong>Thèmes à la carte</strong></div>
      <ul class="lib-list">${themeUnits().map(libRow).join('')}</ul>
    </section>
  </main>
  ${nav('library')}`;
}

function libRow(u) {
  const i = UNITS.indexOf(u), open = unitUnlocked(i), g = GRAMMAR[u.id], d = DIALOGUE_BY_UNIT[u.id], done = state.dialogues[u.id];
  return `
    <li class="${open ? '' : 'locked'}">
      <span class="lib-icon">${open ? u.icon : '🔒'}</span>
      <div class="lib-text"><b>${esc(u.title)}</b>${g ? `<span class="muted small">${esc(g.title)}</span>` : ''}</div>
      <div class="lib-actions">
        ${g ? `<button class="chip" data-action="fiche" data-unit="${u.id}">📖 Fiche</button>` : ''}
        ${d ? `<button class="chip ${done ? 'chip-done' : ''}" data-action="dialogue" data-unit="${u.id}" ${open ? '' : 'disabled'}>💬 ${done ? 'Réussi ✓' : 'Dialogue'}</button>` : ''}
      </div>
    </li>`;
}

/* ---------- Mes expressions ---------- */
function renderMyWords() {
  const list = state.custom;
  return `${topbar()}
  <main class="page">
    <button class="link back" data-action="nav" data-to="library">← Bibliothèque</button>
    <h1>⭐ Mes expressions</h1>
    <p class="muted">Ajoute les mots et phrases que tu croises (séries, travail, voyages…). Ils entrent dans tes leçons et tes révisions, comme le reste du cours.</p>
    <section class="card form">
      <h3>Ajouter une expression</h3>
      <label class="field"><span>En anglais</span><input id="myEn" placeholder="ex. It's up to you" autocomplete="off" spellcheck="false"></label>
      <label class="field"><span>En français</span><input id="myFr" placeholder="ex. C'est toi qui vois" autocomplete="off"></label>
      <label class="field"><span>Autres réponses acceptées <small class="muted">(facultatif, séparées par /)</small></span><input id="myAlts" placeholder="ex. It depends on you" autocomplete="off" spellcheck="false"></label>
      <div class="btn-row">
        <button class="btn btn-secondary" data-action="myListen">🔊 Écouter</button>
        <button class="btn btn-primary" data-action="myAdd">＋ Ajouter</button>
      </div>
    </section>
    <section class="card">
      <div class="row-between">
        <strong>${list.length} expression${list.length > 1 ? 's' : ''}</strong>
        ${list.length >= MY_MIN
          ? `<button class="btn btn-primary" data-action="unit" data-unit="${MY_ID}">S’entraîner</button>`
          : `<span class="muted small">Encore ${MY_MIN - list.length} pour pouvoir t’entraîner</span>`}
      </div>
      ${list.length ? `<ul class="vocab">${list.slice().reverse().map(c => `
        <li>${speakerBtn(c.en, 'sm')}
          <div class="v-text"><b>${esc(c.en)}</b><span class="muted">${esc(c.fr)}${c.alts && c.alts.length ? ` · aussi : ${esc(c.alts.join(' / '))}` : ''}</span></div>
          ${dots(peek(`my-${c.id}`).box)}
          <button class="icon-btn small-icon" data-action="myDel" data-id="${c.id}" title="Supprimer">🗑️</button>
        </li>`).join('')}</ul>` : '<p class="muted small">Ta liste est vide pour l’instant.</p>'}
    </section>
  </main>
  ${nav('library')}`;
}

function addCustom() {
  const en = $('#myEn').value.trim(), fr = $('#myFr').value.trim();
  const alts = $('#myAlts').value.split(/[\/;]/).map(s => s.trim()).filter(Boolean);
  if (!en || !fr) { toast('Remplis l’anglais et le français'); return; }
  if (!norm(en)) { toast('L’expression anglaise doit contenir des lettres'); return; }
  if (state.custom.some(c => norm(c.en) === norm(en))) { toast('Cette expression est déjà dans ta liste'); return; }
  state.custom.push({ id: Date.now().toString(36), en, fr, alts });
  save();
  syncCustomUnit();
  render();
  toast('Expression ajoutée ✔');
  checkBadges();
  $('#myEn').focus();
}

/* ---------- Sons difficiles ---------- */
let S = null;
const SOUND_ROUNDS = 10;

function renderSounds() {
  return `${topbar()}
  <main class="page">
    <button class="link back" data-action="nav" data-to="library">← Bibliothèque</button>
    <h1>👂 Sons difficiles</h1>
    <p class="muted">Des paires de mots qui ne diffèrent que par un son. Écoute, et choisis le mot que tu entends : ton oreille s’habitue très vite.</p>
    <div class="sound-grid">
      ${SOUNDS.map(g => {
        const best = state.sounds[g.id];
        return `
          <section class="card sound-card">
            <div class="sound-head"><span class="sound-icon">${g.icon}</span><div><b>${esc(g.title)}</b><div class="muted small">${esc(g.sample)}</div></div></div>
            <p class="small">${fmt(g.tip)}</p>
            <div class="row-between">
              <span class="small muted">${best != null ? `Record : ${best} / ${SOUND_ROUNDS}` : 'Pas encore essayé'}</span>
              <button class="btn btn-primary" data-action="soundStart" data-id="${g.id}">S’entraîner</button>
            </div>
          </section>`;
      }).join('')}
    </div>
  </main>
  ${nav('library')}`;
}

function startSounds(id) {
  const g = SOUNDS.find(x => x.id === id);
  // Chaque paire au moins une fois, puis complété au hasard
  const order = shuffle(g.pairs);
  while (order.length < SOUND_ROUNDS) order.push(pick(g.pairs));
  S = { g, rounds: order.slice(0, SOUND_ROUNDS).map(p => ({ p, side: Math.random() < 0.5 ? 0 : 1 })), k: 0, score: 0, answer: null, done: false };
  screen = 'soundGame';
  render();
  playSoundTarget();
}

const soundWord = (p, side) => ({ en: p[side * 2], fr: p[side * 2 + 1] });

function renderSoundGame() {
  const g = S.g;
  if (S.done) {
    return `
    <main class="page result">
      <div class="trophy">${S.score === SOUND_ROUNDS ? '🏆' : S.score >= 7 ? '🎉' : '👂'}</div>
      <h1 class="center">${S.score} / ${SOUND_ROUNDS}</h1>
      <p class="center muted">${S.score === SOUND_ROUNDS ? 'Oreille parfaite !' : S.score >= 7 ? 'Très bonne oreille !' : 'Ça viendra : refais-le demain, la différence s’entend de mieux en mieux.'}
        <br>+${S.xp} XP</p>
      <section class="card">
        <strong>Toutes les paires</strong>
        <ul class="vocab">${g.pairs.map(p => `
          <li class="pair-row">
            ${speakerBtn(p[0], 'sm')}<div class="v-text"><b>${esc(p[0])}</b><span class="muted">${esc(p[1])}</span></div>
            ${speakerBtn(p[2], 'sm')}<div class="v-text"><b>${esc(p[2])}</b><span class="muted">${esc(p[3])}</span></div>
          </li>`).join('')}</ul>
      </section>
      <div class="btn-col">
        <button class="btn btn-primary wide" data-action="soundStart" data-id="${g.id}">Rejouer</button>
        <button class="btn btn-secondary wide" data-action="nav" data-to="sounds">Autres sons</button>
      </div>
    </main>`;
  }
  const r = S.rounds[S.k], target = soundWord(r.p, r.side);
  const opts = [soundWord(r.p, 0), soundWord(r.p, 1)];
  const answered = S.answer != null;
  return `
  <div class="lesson">
    <header class="lesson-top">
      <button class="icon-btn" data-action="nav" data-to="sounds" title="Quitter">✕</button>
      <div class="bar big"><div style="width:${Math.round(S.k / SOUND_ROUNDS * 100)}%"></div></div>
      <span class="combo">${g.icon}</span>
    </header>
    <main class="lesson-body">
      <div class="placement-tag">👂 ${esc(g.title)}</div>
      <h2>Quel mot entends-tu ?</h2>
      <div class="listen">
        <button class="speaker huge" data-action="say" data-text="${esc(target.en)}" title="Réécouter">🔊</button>
        <button class="speaker slow" data-action="say" data-text="${esc(target.en)}" data-slow="1" title="Plus lentement">🐢</button>
      </div>
      <div class="sound-options">
        ${opts.map((o, i) => {
          const cls = !answered ? '' : i === r.side ? 'correct' : i === S.answer ? 'wrong' : '';
          return `<button class="option sound-option ${cls}" data-action="soundPick" data-i="${i}" ${answered ? 'disabled' : ''}>
            <kbd>${i + 1}</kbd><span><b>${esc(o.en)}</b><span class="muted small">${esc(o.fr)}</span></span></button>`;
        }).join('')}
      </div>
    </main>
    <footer class="lesson-foot">
      ${answered ? `
        <div class="feedback ${S.answer === r.side ? 'ok' : 'ko'}">
          <div class="fb-text">
            <div class="fb-title">${S.answer === r.side ? pick(PRAISE) : 'Raté !'}</div>
            <div class="small">C’était <b>${esc(target.en)}</b>. Compare :</div>
          </div>
          <div class="fb-actions">
            <button class="chip" data-action="say" data-text="${esc(opts[0].en)}">🔊 ${esc(opts[0].en)}</button>
            <button class="chip" data-action="say" data-text="${esc(opts[1].en)}">🔊 ${esc(opts[1].en)}</button>
            <button class="btn ${S.answer === r.side ? 'btn-primary' : 'btn-danger'}" data-action="soundNext">Continuer</button>
          </div>
        </div>` : `<div class="foot-row"><span class="muted small">Réécoute autant que tu veux.</span></div>`}
    </footer>
  </div>`;
}

function soundPick(i) {
  if (!S || S.done || S.answer != null) return;
  const r = S.rounds[S.k];
  S.answer = i;
  if (i === r.side) S.score++;
  beep(i === r.side);
  render();
}

function soundNext() {
  if (!S || S.answer == null) return;
  S.k++;
  S.answer = null;
  if (S.k >= SOUND_ROUNDS) {
    S.done = true;
    S.xp = S.score;
    state.sounds[S.g.id] = Math.max(state.sounds[S.g.id] || 0, S.score);
    addXp(S.xp);
  }
  render();
  if (S.done) checkBadges();
  if (!S.done) playSoundTarget();
}

function playSoundTarget() {
  const r = S.rounds[S.k];
  setTimeout(() => speak(soundWord(r.p, r.side).en), 250);
}

function renderLesson() {
  const placement = L.kind === 'placement';
  const pct = placement
    ? Math.round(L.done / (LEVELS.length * PLACEMENT_PER_LEVEL) * 100)
    : Math.round(L.done / (L.done + L.queue.length + 1) * 100);
  const lvl = placement && LEVELS[L.ex.level];
  return `
  <div class="lesson">
    <header class="lesson-top">
      <button class="icon-btn" data-action="quit" title="Quitter">✕</button>
      <div class="bar big"><div style="width:${pct}%"></div></div>
      <span class="combo">${L.combo >= 3 ? `🔥${L.combo}` : ''}</span>
    </header>
    <main class="lesson-body" id="exercise">
      ${placement ? `<div class="placement-tag">🧭 Test de niveau · <span class="level-badge sm" data-l="${lvl.id}">${lvl.id}</span> ${esc(lvl.name)}</div>` : ''}
      ${exerciseHTML(L.ex)}
    </main>
    <footer class="lesson-foot" id="foot">${footHTML()}</footer>
  </div>`;
}

const speakerBtn = (text, cls = '') => `<button class="speaker ${cls}" data-action="say" data-text="${esc(text)}" title="Écouter">🔊</button>`;
const listenBlock = it => `
  <div class="listen">
    <button class="speaker huge" data-action="say" data-text="${esc(it.en)}" title="Écouter">🔊</button>
    <button class="speaker slow" data-action="say" data-text="${esc(it.en)}" data-slow="1" title="Écouter lentement">🐢</button>
  </div>`;
const optionsHTML = ex => `
  <div class="options">${ex.options.map((o, i) =>
    `<button class="option" data-action="option" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}
  </div>`;
const answerBox = ph => `<textarea id="answer" class="answer" rows="3" placeholder="${ph}" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>`;

function exerciseHTML(ex) {
  const it = ex.item;
  switch (ex.type) {
    case 'intro': return `
      <div class="tag">✨ Nouvelle expression</div>
      <div class="flash">
        ${speakerBtn(it.en, 'huge')}
        <div class="flash-en">${clickable(it.en)}</div>
        <div class="flash-fr">${esc(it.fr)}</div>
        <button class="link" data-action="say" data-text="${esc(it.en)}" data-slow="1">🐢 Écouter lentement</button>
      </div>`;
    case 'mc_en_fr': return `
      <h2>Que veut dire cette phrase ?</h2>
      <div class="prompt">${speakerBtn(it.en)}<span class="prompt-text">${clickable(it.en)}</span></div>
      ${optionsHTML(ex)}`;
    case 'mc_fr_en': return `
      <h2>Comment dit-on en anglais ?</h2>
      <div class="prompt"><span class="prompt-text">${esc(it.fr)}</span></div>
      ${optionsHTML(ex)}`;
    case 'listen_mc': return `
      <h2>Écoute et choisis la traduction</h2>
      ${listenBlock(it)}
      ${optionsHTML(ex)}`;
    case 'type_fr_en': return `
      <h2>Traduis en anglais</h2>
      <div class="prompt"><span class="prompt-text">${esc(it.fr)}</span></div>
      ${answerBox('Écris en anglais…')}`;
    case 'dictation': return `
      <h2>Écris ce que tu entends</h2>
      ${listenBlock(it)}
      ${answerBox('Écris en anglais…')}`;
    case 'wordbank': return `
      <h2>Traduis cette phrase</h2>
      <div class="prompt"><span class="prompt-text">${esc(it.fr)}</span></div>
      <div id="wb">${wordbankInner(ex)}</div>`;
    case 'speak': return `
      <h2>Dis cette phrase à voix haute</h2>
      <div class="prompt">${speakerBtn(it.en)}<span class="prompt-text">${clickable(it.en)}</span></div>
      <p class="muted center">${esc(it.fr)}</p>
      <button class="mic" id="micBtn" data-action="mic">🎤<span>Appuie pour parler</span></button>
      <p id="heard" class="heard"></p>`;
    case 'match': return `
      <h2>Associe les paires</h2>
      <div class="match" id="match">${matchInner(ex)}</div>`;
  }
  return '';
}

function wordbankInner(ex) {
  return `
    <div class="wb-answer">${ex.chosen.map((bi, k) =>
      `<button class="tile" data-action="untile" data-k="${k}">${esc(ex.bank[bi])}</button>`).join('') ||
      '<span class="muted small">Touche les mots dans le bon ordre</span>'}</div>
    <div class="wb-bank">${ex.bank.map((w, bi) => {
      const used = ex.chosen.includes(bi);
      return `<button class="tile ${used ? 'used' : ''}" data-action="tile" data-i="${bi}" ${used ? 'disabled' : ''}>${esc(w)}</button>`;
    }).join('')}</div>`;
}

function matchInner(ex) {
  const col = (list, side, key) => `<div class="match-col">${list.map(i => {
    const done = ex.done.has(i.id);
    const sel = (side === 'L' ? ex.selL : ex.selR) === i.id;
    const bad = ex.bad && ex.bad[side === 'L' ? 0 : 1] === i.id;
    return `<button class="tile m ${done ? 'matched' : ''} ${sel ? 'selected' : ''} ${bad ? 'bad' : ''}" data-action="match" data-side="${side}" data-id="${i.id}" ${done ? 'disabled' : ''}>${esc(i[key])}</button>`;
  }).join('')}</div>`;
  return col(ex.left, 'L', 'en') + col(ex.right, 'R', 'fr');
}

function footHTML() {
  const ex = L.ex;
  if (L.phase === 'feedback') {
    let cls, title, body = '';
    const pair = ex.item ? `<div class="fb-answer"><b>${clickable(ex.item.en)}</b> — ${esc(ex.item.fr)}</div>` : '';
    if (ex.neutral) { cls = 'neutral'; title = 'Pas grave, on continue !'; body = `<div class="small">Écoute bien la prononciation :</div>${pair}`; }
    else if (ex.type === 'match') { cls = 'ok'; title = ex.errors.size ? 'Toutes les paires trouvées !' : pick(PRAISE); }
    else if (ex.ok) { cls = 'ok'; title = pick(PRAISE); body = ex.typo ? `<div class="small">Attention à l’orthographe :</div>${pair}` : pair; }
    else { cls = 'ko'; title = 'Pas tout à fait…'; body = `<div class="small">Bonne réponse :</div>${pair}`; }
    return `
      <div class="feedback ${cls}">
        <div class="fb-text"><div class="fb-title">${title}</div>${body}</div>
        <div class="fb-actions">
          ${ex.item ? speakerBtn(ex.item.en) : ''}
          <button class="btn ${cls === 'ko' ? 'btn-danger' : 'btn-primary'}" data-action="continue">Continuer</button>
        </div>
      </div>`;
  }
  if (ex.type === 'intro') return `<div class="foot-row"><span></span><button class="btn btn-primary" data-action="continue">Compris !</button></div>`;
  if (ex.type === 'match') return `<div class="foot-row"><span class="muted small">Touche un mot anglais puis sa traduction.</span></div>`;
  if (ex.type === 'speak') return `<div class="foot-row"><button class="btn btn-ghost" data-action="skip" data-what="speak">Je ne peux pas parler maintenant</button></div>`;
  const skip = L.kind === 'placement'
    ? '<button class="btn btn-ghost" data-action="dunno">Je ne sais pas</button>'
    : ['listen_mc', 'dictation'].includes(ex.type)
      ? '<button class="btn btn-ghost" data-action="skip" data-what="listen">Je ne peux pas écouter</button>' : '<span></span>';
  return `<div class="foot-row">${skip}<button class="btn btn-primary" id="checkBtn" data-action="check" disabled>Vérifier</button></div>`;
}

function renderFoot() { $('#foot').innerHTML = footHTML(); updateCheck(); }

function afterExercise() {
  const ex = L.ex;
  if (state.settings.autoplay && ['intro', 'mc_en_fr', 'listen_mc', 'dictation'].includes(ex.type)) setTimeout(() => speak(ex.item.en), 250);
  const a = $('#answer');
  if (a) a.focus();
  updateCheck();
}

function renderPlacementResult() {
  const { passed, start } = L.result;
  const startLvl = LEVELS[start];
  const verdict = passed === 0
    ? { icon: '🌱', title: 'On part de la base !', text: 'Le niveau A1 est fait pour toi : tu vas progresser très vite.' }
    : passed === LEVELS.length
      ? { icon: '🏆', title: `Niveau estimé : ${LEVELS[passed - 1].id} et plus`, text: `Impressionnant ! Commence par le ${startLvl.id} pour peaufiner les nuances.` }
      : { icon: '🎉', title: `Niveau estimé : ${LEVELS[passed - 1].id}`, text: `Tu maîtrises le niveau ${LEVELS[passed - 1].name.toLowerCase()}. Ton prochain défi : le ${startLvl.id}.` };
  return `
  <main class="page result">
    <div class="trophy">${verdict.icon}</div>
    <h1 class="center">${verdict.title}</h1>
    <p class="center muted">${verdict.text}</p>
    <section class="card">
      <strong>Détail du test</strong>
      ${LEVELS.map((l, i) => {
        const s = L.scores[i];
        const label = s == null ? 'non testé' : `${s} / ${PLACEMENT_PER_LEVEL} ${s >= PLACEMENT_PASS ? '✅' : '❌'}`;
        return `<div class="level-stat"><span class="level-badge sm" data-l="${l.id}">${l.id}</span><span class="level-stat-name">${esc(l.name)}</span>
          <div class="bar thin"><div style="width:${(s || 0) / PLACEMENT_PER_LEVEL * 100}%"></div></div><span class="small muted placement-score">${label}</span></div>`;
      }).join('')}
      <p class="small muted">Il faut ${PLACEMENT_PASS} bonnes réponses sur ${PLACEMENT_PER_LEVEL} pour valider un niveau. Le test n’a aucun effet sur tes révisions.</p>
    </section>
    <div class="btn-col">
      <button class="btn btn-primary wide" data-action="placeStart" data-level="${startLvl.id}">Commencer au niveau ${startLvl.id}</button>
      <button class="btn btn-secondary wide" data-action="nav" data-to="home">Retour à l’accueil</button>
    </div>
  </main>`;
}

function renderResult() {
  const r = L.result;
  return `
  <main class="page result">
    <div class="trophy">${r.acc === 100 ? '🏆' : r.acc >= 80 ? '🎉' : '💪'}</div>
    <h1 class="center">${L.doneTitle}</h1>
    <div class="stat-grid three">
      ${statTile('⭐', '+' + r.xp, 'XP gagnés')}
      ${statTile('🎯', r.acc + ' %', 'précision')}
      ${statTile('⏱️', fmtTime(r.time), 'durée')}
    </div>
    <p class="center">🔥 Série : <b>${state.streak} jour${state.streak > 1 ? 's' : ''}</b>${r.goalReached ? '<br>🎯 Objectif du jour atteint !' : ''}</p>
    ${L.mistakes.length ? `
      <section class="card">
        <strong>À retravailler</strong>
        <ul class="vocab">${L.mistakes.map(vocabRow).join('')}</ul>
      </section>` : ''}
    <div class="btn-col">
      <button class="btn btn-primary wide" data-action="again">Encore une</button>
      <button class="btn btn-secondary wide" data-action="nav" data-to="home">Retour à l’accueil</button>
    </div>
  </main>`;
}

const dots = box => `<span class="dots" title="Niveau ${box}/${MAX_BOX}">${[1, 2, 3, 4, 5].map(k => `<i class="${box >= k ? 'on' : ''}"></i>`).join('')}</span>`;
const vocabRow = i => `
  <li>${speakerBtn(i.en, 'sm')}
    <div class="v-text"><b>${clickable(i.en)}</b><span class="muted">${esc(i.fr)}</span></div>
    ${dots(peek(i.id).box)}
  </li>`;

function vocabList(q) {
  const fq = fold(q.trim());
  const html = UNITS.map(u => {
    const rows = u.items.filter(i => peek(i.id).seen && (!fq || fold(i.en + ' ' + i.fr).includes(fq)));
    return rows.length ? `<h3>${u.icon} ${esc(u.title)}</h3><ul class="vocab">${rows.map(vocabRow).join('')}</ul>` : '';
  }).join('');
  return html || `<p class="muted">${fq ? 'Aucun résultat.' : 'Rien pour l’instant : termine une leçon pour remplir ton vocabulaire.'}</p>`;
}

function renderProgress() {
  const seen = ALL.filter(i => peek(i.id).seen);
  const mastered = seen.filter(i => peek(i.id).box >= MASTERED).length;
  const acc = state.answers ? Math.round(state.good / state.answers * 100) : 0;
  const days = [...Array(7)].map((_, k) => {
    const t = Date.now() - (6 - k) * DAY;
    return { label: new Date(t).toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''), xp: state.daily[dayKey(t)] || 0 };
  });
  const goal = state.settings.dailyGoal, max = Math.max(goal, ...days.map(d => d.xp));
  return `${topbar()}
  <main class="page">
    <h1>Ta progression</h1>
    <div class="stat-grid">
      ${statTile('🔥', currentStreak(), 'jours de série')}
      ${statTile('🏆', state.bestStreak, 'meilleure série')}
      ${statTile('⭐', state.xp, 'XP au total')}
      ${statTile('📚', state.lessons, 'leçons faites')}
      ${statTile('🗂️', `${seen.length}/${ALL.length}`, 'expressions vues')}
      ${statTile('💎', mastered, 'maîtrisées')}
      ${statTile('💬', `${Object.values(state.dialogues).filter(x => x.done).length}/${DIALOGUES.length}`, 'dialogues réussis')}
    </div>
    <section class="card">
      <strong>Niveaux</strong>
      ${LEVELS.map(l => {
        const p = Math.round(levelProgress(l.id) * 100);
        return `<div class="level-stat"><span class="level-badge sm" data-l="${l.id}">${l.id}</span><span class="level-stat-name">${esc(l.name)}</span><div class="bar thin"><div style="width:${p}%"></div></div><span class="small muted">${p} %</span></div>`;
      }).join('')}
    </section>
    <section class="card" id="badges">
      <div class="row-between"><strong>🏅 Badges</strong><span class="muted small">${Object.keys(state.badges).length} / ${BADGES.length}</span></div>
      <div class="badge-grid">
        ${BADGES.map(b => {
          const got = state.badges[b.id];
          return `<div class="badge ${got ? 'got' : 'locked'}" title="${esc(b.desc)}">
            <span class="badge-icon">${got ? b.icon : '🔒'}</span>
            <b>${esc(b.name)}</b>
            <span class="muted">${esc(b.desc)}</span>
            ${got ? `<span class="badge-date">${new Date(got).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>` : ''}
          </div>`;
        }).join('')}
      </div>
    </section>
    <section class="card">
      <div class="row-between"><strong>7 derniers jours</strong><span class="muted small">${acc} % de bonnes réponses</span></div>
      <div class="chart">
        <div class="goal-line" style="bottom:calc(32px + (100% - 32px) * ${goal / max})"><span>objectif</span></div>
        ${days.map(d => `
          <div class="chart-col">
            <div class="chart-track"><div class="chart-bar ${d.xp >= goal ? 'met' : ''}" style="height:${d.xp / max * 100}%"></div></div>
            <span class="chart-val">${d.xp || ''}</span>
            <span class="chart-lbl">${d.label}</span>
          </div>`).join('')}
      </div>
    </section>
    <section class="card">
      <div class="row-between"><strong>Mon vocabulaire</strong><input id="vocabSearch" type="search" placeholder="Rechercher…"></div>
      <div id="vocabList">${vocabList('')}</div>
    </section>
  </main>
  ${nav('progress')}`;
}

function renderSettings() {
  const s = state.settings;
  const toggle = (k, label, disabled = false) => `
    <label class="row-between toggle ${disabled ? 'disabled' : ''}">
      <span>${label}</span>
      <input type="checkbox" data-setting="${k}" ${s[k] && !disabled ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
    </label>`;
  return `${topbar()}
  <main class="page">
    <h1>Réglages</h1>
    <section class="card form">
      <h3>Voix anglaise</h3>
      <label class="row-between">Accent
        <select data-setting="accent">
          <option value="en-US" ${s.accent === 'en-US' ? 'selected' : ''}>🇺🇸 Américain</option>
          <option value="en-GB" ${s.accent === 'en-GB' ? 'selected' : ''}>🇬🇧 Britannique</option>
        </select>
      </label>
      <label class="row-between">Voix
        <select data-setting="voice">
          <option value="">Automatique</option>
          ${voices.map(v => `<option value="${esc(v.name)}" ${s.voice === v.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}
        </select>
      </label>
      <label class="row-between">Vitesse
        <span class="range"><input type="range" min="0.5" max="1.3" step="0.05" value="${s.rate}" data-setting="rate"><output id="rateOut">${Number(s.rate).toFixed(2)}×</output></span>
      </label>
      <button class="btn btn-secondary" data-action="say" data-text="Hello! Let's practice English together.">🔊 Tester la voix</button>
      ${!window.speechSynthesis ? '<p class="warn">Ce navigateur ne sait pas lire de texte à voix haute.</p>'
        : !voices.length ? '<p class="warn">Aucune voix anglaise trouvée. Sous Windows : Paramètres › Heure et langue › Voix › Ajouter des voix (anglais).</p>' : ''}
    </section>
    <section class="card form">
      <h3>Leçons</h3>
      <label class="row-between">Objectif quotidien
        <select data-setting="dailyGoal">
          ${[[10, 'Tranquille'], [20, 'Normal'], [30, 'Sérieux'], [50, 'Intense'], [80, 'Marathon']].map(([g, l]) =>
            `<option value="${g}" ${s.dailyGoal === g ? 'selected' : ''}>${g} XP — ${l}</option>`).join('')}
        </select>
      </label>
      ${toggle('autoplay', 'Lecture audio automatique')}
      ${toggle('listening', 'Exercices d’écoute')}
      ${toggle('speaking', 'Exercices de prononciation (micro)', !SR)}
      ${!SR ? '<p class="warn">La reconnaissance vocale n’est pas disponible dans ce navigateur : utilise Google Chrome ou Microsoft Edge.</p>' : ''}
      ${toggle('sounds', canVibrate ? 'Effets sonores et vibrations' : 'Effets sonores')}
      ${toggle('unlockAll', 'Débloquer toutes les unités')}
    </section>
    ${installSection()}
    <section class="card form">
      <h3>🔔 Rappel quotidien</h3>
      <p class="small">Ajoute un rendez-vous quotidien à l’agenda de ton téléphone (ou de ton PC) : il te notifiera chaque jour à l’heure choisie.</p>
      <div class="row-between reminder-row">
        <label class="time-field">Heure <input type="time" id="reminderTime" value="${esc(state.settings.reminderTime || '19:00')}"></label>
        <button class="btn btn-primary" data-action="calendar">📅 Ajouter à mon agenda</button>
      </div>
      <p class="muted small">Ton agenda te demandera de confirmer l’ajout. Pour arrêter, supprime simplement l’événement « Leçon d’anglais ».</p>
      ${location.protocol === 'file:' ? `
        <details class="small">
          <summary><b>Sur PC Windows : notification sans agenda</b></summary>
          <ol class="steps">
            <li>Ouvre le dossier de l’appli, puis le sous-dossier <b>rappel</b>${appFolder() ? ` :<br><code>${esc(appFolder())}\\rappel</code>` : ''}</li>
            <li>Double-clique sur <b>installer-rappel.bat</b></li>
            <li>Tape l’heure voulue (par exemple <b>19:00</b>) et valide</li>
          </ol>
          <p class="muted">Pour arrêter : <b>desinstaller-rappel.bat</b>.</p>
        </details>` : ''}
    </section>
    <section class="card form">
      <h3>Mes données</h3>
      <p class="muted small">Ta progression est enregistrée uniquement dans ce navigateur, sur cet ordinateur. Exporte une sauvegarde de temps en temps.</p>
      <div class="btn-row">
        <button class="btn btn-secondary" data-action="export">💾 Exporter</button>
        <button class="btn btn-secondary" data-action="import">📂 Importer</button>
        <button class="btn btn-danger-outline" data-action="reset">🗑️ Tout effacer</button>
      </div>
      <input type="file" id="importFile" accept=".json,application/json" hidden>
    </section>
  </main>
  ${nav('settings')}`;
}

/* ---------- Installation (PWA) ---------- */
let installPrompt = null; // fourni par Chrome / Edge sur Android et PC
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  if (screen === 'settings') render();
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  toast('Appli installée ✔');
  if (screen === 'settings') render();
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* hors ligne indisponible */ }));
}

function installSection() {
  let body;
  if (isStandalone()) {
    body = '<p class="small ok-text">✅ L’appli est installée sur cet appareil.</p>';
  } else if (location.protocol === 'file:') {
    body = `<p class="small">Pour l’installer sur ton téléphone, l’appli doit d’abord être mise en ligne (gratuitement) : voir le fichier <b>LISEZMOI</b>.
      Ouvre ensuite son adresse sur ton téléphone et reviens ici.</p>`;
  } else if (installPrompt) {
    body = `<p class="small">Ajoute English Coach à ton écran d’accueil : elle s’ouvrira en plein écran, comme une vraie appli, même sans connexion.</p>
      <button class="btn btn-primary" data-action="install">📲 Installer l’appli</button>`;
  } else if (isIOS()) {
    body = `<ol class="small steps">
        <li>Ouvre cette page dans <b>Safari</b></li>
        <li>Touche le bouton <b>Partager</b> <span class="ios-share">⬆︎</span> en bas de l’écran</li>
        <li>Choisis <b>« Sur l’écran d’accueil »</b>, puis <b>Ajouter</b></li>
      </ol>`;
  } else {
    body = `<ol class="small steps">
        <li>Ouvre le menu du navigateur <b>⋮</b> (en haut à droite)</li>
        <li>Choisis <b>« Installer l’application »</b> ou <b>« Ajouter à l’écran d’accueil »</b></li>
      </ol>`;
  }
  return `
    <section class="card form">
      <h3>📱 Installer l’appli</h3>
      ${body}
      <p class="muted small">Ta progression est propre à chaque appareil. Pour passer du PC au téléphone : <b>Exporter</b> ici, puis <b>Importer</b> le fichier sur l’autre appareil.</p>
    </section>`;
}

// Fichier d'agenda (.ics) : un rendez-vous quotidien avec une alerte
function downloadCalendar() {
  const time = ($('#reminderTime').value || '19:00').replace(':', '');
  state.settings.reminderTime = $('#reminderTime').value || '19:00';
  save();
  const d = new Date(Date.now() + DAY);
  const start = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${time}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const url = location.protocol.startsWith('http') ? location.href.split('#')[0] : '';
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//English Coach//FR', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:english-coach-rappel-${stamp}@english-coach`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:🗣️ Leçon d’anglais',
    `DESCRIPTION:5 minutes d’anglais avec English Coach !${url ? `\\n${url}` : ''}`,
    ...(url ? [`URL:${url}`] : []),
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:PT0M', 'DESCRIPTION:C’est l’heure de ton anglais !', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  a.download = 'rappel-anglais.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Ouvre le fichier pour l’ajouter à ton agenda');
}

// Dossier de l'appli sur le disque (quand elle est ouverte en double-cliquant sur index.html)
function appFolder() {
  if (location.protocol !== 'file:') return '';
  return decodeURIComponent(location.pathname).replace(/^\/([A-Za-z]:)/, '$1').replace(/\/[^/]*$/, '').replace(/\//g, '\\');
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ================= Actions ================= */
function selectOption(i) {
  const ex = L.ex;
  if (L.phase !== 'answer' || !ex.options || i >= ex.options.length) return;
  ex.sel = i;
  $$('#exercise .option').forEach((b, k) => b.classList.toggle('selected', k === i));
  if (ex.type === 'mc_fr_en' && state.settings.autoplay) speak(ex.options[i]);
  updateCheck();
}

function onMatch(el) {
  const ex = L.ex;
  if (L.phase !== 'answer' || ex.lock) return;
  const id = el.dataset.id;
  if (el.dataset.side === 'L') { ex.selL = id; speak(BY_ID[id].en); } else ex.selR = id;
  if (ex.selL && ex.selR) {
    if (ex.selL === ex.selR) {
      ex.done.add(ex.selL);
      ex.selL = ex.selR = null;
    } else {
      ex.errors.add(ex.selL).add(ex.selR);
      ex.bad = [ex.selL, ex.selR];
      ex.lock = true;
      beep(false);
      setTimeout(() => { ex.bad = null; ex.lock = false; ex.selL = ex.selR = null; $('#match').innerHTML = matchInner(ex); }, 550);
    }
  }
  $('#match').innerHTML = matchInner(ex);
  if (ex.done.size === ex.items.length) { ex.lock = true; setTimeout(() => grade(true), 250); }
}

function skip(what) {
  if (what === 'speak') { L.noSpeak = true; toast('Exercices de prononciation désactivés pour cette leçon'); }
  else { L.noListen = true; toast('Exercices d’écoute désactivés pour cette leçon'); }
  next();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `english-coach-sauvegarde-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data.items !== 'object') throw new Error('format');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      state = load();
      syncCustomUnit();
      toast('Sauvegarde importée ✔');
      render();
    } catch (e) { toast('Fichier de sauvegarde invalide'); }
  };
  reader.readAsText(file);
}

const actions = {
  nav: el => {
    window.speechSynthesis && speechSynthesis.cancel();
    screen = el.dataset.to; L = null; D = null; F = null; S = null; render();
  },
  myAdd: () => addCustom(),
  myListen: () => { const en = $('#myEn').value.trim(); if (en) speak(en); else toast('Écris d’abord l’expression en anglais'); },
  myDel: el => {
    const c = state.custom.find(x => x.id === el.dataset.id);
    if (!c || !confirm(`Supprimer « ${c.en} » de ta liste ?`)) return;
    state.custom = state.custom.filter(x => x !== c);
    delete state.items[`my-${c.id}`];
    save();
    syncCustomUnit();
    render();
  },
  soundStart: el => startSounds(el.dataset.id),
  soundPick: el => soundPick(+el.dataset.i),
  soundNext: () => soundNext(),
  unit: el => {
    const id = el.dataset.unit;
    // La fiche de grammaire s'affiche automatiquement avant la toute première leçon d'une unité
    if (GRAMMAR[id] && !state.fichesSeen[id]) openFiche(id, true, screen);
    else startLesson('unit', id);
  },
  fiche: el => openFiche(el.dataset.unit, false, screen === 'fiche' ? F.from : screen),
  ficheBack: () => { screen = F.from; F = null; render(); },
  ficheStart: () => startLesson('unit', F.unit),
  dialogue: el => startDialogue(el.dataset.unit, screen === 'fiche' ? F.from : screen),
  reply: el => reply(+el.dataset.i),
  toggleFr: el => { const b = D && D.shown[+el.dataset.k]; if (b) { b.showFr = !b.showFr; drawDialogue(); } },
  quitDialogue: () => {
    if (!D.done && !confirm('Quitter le dialogue ? Tu pourras le reprendre depuis le début.')) return;
    actions.dialogueEnd();
  },
  dialogueAgain: () => startDialogue(D.d.unit, D.from),
  dialogueEnd: () => {
    window.speechSynthesis && speechSynthesis.cancel();
    screen = D.from;
    D = null;
    render();
  },
  review: () => startLesson('review'),
  openLevel: el => {
    const id = el.dataset.level;
    if (!confirm(`Débloquer directement le niveau ${id} ? Les unités de ce niveau se débloqueront ensuite une par une.`)) return;
    state.openLevels[id] = true;
    levelFolded[id] = false;
    save();
    render();
  },
  again: () => startLesson(L.kind, L.unitId),
  placement: () => startPlacement(),
  dunno: () => { if (L && L.phase === 'answer') grade(false); },
  placeStart: el => {
    const id = el.dataset.level, upTo = LEVEL_IDS.indexOf(id);
    // Débloque le niveau conseillé (et les précédents, pour pouvoir y revenir)
    LEVEL_IDS.forEach((lid, i) => {
      if (i <= upTo) state.openLevels[lid] = true;
      levelFolded[lid] = lid !== id;
    });
    save();
    L = null;
    screen = 'home';
    render();
    const sec = $(`details[data-level="${id}"]`);
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  quit: () => {
    const msg = L.kind === 'placement'
      ? 'Quitter le test de niveau ? Tu pourras le refaire plus tard depuis l’accueil.'
      : 'Quitter la leçon ? Les réponses déjà données restent comptées, mais tu ne gagneras pas l’XP de fin de leçon.';
    if (!confirm(msg)) return;
    window.speechSynthesis && speechSynthesis.cancel();
    L = null; screen = 'home'; render();
  },
  say: el => speak(el.dataset.text, !!el.dataset.slow, { alt: !!el.dataset.alt }),
  word: el => openWord(el.dataset.w),
  install: async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    installPrompt = null;
    render();
  },
  calendar: () => downloadCalendar(),
  closeOverlay: () => closeOverlays(),
  option: el => selectOption(+el.dataset.i),
  check: () => check(),
  continue: () => next(),
  skip: el => skip(el.dataset.what),
  mic: () => startMic(),
  tile: el => {
    const ex = L.ex;
    if (L.phase !== 'answer') return;
    ex.chosen.push(+el.dataset.i);
    if (state.settings.autoplay) speak(ex.bank[+el.dataset.i]);
    $('#wb').innerHTML = wordbankInner(ex);
    updateCheck();
  },
  untile: el => {
    const ex = L.ex;
    if (L.phase !== 'answer') return;
    ex.chosen.splice(+el.dataset.k, 1);
    $('#wb').innerHTML = wordbankInner(ex);
    updateCheck();
  },
  match: el => onMatch(el),
  export: () => exportData(),
  import: () => $('#importFile').click(),
  reset: () => {
    if (!confirm('Effacer toute ta progression (XP, série, vocabulaire) ? Tes réglages et ta liste « Mes expressions » sont conservés. Cette action est définitive.')) return;
    const { settings, custom } = state;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    state = load();
    state.settings = settings;
    state.custom = custom;
    save();
    syncCustomUnit();
    toast('Progression effacée');
    render();
  },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (fn) fn(el, e);
});

document.addEventListener('toggle', e => {
  const id = e.target.dataset && e.target.dataset.level;
  if (id && e.target.tagName === 'DETAILS') levelFolded[id] = !e.target.open;
}, true);

document.addEventListener('input', e => {
  if (e.target.id === 'answer') updateCheck();
  else if (e.target.id === 'vocabSearch') $('#vocabList').innerHTML = vocabList(e.target.value);
  else if (e.target.dataset.setting === 'rate') $('#rateOut').textContent = `${Number(e.target.value).toFixed(2)}×`;
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'importFile' && t.files[0]) return importData(t.files[0]);
  const k = t.dataset.setting;
  if (!k) return;
  let v = t.type === 'checkbox' ? t.checked : t.value;
  if (k === 'rate' || k === 'dailyGoal') v = Number(v);
  state.settings[k] = v;
  if (k === 'accent') state.settings.voice = '';
  save();
  if (k === 'accent' || k === 'unlockAll') render();
});

document.addEventListener('keydown', e => {
  // Une fenêtre (sens d'un mot, badge) est ouverte : Échap ou Entrée la ferme
  if ($('.overlay')) {
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); closeOverlays(); }
    return;
  }
  if (screen === 'mywords' && e.key === 'Enter' && e.target.tagName === 'INPUT') {
    e.preventDefault();
    addCustom();
    return;
  }
  if (screen === 'soundGame' && S && !S.done) {
    if (S.answer == null && /^[12]$/.test(e.key)) soundPick(Number(e.key) - 1);
    else if (S.answer != null && e.key === 'Enter') { e.preventDefault(); soundNext(); }
    return;
  }
  if (screen === 'dialogue' && D) {
    if (D.done && e.key === 'Enter') { e.preventDefault(); actions.dialogueEnd(); }
    else if (D.choices && /^[1-3]$/.test(e.key)) reply(Number(e.key) - 1);
    return;
  }
  if (screen !== 'lesson' || !L || !L.ex) return;
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (L.phase === 'feedback' || L.ex.type === 'intro') next();
    else check();
  } else if (L.phase === 'answer' && /^[1-4]$/.test(e.key) && L.ex.options && document.activeElement.tagName !== 'TEXTAREA') {
    selectOption(Number(e.key) - 1);
  }
});

// Badges déjà mérités avant leur apparition : attribués sans célébration
checkBadges(true);
render();
