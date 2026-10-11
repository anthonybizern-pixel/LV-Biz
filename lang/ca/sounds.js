// Entraînement aux sons catalans difficiles pour les francophones (paires minimales).
// Chaque paire : ["mot 1", "traduction 1", "mot 2", "traduction 2"]

const SOUNDS = [
  {
    id: "sz", icon: "🐝", title: "s sourd ou s sonore", sample: "casa / caça",
    tip: "Entre deux voyelles, un **s** seul se prononce **z** (casa = « caza »). Le **ss** et le **ç** se prononcent **s** (caça = « cassa »).",
    pairs: [
      ["casa", "maison", "caça", "chasse"],
      ["rosa", "rose", "rossa", "blonde"],
      ["pesa", "il pèse", "peça", "pièce"],
      ["zel", "zèle", "cel", "ciel"],
    ],
  },
  {
    id: "ll", icon: "🏓", title: "l, ll et l·l", sample: "pala / palla",
    tip: "**ll** se prononce comme le « lli » de « million », en un seul son mouillé. **l·l** (ela geminada) est un **l** double, un peu plus long : *cel·la*.",
    pairs: [
      ["pala", "pelle", "palla", "paille"],
      ["fil", "fil", "fill", "fils"],
      ["cola", "colle", "colla", "bande, groupe"],
      ["cel·la", "cellule", "cella", "sourcil"],
    ],
  },
  {
    id: "ny", icon: "🌾", title: "n ou ny", sample: "cana / canya",
    tip: "**ny** se prononce comme le **gn** de « montagne ». À la fin d'un mot aussi : *any* = « agn ».",
    pairs: [
      ["cana", "cheveu blanc", "canya", "canne, roseau"],
      ["mana", "il ordonne", "manya", "habileté"],
      ["pena", "peine", "penya", "rocher, club d'amis"],
      ["ban", "ban, avis officiel", "bany", "bain"],
    ],
  },
  {
    id: "rr", icon: "🍇", title: "r doux ou r roulé", sample: "para / parra",
    tip: "Entre deux voyelles, **r** est un battement léger de la langue. **rr** (et le r en début de mot) est **roulé**, avec plusieurs battements.",
    pairs: [
      ["para", "il arrête", "parra", "treille"],
      ["era", "il était", "erra", "il se trompe"],
      ["mira", "il regarde", "mirra", "myrrhe"],
    ],
  },
  {
    id: "eo", icon: "🎵", title: "Voyelles ouvertes ou fermées", sample: "mes / més",
    tip: "En catalan, **e** et **o** accentués peuvent être **ouverts** (è, ò, comme dans « mère », « porte ») ou **fermés** (é, ó, comme dans « été », « eau »). Les accents écrits t'aident.",
    pairs: [
      ["mes", "mois", "més", "plus"],
      ["be", "agneau", "bé", "bien"],
      ["son", "sommeil", "són", "ils sont"],
      ["te", "thé", "té", "il a"],
    ],
  },
];
