import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}
function entierAleatoire(max) {
  return Math.floor(Math.random() * max);
}

function genererGraphe(nbSommets, nbAretes) {

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
   * @type {Map<string, Array<String>>}
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

    const a = sommets[entierAleatoire(nbSommets)];
    const b = sommets[entierAleatoire(nbSommets)];

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

class FinPartie extends CustomEvent{
  constructor(reason) {
    super("gameEnd",{detail:{
      reason:reason
      }});
  }

}
export class Game {
  /**
   * @type {number} id identifiant de la partie en cours
   */
  #id;
  #setname;
  #images;
  #difficulty
  #pairesrestantes
  #state
  #hardcore
  #gamemode
  #remainingAttempts
  graphe = {};
  Fin(reason){
    return new FinPartie(reason);
  }
  async endGame() {
    // Todo À compléter
    if (this.state !== "ended") {
      this.#state = "ended"
      try {
        const result = await ApiService.updateGameResult(this.#id, this.#pairesrestantes);
        console.log('Fin de partie:', result);
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Erreur lors de la fin de la partie');
      }

    }
  }

  /**
   * Start a new game.
   * @param {number} id - The game ID.
   * @param {string} gamemode
   * @param {number} difficulty
   * @param {boolean} hardcore
   */
  startGame(id,gamemode,difficulty,hardcore) {
    this.#id = id;
    this.#state = "started"
    this.#hardcore = hardcore
    this.#gamemode = gamemode
    this.#difficulty = difficulty;
    this.#remainingAttempts=3;
    if (gamemode==="graphe"){
      this.graphe = genererGraphe(this.#difficulty,this.#difficulty)
    }

  }
  setImage(setName){
    this.#setname  = setName;
    this.#images = imageCollections[this.#setname].splice(this.#difficulty)
    this.#pairesrestantes = this.#difficulty;
  }
  getImage(){
    return this.#images
  }
  get state(){
    return this.#state;
  }
  get hardcore(){
    return this.#hardcore;
  }
  get gamemode(){
    return this.#gamemode;
  }
  get remainingAttempts(){
    return this.#remainingAttempts
  }
  failedAttempt(){
    this.#remainingAttempts-=1;
    if (this.#remainingAttempts===0){
      document.dispatchEvent(new FinPartie("no-remaining-attempts"))
    }
  }
  paireDecouverte(event){
    console.log(event.detail)
    this.#pairesrestantes-=1;
    if (this.#pairesrestantes===0){
        document.dispatchEvent(new FinPartie("regular"))
    }
  }

}
