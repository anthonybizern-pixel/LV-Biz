// Entraînement aux sons difficiles pour les francophones (paires minimales).
// Chaque paire : ["mot 1", "traduction 1", "mot 2", "traduction 2"]

const SOUNDS = [
  {
    id: "i", icon: "🐑", title: "i court ou ee long", sample: "ship / sheep",
    tip: "**i** court (ship) : bouche détendue, son bref, entre « i » et « é ». **ee** long (sheep) : sourire, son long « iii ».",
    pairs: [
      ["ship", "navire", "sheep", "mouton"],
      ["live", "vivre", "leave", "partir"],
      ["sit", "s'asseoir", "seat", "siège"],
      ["fill", "remplir", "feel", "ressentir"],
      ["bit", "un morceau", "beat", "battre"],
      ["still", "encore", "steal", "voler"],
    ],
  },
  {
    id: "th", icon: "👅", title: "Le th", sample: "think / sink",
    tip: "Place le bout de la langue **entre les dents** et souffle. Sans vibration pour *think*, avec vibration pour *they*.",
    pairs: [
      ["think", "penser", "sink", "couler"],
      ["three", "trois", "free", "libre"],
      ["thank", "remercier", "tank", "réservoir"],
      ["they", "ils", "day", "jour"],
      ["thin", "mince", "fin", "nageoire"],
      ["mouth", "bouche", "mouse", "souris"],
    ],
  },
  {
    id: "h", icon: "💨", title: "Le h aspiré", sample: "hair / air",
    tip: "En anglais, le **h** se prononce : un petit souffle, comme quand tu embues une vitre. Sans lui, le mot change !",
    pairs: [
      ["hair", "cheveux", "air", "air"],
      ["heat", "chaleur", "eat", "manger"],
      ["hill", "colline", "ill", "malade"],
      ["hand", "main", "and", "et"],
      ["hold", "tenir", "old", "vieux"],
      ["heart", "cœur", "art", "art"],
    ],
  },
  {
    id: "a", icon: "🐱", title: "a de cat ou u de cut", sample: "cat / cut",
    tip: "**a** (cat) : bouche grande ouverte, entre « a » et « è ». **u** (cut) : son court et neutre, proche de « eu » dans « le ».",
    pairs: [
      ["cat", "chat", "cut", "couper"],
      ["hat", "chapeau", "hut", "cabane"],
      ["bag", "sac", "bug", "insecte"],
      ["match", "allumette", "much", "beaucoup"],
      ["ran", "a couru", "run", "courir"],
      ["cap", "casquette", "cup", "tasse"],
    ],
  },
  {
    id: "u", icon: "🏊", title: "u court ou oo long", sample: "full / fool",
    tip: "**u** court (full) : son bref et détendu. **oo** long (fool) : lèvres arrondies, « ou » prolongé.",
    pairs: [
      ["full", "plein", "fool", "idiot"],
      ["pull", "tirer", "pool", "piscine"],
      ["look", "regarder", "Luke", "Luke"],
      ["could", "pourrait", "cooed", "a roucoulé"],
    ],
  },
  {
    id: "w", icon: "🍷", title: "w ou v", sample: "west / vest",
    tip: "**w** : lèvres arrondies comme pour « ou », les dents ne touchent pas la lèvre. **v** : les dents du haut touchent la lèvre du bas.",
    pairs: [
      ["west", "ouest", "vest", "gilet"],
      ["wine", "vin", "vine", "vigne"],
      ["wet", "mouillé", "vet", "vétérinaire"],
      ["worse", "pire", "verse", "couplet"],
    ],
  },
];
