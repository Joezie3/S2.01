import {shuffle,Aleatoire} from "./Utils.js";

export function genererGraphe(nbSommets, nbAretes) {
    // -----------------------------
    // Sécurité :
    // un graphe connexe avec N sommets
    // doit avoir au minimum N - 1 arêtes
    // -----------------------------
    if (nbAretes < nbSommets - 1) {
        nbAretes = nbSommets - 1;
    }

    // -----------------------------
    // Création des sommets
    // A, B, C, D...
    // -----------------------------
    const sommets = [];

    for (let i = 0; i < nbSommets; i++) {
        sommets.push(String.fromCharCode(65 + i));
    }
    // -----------------------------
    // Initialisation du graphe
    // -----------------------------
    /**
     *
     * @type {Map<string, Array<string>>}
     */
    const graphe = new Map();

    sommets.forEach(sommet => {
        graphe.set(sommet,[]);
    });
    shuffle(sommets);

    // -----------------------------
    // Étape 1 :
    // Création d'un graphe connexe
    // en reliant les sommets en chaîne
    //
    // A-B-C-D-E...
    // -----------------------------
    let nombreActuelAretes = 0;

    for (let i = 0; i < sommets.length - 1; i++) {
        const a = sommets[i];
        const b = sommets[i + 1];
        graphe.get(a).push(b)
        graphe.get(b).push(a)

        nombreActuelAretes++;
    }
    //console.log(graphe);
    //console.log(nombreActuelAretes);
    // -----------------------------
    // Étape 2 :
    // Ajout d'arêtes aléatoires
    // -----------------------------
    while (nombreActuelAretes < nbAretes) {

        const a = sommets[Aleatoire.entierAleatoireMax(nbSommets)];
        const b = sommets[Aleatoire.entierAleatoireMax(nbSommets)];

        // Vérifications :
        // - pas de boucle A-A
        // - pas de doublon
        if (
            a !== b &&
            !graphe.get(a).includes(b)
        ) {

            graphe.get(a).push(b);
            graphe.get(b).push(a);

            nombreActuelAretes++;
        }
    }

    return graphe;
}
/**
 * Genère les positions (x,y) pour afficher le Graphe. Utilise l'algorithme de positionnement radial, qui place tous les sommets sur un cercle, avec des perturbations (du "bruits")
 * @param {node[]}sommets La liste des sommets à positionner
 * @param {number}largeur La largeur disponible pour dessiner le graphe
 * @param {number}hauteur La hauteur disponible pour dessiner le graphe
 * @returns {Map<node,Coordinate>}
 */
export function genererPositions(sommets, largeur, hauteur) {
    /**
     * @type {Map<node,Coordinate>}
     */
    const positions = new Map();
    const test = {"a":{x:1,y:2}}
    const centreX = largeur / 2;
    const centreY = hauteur / 2;

    const marge = 60;

    const rayon = Math.min(largeur, hauteur) / 2 - marge;

    const angleStep = (2 * Math.PI) / sommets.length;

    sommets.forEach((sommet, i) => {
        const angle = i * angleStep;
        const bruit = 30;
        positions.set(sommet, {
            x: centreX + Math.cos(angle) * rayon + (Math.random() * bruit - bruit / 2),
            y: centreY + Math.sin(angle) * rayon + (Math.random() * bruit - bruit / 2)
        });
    });
    return positions;
}