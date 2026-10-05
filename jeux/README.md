# La station des jeux

Des jeux à deux dans l’univers de WALL-E. Chacun sur son téléphone :
l'un crée une partie, l'autre la rejoint avec le code (ou le lien envoyé). On peut aussi jouer
à deux sur un seul téléphone.

## Les 24 jeux, et le grand mélange

- **Le grand mélange** : un seul bouton, et les jeux s'enchaînent au hasard (un « Tu préfères »,
  un morpion, un mot mystère…) ; « Jeu suivant 🎲 » à la fin de chaque manche.
- **Se découvrir** : Tu préfères…, Qui de nous deux ?, Je n'ai jamais…, Tu me connais ?,
  Même longueur d'onde, À cœur ouvert (trois niveaux), Deux vérités un mensonge, Mots jumeaux,
  Dans le même ordre.
- **Jouer ensemble** : Dessine-moi (le dessin apparaît en direct chez l'autre), Le grand mime,
  5 secondes chrono, L'histoire à quatre mains, Le mot mystère (la batterie de WALL-E), Le quiz,
  La roue des câlins, Idée de sortie.
- **Petits défis** : Memory, Morpion, Quatre à la suite, Les petits carrés, Cube-Botte-Plante,
  Duel de réflexes, Plus ou moins.

Les questions ne parlent pas de WALL-E : seul le décor est à son image.

## Ajouter ou changer une question

Tout le texte est dans `contenu.js`, une liste par jeu. Une ligne = une question.
Garder l'apostrophe typographique `’` dans les phrases (l'apostrophe droite `'` casse la liste).

## Comment les deux téléphones se parlent

Le site est une simple page (GitHub Pages) : pas de serveur à nous. Les messages passent par
deux relais publics et gratuits (broker.emqx.io et broker.hivemq.com) : on écrit sur les deux,
on lit le premier qui arrive. Tout est chiffré (AES-GCM) avec une clé tirée du code de la
partie : les relais ne voient passer que du charabia. Le téléphone qui a créé la partie fait
foi et garde l'état ; si une page se recharge, la partie reprend là où elle en était.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | la page, le ciel étoilé, la planète, les tours de cubes |
| `style.css` | l’espace et la Terre poussiéreuse, les cartes blanches d’EVE, les boutons |
| `contenu.js` | toutes les questions, gages, mots… |
| `regles.js` | les règles de chaque jeu et du grand mélange (sans affichage) |
| `reseau.js` | la connexion chiffrée entre les deux téléphones |
| `app.js` | les écrans et l'affichage des jeux |
| `img/` | les personnages (`av-*.webp`), les illustrations, la petite pousse (`pousse.svg`), l'aperçu du lien (`apercu.jpg`) |

Les personnages de WALL-E appartiennent à Disney / Pixar. Images utilisées ici pour un cadeau
personnel, sans usage commercial. La page demande aux moteurs de recherche de ne pas l'indexer.
