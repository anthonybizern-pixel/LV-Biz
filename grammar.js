// Fiches de grammaire, une par unité (clé = id de l'unité).
// Format : { title, points: [{ t: "explication", ex: [["anglais", "français"]] }], tip: "astuce" }
// **texte** s'affiche en gras.

const GRAMMAR = {
  /* ---------- A1 ---------- */
  u1: {
    title: "Saluer et être poli",
    points: [
      { t: "**Hello** passe partout, **Hi** est plus familier. Selon le moment : **Good morning** (le matin), **Good afternoon** (l'après-midi), **Good evening** (le soir, en arrivant).",
        ex: [["Good morning!", "Bonjour ! (le matin)"], ["Good evening!", "Bonsoir !"]] },
      { t: "⚠️ **Good night** ne sert pas à saluer : on le dit en partant le soir ou avant d'aller dormir.",
        ex: [["Good night, see you tomorrow!", "Bonne nuit, à demain !"]] },
      { t: "**Excuse me** sert à attirer l'attention ou à passer. **Sorry** sert à s'excuser après coup.",
        ex: [["Excuse me, where is the station?", "Excusez-moi, où est la gare ?"], ["Sorry, I'm late.", "Désolé, je suis en retard."]] },
    ],
    tip: "« How are you? » n'attend pas une vraie réponse détaillée : **I'm fine, thanks. And you?** suffit.",
  },
  u2: {
    title: "Le verbe to be (être)",
    points: [
      { t: "**I am** · **you are** · **he / she / it is** · **we are** · **they are**. À l'oral, on contracte : **I'm, you're, he's, she's, it's, we're, they're**.",
        ex: [["I'm French.", "Je suis français."], ["She's my friend.", "C'est mon amie."]] },
      { t: "⚠️ L'âge se dit avec **be**, jamais avec have.",
        ex: [["I'm thirty (years old).", "J'ai trente ans."]] },
      { t: "Pour poser une question, on inverse le sujet et le verbe.",
        ex: [["Are you French?", "Es-tu français ?"], ["Where are you from?", "D'où viens-tu ?"]] },
    ],
    tip: "Les nationalités et les langues prennent toujours une majuscule : **French, English, Spanish**.",
  },
  u3: {
    title: "Dire l'heure et les moments",
    points: [
      { t: "**at** + heure · **on** + jour · **in** + mois, année ou partie de la journée.",
        ex: [["at seven o'clock", "à sept heures"], ["on Monday", "lundi"], ["in July", "en juillet"], ["in the morning", "le matin"]] },
      { t: "L'heure : **It's ten o'clock** (pile), **half past ten** (10 h 30), **a quarter to eleven** (10 h 45).",
        ex: [["It's half past ten.", "Il est dix heures et demie."]] },
      { t: "Pas d'article ni de préposition avec **next, last, this, every, tomorrow, yesterday**.",
        ex: [["See you next week!", "À la semaine prochaine !"], ["I work every day.", "Je travaille tous les jours."]] },
    ],
    tip: "Exceptions à retenir : **at night** (la nuit) et **at the weekend** (UK) / **on the weekend** (US).",
  },
  u4: {
    title: "A, an, some et commander poliment",
    points: [
      { t: "**a** devant un son consonne, **an** devant un son voyelle (c'est le son qui compte, pas la lettre).",
        ex: [["a coffee", "un café"], ["an apple", "une pomme"], ["an hour", "une heure"]] },
      { t: "Certains mots sont **indénombrables** : water, bread, cheese, money, advice… Pas de a, pas de pluriel. On utilise **some** (ou a glass of, a piece of…).",
        ex: [["Can I have some water?", "Je peux avoir de l'eau ?"], ["a piece of bread", "un morceau de pain"]] },
      { t: "Pour commander, **I'd like…** ou **Can I have…?** sont polis. « I want » sonne brusque.",
        ex: [["I'd like a coffee, please.", "Je voudrais un café, s'il vous plaît."]] },
    ],
    tip: "**some** dans les phrases affirmatives, **any** dans les questions et négations : *Do you have any bread? — No, I don't have any.*",
  },
  u5: {
    title: "Les possessifs et le verbe have",
    points: [
      { t: "**my, your, his** (à lui), **her** (à elle), **its, our, their**. ⚠️ Le possessif s'accorde avec le **possesseur**, pas avec l'objet.",
        ex: [["his mother", "sa mère (la mère de lui)"], ["her father", "son père (le père d'elle)"]] },
      { t: "**'s** indique l'appartenance : le possesseur d'abord.",
        ex: [["Paul's sister", "la sœur de Paul"], ["my parents' house", "la maison de mes parents"]] },
      { t: "**have**, mais **he / she / it has**. En anglais britannique, on entend aussi **have got**.",
        ex: [["She has two children.", "Elle a deux enfants."], ["I've got a brother.", "J'ai un frère."]] },
    ],
    tip: "Pluriels irréguliers fréquents : **child → children, man → men, woman → women, person → people**.",
  },
  u12: {
    title: "Les adjectifs et le présent continu",
    points: [
      { t: "L'adjectif se place **avant** le nom et ne s'accorde jamais.",
        ex: [["a red dress", "une robe rouge"], ["red shoes", "des chaussures rouges"]] },
      { t: "**be + verbe-ing** décrit ce qui se passe maintenant, comme ce que quelqu'un porte.",
        ex: [["She is wearing a hat.", "Elle porte un chapeau."]] },
      { t: "Certains vêtements sont toujours **au pluriel** : jeans, trousers, shorts, glasses.",
        ex: [["These jeans are too big.", "Ce jean est trop grand."]] },
    ],
    tip: "**wear** = porter un vêtement ; **carry** = porter dans ses bras ou à la main.",
  },
  u13: {
    title: "There is / there are et l'impératif",
    points: [
      { t: "« Il y a » = **There is** + singulier, **There are** + pluriel.",
        ex: [["There is a garden.", "Il y a un jardin."], ["There are two bedrooms.", "Il y a deux chambres."]] },
      { t: "Question : on inverse → **Is there…? / Are there…?**",
        ex: [["Is there a lift?", "Y a-t-il un ascenseur ?"]] },
      { t: "L'impératif = le verbe seul. Négatif : **Don't** + verbe. On adoucit avec **please**.",
        ex: [["Close the door, please.", "Ferme la porte, s'il te plaît."], ["Don't open the window.", "N'ouvre pas la fenêtre."]] },
    ],
    tip: "Lieux : **in** the kitchen (dans), **on** the table (sur), **under** the bed (sous), **next to** the door (à côté de).",
  },

  /* ---------- A2 ---------- */
  u6: {
    title: "Demander son chemin",
    points: [
      { t: "Pour demander de l'aide : **Can you…?** ou, plus poli, **Could you…?** + verbe.",
        ex: [["Could you help me, please?", "Pourriez-vous m'aider, s'il vous plaît ?"]] },
      { t: "Pour demander où se trouve quelque chose : **Where is…?** ou **How do I get to…?**",
        ex: [["How do I get to the airport?", "Comment aller à l'aéroport ?"]] },
      { t: "Indications : **turn left / right**, **go straight ahead**, **it's on your left**, **next to**, **opposite** (en face de).",
        ex: [["Turn right, then go straight ahead.", "Tournez à droite, puis allez tout droit."]] },
    ],
    tip: "**How much is it?** pour un objet, **How much are they?** pour plusieurs.",
  },
  u7: {
    title: "Le présent simple",
    points: [
      { t: "Pour les habitudes et les vérités générales. ⚠️ **-s** à la 3e personne du singulier.",
        ex: [["I work in Paris.", "Je travaille à Paris."], ["She works from home.", "Elle travaille à la maison."]] },
      { t: "Négation : **don't / doesn't** + verbe à la base (sans s). Question : **Do / Does** + sujet + verbe.",
        ex: [["He doesn't like coffee.", "Il n'aime pas le café."], ["Does she cook?", "Est-ce qu'elle cuisine ?"]] },
      { t: "Les adverbes de fréquence se placent **avant** le verbe : always, usually, often, sometimes, never.",
        ex: [["I often cook in the evening.", "Je cuisine souvent le soir."]] },
    ],
    tip: "Après **like, love, hate, enjoy**, on met le verbe en **-ing** : *I like reading.*",
  },
  u8: {
    title: "Présent continu et will",
    points: [
      { t: "**be + -ing** pour une action en cours, maintenant ou en ce moment.",
        ex: [["I'm working on a project.", "Je travaille sur un projet."]] },
      { t: "**will** ('ll) pour une décision prise sur le moment ou une promesse.",
        ex: [["I'll call you back.", "Je te rappelle."], ["I'll send it today.", "Je l'enverrai aujourd'hui."]] },
      { t: "**by** = au plus tard ; **until** = jusqu'à (de façon continue).",
        ex: [["Send it by Friday.", "Envoie-le d'ici vendredi."], ["I'm here until six.", "Je suis là jusqu'à six heures."]] },
    ],
    tip: "On dit **at work** (au travail), **at the office** (au bureau) et **work on** a project.",
  },
  u9: {
    title: "Le prétérit (past simple)",
    points: [
      { t: "Pour une action terminée dans le passé. Verbes réguliers : **+ed**.",
        ex: [["We visited London.", "Nous avons visité Londres."]] },
      { t: "Les verbes irréguliers les plus courants : go → **went**, have → **had**, see → **saw**, buy → **bought**, lose → **lost**, be → **was / were**.",
        ex: [["I went to the cinema.", "Je suis allé au cinéma."]] },
      { t: "Négation : **didn't** + verbe à la base. Question : **Did** + sujet + verbe.",
        ex: [["I didn't sleep well.", "Je n'ai pas bien dormi."], ["Did you see the film?", "As-tu vu le film ?"]] },
    ],
    tip: "**ago** = il y a (dans le temps) : *two days ago* = il y a deux jours.",
  },
  u10: {
    title: "Parler du futur",
    points: [
      { t: "**going to** + verbe : projet déjà décidé ou prédiction évidente.",
        ex: [["I'm going to travel.", "Je vais voyager."], ["Look at the clouds, it's going to rain.", "Regarde les nuages, il va pleuvoir."]] },
      { t: "**will** + verbe : décision sur le moment, promesse, prédiction générale.",
        ex: [["I'll help you.", "Je vais t'aider."]] },
      { t: "Présent continu : rendez-vous ou plan déjà organisé.",
        ex: [["What are you doing this weekend?", "Que fais-tu ce week-end ?"]] },
    ],
    tip: "Jamais de **to** après will : *It will rain* (pas « will to rain »).",
  },
  u11: {
    title: "Réponses courtes et moi aussi / moi non plus",
    points: [
      { t: "On répond avec l'auxiliaire de la question, sans répéter le verbe.",
        ex: [["Do you like it? — Yes, I do.", "Tu aimes ? — Oui."], ["Are you ready? — No, I'm not.", "Tu es prêt ? — Non."]] },
      { t: "**So do I** = moi aussi · **Neither do I** = moi non plus (avec l'auxiliaire adapté).",
        ex: [["I love jazz. — So do I.", "J'adore le jazz. — Moi aussi."], ["I can't swim. — Neither can I.", "Je ne sais pas nager. — Moi non plus."]] },
      { t: "Les questions avec un verbe autre que be ont besoin de **do / does / did**.",
        ex: [["What does it mean?", "Qu'est-ce que ça veut dire ?"]] },
    ],
    tip: "À l'oral, **Me too** et **Me neither** sont aussi très courants.",
  },
  u14: {
    title: "Comparer et faire ses achats",
    points: [
      { t: "Adjectif court : **+er** (smaller, cheaper). Adjectif long : **more** + adjectif (more expensive). Irréguliers : good → **better**, bad → **worse**.",
        ex: [["Do you have a smaller size?", "Avez-vous une taille plus petite ?"], ["It's more expensive.", "C'est plus cher."]] },
      { t: "**too** + adjectif = trop · **not** + adjectif + **enough** = pas assez.",
        ex: [["It's too expensive.", "C'est trop cher."], ["It's not big enough.", "Ce n'est pas assez grand."]] },
      { t: "**it** pour un objet, **them** pour plusieurs.",
        ex: [["I'll take them.", "Je les prends."]] },
    ],
    tip: "**I'm just looking** = je regarde seulement. **look** pour des articles, **watch** pour un film ou un match.",
  },
  u15: {
    title: "Avoir mal et donner des conseils",
    points: [
      { t: "**I have a…** + headache, stomachache, toothache, sore throat. Ou **My … hurts**.",
        ex: [["I have a headache.", "J'ai mal à la tête."], ["My back hurts.", "J'ai mal au dos."]] },
      { t: "⚠️ Avoir froid, faim, soif ou peur se dit avec **be**.",
        ex: [["I'm cold.", "J'ai froid."], ["I'm scared.", "J'ai peur."]] },
      { t: "**should** + verbe pour conseiller.",
        ex: [["You should rest.", "Tu devrais te reposer."]] },
    ],
    tip: "On utilise le possessif pour le corps : *I broke **my** arm* (pas « the arm »).",
  },
  u16: {
    title: "La météo et les loisirs",
    points: [
      { t: "La météo se dit avec **it** : **It's sunny / raining / cold**. Question : **What's the weather like?**",
        ex: [["It's raining.", "Il pleut."]] },
      { t: "**play** + sport ou instrument · **go + -ing** pour les activités · **do** pour certaines (yoga, sport).",
        ex: [["I play the guitar.", "Je joue de la guitare."], ["Let's go hiking!", "Allons faire de la randonnée !"]] },
      { t: "**Let's** + verbe pour proposer.",
        ex: [["Let's stay at home.", "Restons à la maison."]] },
    ],
    tip: "« Il fait beau » ne se traduit pas avec make : **It's nice** ou **It's sunny**.",
  },

  /* ---------- B1 ---------- */
  u17: {
    title: "Exprimer son opinion",
    points: [
      { t: "⚠️ **agree** est un verbe : **I agree**, **I don't agree**, **I disagree** (jamais « I am agree »).",
        ex: [["I agree with you.", "Je suis d'accord avec toi."]] },
      { t: "**I don't think** + phrase affirmative est plus naturel que « I think … not ».",
        ex: [["I don't think it's true.", "Je ne pense pas que ce soit vrai."]] },
      { t: "Pour structurer : **On the one hand… On the other hand…**, **However**, **In my opinion**.",
        ex: [["In my opinion, it's a good idea.", "À mon avis, c'est une bonne idée."]] },
    ],
    tip: "Pour nuancer : **It depends**, **I'm not sure**, **I see your point, but…**",
  },
  u18: {
    title: "Le present perfect",
    points: [
      { t: "**have / has + participe passé** pour une expérience sans date précise ou un résultat présent.",
        ex: [["Have you ever been to London?", "Es-tu déjà allé à Londres ?"], ["I've lost my keys.", "J'ai perdu mes clés (je ne les ai plus)."]] },
      { t: "« Depuis » : **for** + durée, **since** + point de départ. Le français utilise le présent, l'anglais le present perfect.",
        ex: [["I've lived here for five years.", "J'habite ici depuis cinq ans."], ["since 2020", "depuis 2020"]] },
      { t: "⚠️ Avec une date ou un moment passé précis, on utilise le **prétérit**.",
        ex: [["I went to London in 2019.", "Je suis allé à Londres en 2019."]] },
    ],
    tip: "**just** (venir de), **already** (déjà), **yet** (pas encore, ou déjà en question) vont avec le present perfect.",
  },
  u19: {
    title: "Les conditionnels",
    points: [
      { t: "Situation réelle : **If + présent, will + verbe**.",
        ex: [["If it rains, we'll stay inside.", "S'il pleut, nous resterons à l'intérieur."]] },
      { t: "Situation imaginaire : **If + prétérit, would + verbe**. Avec be : **If I were…**",
        ex: [["If I had more time, I would travel.", "Si j'avais plus de temps, je voyagerais."], ["If I were you…", "Si j'étais toi…"]] },
      { t: "⚠️ Jamais de **will** ni de **would** juste après **if**.",
        ex: [["If I had money…", "Si j'avais de l'argent… (et non « If I would have »)"]] },
    ],
    tip: "Regret : **should have + participe** = aurais dû. *I should have told you.*",
  },
  u20: {
    title: "Téléphone et e-mails professionnels",
    points: [
      { t: "Au téléphone, on se présente avec **This is…** (pas « I am… » ni « here is… »).",
        ex: [["Hello, this is Alex Martin.", "Bonjour, c'est Alex Martin."], ["Could I speak to Mr Jones?", "Pourrais-je parler à M. Jones ?"]] },
      { t: "Formules d'e-mail : **Dear…**, **I'm writing to…**, **Please find attached…**, **Best regards**.",
        ex: [["I'm writing to confirm the meeting.", "Je vous écris pour confirmer la réunion."]] },
      { t: "⚠️ **look forward to** + nom ou **-ing**.",
        ex: [["I look forward to hearing from you.", "Dans l'attente de votre réponse."]] },
    ],
    tip: "Pour être très poli : **Would you mind + -ing?** *Would you mind calling back later?*",
  },
  u21: {
    title: "Raconter au passé",
    points: [
      { t: "**was / were + -ing** : action en cours, souvent interrompue par une autre au prétérit.",
        ex: [["I was sleeping when you called.", "Je dormais quand tu as appelé."]] },
      { t: "**had + participe passé** (plus-que-parfait) : action antérieure à une autre action passée.",
        ex: [["The train had already left when I arrived.", "Le train était déjà parti quand je suis arrivé."]] },
      { t: "**used to** + verbe : habitude ou situation passée qui n'existe plus.",
        ex: [["We used to live by the sea.", "Avant, nous habitions au bord de la mer."]] },
    ],
    tip: "Connecteurs : **First, Then, After that, Suddenly, In the end**. ⚠️ « Finalement » = **in the end** (« at the end » = à la fin de quelque chose).",
  },

  /* ---------- B2 ---------- */
  u22: {
    title: "Les phrasal verbs",
    points: [
      { t: "Verbe + particule = un nouveau sens, souvent impossible à deviner.",
        ex: [["give up", "abandonner"], ["find out", "découvrir"], ["call off", "annuler"]] },
      { t: "Verbes **séparables** : avec un pronom, il se place **obligatoirement au milieu**.",
        ex: [["Pick me up at ten.", "Viens me chercher à dix heures."], ["We'll figure it out.", "On trouvera une solution."]] },
      { t: "Verbes à trois mots : le complément vient à la fin.",
        ex: [["I've run out of money.", "Je suis à court d'argent."], ["I get along with my boss.", "Je m'entends bien avec mon patron."]] },
    ],
    tip: "Les phrasal verbs sont très courants à l'oral ; leurs équivalents latins (cancel, postpone, discover) sont plus formels.",
  },
  u23: {
    title: "Les expressions idiomatiques",
    points: [
      { t: "Une expression idiomatique ne se traduit **jamais mot à mot** : on apprend le sens global.",
        ex: [["It's a piece of cake.", "C'est du gâteau (très facile)."], ["I'm under the weather.", "Je suis un peu patraque."]] },
      { t: "Beaucoup ont un équivalent français avec une image différente.",
        ex: [["It costs an arm and a leg.", "Ça coûte les yeux de la tête."], ["Speak of the devil!", "Quand on parle du loup !"]] },
      { t: "Elles sont familières : parfaites à l'oral, à éviter dans un e-mail formel.",
        ex: [["Let's call it a day.", "Arrêtons-nous là pour aujourd'hui."]] },
    ],
    tip: "« It's raining cats and dogs » est un peu vieilli ; les natifs disent souvent **It's pouring**.",
  },
  u24: {
    title: "Connecteurs et nuances",
    points: [
      { t: "Concession : **although, even though, nevertheless, having said that**.",
        ex: [["Although it's expensive, it's worth it.", "Bien que ce soit cher, ça vaut le coup."]] },
      { t: "Ajout : **moreover, furthermore, in addition**. Conséquence : **therefore, as a result**.",
        ex: [["As a result, sales increased.", "En conséquence, les ventes ont augmenté."]] },
      { t: "**It's worth** + **-ing** = ça vaut la peine de…",
        ex: [["It's worth trying.", "Ça vaut la peine d'essayer."]] },
    ],
    tip: "Faux amis : **inconvenient** est un adjectif (peu pratique). « Un inconvénient » = **a drawback / a disadvantage**.",
  },
  u25: {
    title: "La diplomatie en anglais professionnel",
    points: [
      { t: "On adoucit les refus : **I'm afraid…**, **That might be difficult**, **I'm not sure we can…**",
        ex: [["I'm afraid that won't be possible.", "J'ai bien peur que ce ne soit pas possible."]] },
      { t: "Proposer : **How about + -ing?**, **What if we…?**, **Would it be possible to…?**",
        ex: [["How about meeting halfway?", "Et si on coupait la poire en deux ?"]] },
      { t: "Questions indirectes, plus polies : l'ordre sujet + verbe revient.",
        ex: [["Could you tell me when it will arrive?", "Pourriez-vous me dire quand il arrivera ?"]] },
    ],
    tip: "Expressions de suivi : **touch base** (faire le point), **keep someone posted** (tenir au courant), **follow up** (relancer).",
  },

  /* ---------- C1 ---------- */
  u26: {
    title: "Les collocations",
    points: [
      { t: "**make** = produire, créer un résultat · **do** = effectuer une tâche, une activité.",
        ex: [["make a decision, make a mistake, make progress", "prendre une décision, faire une erreur, progresser"], ["do research, do your homework, do business", "faire des recherches, faire ses devoirs, faire des affaires"]] },
      { t: "Beaucoup de verbes + noms forment des blocs figés qu'on ne peut pas traduire mot à mot.",
        ex: [["pay attention", "faire attention"], ["meet a deadline", "respecter une échéance"], ["take into account", "prendre en compte"]] },
      { t: "Même chose pour les adjectifs : on dit **heavy** rain, **strong** coffee, **high** prices.",
        ex: [["a heavy smoker", "un gros fumeur"], ["heavy traffic", "une circulation dense"]] },
    ],
    tip: "Apprends les mots par **blocs** plutôt qu'isolés : c'est ce qui rend un anglais naturel.",
  },
  u27: {
    title: "Emphase et inversion",
    points: [
      { t: "Un adverbe négatif ou restrictif en tête de phrase entraîne une **inversion**, comme dans une question : Never, Not only, Hardly, Under no circumstances, Little, Only then…",
        ex: [["Never have I seen such a mess.", "Je n'ai jamais vu un tel désordre."], ["Not only is it cheap, but it's also fast.", "Non seulement c'est bon marché, mais c'est aussi rapide."]] },
      { t: "Phrases clivées pour mettre en relief : **It was… who / that…**, **What I need is…**, **All I want is…**",
        ex: [["It was Sarah who called.", "C'est Sarah qui a appelé."], ["What I need is a break.", "Ce dont j'ai besoin, c'est d'une pause."]] },
      { t: "Le **do d'insistance** dans une phrase affirmative renforce le verbe.",
        ex: [["I do appreciate your help.", "J'apprécie vraiment ton aide."]] },
    ],
    tip: "L'inversion est surtout écrite ou soutenue. À l'oral courant, elle sonne très dramatique… ce qui peut être voulu !",
  },
  u28: {
    title: "Regrets, hypothèses et déductions",
    points: [
      { t: "Hypothèse sur le passé : **If + past perfect, would have + participe**. En style soutenu : **Had I known…**",
        ex: [["If I had known, I would have come.", "Si j'avais su, je serais venu."], ["Had I known, I would have helped.", "Si j'avais su, j'aurais aidé."]] },
      { t: "Conditionnel **mixte** : une condition passée, une conséquence présente.",
        ex: [["If I had taken that job, I would be rich now.", "Si j'avais pris ce poste, je serais riche aujourd'hui."]] },
      { t: "Regret : **I wish / If only + past perfect**. Déduction sur le passé : **must have** (sûrement), **can't have** (impossible).",
        ex: [["I wish I hadn't said that.", "Je regrette d'avoir dit ça."], ["She must have forgotten.", "Elle a dû oublier."]] },
    ],
    tip: "Après **I'd rather (que quelqu'un)** et **It's high time**, on met le prétérit : *It's high time we left.*",
  },
  u29: {
    title: "Le registre soutenu",
    points: [
      { t: "Les verbes courts du quotidien ont des équivalents formels : get → **receive / obtain**, need → **require**, help → **assist**, ask → **enquire**.",
        ex: [["We have received your request.", "Nous avons bien reçu votre demande."]] },
      { t: "Formules figées des courriers soutenus.",
        ex: [["Further to our conversation…", "Suite à notre conversation…"], ["I would appreciate it if you could…", "Je vous serais reconnaissant de bien vouloir…"], ["at your earliest convenience", "dans les meilleurs délais"]] },
      { t: "À l'écrit formel, on évite les contractions et les phrasal verbs familiers.",
        ex: [["Please do not hesitate to contact me.", "N'hésitez pas à me contacter."]] },
    ],
    tip: "**I would appreciate it if…** : n'oublie pas le **it**, c'est l'erreur la plus fréquente.",
  },

  /* ---------- Thèmes ---------- */
  u30: {
    title: "Les faux amis",
    points: [
      { t: "Ces mots ressemblent au français mais ont un **autre sens**.",
        ex: [["actually", "en fait (actuellement = currently)"], ["eventually", "finalement (éventuellement = possibly)"], ["library", "bibliothèque (librairie = bookshop)"]] },
      { t: "Des verbes trompeurs :",
        ex: [["attend", "assister à (attendre = wait)"], ["pretend", "faire semblant (prétendre = claim)"], ["assist", "aider (assister à = attend)"]] },
      { t: "Et des adjectifs :",
        ex: [["sensible", "raisonnable (sensible = sensitive)"], ["excited", "impatient, enthousiaste (rien de déplacé !)"]] },
    ],
    tip: "Autres pièges : **journey** = trajet (journée = day), **support** = soutenir (supporter = stand), **demand** = exiger (demander = ask).",
  },
  u31: {
    title: "Réussir un entretien en anglais",
    points: [
      { t: "Pour ton parcours : **present perfect + for** pour ce qui dure encore, **prétérit** pour ce qui est terminé.",
        ex: [["I've worked here for five years.", "Je travaille ici depuis cinq ans."], ["I led a team of ten in 2022.", "J'ai dirigé une équipe de dix personnes en 2022."]] },
      { t: "Un point fort se prouve toujours avec un **exemple concret**.",
        ex: [["My main strength is organisation. For example, I delivered my last project two weeks early.", "Mon point fort est l'organisation. Par exemple, j'ai livré mon dernier projet avec deux semaines d'avance."]] },
      { t: "Prépare des questions à poser à la fin : ça montre ton intérêt.",
        ex: [["What are the next steps?", "Quelles sont les prochaines étapes ?"], ["What does a typical day look like?", "À quoi ressemble une journée type ?"]] },
    ],
    tip: "Prépare un « Tell me about yourself » d'une minute : **présent** (ton poste), **passé** (ton parcours), **futur** (ce que tu cherches).",
  },
  u32: {
    title: "Voyager : aéroport et hôtel",
    points: [
      { t: "Le vocabulaire clé : **check-in** (enregistrement), **boarding pass**, **gate** (porte d'embarquement), **delayed** (retardé), **cancelled** (annulé).",
        ex: [["My flight is delayed.", "Mon vol est retardé."], ["Gate twelve is on your left.", "La porte 12 est sur votre gauche."]] },
      { t: "Pour demander poliment : **Could I have…?**, **I'd like to…**, **Is … included?**",
        ex: [["Could I have a window seat?", "Pourrais-je avoir un siège côté hublot ?"], ["Is breakfast included?", "Le petit-déjeuner est-il compris ?"]] },
      { t: "Pour signaler un problème : **The … doesn't work**, **There's a problem with…**",
        ex: [["The shower doesn't work.", "La douche ne marche pas."]] },
    ],
    tip: "**check in** (verbe, en deux mots) : s'enregistrer · **the check-in** (nom, avec un tiret) : le comptoir.",
  },
  u33: {
    title: "L'anglais de la tech",
    points: [
      { t: "Verbes essentiels : **download / upload**, **log in / log out**, **sign up** (créer un compte), **update**, **crash** (planter), **freeze** (se figer).",
        ex: [["I can't log in.", "Je n'arrive pas à me connecter."]] },
      { t: "**keep + -ing** pour un problème qui se répète.",
        ex: [["My computer keeps crashing.", "Mon ordinateur plante sans arrêt."]] },
      { t: "En visio : **mute / unmute**, **share your screen**, **You're breaking up** (ça coupe).",
        ex: [["You're on mute.", "Tu es en sourdine."], ["Can you see my screen?", "Tu vois mon écran ?"]] },
    ],
    tip: "**down** = hors service : *The server is down.* Et **hear** (entendre) ≠ **listen** (écouter).",
  },
  u34: {
    title: "L'anglais parlé des séries",
    points: [
      { t: "À l'oral rapide, certains mots fusionnent : **gonna** (going to), **wanna** (want to), **gotta** (got to), **kinda** (kind of), **dunno** (don't know).",
        ex: [["I'm gonna be late.", "Je vais être en retard."], ["I wanna go home.", "J'ai envie de rentrer."]] },
      { t: "Les réactions express : **No way!**, **Come on!**, **My bad!**, **Who cares?**",
        ex: [["No way!", "Pas possible !"], ["My bad!", "Au temps pour moi !"]] },
      { t: "Expressions très courantes : **I don't get it** (je ne comprends pas), **hang out** (traîner ensemble), **I'm kidding** (je plaisante).",
        ex: [["We're hanging out tonight.", "On traîne ensemble ce soir."]] },
    ],
    tip: "Comprends-les, utilise-les entre amis… mais jamais **gonna** ou **wanna** dans un e-mail professionnel !",
  },
};
