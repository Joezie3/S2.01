# S2.01

## Composition de l'équipe
- Benoit DEDECKER
- Thomas DUBOST
- Ibrahim DAR YAZID
- Martin NADARADJANE
## Fonctionnalités implémentées
- Mode de jeu supplémentaire : Graphe Memory. Au lieu de retourner des cartes, le joueur dispose d'un Graphe non orienté et non valué. Au commencement de la parie, seul les sommets sont visible, et c'est au joueur de découvrir les arêtes. Une fois qu'il a découvert toutes les arêtes d'un sommet, ce dernier est indiqué comme découvert, par sa couleur violette.
- Une fenêtre modale apparaît à la fin de la partie, rappelant les paramètres de la partie (difficulté, mode de jeu, etc...), ainsi que les performance du joueur (score, nombre de tentatives, temps). La fenêtre propose de soit relancer la partie avec les mêmes paramètres, soit de retourner au menu (sans recharger la page) pour changer les paramètres, ou alors de fermer la fenêtre (possibilité de la rouvrir)
- Différentes animations visuelles. Dans le Memory classique, lorsqu'une paire est correcte, un contour clignotte brievement en vert autour des deux cartes, et en rouge si la combinaison est incorrecte. Pour le Memory Graphe, le premier sommet selectionné clignotte en vert pour rappeler au joueur le sommet qu'il tente de découvrir.
- Un tableau des statistiques globales du joueur (nombre de clique, temps moyens d'une partie, nombre de parties etc...)
- Un mode "difficile", où le nombre de coups est limité. Ce nombre est fixé à la difficulté (entre 4 et 8, de 2 en 2) - 1, donc 3 tentatives pour la difficulté 4, 5 pour la 6 etc... Une fois le nombre de tentatives épuisées, le joueur perd la partie (seule moyen de perdre à part l'abandon) (le joueur perd une tentative uniquement si cette dernière est infructueuse, c'est donc un nombre d'erreurs autorisées)