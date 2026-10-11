// Entraînement aux sons allemands difficiles pour les francophones (paires minimales).
// Chaque paire : ["mot 1", "traduction 1", "mot 2", "traduction 2"]

const SOUNDS = [
  {
    id: "ue", icon: "🎈", title: "u ou ü", sample: "Mutter / Mütter",
    tip: "**u** allemand = notre « ou ». **ü** = notre « u » français (lèvres arrondies, langue en avant). La bonne nouvelle : tu sais déjà le prononcer !",
    pairs: [
      ["Mutter", "mère", "Mütter", "mères"],
      ["Bruder", "frère", "Brüder", "frères"],
      ["Kuchen", "gâteau", "Küchen", "cuisines"],
      ["fuhr", "conduisait", "für", "pour"],
    ],
  },
  {
    id: "oe", icon: "🌸", title: "o ou ö", sample: "schon / schön",
    tip: "**ö** se prononce comme « eu » dans « deux » (long) ou « œ » dans « œuf » (court). Ne le confonds pas avec **o** : *schon* (déjà) ≠ *schön* (beau).",
    pairs: [
      ["schon", "déjà", "schön", "beau"],
      ["Ofen", "four", "Öfen", "fours"],
      ["Tochter", "fille", "Töchter", "filles"],
      ["konnte", "pouvait", "könnte", "pourrait"],
    ],
  },
  {
    id: "ch", icon: "🍒", title: "Le ch allemand", sample: "Kirche / Kirsche",
    tip: "Après i, e, ü, ö, ä : **ch** doux, comme un chuintement léger (« ich »), ce n'est pas un « ch » français. Après a, o, u : **ch** guttural, raclé au fond de la gorge (« Nacht »).",
    pairs: [
      ["Kirche", "église", "Kirsche", "cerise"],
      ["mich", "moi", "misch", "mélange"],
      ["Nacht", "nuit", "nackt", "nu"],
      ["lachen", "rire", "Laken", "drap"],
    ],
  },
  {
    id: "h", icon: "💨", title: "Le h aspiré", sample: "Hund / und",
    tip: "En allemand, le **h** en début de mot se prononce toujours : un petit souffle, comme quand tu embues une vitre.",
    pairs: [
      ["Hund", "chien", "und", "et"],
      ["Haus", "maison", "aus", "hors de"],
      ["halt", "stop", "alt", "vieux"],
      ["Hessen", "la Hesse", "essen", "manger"],
    ],
  },
  {
    id: "long", icon: "⏱️", title: "Voyelles longues ou courtes", sample: "Staat / Stadt",
    tip: "La longueur change le sens ! Voyelle **longue** devant une seule consonne, un **h** ou une voyelle doublée (Staat, Miete) ; **courte** devant deux consonnes (Stadt, Mitte).",
    pairs: [
      ["Staat", "État", "Stadt", "ville"],
      ["Miete", "loyer", "Mitte", "milieu"],
      ["Ofen", "four", "offen", "ouvert"],
      ["Beet", "plate-bande", "Bett", "lit"],
      ["Hüte", "chapeaux", "Hütte", "cabane"],
    ],
  },
  {
    id: "z", icon: "🐐", title: "z (ts) ou s", sample: "Zeit / seit",
    tip: "Le **z** allemand se prononce toujours **ts** (Zeit = « tsaït »). Le **s** devant une voyelle se prononce **z** (seit = « zaït »).",
    pairs: [
      ["Zeit", "temps", "seit", "depuis"],
      ["Ziege", "chèvre", "Siege", "victoires"],
      ["Zahl", "nombre", "Saal", "salle"],
    ],
  },
];
