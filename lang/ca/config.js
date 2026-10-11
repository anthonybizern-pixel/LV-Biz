// Configuration de la langue apprise : catalan (standard central, Barcelone).

const LANG = {
  code: 'ca',
  name: 'catalan',          // « en catalan »
  Name: 'Catalan',
  adjF: 'catalane',         // « une expression catalane »
  de: 'de catalan',         // « ta leçon de catalan »
  native: 'Català',
  flag: '<span class="flag-ca" aria-hidden="true"></span>',
  storageKey: 'lv-coach-ca-v1',
  voicePrefix: 'ca',
  accents: [['ca-ES', 'Catalan central']],
  defaultAccent: 'ca-ES',
  testPhrase: 'Hola! Practiquem el català junts.',
  example: { en: 'Fa molta calor', fr: 'Il fait très chaud', alts: 'Fa calor' },
  voiceHelp: 'Android : Paramètres › Synthèse vocale › Google › installer la voix « Català ». iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Català. Windows : Paramètres › Heure et langue › Langue › ajouter « Català » avec la synthèse vocale.',
  // Les accents distinguent des mots (és / es, més / mes, té / te) : une faute d’accent est signalée
  accentSensitive: true,

  // Mots cliquables : lettres accentuées et l·l comprises ; l’apostrophe sépare (l'aigua → l' + aigua)
  wordRegex: /([A-Za-zÀ-ÖØ-öø-ÿ·]+)/,

  contractions: {},
  numbers: {
    1: 'un', 2: 'dos', 3: 'tres', 4: 'quatre', 5: 'cinc', 6: 'sis', 7: 'set', 8: 'vuit', 9: 'nou', 10: 'deu',
    11: 'onze', 12: 'dotze', 15: 'quinze', 20: 'vint', 30: 'trenta', 100: 'cent',
  },

  // Formes de base possibles : pluriel (cases → casa), féminin (petita → petit), conjugaisons (parlo → parlar)
  lemmas(w) {
    const cands = [w];
    const add = s => { if (s && s.length > 1 && !cands.includes(s)) cands.push(s); };
    // pluriels et féminins
    if (/ques$/.test(w)) add(w.slice(0, -4) + 'ca');
    if (/gues$/.test(w)) add(w.slice(0, -4) + 'ga');
    if (/ces$/.test(w)) add(w.slice(0, -3) + 'ça');
    if (/ges$/.test(w)) add(w.slice(0, -3) + 'ja');
    if (/gües$/.test(w)) add(w.slice(0, -4) + 'gua');
    if (/es$/.test(w)) { add(w.slice(0, -2) + 'a'); add(w.slice(0, -2)); add(w.slice(0, -1)); }
    if (/ssos$/.test(w)) add(w.slice(0, -3));
    if (/os$/.test(w)) add(w.slice(0, -2));
    if (/s$/.test(w)) add(w.slice(0, -1));
    if (/ns$/.test(w)) { const r = w.slice(0, -2); add(r.replace(/i$/, 'í').replace(/o$/, 'ó').replace(/e$/, 'è').replace(/a$/, 'à')); }
    if (/a$/.test(w)) { add(w.slice(0, -1)); add(w.slice(0, -1) + 'e'); }
    if (/ssa$/.test(w)) add(w.slice(0, -2));
    if (/ana$/.test(w)) add(w.slice(0, -3) + 'à');
    if (/ena$/.test(w)) add(w.slice(0, -3) + 'è');
    if (/ina$/.test(w)) add(w.slice(0, -3) + 'í');
    if (/ona$/.test(w)) add(w.slice(0, -3) + 'ó');
    // futur et conditionnel = infinitif + terminaison (viatjaré → viatjar, plourà → ploure)
    for (const e of ['íem', 'íeu', 'ies', 'ien', 'ia', 'em', 'eu', 'an', 'às', 'é', 'à']) {
      if (w.length > e.length + 2 && w.endsWith(e)) { const r = w.slice(0, -e.length); add(r); add(r + 'e'); }
    }
    // conjugaisons régulières : on essaie de retrouver l'infinitif
    const ends = ['àvem', 'àveu', 'aves', 'aven', 'ava', 'aré', 'aràs', 'arà', 'arem', 'areu', 'aran', 'aria', 'aríem', 'arien',
      'eixo', 'eixes', 'eix', 'eixen', 'em', 'eu', 'en', 'es', 'ats', 'ades', 'ada', 'at', 'ida', 'ides', 'it', 'its', 'uda', 'ut',
      'ant', 'ent', 'int', 'ia', 'ies', 'ien', 'o', 'a', 'i', 'e'];
    for (const e of ends) {
      if (w.length > e.length + 2 && w.endsWith(e)) {
        const stem = w.slice(0, -e.length);
        ['ar', 'ir', 'er', 're'].forEach(x => add(stem + x));
      }
    }
    return cands;
  },
};
