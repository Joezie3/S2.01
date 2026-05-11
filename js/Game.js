import {imageCollections} from './ImageCollection.js';
import {ApiService} from './ApiService.js';
import {shuffle,entierAleatoire} from "./Utils.js";


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
  #selectedNode = null;
  #selectedCard = null;
  #grapheDiscovered = new Map;
  graphe;
  discoveredGraphe = new Map();
  event;
  Fin(reason){
    return new FinPartie(reason);
  }
  async endGame() {
    // Todo À compléter
    if (this.#state !== "ended") {
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
      for (let sommet of this.graphe.keys()){
        this.#grapheDiscovered.set(sommet,[]);
      }
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
  failedAttempt(){
    this.#remainingAttempts-=1;
    if (this.#remainingAttempts===0 && this.#hardcore){
      console.log("FIN DE LA PARTIE HARDCORE")
      document.dispatchEvent(new FinPartie("no-remaining-attempts"))
    }
  }
  selectCard(card){
    console.log(card.index,card.id);
    if (this.#selectedCard===null){
      this.#selectedCard = card;
      return {
        type:"first-selection",
        card
      }
    }
    const first = this.#selectedCard;
    const second = card;
    this.#selectedCard = null;
    if (first.index===second.index){
      this.#selectedCard = first;
      return {type:"invalid"}
    }
    const correct = first.id === second.id;
    if (!correct){
      this.failedAttempt();
      return {
        type:"wrong-pair",
        first,
        second
      }
    }
    return{
      type:"correct-pair",
      first,
      second
    }
  }
  isDiscovered(node){
    for (let s_node of this.graphe.get(node)) {
      if (!this.#grapheDiscovered.get(node).includes(s_node)) {
        return false
      }
    }
    return true
  }
  selectNode(node){
    if(this.#selectedNode===null){
      this.#selectedNode = node;
      return{
        type:"first-selection",
        node
      }
    }
    const first = this.#selectedNode
    const second = node;
    this.#selectedNode = null;
    if (first===second){
      this.#selectedNode = first;
      return {type:"invalid"}
    }
    const connected = this.graphe.get(first).includes(second)
    if (!connected){
      this.failedAttempt();
      return {
        type : "wrong-pair",
        first,
        second,
      }
    }
    if(this.#grapheDiscovered.get(first).includes(second)){
      return {
        type: "already-found",
        first
      }
    }
    this.#grapheDiscovered.get(first).push(second);
    this.#grapheDiscovered.get(second).push(first)
    this.#pairesrestantes-=1;
    if (this.#pairesrestantes===0){
      document.dispatchEvent(new FinPartie("regular"))
    }
    return {
      type:"correct-pair",
      first,
      second,
      first_discovered:this.isDiscovered(first),
      second_discovered:this.isDiscovered(second)
    }
  }

}
