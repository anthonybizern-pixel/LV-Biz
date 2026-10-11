# English Coach

Petite appli perso pour apprendre l'anglais, 100 % locale, sans compte ni abonnement.

## Lancer l'appli
Double-clique sur `index.html` : l'appli s'ouvre dans ton navigateur.
Utilise de préférence **Microsoft Edge** (ses voix anglaises « Natural » sont excellentes) ou **Google Chrome**.

## Sur ton téléphone
L'appli est en ligne sur GitHub Pages (gratuit). Ouvre son adresse sur ton téléphone, puis :
- **Android (Chrome)** : menu **⋮** › **Installer l'application** (ou le bouton « Installer l'appli » dans Réglages)
- **iPhone (Safari)** : bouton **Partager** › **Sur l'écran d'accueil**

Elle s'ouvre alors en plein écran avec son icône et fonctionne **hors connexion**
(sauf l'exercice de prononciation au micro, qui a besoin d'Internet).
Ta progression est propre à chaque appareil : pour la transférer, **Réglages › Exporter** puis **Importer** sur l'autre appareil.
Rappel sur téléphone : **Réglages › Rappel quotidien › Ajouter à mon agenda**.

## Ce qu'il y a dedans
- 5 niveaux (A1 Débutant → C1 Autonome), 29 unités du parcours, du « Hello » à l'inversion et au registre soutenu
- 12 thèmes à la carte, accessibles à tout moment : faux amis, entretien d'embauche, aéroport et hôtel, tech, anglais des séries, restaurant, transports, small talk, urgences, logement, banque, réunions et présentations
- **Mes expressions** : ajoute tes propres mots, ils entrent dans les leçons et les révisions (conservés même si tu réinitialises ta progression)
- **Sons difficiles** : entraînement à l'oreille sur les paires piégeuses (ship/sheep, think/sink, hair/air…)
- **🎧 Écoute** : 12 mini-histoires audio (A1 à C1) avec lecteur (pause, phrase par phrase, ralenti), texte masqué, en anglais ou traduit, et questions de compréhension. L'écran reste allumé pendant la lecture
- Test de niveau (2 à 5 min) pour savoir où commencer, ou bouton « Commencer au niveau… » pour sauter directement à un niveau
- 41 fiches de grammaire (une par unité), affichées avant la première leçon et relisibles à tout moment
- 41 mini-dialogues : un personnage te parle, tu choisis ta réplique ; chaque erreur classique est expliquée
- Onglet **Bibliothèque** qui regroupe fiches et dialogues
- **Touche un mot anglais** (fiches, dialogues, leçons, vocabulaire) pour voir son sens, l'écouter et le revoir dans le cours
- **38 badges** à débloquer (séries, leçons sans faute, niveaux terminés, dialogues, oreille fine…), visibles dans Progrès
- Exercices variés : QCM, traduction écrite, phrases à reconstruire, dictée, paires à associer, prononciation au micro
- Répétition espacée : les expressions reviennent en révision au bon moment (1, 2, 4, 8, 16 jours…)
- XP, série de jours, objectif quotidien, statistiques et liste de ton vocabulaire
- Raccourcis clavier : `Entrée` pour valider/continuer, `1` à `4` pour choisir une réponse

## Bon à savoir
- La progression est enregistrée dans le navigateur. Pense à faire **Réglages › Exporter** de temps en temps
  (et ouvre toujours l'appli avec le même navigateur).
- La prononciation (micro) utilise la reconnaissance vocale de Chrome/Edge, qui a besoin d'Internet.
  Tu peux la désactiver dans les réglages.
- Pas de voix anglaise ? Windows : Paramètres › Heure et langue › Voix › Ajouter des voix (anglais).

## Rappel quotidien (notification Windows)
Dans le dossier `rappel`, double-clique sur **installer-rappel.bat** et tape l'heure voulue (ex. 19:00).
Une notification arrive chaque jour à cette heure, même appli fermée ; un clic dessus ouvre l'appli.
Pour changer l'heure, relance l'installeur. Pour arrêter : **desinstaller-rappel.bat**.

## Ajouter du contenu
Ouvre `data.js` et ajoute des lignes `["anglais", "français", ["autres réponses acceptées"]]`
à la fin d'une unité, ou une nouvelle unité (avec `level: "A1"` à `"C1"`, et `theme: true` pour un thème à la carte) à la fin de la liste.

Les fiches de grammaire sont dans `grammar.js`, les dialogues dans `dialogues.js` et
les paires de sons dans `sounds.js`, les mini-histoires dans `stories.js` et le dictionnaire dans `lexicon.js` ;
le format est expliqué en haut de chaque fichier.
