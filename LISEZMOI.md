# LV Coach

Appli perso pour apprendre les langues, **anglais**, **catalan** et **allemand**, sans compte ni abonnement.
En ligne : https://anthonybizern-pixel.github.io/LV-Biz/

## Sur ton téléphone
Ouvre l'adresse ci-dessus sur ton téléphone, puis :
- **Android (Chrome)** : menu **⋮** › **Installer l'application** (ou le bouton « Installer l'appli » dans Réglages)
- **iPhone (Safari)** : bouton **Partager** › **Sur l'écran d'accueil**

Elle s'ouvre alors en plein écran avec son icône et fonctionne **hors connexion**
(sauf l'exercice de prononciation au micro, qui a besoin d'Internet).
Rappel sur téléphone : **Réglages › Rappel quotidien › Ajouter à mon agenda**.

## Trois langues
- Au premier lancement, l'appli demande quelle langue apprendre. Pour changer ensuite : touche le **drapeau** en haut de l'écran.
- **Chaque langue a sa propre progression** (XP, série, badges, mots perso). Chaque appareil aussi : une personne = un téléphone.
- Pour le catalan et l'allemand, il faut la voix de la langue sur l'appareil :
  - Android : Paramètres › Synthèse vocale › Google › installer « Català » / « Deutsch »
  - iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Català / Deutsch
- En catalan, une faute d'accent est signalée sans compter la réponse fausse (és / es, més / mes…).
- En allemand, sans clavier allemand on peut taper **ae, oe, ue, ss** à la place de **ä, ö, ü, ß** : c'est accepté.

## Ce qu'il y a dedans (pour chaque langue)
- 5 niveaux (A1 Débutant → C1 Autonome) et 12 thèmes à la carte (voyage, travail, restaurant, urgences, banque…)
- Test de niveau pour savoir où commencer, ou bouton « Commencer au niveau… »
- 41 fiches de grammaire et 41 mini-dialogues où chaque erreur classique des francophones est expliquée
- **🎧 Écoute** : 12 mini-histoires audio avec questions de compréhension
- **Sons difficiles**, **Mes expressions** (tes propres mots), **sens des mots** (touche un mot)
- Exercices variés, répétition espacée, XP, séries, objectif du jour, 38 badges

## Bon à savoir
- La progression est enregistrée dans le navigateur de l'appareil. Fais **Réglages › Exporter** de temps en temps.
- Sur PC, le dossier `rappel` permet d'installer une notification Windows quotidienne (`installer-rappel.bat`).

## Organisation des fichiers
- `boot.js` choisit la langue puis charge son contenu ; `app.js` contient toute l'appli.
- `lang/en/`, `lang/ca/` et `lang/de/` contiennent le contenu de chaque langue :
  `config.js` (voix, règles de la langue), `data.js` (leçons), `grammar.js` (fiches), `dialogues.js`,
  `stories.js` (mode écoute), `sounds.js` (sons difficiles), `lexicon.js` (sens des mots).
- Pour ajouter des expressions : ajoute des lignes `["phrase", "traduction", ["autres réponses acceptées"]]`
  à la fin d'une unité de `data.js` (ne réordonne pas les lignes existantes : la progression y est liée).
- Après une modification, incrémente `VERSION` dans `sw.js` pour que les téléphones récupèrent la mise à jour.
