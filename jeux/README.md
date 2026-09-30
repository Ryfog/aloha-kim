# L'île aux jeux

Des jeux à deux avec Stitch. Chacun sur son téléphone : l'un crée une partie, l'autre la
rejoint avec le code (ou le lien envoyé). On peut aussi jouer à deux sur un seul téléphone.

## Les 17 jeux

- **Se découvrir** : Tu préfères…, Qui de nous deux ?, Je n'ai jamais…, Tu me connais ?,
  Même longueur d'onde, À cœur ouvert (trois niveaux), Action ou vérité.
- **Jouer ensemble** : Stitch dessine (le dessin apparaît en direct chez l'autre), Le mime,
  5 secondes chrono, Quiz Stitch, La roue des câlins, Idée de sortie.
- **Petits défis** : Memory, Morpion, Coco-Palme-Pince, Duel de réflexes.

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
| `index.html` | la page |
| `style.css` | l'île, les cartes, les boutons |
| `contenu.js` | toutes les questions, gages, mots… |
| `regles.js` | les règles de chaque jeu (sans affichage) |
| `reseau.js` | la connexion chiffrée entre les deux téléphones |
| `app.js` | les écrans et l'affichage des jeux |
| `img/` | les personnages en WebP transparent, et l'aperçu du lien (`apercu.jpg`) |

Les personnages de Lilo & Stitch appartiennent à Disney. Images utilisées ici pour un cadeau
personnel, sans usage commercial. La page demande aux moteurs de recherche de ne pas l'indexer.
