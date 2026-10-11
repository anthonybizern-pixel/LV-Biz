// Configuration de la langue apprise : anglais.
// Tout ce qui dépend de la langue (voix, textes de l'interface, comparaison des réponses, lexique) est ici.

const LANG = {
  code: 'en',
  name: 'anglais',          // « en anglais »
  Name: 'Anglais',
  adjF: 'anglaise',         // « une expression anglaise »
  de: 'd’anglais',          // « ta leçon d’anglais »
  native: 'English',
  flag: '<span class="flag-uk" aria-hidden="true"></span>',
  storageKey: 'english-coach-v1', // clé historique : la progression existante est conservée
  voicePrefix: 'en',
  accents: [['en-US', '🇺🇸 Américain'], ['en-GB', '🇬🇧 Britannique']],
  defaultAccent: 'en-US',
  testPhrase: "Hello! Let's practise English together.",
  example: { en: "It's up to you", fr: "C'est toi qui vois", alts: 'It depends on you' },
  voiceHelp: 'Sous Windows : Paramètres › Heure et langue › Voix › Ajouter des voix (anglais). Sur Android : Paramètres › Synthèse vocale.',
  accentSensitive: false,

  // Découpage des mots cliquables
  wordRegex: /([A-Za-z][A-Za-z'’-]*[A-Za-z]|[A-Za-z])/,

  // Formes équivalentes acceptées dans les réponses écrites
  contractions: {
    "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are', "he's": 'he is', "she's": 'she is',
    "it's": 'it is', "that's": 'that is', "what's": 'what is', "where's": 'where is', "there's": 'there is',
    "i've": 'i have', "you've": 'you have', "we've": 'we have', "they've": 'they have',
    "i'll": 'i will', "you'll": 'you will', "he'll": 'he will', "she'll": 'she will', "we'll": 'we will', "they'll": 'they will', "it'll": 'it will',
    "i'd": 'i would', "you'd": 'you would', "we'd": 'we would', "he'd": 'he would', "she'd": 'she would',
    "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "can't": 'can not', cannot: 'can not', "won't": 'will not',
    "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not', "hasn't": 'has not',
    "couldn't": 'could not', "wouldn't": 'would not', "shouldn't": 'should not', "let's": 'let us',
  },
  numbers: {
    0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
    11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen',
    19: 'nineteen', 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty', 100: 'hundred',
  },

  // Formes de base possibles d'un mot (works → work, running → run, smaller → small…)
  lemmas(w) {
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
    return cands;
  },
};
