/**
 * @typedef {Object} Image
 * @property {number} id
 * @property {string} name
 * @property {string} url
 */

/**
 * @typedef {Image[]} Collection
 */

/**
 * @typedef {Object} ImagesCollection
 * @property {Collection} animals
 * @property {Collection} fruits
 * @property {Collection} cars
 */

/**
 * Une carte du memory, identifié grâce à son index dans le DOM (id de la div) et son identifiant (id) (qui dépend de l'image sur la carte)
 * @typedef {Object} card
 * @property {number} index L'index du {@link HTMLDivElement div} qui représente la carte
 * @property {number} id L'identifiant de la carte. Dépend de l'image sur la carte (pour trouver les correspondances)
 */
/**
 * Un sommet, identifié par son {@link string nom}
 * @typedef {string} node
 */
/**
 * Un tableau de {@link node sommets} voisins
 * @typedef {node[]} neighbors
 */
/**
 * Un élément de jeu. Soit une {@link card carte}, soit un {@link node sommet}
 * @typedef {card|node} element
 */
/**
 * Les paramètres d'une partie
 * @typedef {Object} settings
 * @property {number} difficulty La difficulté de la partie
 * @property {string} gamemode Le mode de jeu (soit le mode Graphe soit le mode Memory)
 * @property {boolean} Hardcore Jeu en mode difficile ou non (tentatives limitées)
 * @property {string} imageset Le nom du set d'images pour le memory
 * @property {string} playername Le nom du joueur
 */
/**
 * Résultat d'une interaction. Indique les actions à effectuer par le DOMManager selon le contexte.
 * @typedef {{type: string}|{type: string, element: *}|{type: string, first: {index: number, id: number}|string, second: *}|{type: string, first: {index: number, id: number}|string, second: *}|{type: string, first: {index: number, id: number}|string|null, second: *, first_discovered: boolean, second_discovered: boolean}|{type: string, first: {index: number, id: number}|string}} interactionResult
 */
/**
 * Un graphe, représenté par une liste d'adjacence. On utilise un dictionnaire. La clé est le nom du {@link node sommet}, et la valeur est un {@link neighbors tableau} contenant les noms des sommets voisins
 * @typedef {Map<string, node[]>} Graphe
 */
/**
 * Représentation des coordonnées d'un point sur un repère en 2 dimensions.
 * @typedef {Object} Coordinate
 * @property {number} x Coordonnée x
 * @property {number} y Coordonnée y
 */