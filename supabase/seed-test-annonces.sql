-- Annonces de démonstration destinées au compte test.
-- Le propriétaire correspond au profil ae72dfea-dedf-44f8-b15b-60240e6a23fa.

insert into public.annonces (
  owner_id,
  titre,
  categorie,
  lieu,
  date_event,
  statut,
  extrait,
  recit,
  gravite,
  featured,
  urgent,
  nouveau
)
select *
from (
  values
    (
      'ae72dfea-dedf-44f8-b15b-60240e6a23fa'::uuid,
      'La fenêtre qui s’allume avant minuit',
      'Lieux maudits',
      'Nancy',
      '2024',
      'Témoignage',
      'Une fenêtre vide s’allume toujours trois minutes avant minuit.',
      'Les voisins affirment que la pièce derrière cette fenêtre n’a aucun meuble et aucune source électrique. Pourtant, chaque nuit, une silhouette traverse brièvement le rideau.',
      2,
      false,
      false,
      true
    ),
    (
      'ae72dfea-dedf-44f8-b15b-60240e6a23fa'::uuid,
      'Le train sans destination',
      'Phénomènes nocturnes',
      'Limoges',
      '2018',
      'Non élucidé',
      'À deux heures du matin, une rame arrive sans panneau ni voyageurs.',
      'Plusieurs gardiens ont vu les portes s’ouvrir sur un quai désert. À l’intérieur, les sièges portaient encore la chaleur de personnes absentes.',
      3,
      false,
      true,
      true
    ),
    (
      'ae72dfea-dedf-44f8-b15b-60240e6a23fa'::uuid,
      'Les mots sous la glace',
      'Objets troublants',
      'Chamonix',
      '2021',
      'Documenté',
      'Une phrase apparaît sous la glace au lever du jour.',
      'Chaque matin d’hiver, le lac révèle une nouvelle ligne écrite à l’envers. Les trois premières nuits étaient illisibles, puis une quatrième avait été gravée avec précision.',
      2,
      true,
      false,
      true
    ),
    (
      'ae72dfea-dedf-44f8-b15b-60240e6a23fa'::uuid,
      'La promesse du vieux phare',
      'Disparitions',
      'Saint-Malo',
      '1996',
      'Témoignage',
      'Le gardien promet de revenir à chaque nouvelle lune.',
      'Pendant trois mois, il a régulièrement quitté le phare sans emporter ses clés. Depuis sa disparition, son nom est retrouvé dans le registre sous une date qui n’est pas encore passée.',
      3,
      false,
      false,
      true
    ),
    (
      'ae72dfea-dedf-44f8-b15b-60240e6a23fa'::uuid,
      'Celui qui répond avant la question',
      'Présages & signes',
      'Avignon',
      '2023',
      'Témoignage',
      'Une voix enregistrée répète les questions quelques secondes trop tôt.',
      'L’enregistrement d’une conversation ordinaire contient une voix inconnue. Elle prononce exactement les questions suivantes juste avant qu’elles ne soient posées.',
      1,
      false,
      false,
      true
    )
) as annonces(
  owner_id,
  titre,
  categorie,
  lieu,
  date_event,
  statut,
  extrait,
  recit,
  gravite,
  featured,
  urgent,
  nouveau
);
