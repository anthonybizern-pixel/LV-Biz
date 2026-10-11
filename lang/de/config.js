// Configuration de la langue apprise : allemand (standard d'Allemagne).

const LANG = {
  code: 'de',
  name: 'allemand',         // « en allemand »
  Name: 'Allemand',
  adjF: 'allemande',        // « une expression allemande »
  de: 'd’allemand',         // « ta leçon d’allemand »
  native: 'Deutsch',
  flag: '<span class="flag-de" aria-hidden="true"></span>',
  storageKey: 'lv-coach-de-v1',
  voicePrefix: 'de',
  accents: [['de-DE', 'Allemagne'], ['de-AT', 'Autriche']],
  defaultAccent: 'de-DE',
  testPhrase: 'Hallo! Lass uns zusammen Deutsch üben.',
  example: { en: 'Das ist mir egal', fr: 'Ça m’est égal', alts: 'Ist mir egal' },
  voiceHelp: 'Android : Paramètres › Synthèse vocale › Google › installer « Deutsch ». iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Deutsch. Windows : Paramètres › Heure et langue › Voix › Ajouter des voix (allemand).',
  // Les umlauts peuvent être tapés ae, oe, ue et ß en ss (convention allemande) : voir preNorm
  accentSensitive: false,

  // Mots cliquables : lettres avec umlauts et ß
  wordRegex: /([A-Za-zÄÖÜäöüß]+)/,

  // ä → ae, ö → oe, ü → ue, ß → ss : « schön » et « schoen » sont équivalents, « schon » reste différent
  preNorm: s => s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss'),

  contractions: {
    "geht's": 'geht es', "gibt's": 'gibt es', "wie's": 'wie es', "hab's": 'habe es', "ich's": 'ich es',
  },
  numbers: {
    1: 'eins', 2: 'zwei', 3: 'drei', 4: 'vier', 5: 'fuenf', 6: 'sechs', 7: 'sieben', 8: 'acht', 9: 'neun', 10: 'zehn',
    11: 'elf', 12: 'zwoelf', 15: 'fuenfzehn', 20: 'zwanzig', 30: 'dreissig', 100: 'hundert',
  },

  // Formes de base possibles : pluriels, adjectifs accordés, verbes conjugués, participes (gemacht → machen)
  lemmas(w) {
    const cands = [w];
    const add = s => { if (s && s.length > 1 && !cands.includes(s)) cands.push(s); };
    // participes passés : ge…t / ge…en
    if (/^ge.+t$/.test(w)) { const r = w.slice(2, -1); add(r + 'en'); add(r + 'n'); add(r.replace(/e$/, '') + 'en'); }
    if (/^ge.+en$/.test(w)) add(w.slice(2));
    // terminaisons d'adjectifs, de pluriels et de conjugaisons
    for (const e of ['ern', 'en', 'em', 'er', 'es', 'est', 'st', 'et', 'te', 'ten', 'tet', 'e', 'n', 's', 't']) {
      if (w.length > e.length + 2 && w.endsWith(e)) {
        const r = w.slice(0, -e.length);
        add(r); add(r + 'en'); add(r + 'n'); add(r + 'e');
      }
    }
    return cands;
  },
};
